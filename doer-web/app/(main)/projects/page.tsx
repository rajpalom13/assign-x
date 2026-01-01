'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ActiveProjectsTab,
  UnderReviewTab,
  CompletedProjectsTab,
} from '@/components/projects'
import { ROUTES } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import { getProjectsByCategory } from '@/services/project.service'
import { toast } from 'sonner'
import type { Project, ProjectStatus } from '@/types/database'

/**
 * Projects page
 * Shows active, under review, and completed projects
 */
export default function ProjectsPage() {
  const router = useRouter()
  const { doer, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [activeProjects, setActiveProjects] = useState<Project[]>([])
  const [reviewProjects, setReviewProjects] = useState<Project[]>([])
  const [completedProjects, setCompletedProjects] = useState<Project[]>([])

  /**
   * Load projects from Supabase
   */
  const loadProjects = useCallback(async () => {
    if (!doer?.id) return

    setIsLoading(true)
    try {
      // Fetch all project categories in parallel
      const [active, review, completed] = await Promise.all([
        getProjectsByCategory(doer.id, 'active'),
        getProjectsByCategory(doer.id, 'review'),
        getProjectsByCategory(doer.id, 'completed'),
      ])

      setActiveProjects(active)
      setReviewProjects(review)
      setCompletedProjects(completed)
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }, [doer?.id])

  /** Load projects on mount and when doer changes */
  useEffect(() => {
    if (doer?.id) {
      loadProjects()
    }
  }, [doer?.id, loadProjects])

  /** Navigate to project workspace */
  const handleProjectClick = (projectId: string) => {
    router.push(`${ROUTES.projects}/${projectId}`)
  }

  /** Navigate to workspace */
  const handleOpenWorkspace = (projectId: string) => {
    router.push(`${ROUTES.projects}/${projectId}`)
  }

  /** Count revisions needing attention */
  const revisionCount = activeProjects.filter(
    (p) => p.status === 'revision_requested'
  ).length

  // Show loading state while auth or projects are loading
  if (authLoading || (isLoading && activeProjects.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-12 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">My Projects</h1>
        <p className="text-muted-foreground">
          Manage your active and completed projects
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="active" className="relative">
            Active
            {revisionCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {revisionCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="review">
            Under Review
            <Badge variant="secondary" className="ml-2">
              {reviewProjects.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <Badge variant="secondary" className="ml-2">
              {completedProjects.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          <ActiveProjectsTab
            projects={activeProjects}
            isLoading={isLoading}
            onProjectClick={handleProjectClick}
            onOpenWorkspace={handleOpenWorkspace}
          />
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <UnderReviewTab
            projects={reviewProjects}
            isLoading={isLoading}
            onProjectClick={handleProjectClick}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <CompletedProjectsTab
            projects={completedProjects}
            isLoading={isLoading}
            onProjectClick={handleProjectClick}
            onDownloadInvoice={(id) => console.log('Download invoice:', id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
