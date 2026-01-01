'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  IndianRupee,
  Star,
  Calendar,
  Download,
  Trophy,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types/database'

interface CompletedProjectsTabProps {
  /** List of completed projects */
  projects: Project[]
  /** Loading state */
  isLoading?: boolean
  /** Callback when project card is clicked */
  onProjectClick?: (projectId: string) => void
  /** Callback to download invoice */
  onDownloadInvoice?: (projectId: string) => void
}

/** Get payment status display */
function getPaymentStatus(status: ProjectStatus): {
  label: string
  color: string
  icon: React.ReactNode
} {
  switch (status) {
    case 'delivered':
      return {
        label: 'Delivered',
        color: 'bg-green-500/10 text-green-600 border-green-500/20',
        icon: <IndianRupee className="h-3 w-3" />,
      }
    case 'qc_approved':
    case 'auto_approved':
      return {
        label: 'Approved',
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        icon: <CheckCircle2 className="h-3 w-3" />,
      }
    case 'completed':
      return {
        label: 'Completed',
        color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        icon: <Trophy className="h-3 w-3" />,
      }
    default:
      return {
        label: status,
        color: 'bg-muted text-muted-foreground',
        icon: <CheckCircle2 className="h-3 w-3" />,
      }
  }
}

/** Format date */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Completed projects tab component
 * Shows historical completed projects with earnings
 */
export function CompletedProjectsTab({
  projects,
  isLoading = false,
  onProjectClick,
  onDownloadInvoice,
}: CompletedProjectsTabProps) {
  // Sort by completion time (most recent first)
  const sortedProjects = [...projects].sort((a, b) => {
    const aTime = a.completed_at ? new Date(a.completed_at).getTime() : 0
    const bTime = b.completed_at ? new Date(b.completed_at).getTime() : 0
    return bTime - aTime
  })

  // Calculate total earnings
  const totalEarnings = projects.reduce((sum, p) => sum + (p.price ?? p.doer_payout ?? 0), 0)

  if (projects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Completed Projects Yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Complete your first project to see your achievements here
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-3xl font-bold text-green-600">
                Rs. {totalEarnings.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Projects Completed</p>
              <p className="text-3xl font-bold">{projects.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        {projects.length} completed project{projects.length !== 1 ? 's' : ''}
      </p>

      <AnimatePresence mode="popLayout">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project, index) => {
            const paymentInfo = getPaymentStatus(project.status)

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
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    </div>
                    {project.subject_name && (
                      <Badge variant="secondary" className="mt-1 text-xs w-fit">
                        {project.subject_name}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Payment status */}
                    <Badge
                      variant="outline"
                      className={cn('gap-1', paymentInfo.color)}
                    >
                      {paymentInfo.icon}
                      {paymentInfo.label}
                    </Badge>

                    {/* Earnings */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Earned</span>
                      <span className="font-bold text-green-600 text-lg">
                        Rs. {(project.price ?? project.doer_payout ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Completion date */}
                    <div className="flex items-center justify-between text-sm border-t pt-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Completed</span>
                      </div>
                      <span className="font-medium">
                        {formatDate(project.completed_at)}
                      </span>
                    </div>

                    {/* Supervisor */}
                    {project.supervisor_name && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Supervisor</span>
                        <span className="font-medium truncate ml-2">
                          {project.supervisor_name}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    {(project.status === 'delivered' || project.status === 'completed') && onDownloadInvoice && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDownloadInvoice(project.id)
                        }}
                      >
                        <Download className="h-4 w-4" />
                        Download Invoice
                      </Button>
                    )}

                    {/* Rating placeholder */}
                    <div className="flex items-center justify-center gap-1 pt-2 border-t">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-4 w-4',
                            star <= 4
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          )}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">
                        4.0
                      </span>
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
