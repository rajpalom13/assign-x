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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types/database'
import { formatDate } from './utils'

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

/**
 * Completed projects tab component
 * Shows historical completed projects with earnings
 */
export function CompletedProjectsTab({
  projects,
  isLoading: _isLoading = false,
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

  return (
    <Card className="border border-border/70 bg-card/90">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold">Completed highlights</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Celebrate delivered work and track earnings.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {projects.length} completed
          </Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3">
            <p className="text-xs text-emerald-700">Total earnings</p>
            <p className="text-2xl font-semibold text-emerald-700">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/60 p-3">
            <p className="text-xs text-muted-foreground">Projects delivered</p>
            <p className="text-2xl font-semibold text-foreground">{projects.length}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-10 text-center"
          >
            <Trophy className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-base font-semibold">No completed projects yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Complete your first project to see achievements here.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {sortedProjects.map((project, index) => {
                const paymentInfo = getPaymentStatus(project.status)
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
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <p className="text-sm font-semibold text-foreground line-clamp-1">
                            {project.title}
                          </p>
                          <Badge variant="outline" className={cn('rounded-full px-2 py-0.5 text-xs', paymentInfo.color)}>
                            {paymentInfo.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {project.subject_name && <span>{project.subject_name}</span>}
                          {project.subject_name && project.supervisor_name && <span>•</span>}
                          {project.supervisor_name && <span>{project.supervisor_name}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Completed {project.completed_at ? formatDate(project.completed_at) : 'Unknown'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Earned</p>
                          <p className="text-lg font-semibold text-emerald-600">
                            ₹{payout.toLocaleString('en-IN')}
                          </p>
                        </div>
                        {(project.status === 'delivered' || project.status === 'completed') && onDownloadInvoice && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full gap-2"
                            onClick={(event) => {
                              event.stopPropagation()
                              onDownloadInvoice(project.id)
                            }}
                          >
                            <Download className="h-4 w-4" />
                            Invoice
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between rounded-2xl bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
                      <span>Quality score</span>
                      <span className="flex items-center gap-1 text-foreground">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-3.5 w-3.5',
                              star <= 4
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            )}
                          />
                        ))}
                        <span className="text-xs">4.0</span>
                      </span>
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
