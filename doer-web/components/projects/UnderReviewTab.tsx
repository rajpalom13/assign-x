'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Eye,
  CheckCircle2,
  FileSearch,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  isLoading = false,
  onProjectClick,
}: UnderReviewTabProps) {
  // Sort by submission time (most recent first)
  const sortedProjects = [...projects].sort((a, b) => {
    const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0
    const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0
    return bTime - aTime
  })

  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <FileSearch className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Projects Under Review</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Submit your completed work to see it here for quality check
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {projects.length} project{projects.length !== 1 ? 's' : ''} under review
      </p>

      <AnimatePresence mode="popLayout">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project, index) => {
            const statusInfo = getReviewStatusDisplay(project.status)

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onProjectClick?.(project.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base line-clamp-2 flex-1">
                        {project.title}
                      </CardTitle>
                      <div className="flex-shrink-0 text-muted-foreground">
                        {statusInfo.icon}
                      </div>
                    </div>
                    {project.subject_name && (
                      <Badge variant="secondary" className="mt-1 text-xs w-fit">
                        {project.subject_name}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Status badge and description */}
                    <div className="space-y-1">
                      <Badge
                        variant="outline"
                        className={cn('gap-1', statusInfo.color)}
                      >
                        {statusInfo.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {statusInfo.description}
                      </p>
                    </div>

                    {/* Submission info */}
                    <div className="flex items-center justify-between text-sm border-t pt-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Submitted</span>
                      </div>
                      <span className="font-medium">
                        {formatRelativeTime(project.submitted_at)}
                      </span>
                    </div>

                    {/* Supervisor */}
                    {project.supervisor_name && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Reviewer</span>
                        <span className="font-medium">{project.supervisor_name}</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between text-sm border-t pt-3">
                      <span className="text-muted-foreground">Earnings</span>
                      <span className="font-semibold text-green-600">
                        Rs. {(project.price ?? project.doer_payout ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex justify-center pt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                          <div className="h-2 w-2 rounded-full bg-primary/60 animate-pulse delay-75" />
                          <div className="h-2 w-2 rounded-full bg-primary/30 animate-pulse delay-150" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Processing...
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </AnimatePresence>
    </div>
  )
}
