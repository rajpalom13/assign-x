'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  TrendingUp,
  Clock,
  IndianRupee,
  Sparkles,
  RefreshCw,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TaskPoolList, AssignedTaskList } from '@/components/dashboard'
import type { Project } from '@/components/dashboard'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  getAssignedTasks,
  getOpenPoolTasks,
  acceptPoolTask,
  isDeadlineUrgent,
  type ProjectWithSupervisor,
} from '@/services/project.service'

type DoerProfile = {
  id: string
  user_id: string
  full_name: string | null
  email: string
  phone: string | null
  avatar_url: string | null
  bio: string | null
  skills: string[] | null
  hourly_rate: number | null
}

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

/** Quick stat card for dashboard */
function QuickStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconBg,
  iconColor,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  gradient: string
  iconBg: string
  iconColor: string
}) {
  return (
    <Card className={cn("relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5", gradient)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type DashboardClientProps = {
  initialDoer: DoerProfile
}

/**
 * Dashboard client component
 * Professional design with stats and task management
 */
export function DashboardClient({ initialDoer }: DashboardClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [assignedTasks, setAssignedTasks] = useState<Project[]>([])
  const [poolTasks, setPoolTasks] = useState<Project[]>([])
  const [activeTab, setActiveTab] = useState('assigned')

  /**
   * Load tasks from Supabase
   */
  const loadTasks = useCallback(async (showRefresh = false) => {
    console.log('[Dashboard] loadTasks called, doer:', initialDoer?.id)
    if (!initialDoer?.id) {
      console.log('[Dashboard] No doer ID, skipping load')
      return
    }

    if (showRefresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      console.log('[Dashboard] Fetching tasks for doer:', initialDoer.id)
      const [assignedData, poolData] = await Promise.all([
        getAssignedTasks(initialDoer.id),
        getOpenPoolTasks(),
      ])

      console.log('[Dashboard] Assigned tasks:', assignedData.length, 'Pool tasks:', poolData.length)
      setAssignedTasks(assignedData.map(transformProject))
      setPoolTasks(poolData.map(transformProject))
    } catch (error) {
      console.error('[Dashboard] Error loading tasks:', error)
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [initialDoer?.id])

  /** Load tasks on mount */
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  /**
   * Handle accepting a task from the pool
   */
  const handleAcceptTask = useCallback(async (projectId: string) => {
    if (!initialDoer?.id) {
      toast.error('Please log in to accept tasks')
      return
    }

    try {
      await acceptPoolTask(projectId, initialDoer.id)

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
  }, [initialDoer?.id, poolTasks])

  /** Handle project click */
  const handleProjectClick = useCallback((projectId: string) => {
    router.push(`${ROUTES.projects}/${projectId}`)
  }, [router])

  /** Handle refresh */
  const handleRefresh = useCallback(async () => {
    await loadTasks(true)
  }, [loadTasks])

  /** Count of tasks needing attention */
  const urgentCount = useMemo(() =>
    assignedTasks.filter(t => t.isUrgent || t.status === 'revision_requested').length,
    [assignedTasks]
  )

  /** Calculate quick stats */
  const totalEarningsPotential = useMemo(() =>
    [...assignedTasks, ...poolTasks].reduce((sum, t) => sum + t.price, 0),
    [assignedTasks, poolTasks]
  )

  const activeCount = assignedTasks.filter(t =>
    t.status === 'in_progress' || t.status === 'assigned'
  ).length

  console.log('[Dashboard] Render state - isLoading:', isLoading, 'doer:', initialDoer?.id, 'tasks:', assignedTasks.length)

  // Show loading state while tasks are loading
  if (isLoading && assignedTasks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your tasks and find new opportunities
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickStatCard
          title="Assigned Tasks"
          value={assignedTasks.length}
          subtitle={`${activeCount} in progress`}
          icon={Briefcase}
          gradient="stat-gradient-teal"
          iconBg="bg-teal-100 dark:bg-teal-900/30"
          iconColor="text-teal-600 dark:text-teal-400"
        />
        <QuickStatCard
          title="Available Tasks"
          value={poolTasks.length}
          subtitle="In open pool"
          icon={Sparkles}
          gradient="stat-gradient-emerald"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <QuickStatCard
          title="Urgent"
          value={urgentCount}
          subtitle="Need attention"
          icon={Clock}
          gradient="stat-gradient-amber"
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <QuickStatCard
          title="Potential Earnings"
          value={`₹${totalEarningsPotential.toLocaleString('en-IN')}`}
          subtitle="Total available"
          icon={IndianRupee}
          gradient="stat-gradient-purple"
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md h-12">
          <TabsTrigger value="assigned" className="relative gap-2 text-sm">
            <Briefcase className="h-4 w-4" />
            Assigned to Me
            {urgentCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {urgentCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pool" className="gap-2 text-sm">
            <Sparkles className="h-4 w-4" />
            Open Pool
            <Badge variant="secondary" className="ml-1">
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
