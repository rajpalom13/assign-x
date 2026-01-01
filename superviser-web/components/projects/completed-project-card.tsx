/**
 * @fileoverview Card displaying completed project summary and details.
 * @module components/projects/completed-project-card
 */

"use client"

import { format } from "date-fns"
import {
  CheckCircle2,
  Star,
  FileText,
  Clock,
  User,
  DollarSign,
  Eye,
  RotateCcw,
  MessageSquare,
} from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ActiveProject, STATUS_CONFIG } from "./types"

interface CompletedProjectCardProps {
  project: ActiveProject
  rating?: number
  feedback?: string
  onViewDetails?: (projectId: string) => void
  onViewChat?: (projectId: string) => void
}

function TimelineItem({
  label,
  date,
  icon: Icon,
  isLast = false,
}: {
  label: string
  date?: string
  icon: React.ComponentType<{ className?: string }>
  isLast?: boolean
}) {
  if (!date) return null
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        {!isLast && <div className="w-px h-full bg-border flex-1 min-h-[1rem]" />}
      </div>
      <div className="pb-3">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(date), "MMM d, yyyy 'at' h:mm a")}
        </p>
      </div>
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/30"
          )}
        />
      ))}
      <span className="ml-1.5 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

export function CompletedProjectCard({
  project,
  rating,
  feedback,
  onViewDetails,
  onViewChat,
}: CompletedProjectCardProps) {
  const statusConfig = STATUS_CONFIG[project.status]

  return (
    <Card className="transition-all hover:shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground">
                {project.project_number}
              </span>
              <Badge
                variant="outline"
                className={cn(statusConfig.bgColor, statusConfig.color)}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
              {project.revision_count && project.revision_count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  {project.revision_count} revision
                  {project.revision_count > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base leading-tight line-clamp-1">
              {project.title}
            </h3>
          </div>
          {rating && <StarRating rating={rating} />}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{project.subject}</span>
          <span>|</span>
          <span>{project.service_type}</span>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="text-sm font-medium">{project.user_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Expert</p>
              <p className="text-sm font-medium">
                {project.doer_name || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Client Feedback */}
        {feedback && (
          <div className="p-3 rounded-lg bg-muted/30 border-l-2 border-primary">
            <p className="text-xs text-muted-foreground mb-1">
              Client Feedback
            </p>
            <p className="text-sm italic">&ldquo;{feedback}&rdquo;</p>
          </div>
        )}

        {/* Timeline Collapsible */}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Clock className="h-4 w-4 mr-2" />
              View Project Timeline
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="pl-2">
              <TimelineItem
                label="Project Submitted"
                date={project.created_at}
                icon={FileText}
              />
              <TimelineItem
                label="Assigned to Expert"
                date={project.assigned_at}
                icon={User}
              />
              <TimelineItem
                label="Submitted for Review"
                date={project.submitted_for_qc_at}
                icon={FileText}
              />
              <TimelineItem
                label="Delivered to Client"
                date={project.delivered_at}
                icon={CheckCircle2}
              />
              <TimelineItem
                label="Project Completed"
                date={project.completed_at}
                icon={CheckCircle2}
                isLast
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Earnings */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Commission Earned</span>
          </div>
          <span className="font-semibold text-green-600">
            ${project.supervisor_commission.toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewChat?.(project.id)}
            asChild
          >
            <Link href={`/chat/${project.id}`}>
              <MessageSquare className="h-4 w-4 mr-1.5" />
              View Chat
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => onViewDetails?.(project.id)}
            asChild
          >
            <Link href={`/projects/${project.id}`}>
              <Eye className="h-4 w-4 mr-1.5" />
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
