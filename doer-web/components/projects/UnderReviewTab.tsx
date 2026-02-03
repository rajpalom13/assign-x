'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Eye,
  CheckCircle2,
  FileSearch,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types/database'

interface UnderReviewTabProps {
  /** List of projects under review */
  projects: Project[]
  /** Loading state */
  isLoading?: boolean
  /** Callback when project card is clicked */
  onProjectClick?: (projectId: string) => void
}

/** Get status display for review states */
function getReviewStatusDisplay(status: ProjectStatus): {
  label: string
  color: string
  icon: React.ReactNode
  description: string
} {
  switch (status) {
    case 'submitted':
      return {
        label: 'Submitted',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        icon: <CheckCircle2 className="h-4 w-4" />,
        description: 'Awaiting supervisor review',
      }
    case 'submitted_for_qc':
    case 'qc_in_progress':
      return {
        label: 'QC in Progress',
        color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        description: 'Quality check in progress',
      }
    default:
      return {
        label: 'Under Review',
        color: 'bg-muted text-muted-foreground',
        icon: <Eye className="h-4 w-4" />,
        description: 'Being reviewed',
      }
  }
}

/** Format relative time */
function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return 'Unknown'

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays}d ago`
  }
  if (diffHours > 0) {
    return `${diffHours}h ago`
  }
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  return `${diffMinutes}m ago`
}

/**
 * Under review tab component
 * Shows submitted projects awaiting QC approval
 */
export function UnderReviewTab({
  projects,
  isLoading: _isLoading = false,
  onProjectClick,
}: UnderReviewTabProps) {
  // Sort by submission time (most recent first)
  const sortedProjects = [...projects].sort((a, b) => {
    const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0
    const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0
    return bTime - aTime
  })

  return (
    <Card className="border border-border/70 bg-card/90">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold">Review queue</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Projects waiting for QC approval and supervisor feedback.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {projects.length} in review
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
            <FileSearch className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold">No projects under review</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Submit your completed work to see it in the review queue.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {sortedProjects.map((project, index) => {
                const statusInfo = getReviewStatusDisplay(project.status)
                const payout = project.price ?? project.doer_payout ?? 0

                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <div
                      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/80 p-4 transition hover:shadow-lg"
                      onClick={() => onProjectClick?.(project.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') onProjectClick?.(project.id)
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground line-clamp-1">
                            {project.title}
                          </p>
                          <Badge variant="outline" className={cn('rounded-full px-2 py-0.5 text-xs', statusInfo.color)}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {project.subject_name && <span>{project.subject_name}</span>}
                          {project.subject_name && project.supervisor_name && <span>•</span>}
                          {project.supervisor_name && <span>Reviewer: {project.supervisor_name}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Submitted {formatRelativeTime(project.submitted_at)}
                        </div>
                        <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Earnings</p>
                          <p className="text-base font-semibold text-emerald-600">
                            ₹{payout.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 rounded-full"
                          onClick={(event) => {
                            event.stopPropagation()
                            onProjectClick?.(project.id)
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                          View
                        </Button>
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
