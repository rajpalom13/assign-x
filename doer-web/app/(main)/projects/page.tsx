'use client'

import { useState, useEffect, useCallback, useMemo, type ElementType } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  RefreshCw,
  FolderOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import { getTimeRemaining } from '@/components/projects/utils'

/**
 * Stat tile for project overview metrics.
 */
function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  tone,
}: {
  title: string
  value: string | number
  helper: string
  icon: ElementType
  tone: string
}) {
  return (
    <Card className="border border-border/70 bg-card/80">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Projects page
 * Professional design with stats overview and tabbed navigation
 */
export default function ProjectsPage() {
  const router = useRouter()
  const { doer, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
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

  /** Total pipeline value */
  const totalPipeline = useMemo(() => {
    const allProjects = [...activeProjects, ...reviewProjects, ...completedProjects]
    return allProjects.reduce((sum, p) => sum + (p.price ?? p.doer_payout ?? 0), 0)
  }, [activeProjects, reviewProjects, completedProjects])

  /**
   * Filter projects by search query.
   */
  const filterProjects = useCallback((projects: Project[]) => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return projects

    return projects.filter((project) => {
      const content = [
        project.title,
        project.subject_name,
        project.supervisor_name,
        project.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return content.includes(query)
    })
  }, [searchQuery])

  const filteredActiveProjects = useMemo(
    () => filterProjects(activeProjects),
    [filterProjects, activeProjects]
  )

  const filteredReviewProjects = useMemo(
    () => filterProjects(reviewProjects),
    [filterProjects, reviewProjects]
  )

  const filteredCompletedProjects = useMemo(
    () => filterProjects(completedProjects),
    [filterProjects, completedProjects]
  )

  /**
   * Select the most urgent project for the summary card.
   */
  const priorityProject = useMemo(() => {
    if (activeProjects.length === 0) return null
    const revisionProject = activeProjects.find(
      (project) => project.status === 'revision_requested'
    )
    if (revisionProject) return revisionProject

    return [...activeProjects].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    )[0]
  }, [activeProjects])

  /**
   * Format payout value.
   */
  const formatCurrency = useCallback((value: number) =>
    `₹${value.toLocaleString('en-IN')}`,
  [])

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
    <div className="space-y-8">
      {/* Header */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Projects Hub</h1>
              <p className="text-muted-foreground">
                Track momentum, reviews, and earnings in one place.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects by title, subject, or supervisor"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-full pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Active {activeProjects.length}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Review {reviewProjects.length}
              </Badge>
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Completed {completedProjects.length}
              </Badge>
            </div>
          </div>
        </div>

        <Card className="relative overflow-hidden border border-border/70 bg-card/90">
          <div className="absolute inset-x-0 top-0 h-1 gradient-primary" />
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Focus today
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                {priorityProject?.title || 'Plan your next project sprint'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {priorityProject
                  ? `Due ${getTimeRemaining(priorityProject.deadline).text}`
                  : 'Accept new work from the pool to keep your pipeline full.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Pipeline</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(totalPipeline)}
                </p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Revisions</p>
                <p className="text-lg font-semibold text-foreground">{revisionCount}</p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(totalCompleted)}
                </p>
              </div>
            </div>

            {priorityProject && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/80 p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Next priority</p>
                  <p className="text-sm font-semibold text-foreground line-clamp-1">
                    {priorityProject.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {priorityProject.supervisor_name || 'AssignX Team'}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleOpenWorkspace(priorityProject.id)}
                >
                  Open Workspace
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active"
          value={activeProjects.length}
          helper="Projects in motion"
          icon={FolderOpen}
          tone="bg-teal-100 text-teal-700"
        />
        <StatCard
          title="Review"
          value={reviewProjects.length}
          helper="Awaiting approval"
          icon={Clock}
          tone="bg-amber-100 text-amber-700"
        />
        <StatCard
          title="Completed"
          value={completedProjects.length}
          helper="Projects delivered"
          icon={CheckCircle2}
          tone="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          title="Revisions"
          value={revisionCount}
          helper="Need attention"
          icon={AlertTriangle}
          tone="bg-rose-100 text-rose-700"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <ActiveProjectsTab
            projects={filteredActiveProjects}
            isLoading={isLoading}
            onProjectClick={handleProjectClick}
            onOpenWorkspace={handleOpenWorkspace}
          />
          <UnderReviewTab
            projects={filteredReviewProjects}
            isLoading={isLoading}
            onProjectClick={handleProjectClick}
          />
        </div>
        <div className="space-y-6">
          <CompletedProjectsTab
            projects={filteredCompletedProjects}
            isLoading={isLoading}
            onProjectClick={handleProjectClick}
            onDownloadInvoice={(id) => console.log('Download invoice:', id)}
          />
          <Card className="border border-border/70 bg-card/90">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    Momentum
                  </p>
                  <p className="text-lg font-semibold text-foreground">Weekly delivery pace</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Active to review</span>
                  <span className="text-foreground font-semibold">
                    {activeProjects.length} → {reviewProjects.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Review to completion</span>
                  <span className="text-foreground font-semibold">
                    {reviewProjects.length} → {completedProjects.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lifetime earnings</span>
                  <span className="text-foreground font-semibold">
                    {formatCurrency(totalCompleted)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
