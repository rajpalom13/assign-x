'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Flame, IndianRupee, User, Calendar, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { ProjectStatus } from '@/types/database'

interface ProjectCardProps {
  /** Project ID */
  id: string
  /** Project title */
  title: string
  /** Subject/category */
  subject: string
  /** Project description */
  description?: string
  /** Price in INR */
  price: number
  /** Deadline timestamp */
  deadline: Date
  /** Project status */
  status: ProjectStatus
  /** Supervisor name (for assigned tasks) */
  supervisorName?: string
  /** Whether this is an urgent task */
  isUrgent?: boolean
  /** Callback when accept button is clicked */
  onAccept?: (id: string) => void
  /** Callback when card is clicked */
  onClick?: (id: string) => void
}

/**
 * Project card component
 * Displays project details in a card format
 */
export function ProjectCard({
  id,
  title,
  subject,
  description,
  price,
  deadline,
  status,
  supervisorName,
  isUrgent,
  onAccept,
  onClick,
}: ProjectCardProps) {
  const [isAccepting, setIsAccepting] = useState(false)

  /** Calculate time remaining */
  const getTimeRemaining = () => {
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()

    if (diff <= 0) return 'Overdue'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours >= 24) {
      const days = Math.floor(hours / 24)
      return `${days}d ${hours % 24}h`
    }

    return `${hours}h ${minutes}m`
  }

  /** Check if deadline is within 6 hours */
  const isDeadlineSoon = () => {
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    return diff > 0 && diff <= 6 * 60 * 60 * 1000
  }

  const timeRemaining = getTimeRemaining()
  const showUrgent = isUrgent || isDeadlineSoon()

  /** Handle accept click */
  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onAccept) return

    setIsAccepting(true)
    try {
      await onAccept(id)
    } finally {
      setIsAccepting(false)
    }
  }

  /** Handle card click */
  const handleClick = () => {
    onClick?.(id)
  }

  /** Get status badge */
  const getStatusBadge = () => {
    switch (status) {
      case 'paid':
        return null
      case 'assigned':
        return <Badge variant="secondary">Assigned</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>
      case 'submitted_for_qc':
        return <Badge className="bg-purple-500">Submitted</Badge>
      case 'qc_in_progress':
        return <Badge className="bg-yellow-500">Under Review</Badge>
      case 'revision_requested':
        return <Badge variant="destructive">Revision Needed</Badge>
      case 'in_revision':
        return <Badge className="bg-orange-500">In Revision</Badge>
      case 'completed':
      case 'auto_approved':
        return <Badge className="bg-green-500">Completed</Badge>
      case 'delivered':
        return <Badge className="bg-green-600">Delivered</Badge>
      default:
        return null
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-shadow hover:shadow-md',
          showUrgent && 'border-red-500 border-2',
          status === 'revision_requested' && 'border-destructive'
        )}
        onClick={handleClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Subject badge */}
              <Badge variant="outline" className="mb-2">
                {subject}
              </Badge>

              {/* Title */}
              <h3 className="font-semibold text-base leading-tight line-clamp-2">
                {title}
              </h3>
            </div>

            {/* Urgent indicator */}
            {showUrgent && (
              <div className="flex items-center gap-1 text-red-500 animate-pulse">
                <Flame className="h-5 w-5" />
                <span className="text-xs font-medium">Urgent</span>
              </div>
            )}
          </div>

          {/* Status badge */}
          {getStatusBadge()}
        </CardHeader>

        <CardContent className="pb-2">
          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-sm">
            {/* Price */}
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
              <IndianRupee className="h-4 w-4" />
              <span>{price.toLocaleString('en-IN')}</span>
            </div>

            {/* Deadline */}
            <div
              className={cn(
                'flex items-center gap-1',
                showUrgent ? 'text-red-500' : 'text-muted-foreground'
              )}
            >
              <Clock className="h-4 w-4" />
              <span>{timeRemaining}</span>
            </div>

            {/* Due date */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {deadline.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>

            {/* Supervisor */}
            {supervisorName && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{supervisorName}</span>
              </div>
            )}
          </div>
        </CardContent>

        {/* Action footer - show for pool tasks that are paid but not assigned */}
        {status === 'paid' && onAccept && (
          <CardFooter className="pt-2">
            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept Task
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
}
