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
  Layers,
  ArrowUpRight,
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
    <Card className="border border-white/70 bg-white/85 shadow-[0_16px_35px_rgba(30,58,138,0.08)]">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', tone)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{helper}</p>
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
          <Skeleton className="h-8 w-48 bg-[#EEF2FF]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-[#EEF2FF]" />
          ))}
        </div>
        <Skeleton className="h-12 w-full max-w-lg bg-[#EEF2FF]" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl bg-[#EEF2FF]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(90,124,255,0.18),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(67,209,197,0.16),transparent_50%)]" />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Projects Hub</h1>
              <p className="text-slate-500">
                Track momentum, reviews, and earnings in one place.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2 border-white/70 bg-white/80 shadow-[0_10px_22px_rgba(30,58,138,0.08)]"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search projects by title, subject, or supervisor"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-full border border-white/80 bg-white/85 pl-10 shadow-[0_10px_20px_rgba(148,163,184,0.12)]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[#4F6CF7]">
                Active {activeProjects.length}
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-[#EAF6FF] px-3 py-1 text-[#4B9BFF]">
                Review {reviewProjects.length}
              </Badge>
              <Badge variant="secondary" className="rounded-full bg-[#FFF1EC] px-3 py-1 text-[#FF8B6A]">
                Completed {completedProjects.length}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_16px_35px_rgba(30,58,138,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pipeline</p>
                  <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalPipeline)}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E3E9FF] text-[#4F6CF7]">
                  <Layers className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">Total work value across stages</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_16px_35px_rgba(30,58,138,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Revisions</p>
                  <p className="text-xl font-semibold text-slate-900">{revisionCount}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF1EC] text-[#FF8B6A]">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">Tasks needing quick attention</p>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_16px_35px_rgba(30,58,138,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Completed</p>
                  <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalCompleted)}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAF6FF] text-[#4B9BFF]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">Total delivered earnings</p>
            </div>
          </div>
        </div>

        <Card className="relative overflow-hidden border border-white/70 bg-gradient-to-br from-[#EEF2FF] via-[#F3F5FF] to-[#E9FAFA] shadow-[0_24px_60px_rgba(30,58,138,0.12)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_55%)]" />
          <CardContent className="relative space-y-5 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Focus today
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                {priorityProject?.title || 'Plan your next project sprint'}
              </h2>
              <p className="text-sm text-slate-500">
                {priorityProject
                  ? `Due ${getTimeRemaining(priorityProject.deadline).text}`
                  : 'Accept new work from the pool to keep your pipeline full.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/80 p-3 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
                <p className="text-xs text-slate-400">Pipeline</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCurrency(totalPipeline)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-3 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
                <p className="text-xs text-slate-400">Revisions</p>
                <p className="text-lg font-semibold text-slate-900">{revisionCount}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-3 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
                <p className="text-xs text-slate-400">Completed</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCurrency(totalCompleted)}
                </p>
              </div>
            </div>

            {priorityProject && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
                <div>
                  <p className="text-xs text-slate-400">Next priority</p>
                  <p className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {priorityProject.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {priorityProject.supervisor_name || 'AssignX Team'}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full bg-gradient-to-r from-[#5A7CFF] via-[#5B86FF] to-[#49C5FF] text-white shadow-[0_14px_28px_rgba(91,124,255,0.25)]"
                  onClick={() => handleOpenWorkspace(priorityProject.id)}
                >
                  Open Workspace
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active"
          value={activeProjects.length}
          helper="Projects in motion"
          icon={FolderOpen}
          tone="bg-[#E3E9FF] text-[#4F6CF7]"
        />
        <StatCard
          title="Review"
          value={reviewProjects.length}
          helper="Awaiting approval"
          icon={Clock}
          tone="bg-[#EAF6FF] text-[#4B9BFF]"
        />
        <StatCard
          title="Completed"
          value={completedProjects.length}
          helper="Projects delivered"
          icon={CheckCircle2}
          tone="bg-[#EAF6FF] text-[#4B9BFF]"
        />
        <StatCard
          title="Revisions"
          value={revisionCount}
          helper="Need attention"
          icon={AlertTriangle}
          tone="bg-[#FFF1EC] text-[#FF8B6A]"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_40px_rgba(30,58,138,0.08)]">
            <ActiveProjectsTab
              projects={filteredActiveProjects}
              isLoading={isLoading}
              onProjectClick={handleProjectClick}
              onOpenWorkspace={handleOpenWorkspace}
            />
          </div>
          <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_40px_rgba(30,58,138,0.08)]">
            <UnderReviewTab
              projects={filteredReviewProjects}
              isLoading={isLoading}
              onProjectClick={handleProjectClick}
            />
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_40px_rgba(30,58,138,0.08)]">
            <CompletedProjectsTab
              projects={filteredCompletedProjects}
              isLoading={isLoading}
              onProjectClick={handleProjectClick}
              onDownloadInvoice={(id) => console.log('Download invoice:', id)}
            />
          </div>
          <Card className="border border-white/70 bg-white/85 shadow-[0_16px_35px_rgba(30,58,138,0.08)]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Momentum
                  </p>
                  <p className="text-lg font-semibold text-slate-900">Weekly delivery pace</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E3E9FF] text-[#4F6CF7]">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Active to review</span>
                  <span className="text-slate-900 font-semibold">
                    {activeProjects.length} → {reviewProjects.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Review to completion</span>
                  <span className="text-slate-900 font-semibold">
                    {reviewProjects.length} → {completedProjects.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Lifetime earnings</span>
                  <span className="text-slate-900 font-semibold">
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
