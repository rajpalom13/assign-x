'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  FolderOpen,
  HelpCircle,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Project } from '@/components/dashboard'
import { ROUTES } from '@/lib/constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  acceptPoolTask,
  getAssignedTasks,
  getOpenPoolTasks,
  isDeadlineUrgent,
  type ProjectWithSupervisor,
} from '@/services/project.service'
import { useNewProjectsSubscription, useProjectSubscription } from '@/hooks/useProjectSubscription'

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

type ActivityItem = {
  id: string
  title: string
  description: string
  time: string
  avatarUrl?: string | null
}

type PriorityConfig = {
  label: string
  className: string
}

type StatusConfig = {
  label: string
  className: string
}

const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, description: 'Overview & tasks' },
  { id: 'projects', label: 'My Projects', url: '/projects', icon: FolderOpen, description: 'Active work' },
  { id: 'resources', label: 'Resources', url: '/resources', icon: BookOpen, description: 'Tools & guides' },
] as const

const NAV_PROFILE = [
  { id: 'profile', label: 'My Profile', url: '/profile', icon: User, description: 'Your info' },
  { id: 'reviews', label: 'Reviews', url: '/reviews', icon: Star, description: 'Feedback' },
  { id: 'statistics', label: 'Statistics', url: '/statistics', icon: BarChart3, description: 'Performance' },
] as const

const NAV_SUPPORT = [
  { id: 'support', label: 'Help & Support', url: '/support', icon: HelpCircle, description: 'Get help' },
  { id: 'settings', label: 'Settings', url: '/settings', icon: Settings, description: 'Preferences' },
] as const

const LINE_CHART_DATA = [12, 24, 18, 30, 26, 38, 28, 44]
const DONUT_DATA = [62, 24, 14]

/**
 * Transform database project to component project format.
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
 * Get initials for avatar fallback.
 */
const getInitials = (name?: string | null) => {
  if (!name) return 'DO'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

/**
 * Format currency values for display.
 */
const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`

/**
 * Format short date for task list.
 */
const formatShortDate = (value: Date) =>
  value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

/**
 * Build priority tag styles based on task state.
 */
const getPriorityConfig = (project: Project): PriorityConfig => {
  if (project.isUrgent || project.status === 'revision_requested') {
    return {
      label: 'High',
      className: 'bg-[#FF9F8C]/15 text-[#FF7A61] border border-[#FF9F8C]/30',
    }
  }
  if (project.status === 'in_progress' || project.status === 'assigned') {
    return {
      label: 'Medium',
      className: 'bg-[#5B6CFF]/10 text-[#5B6CFF] border border-[#5B6CFF]/20',
    }
  }
  return {
    label: 'Low',
    className: 'bg-[#4ED1C1]/12 text-[#1C9E8D] border border-[#4ED1C1]/30',
  }
}

/**
 * Build status pill styles for table rows.
 */
const getStatusConfig = (status: Project['status']): StatusConfig => {
  if (status === 'completed') {
    return { label: 'Completed', className: 'bg-[#4ED1C1]/15 text-[#1C9E8D]' }
  }
  if (status === 'in_progress') {
    return { label: 'In Progress', className: 'bg-[#5B6CFF]/12 text-[#4A59E6]' }
  }
  if (status === 'revision_requested') {
    return { label: 'Revision', className: 'bg-[#FF9F8C]/15 text-[#FF7A61]' }
  }
  if (status === 'assigned') {
    return { label: 'Assigned', className: 'bg-[#5B6CFF]/10 text-[#5B6CFF]' }
  }
  return { label: 'Open', className: 'bg-[#F8FAFC] text-[#6B7280] border border-[#E5E7EB]' }
}

/**
 * Sidebar navigation item.
 */
function SidebarNavItem({
  label,
  description,
  icon: Icon,
  url,
  active,
  badgeCount,
  onNavigate,
}: {
  label: string
  description: string
  icon: React.ElementType
  url: string
  active?: boolean
  badgeCount?: number
  onNavigate: (url: string) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(url)}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
        active
          ? 'bg-[#EEF2FF] text-[#1F2937] shadow-sm ring-1 ring-[#C7D2FE]'
          : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#1F2937]'
      )}
    >
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300',
          active ? 'bg-white shadow-sm' : 'bg-[#F8FAFC] group-hover:scale-105'
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="hidden lg:block">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-[#94A3B8]">{description}</span>
      </span>
      {badgeCount ? (
        <span className="ml-auto hidden rounded-full bg-[#5B6CFF]/10 px-2 py-0.5 text-xs font-semibold text-[#5B6CFF] lg:inline-flex">
          {badgeCount}
        </span>
      ) : null}
    </button>
  )
}

/**
 * KPI stat card for dashboard.
 */
function KpiStatCard({
  title,
  value,
  change,
  icon: Icon,
  accent,
}: {
  title: string
  value: string
  change: { value: string; trend: 'up' | 'down' }
  icon: React.ElementType
  accent: string
}) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-[#EEF2FF] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(31,41,55,0.08)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#E8EDFF]" />
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
              {title}
            </p>
            <p className="mt-2 text-2xl font-semibold text-[#1F2937]">{value}</p>
          </div>
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', accent)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1',
                change.trend === 'up'
                  ? 'bg-[#4ED1C1]/15 text-[#1C9E8D]'
                  : 'bg-[#FF9F8C]/15 text-[#FF7A61]'
              )}
            >
              {change.trend === 'up' ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {change.value}
            </span>
            <span className="text-[#6B7280]">vs last week</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Top bar search input.
 */
function SearchInput() {
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
      <Input
        placeholder="Search tasks, projects, or messages"
        className="h-11 rounded-full border-transparent bg-white pl-10 shadow-sm focus-visible:ring-[#5B6CFF]/40"
      />
    </div>
  )
}

/**
 * Dashboard sidebar content.
 */
function SidebarContent({
  doer,
  activeProjects,
  pendingEarnings,
}: {
  doer: DoerProfile
  activeProjects: number
  pendingEarnings: number
}) {
  const router = useRouter()

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <div className="space-y-8">
        <div className="px-3">
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-[#1F2937]">Doer</p>
            <p className="text-xs text-[#6B7280]">Creative workspace</p>
          </div>
        </div>
        <div className="px-3">
          <div className="rounded-2xl border border-[#EEF2FF] bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2FF]">
                <Zap className="h-5 w-5 text-[#5B6CFF]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280]">Ready to work</p>
                <p className="text-sm font-semibold text-[#1F2937]">{activeProjects} Active Projects</p>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-5 px-2">
          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#94A3B8]">
              Main Menu
            </p>
            <nav className="mt-3 space-y-2">
              {NAV_MAIN.map(item => (
                <SidebarNavItem
                  key={item.id}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  url={item.url}
                  onNavigate={(url) => router.push(url)}
                  active={false}
                  badgeCount={item.id === 'projects' ? activeProjects : undefined}
                />
              ))}
            </nav>
          </div>
          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#94A3B8]">
              Profile & Stats
            </p>
            <nav className="mt-3 space-y-2">
              {NAV_PROFILE.map(item => (
                <SidebarNavItem
                  key={item.id}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  url={item.url}
                  onNavigate={(url) => router.push(url)}
                  active={false}
                />
              ))}
            </nav>
          </div>
          <div>
            <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#94A3B8]">
              Support
            </p>
            <nav className="mt-3 space-y-2">
              {NAV_SUPPORT.map(item => (
                <SidebarNavItem
                  key={item.id}
                  label={item.label}
                  description={item.description}
                  icon={item.icon}
                  url={item.url}
                  onNavigate={(url) => router.push(url)}
                  active={false}
                />
              ))}
            </nav>
          </div>
        </div>
        <div className="px-3">
          <div className="rounded-2xl border border-[#EAFBF8] bg-[#F8FAFC] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6FFFA]">
                <TrendingUp className="h-5 w-5 text-[#1C9E8D]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#6B7280]">Pending</p>
                <p className="text-sm font-semibold text-[#1F2937]">{formatCurrency(pendingEarnings)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4 px-3">
        <Separator className="bg-[#E5E7EB]" />
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
          <Avatar className="h-10 w-10">
            <AvatarImage src={doer.avatar_url || undefined} alt={doer.full_name || 'Doer'} />
            <AvatarFallback className="bg-[#5B6CFF]/10 text-[#5B6CFF]">
              {getInitials(doer.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-[#1F2937]">{doer.full_name || 'Doer'}</p>
            <p className="text-xs text-[#6B7280]">Creative Doer</p>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-[#6B7280]">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Dashboard skeleton loading state.
 */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex">
        <div className="hidden md:block md:w-20 lg:w-64">
          <div className="h-screen bg-white" />
        </div>
        <div className="flex-1 space-y-6 px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-11 w-60 rounded-full" />
          </div>
          <Skeleton className="h-40 w-full rounded-3xl" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map(item => (
              <Skeleton key={item} className="h-44 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Skeleton className="h-60 rounded-2xl" />
            <Skeleton className="h-60 rounded-2xl" />
          </div>
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

type DashboardClientProps = {
  initialDoer: DoerProfile
}

/**
 * Dashboard client component with premium layout and analytics.
 */
export function DashboardClient({ initialDoer }: DashboardClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [assignedTasks, setAssignedTasks] = useState<Project[]>([])
  const [poolTasks, setPoolTasks] = useState<Project[]>([])

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
   * Real-time subscription for assigned project updates
   * Refreshes the task list when projects are assigned or updated
   */
  useProjectSubscription({
    doerId: initialDoer?.id,
    onProjectAssigned: (project) => {
      console.log('[Dashboard] Project assigned via realtime:', project.id)
      toast.success('New project assigned to you!')
      loadTasks()
    },
    onProjectUpdate: () => {
      console.log('[Dashboard] Project updated via realtime')
      loadTasks()
    },
    onStatusChange: (project, oldStatus, newStatus) => {
      console.log('[Dashboard] Project status changed:', oldStatus, '->', newStatus)
      if (newStatus === 'revision_requested') {
        toast.warning('Revision requested for a project')
      }
      loadTasks()
    },
    enabled: !!initialDoer?.id,
  })

  /**
   * Real-time subscription for new available projects in the pool
   * Refreshes the pool list when new projects become available
   */
  useNewProjectsSubscription({
    enabled: true,
    onNewProject: (project) => {
      console.log('[Dashboard] New project available in pool:', project.id)
      toast.info('New project available in the pool!')
      loadTasks()
    },
  })

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

  /**
   * Calculate pending earnings for sidebar.
   */
  const pendingEarnings = useMemo(() =>
    assignedTasks
      .filter(task => ['submitted_for_qc', 'qc_in_progress', 'qc_approved'].includes(task.status))
      .reduce((sum, task) => sum + task.price, 0),
    [assignedTasks]
  )

  /**
   * Build headline metrics for the KPI cards.
   */
  const kpiCards = useMemo(() => ([
    {
      title: 'Revenue',
      value: formatCurrency(totalEarningsPotential),
      change: { value: '12.4%', trend: 'up' as const },
      icon: IndianRupee,
      accent: 'bg-[#5B6CFF]/10 text-[#5B6CFF]'
    },
    {
      title: 'Active Users',
      value: `${assignedTasks.length + 48}`,
      change: { value: '6.8%', trend: 'up' as const },
      icon: TrendingUp,
      accent: 'bg-[#4ED1C1]/15 text-[#1C9E8D]'
    },
    {
      title: 'Conversion Rate',
      value: '8.6%',
      change: { value: '1.3%', trend: 'down' as const },
      icon: Sparkles,
      accent: 'bg-[#FF9F8C]/20 text-[#FF7A61]'
    },
    {
      title: 'Growth',
      value: `${activeCount + 24}`,
      change: { value: '9.1%', trend: 'up' as const },
      icon: Briefcase,
      accent: 'bg-[#5B6CFF]/10 text-[#5B6CFF]'
    },
  ]), [activeCount, assignedTasks.length, totalEarningsPotential])

  /**
   * Build activity feed items.
   */
  const activityItems = useMemo<ActivityItem[]>(() => [
    {
      id: 'activity-1',
      title: 'New project assigned',
      description: assignedTasks[0]?.title || 'Brand refresh for Bloom Labs',
      time: '2m ago',
      avatarUrl: initialDoer.avatar_url,
    },
    {
      id: 'activity-2',
      title: 'Milestone completed',
      description: assignedTasks[1]?.title || 'Landing page concept delivered',
      time: '58m ago',
      avatarUrl: initialDoer.avatar_url,
    },
    {
      id: 'activity-3',
      title: 'Feedback received',
      description: 'Supervisor commented on wireframes',
      time: '3h ago',
      avatarUrl: initialDoer.avatar_url,
    },
  ], [assignedTasks, initialDoer.avatar_url])

  /**
   * Build first name for greeting.
   */
  const firstName = useMemo(() => {
    const name = initialDoer.full_name || 'there'
    return name.split(' ')[0]
  }, [initialDoer.full_name])

  const maxLineValue = useMemo(() => Math.max(...LINE_CHART_DATA), [])

  console.log('[Dashboard] Render state - isLoading:', isLoading, 'doer:', initialDoer?.id, 'tasks:', assignedTasks.length)

  // Show loading state while tasks are loading
  if (isLoading && assignedTasks.length === 0) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-[#6B7280]">Create, track, and grow your work.</p>
        </div>
        <div className="hidden items-center gap-3 xl:flex">
          <SearchInput />
          <Button
            variant="outline"
            size="icon"
            className="relative h-11 w-11 rounded-full border-transparent bg-white shadow-sm"
          >
            <Bell className="h-5 w-5 text-[#5B6CFF]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF9F8C]" />
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-11 gap-2 rounded-full bg-[#5B6CFF] px-5 text-white shadow-sm transition-all hover:bg-[#4A59E6]"
          >
            <Plus className="h-4 w-4" />
            Quick Sync
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 w-11 rounded-full p-0">
                <Avatar className="h-11 w-11 border border-white shadow-sm">
                  <AvatarImage src={initialDoer.avatar_url || undefined} alt={initialDoer.full_name || 'Doer'} />
                  <AvatarFallback className="bg-[#5B6CFF]/10 text-[#5B6CFF]">
                    {getInitials(initialDoer.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-[#FF7A61]">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr]">
            <Card className="relative overflow-hidden rounded-3xl border border-[#EEF2FF] bg-white p-6 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1 bg-[#E8EDFF]" />
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#5B6CFF]/6 blur-3xl" />
              <div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-[#4ED1C1]/8 blur-3xl" />
              <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-[#5B6CFF]">Good morning, {firstName} 👋</p>
                  <h2 className="text-3xl font-semibold leading-tight text-[#1F2937]">
                    Your workspace is glowing with new opportunities.
                  </h2>
                  <p className="text-sm text-[#6B7280]">
                    Track progress, manage tasks, and stay aligned with your goals in one beautifully calm space.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button className="rounded-full bg-[#FF9F8C] text-white shadow-sm hover:bg-[#FF8A72]">
                      Explore projects
                    </Button>
                    <Button variant="outline" className="rounded-full border-white bg-white/70">
                      View insights
                    </Button>
                  </div>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-3xl bg-white/70" />
                  <div className="relative grid gap-3">
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold text-[#6B7280]">Weekly Focus</p>
                      <p className="text-lg font-semibold text-[#1F2937]">Brand Systems</p>
                    </div>
                    <div className="rounded-2xl bg-[#5B6CFF] px-4 py-3 text-white shadow-sm">
                      <p className="text-xs font-semibold">Project Pulse</p>
                      <p className="text-lg font-semibold">92% on track</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <p className="text-xs font-semibold text-[#6B7280]">Upcoming Review</p>
                      <p className="text-lg font-semibold text-[#1F2937]">Fri, 5:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
              <CardHeader className="p-0">
                <CardTitle className="text-lg font-semibold text-[#1F2937]">Today at a glance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-0 pt-6">
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-4">
                  <div>
                    <p className="text-sm text-[#6B7280]">Assigned tasks</p>
                    <p className="text-2xl font-semibold text-[#1F2937]">{assignedTasks.length}</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-[#4ED1C1]" />
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-4">
                  <div>
                    <p className="text-sm text-[#6B7280]">Open pool</p>
                    <p className="text-2xl font-semibold text-[#1F2937]">{poolTasks.length}</p>
                  </div>
                  <Sparkles className="h-6 w-6 text-[#5B6CFF]" />
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-[#F8FAFC] p-4">
                  <div>
                    <p className="text-sm text-[#6B7280]">Urgent reviews</p>
                    <p className="text-2xl font-semibold text-[#1F2937]">{urgentCount}</p>
                  </div>
                  <Clock className="h-6 w-6 text-[#FF9F8C]" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map(card => (
              <KpiStatCard
                key={card.title}
                title={card.title}
                value={card.value}
                change={card.change}
                icon={card.icon}
                accent={card.accent}
              />
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
            <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-[#1F2937]">Performance overview</CardTitle>
                  <Badge className="rounded-full bg-[#F1F5FF] text-[#5B6CFF]">+12% this month</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 pt-6">
                <div className="h-48 w-full px-8">
                  <div className="flex h-full items-end justify-center gap-9">
                    {LINE_CHART_DATA.map((value, index) => (
                      <div key={`${value}-${index}`} className="relative h-full w-6">
                        <div
                          className="absolute bottom-0 w-full rounded-full bg-[#4A59E6] shadow-[0_8px_18px_rgba(74,89,230,0.28)]"
                          style={{ height: `${(value / maxLineValue) * 100}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 px-8">
                  <div className="flex items-center justify-center gap-9 text-xs text-[#6B7280]">
                    {LINE_CHART_DATA.map((value, index) => (
                      <span
                        key={`${value}-${index}`}
                        className="w-6 text-center"
                      >
                        Week {index + 1}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
              <CardHeader className="p-0">
                <CardTitle className="text-lg font-semibold text-[#1F2937]">Task mix</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-6">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <svg viewBox="0 0 120 120" className="h-44 w-44">
                      <defs>
                        <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#5B6CFF" floodOpacity="0.12" />
                        </filter>
                      </defs>
                      <circle cx="60" cy="60" r="48" stroke="#F1F5FF" strokeWidth="14" fill="none" />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="#5B6CFF"
                        strokeWidth="14"
                        pathLength="100"
                        strokeDasharray={`${DONUT_DATA[0] - 4} ${100 - DONUT_DATA[0] + 4}`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#donutGlow)"
                        transform="rotate(-90 60 60)"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="#4ED1C1"
                        strokeWidth="14"
                        pathLength="100"
                        strokeDasharray={`${DONUT_DATA[1] - 4} ${100 - DONUT_DATA[1] + 4}`}
                        strokeDashoffset={`-${DONUT_DATA[0] + 4}`}
                        strokeLinecap="round"
                        fill="none"
                        transform="rotate(-90 60 60)"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="#FF9F8C"
                        strokeWidth="14"
                        pathLength="100"
                        strokeDasharray={`${DONUT_DATA[2] - 4} ${100 - DONUT_DATA[2] + 4}`}
                        strokeDashoffset={`-${DONUT_DATA[0] + DONUT_DATA[1] + 8}`}
                        strokeLinecap="round"
                        fill="none"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xs text-[#6B7280]">Active mix</p>
                      <p className="text-lg font-semibold text-[#1F2937]">{DONUT_DATA[0]}%</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-3 text-sm text-[#6B7280]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#5B6CFF]" />
                      Active
                    </span>
                    <span className="text-[#1F2937]">{DONUT_DATA[0]}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#4ED1C1]" />
                      In review
                    </span>
                    <span className="text-[#1F2937]">{DONUT_DATA[1]}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#FF9F8C]" />
                      Upcoming
                    </span>
                    <span className="text-[#1F2937]">{DONUT_DATA[2]}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-[#1F2937]">Priority tasks</CardTitle>
                  <Badge className="rounded-full bg-[#FF9F8C]/15 text-[#FF7A61]">
                    {urgentCount} urgent
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-0 pt-6">
                {assignedTasks.slice(0, 4).map(task => {
                  const priority = getPriorityConfig(task)
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-2xl border border-transparent bg-[#F8FAFC] p-4 transition-all hover:border-[#E5E7EB] hover:bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox className="border-[#D1D5DB]" aria-label={`Mark ${task.title} complete`} />
                        <div>
                          <p className="text-sm font-semibold text-[#1F2937]">{task.title}</p>
                          <p className="text-xs text-[#6B7280]">Due {formatShortDate(task.deadline)}</p>
                        </div>
                      </div>
                      <Badge className={cn('rounded-full px-3 py-1 text-xs', priority.className)}>
                        {priority.label}
                      </Badge>
                    </div>
                  )
                })}
                {assignedTasks.length === 0 && (
                  <div className="flex items-center justify-center gap-3 rounded-2xl p-6 text-sm text-[#6B7280]">
                    <Sparkles className="h-4 w-4 text-[#5B6CFF]" />
                    <span>No tasks assigned yet. Explore the open pool to get started.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
              <CardHeader className="p-0">
                <CardTitle className="text-lg font-semibold text-[#1F2937]">Recent activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-0 pt-6">
                {activityItems.map(item => (
                  <div key={item.id} className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={item.avatarUrl || undefined} alt={item.title} />
                      <AvatarFallback className="bg-[#5B6CFF]/10 text-[#5B6CFF]">
                        {getInitials(initialDoer.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#1F2937]">{item.title}</p>
                      <p className="text-xs text-[#6B7280]">{item.description}</p>
                      <p className="text-xs text-[#9CA3AF]">{item.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 rounded-3xl border-none bg-white p-6 shadow-sm">
            <CardHeader className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-lg font-semibold text-[#1F2937]">Open pool projects</CardTitle>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full border-[#E5E7EB] bg-white"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  aria-label="Refresh pool"
                >
                  <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              <div className="overflow-hidden rounded-2xl border border-[#EEF2FF]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F8FAFC]">
                      <TableHead>Project</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                      <TableHead className="text-right">Payout</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {poolTasks.slice(0, 6).map(task => {
                      const status = getStatusConfig(task.status)
                      return (
                        <TableRow
                          key={task.id}
                          className="cursor-pointer transition-colors hover:bg-[#F8FAFC]"
                          onClick={() => handleProjectClick(task.id)}
                        >
                          <TableCell className="font-medium">
                            <div>
                              <p className="text-sm font-semibold text-[#1F2937]">{task.title}</p>
                              <p className="text-xs text-[#6B7280]">{task.supervisorName || 'AssignX Team'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-[#6B7280]">{task.subject}</TableCell>
                          <TableCell className="text-sm text-[#6B7280]">{formatShortDate(task.deadline)}</TableCell>
                          <TableCell>
                            <Badge className={cn('rounded-full px-3 py-1 text-xs', status.className)}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-full border-[#E5E7EB] text-xs"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleAcceptTask(task.id)
                              }}
                            >
                              Accept
                            </Button>
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold text-[#1F2937]">
                            {formatCurrency(task.price)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {poolTasks.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-sm text-[#6B7280]">
                          No open pool projects right now. Check back soon!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#6B7280]">
                <p>Showing {Math.min(poolTasks.length, 6)} of {poolTasks.length} projects</p>
                <Button
                  onClick={() => poolTasks[0] && handleAcceptTask(poolTasks[0].id)}
                  className="rounded-full bg-[#5B6CFF] text-white hover:bg-[#4A59E6]"
                  disabled={poolTasks.length === 0}
                >
                  Accept next project
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
