'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Flame,
  FolderOpen,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types/database'
import { getTimeRemaining } from './utils'

interface ActiveProjectsTabProps {
  /** List of active projects */
  projects: Project[]
  /** Loading state */
  isLoading?: boolean
  /** Callback when project card is clicked */
  onProjectClick?: (projectId: string) => void
  /** Callback when open workspace is clicked */
  onOpenWorkspace?: (projectId: string) => void
}

/** Get status display */
function getStatusDisplay(status: ProjectStatus): {
  label: string
  color: string
  dot: string
} {
  switch (status) {
    case 'assigned':
      return {
        label: 'Not Started',
        color: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
        dot: 'bg-amber-500',
      }
    case 'in_progress':
      return {
        label: 'In Progress',
        color: 'bg-sky-500/10 text-sky-700 border-sky-500/20',
        dot: 'bg-sky-500',
      }
    case 'revision_requested':
      return {
        label: 'Revision Needed',
        color: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
        dot: 'bg-rose-500',
      }
    case 'in_revision':
      return {
        label: 'In Revision',
        color: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
        dot: 'bg-violet-500',
      }
    default:
      return {
        label: status,
        color: 'bg-muted text-muted-foreground',
        dot: 'bg-muted-foreground',
      }
  }
}

/**
 * Active projects tab component
 * Shows projects that are in progress or need attention
 */
export function ActiveProjectsTab({
  projects,
  isLoading: _isLoading = false,
  onProjectClick,
  onOpenWorkspace,
}: ActiveProjectsTabProps) {
  // Sort by urgency and status
  const sortedProjects = [...projects].sort((a, b) => {
    // Revision requested first
    if (a.status === 'revision_requested' && b.status !== 'revision_requested')
      return -1
    if (b.status === 'revision_requested' && a.status !== 'revision_requested')
      return 1

    // Then by deadline
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })

  return (
    <Card className="border border-border/70 bg-card/90">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold">Active pipeline</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Keep momentum on active work and revisions.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {projects.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center"
          >
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold">No active projects</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Accept tasks from the open pool to start working on projects.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {sortedProjects.map((project, index) => {
                const timeInfo = getTimeRemaining(project.deadline)
                const statusInfo = getStatusDisplay(project.status)
                const isUrgent = timeInfo.isUrgent || project.is_urgent
                const payout = project.price ?? project.doer_payout ?? 0

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      className={cn(
                        'group rounded-2xl border border-border/70 bg-background/80 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg',
                        project.status === 'revision_requested' && 'border-rose-300 bg-rose-50/40',
                        isUrgent && project.status !== 'revision_requested' && 'border-amber-300'
                      )}
                      onClick={() => onProjectClick?.(project.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') onProjectClick?.(project.id)
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('h-2.5 w-2.5 rounded-full', statusInfo.dot)} />
                            <p className="text-sm font-semibold text-foreground line-clamp-1">
                              {project.title}
                            </p>
                            <Badge variant="outline" className={cn('rounded-full px-2 py-0.5 text-xs', statusInfo.color)}>
                              {statusInfo.label}
                            </Badge>
                            {isUrgent && (
                              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                                <Flame className="h-3 w-3" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {project.subject_name && <span>{project.subject_name}</span>}
                            {project.subject_name && project.supervisor_name && <span>•</span>}
                            {project.supervisor_name && <span>{project.supervisor_name}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Payout</p>
                          <p className="text-lg font-semibold text-emerald-600">
                            ₹{payout.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Due {timeInfo.text}
                          </span>
                          <Button
                            size="sm"
                            className={cn(
                              'rounded-full',
                              project.status === 'revision_requested' && 'bg-rose-600 hover:bg-rose-700'
                            )}
                            onClick={(event) => {
                              event.stopPropagation()
                              onOpenWorkspace?.(project.id)
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                            {project.status === 'revision_requested' ? 'Review' : 'Open'}
                          </Button>
                        </div>
                        <Progress
                          value={timeInfo.percentage}
                          className={cn('h-2', isUrgent && '[&>div]:bg-rose-500')}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  )
}
