'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ActiveProjectsTab,
  UnderReviewTab,
  CompletedProjectsTab,
} from '@/components/projects'
import { ROUTES } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'
import { getProjectsByCategory } from '@/services/project.service'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/database'

/**
 * Projects page
 * Professional design with stats overview and tabbed navigation
 */
export default function ProjectsPage() {
  const router = useRouter()
  const { doer, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeProjects, setActiveProjects] = useState<Project[]>([])
  const [reviewProjects, setReviewProjects] = useState<Project[]>([])
  const [completedProjects, setCompletedProjects] = useState<Project[]>([])

  /**
   * Load projects from Supabase
   */
  const loadProjects = useCallback(async (showRefresh = false) => {
    if (!doer?.id) return

    if (showRefresh) setIsRefreshing(true)
    else setIsLoading(true)

    try {
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
      setIsRefreshing(false)
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

  /** Handle refresh */
  const handleRefresh = () => {
    loadProjects(true)
  }

  /** Count revisions needing attention */
  const revisionCount = activeProjects.filter(
    (p) => p.status === 'revision_requested'
  ).length

  /** Calculate total earnings from completed projects */
  const totalCompleted = completedProjects.reduce(
    (sum, p) => sum + (p.doer_payout || 0),
    0
  )

  // Show loading state while auth or projects are loading
  if (authLoading || (isLoading && activeProjects.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
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
          <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">
            Manage your active and completed projects
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

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="stat-gradient-teal">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeProjects.length}</p>
                <p className="text-sm text-muted-foreground">Active Projects</p>
              </div>
              {revisionCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {revisionCount} revision{revisionCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-gradient-amber">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reviewProjects.length}</p>
                <p className="text-sm text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-gradient-emerald">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedProjects.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹{totalCompleted.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-muted-foreground">earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revision Alert */}
      {revisionCount > 0 && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-700 dark:text-red-400">
                  {revisionCount} project{revisionCount > 1 ? 's' : ''} need{revisionCount === 1 ? 's' : ''} revision
                </p>
                <p className="text-sm text-red-600/70 dark:text-red-400/70">
                  Please check the feedback and make the required changes
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setActiveTab('active')}
              >
                View Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 h-12">
            <TabsTrigger value="active" className="relative gap-2">
              <FolderOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Active</span>
              {revisionCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {revisionCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="review" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Review</span>
              <Badge variant="secondary" className="ml-1">
                {reviewProjects.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Completed</span>
              <Badge variant="secondary" className="ml-1">
                {completedProjects.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Search - Future enhancement */}
          {/* <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div> */}
        </div>

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
