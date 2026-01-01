'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Flame,
  AlertTriangle,
  FolderOpen,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types/database'

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

/** Calculate time remaining */
function getTimeRemaining(deadline: string): {
  text: string
  isUrgent: boolean
  percentage: number
} {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()

  if (diff <= 0) {
    return { text: 'Overdue', isUrgent: true, percentage: 100 }
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  let text: string
  if (days > 0) {
    text = `${days}d ${hours % 24}h remaining`
  } else if (hours > 0) {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    text = `${hours}h ${minutes}m remaining`
  } else {
    const minutes = Math.floor(diff / (1000 * 60))
    text = `${minutes}m remaining`
  }

  // Calculate percentage (assume 7 days as max)
  const maxTime = 7 * 24 * 60 * 60 * 1000
  const percentage = Math.min(100, Math.max(0, ((maxTime - diff) / maxTime) * 100))

  return {
    text,
    isUrgent: hours < 6,
    percentage,
  }
}

/** Get status display */
function getStatusDisplay(status: ProjectStatus): {
  label: string
  color: string
  icon?: React.ReactNode
} {
  switch (status) {
    case 'assigned':
      return {
        label: 'Not Started',
        color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      }
    case 'in_progress':
      return {
        label: 'In Progress',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      }
    case 'revision_requested':
      return {
        label: 'Revision Needed',
        color: 'bg-red-500/10 text-red-600 border-red-500/20',
        icon: <AlertTriangle className="h-3 w-3" />,
      }
    case 'in_revision':
      return {
        label: 'In Revision',
        color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      }
    default:
      return {
        label: status,
        color: 'bg-muted text-muted-foreground',
      }
  }
}

/**
 * Active projects tab component
 * Shows projects that are in progress or need attention
 */
export function ActiveProjectsTab({
  projects,
  isLoading = false,
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

  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Active Projects</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Accept tasks from the open pool to start working on projects
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {projects.length} active project{projects.length !== 1 ? 's' : ''}
      </p>

      <AnimatePresence mode="popLayout">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project, index) => {
            const timeInfo = getTimeRemaining(project.deadline)
            const statusInfo = getStatusDisplay(project.status)

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer hover:shadow-md transition-shadow',
                    project.status === 'revision_requested' &&
                      'border-red-500 border-2',
                    timeInfo.isUrgent &&
                      project.status !== 'revision_requested' &&
                      'border-orange-500'
                  )}
                  onClick={() => onProjectClick?.(project.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-2">
                          {project.title}
                        </CardTitle>
                        {project.subject_name && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {project.subject_name}
                          </Badge>
                        )}
                      </div>

                      {/* Urgency indicator */}
                      {(timeInfo.isUrgent || project.is_urgent) && (
                        <Flame className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Status badge */}
                    <Badge variant="outline" className={cn('gap-1', statusInfo.color)}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>

                    {/* Deadline progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Deadline
                        </span>
                        <span
                          className={cn(
                            'font-medium',
                            timeInfo.isUrgent ? 'text-red-500' : 'text-foreground'
                          )}
                        >
                          {timeInfo.text}
                        </span>
                      </div>
                      <Progress
                        value={timeInfo.percentage}
                        className={cn(
                          'h-1.5',
                          timeInfo.isUrgent && '[&>div]:bg-red-500'
                        )}
                      />
                    </div>

                    {/* Price and supervisor */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-green-600">
                        Rs. {(project.price ?? project.doer_payout ?? 0).toLocaleString('en-IN')}
                      </span>
                      {project.supervisor_name && (
                        <span className="text-muted-foreground truncate ml-2">
                          {project.supervisor_name}
                        </span>
                      )}
                    </div>

                    {/* Action button */}
                    <Button
                      className="w-full gap-2"
                      variant={
                        project.status === 'revision_requested'
                          ? 'destructive'
                          : 'default'
                      }
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenWorkspace?.(project.id)
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      {project.status === 'revision_requested'
                        ? 'View Revision'
                        : 'Open Workspace'}
                    </Button>
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
