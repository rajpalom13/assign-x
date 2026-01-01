/**
 * @fileoverview Card displaying ongoing project status and progress.
 * @module components/projects/ongoing-project-card
 */

"use client"

import { useState, useEffect } from "react"
import { differenceInSeconds, format, formatDistanceToNow } from "date-fns"
import {
  Clock,
  MessageSquare,
  User,
  FileText,
  AlertTriangle,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ActiveProject, STATUS_CONFIG } from "./types"

interface OngoingProjectCardProps {
  project: ActiveProject
  onChatClick?: (projectId: string) => void
  onViewDetails?: (projectId: string) => void
}

function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState("")
  const [isUrgent, setIsUrgent] = useState(false)
  const [isCritical, setIsCritical] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const deadlineDate = new Date(deadline)
      const diffInSeconds = differenceInSeconds(deadlineDate, now)

      if (diffInSeconds <= 0) {
        setTimeLeft("Overdue")
        setIsCritical(true)
        return
      }

      const days = Math.floor(diffInSeconds / 86400)
      const hours = Math.floor((diffInSeconds % 86400) / 3600)
      const minutes = Math.floor((diffInSeconds % 3600) / 60)
      const seconds = diffInSeconds % 60

      // Set urgency levels
      if (diffInSeconds < 6 * 3600) {
        setIsCritical(true)
        setIsUrgent(true)
      } else if (diffInSeconds < 24 * 3600) {
        setIsCritical(false)
        setIsUrgent(true)
      } else {
        setIsCritical(false)
        setIsUrgent(false)
      }

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [deadline])

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 font-mono text-sm font-medium",
        isCritical
          ? "text-red-600"
          : isUrgent
            ? "text-amber-600"
            : "text-muted-foreground"
      )}
    >
      <Clock
        className={cn(
          "h-4 w-4",
          isCritical && "animate-pulse",
          isUrgent && !isCritical && "animate-[pulse_2s_ease-in-out_infinite]"
        )}
      />
      <span>{timeLeft}</span>
      {isCritical && <AlertTriangle className="h-4 w-4 animate-pulse" />}
    </div>
  )
}

export function OngoingProjectCard({
  project,
  onChatClick,
  onViewDetails,
}: OngoingProjectCardProps) {
  const statusConfig = STATUS_CONFIG[project.status]

  return (
    <Card className="group transition-all hover:shadow-md hover:border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-muted-foreground">
                {project.project_number}
              </span>
              <Badge
                variant="outline"
                className={cn(statusConfig.bgColor, statusConfig.color)}
              >
                {statusConfig.label}
              </Badge>
              {project.revision_count && project.revision_count > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Rev {project.revision_count}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight line-clamp-1">
              {project.title}
            </h3>
          </div>
          <CountdownTimer deadline={project.deadline} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">{project.subject}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="truncate">{project.service_type}</span>
          </div>
        </div>

        {/* Doer Info */}
        {project.doer_name && (
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{project.doer_name}</p>
                <p className="text-xs text-muted-foreground">Assigned Expert</p>
              </div>
            </div>
            {project.assigned_at && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(project.assigned_at), {
                  addSuffix: true,
                })}
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {project.word_count && (
            <span>{project.word_count.toLocaleString()} words</span>
          )}
          {project.page_count && <span>{project.page_count} pages</span>}
          <span className="ml-auto font-medium text-foreground">
            ${project.supervisor_commission.toFixed(2)} commission
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative"
                  onClick={() => onChatClick?.(project.id)}
                  asChild
                >
                  <Link href={`/chat/${project.id}`}>
                    <MessageSquare className="h-4 w-4 mr-1.5" />
                    Chat
                    {project.has_unread_messages && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive" />
                    )}
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open chat with client and expert</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto group-hover:bg-primary group-hover:text-primary-foreground"
            onClick={() => onViewDetails?.(project.id)}
            asChild
          >
            <Link href={`/projects/${project.id}`}>
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
