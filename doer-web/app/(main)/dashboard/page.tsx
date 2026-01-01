'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TaskPoolList, AssignedTaskList } from '@/components/dashboard'
import type { Project } from '@/components/dashboard'
import { ROUTES } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import {
  getAssignedTasks,
  getOpenPoolTasks,
  acceptPoolTask,
  isDeadlineUrgent,
  type ProjectWithSupervisor,
} from '@/services/project.service'

/**
 * Transform database project to component project format
 */
function transformProject(dbProject: ProjectWithSupervisor): Project {
  return {
    id: dbProject.id,
    title: dbProject.title,
    subject: dbProject.topic || dbProject.service_type || 'General',
    description: dbProject.description || undefined,
    price: Number(dbProject.doer_payout) || 0,
    deadline: new Date(dbProject.deadline),
    status: dbProject.status as Project['status'],
    supervisorName: dbProject.supervisor?.profile?.full_name,
    isUrgent: isDeadlineUrgent(dbProject.deadline),
  }
}

/**
 * Dashboard page
 * Shows assigned tasks and open pool tabs
 */
export default function DashboardPage() {
  const router = useRouter()
  const { doer, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [assignedTasks, setAssignedTasks] = useState<Project[]>([])
  const [poolTasks, setPoolTasks] = useState<Project[]>([])
  const [activeTab, setActiveTab] = useState('assigned')

  /**
   * Load tasks from Supabase
   */
  const loadTasks = useCallback(async () => {
    console.log('[Dashboard] loadTasks called, doer:', doer?.id)
    if (!doer?.id) {
      console.log('[Dashboard] No doer ID, skipping load')
      return
    }

    setIsLoading(true)
    try {
      console.log('[Dashboard] Fetching tasks for doer:', doer.id)
      // Fetch assigned tasks and open pool tasks in parallel
      const [assignedData, poolData] = await Promise.all([
        getAssignedTasks(doer.id),
        getOpenPoolTasks(),
      ])

      console.log('[Dashboard] Assigned tasks:', assignedData.length, 'Pool tasks:', poolData.length)
      // Transform to component format
      setAssignedTasks(assignedData.map(transformProject))
      setPoolTasks(poolData.map(transformProject))
    } catch (error) {
      console.error('[Dashboard] Error loading tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }, [doer?.id])

  /** Load tasks on mount and when doer changes */
  useEffect(() => {
    if (doer?.id) {
      loadTasks()
    }
  }, [doer?.id, loadTasks])

  /**
   * Handle accepting a task from the pool
   */
  const handleAcceptTask = useCallback(async (projectId: string) => {
    if (!doer?.id) {
      toast.error('Please log in to accept tasks')
      return
    }

    try {
      await acceptPoolTask(projectId, doer.id)

      // Move task from pool to assigned
      const task = poolTasks.find(t => t.id === projectId)
      if (task) {
        setPoolTasks(prev => prev.filter(t => t.id !== projectId))
        setAssignedTasks(prev => [...prev, { ...task, status: 'assigned' }])
      }

      toast.success('Task accepted successfully!')
    } catch (error) {
      console.error('Error accepting task:', error)
      toast.error('Failed to accept task')
    }
  }, [doer?.id, poolTasks])

  /** Handle project click */
  const handleProjectClick = useCallback((projectId: string) => {
    router.push(`${ROUTES.projects}/${projectId}`)
  }, [router])

  /** Handle refresh */
  const handleRefresh = useCallback(async () => {
    await loadTasks()
  }, [loadTasks])

  /** Count of tasks needing attention */
  const urgentCount = useMemo(() =>
    assignedTasks.filter(t => t.isUrgent || t.status === 'revision_requested').length,
    [assignedTasks]
  )

  console.log('[Dashboard] Render state - authLoading:', authLoading, 'isLoading:', isLoading, 'doer:', doer?.id, 'tasks:', assignedTasks.length)

  // Show loading state while auth is loading
  if (authLoading || (isLoading && assignedTasks.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your tasks and find new opportunities
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="assigned" className="relative">
            Assigned to Me
            {urgentCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {urgentCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pool">
            Open Pool
            <Badge variant="secondary" className="ml-2">
              {poolTasks.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-6">
          <AssignedTaskList
            projects={assignedTasks}
            isLoading={isLoading}
            onProjectClick={handleProjectClick}
          />
        </TabsContent>

        <TabsContent value="pool" className="mt-6">
          <TaskPoolList
            projects={poolTasks}
            isLoading={isLoading}
            onAcceptTask={handleAcceptTask}
            onProjectClick={handleProjectClick}
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
