/**
 * @fileoverview User details sheet component for viewing full user profile.
 * @module components/users/user-details
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Star,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Building2,
  IndianRupee,
  CheckCircle2,
  MessageSquare,
  Loader2,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { User } from "./types"
import { useUserProjects } from "@/hooks/use-users"
import { Skeleton } from "@/components/ui/skeleton"

interface UserDetailsProps {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onChat?: (userId: string) => void
}

export function UserDetails({
  user,
  open,
  onOpenChange,
  onChat,
}: UserDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch real projects data from Supabase
  const { projects, isLoading: isLoadingProjects } = useUserProjects({ userId: user.id })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      analyzing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      quoted: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      payment_pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      paid: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      submitted_for_qc: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      new_project: "New Project",
      proofreading: "Proofreading",
      plagiarism_check: "Plagiarism Check",
      ai_detection: "AI Detection",
      expert_opinion: "Expert Opinion",
    }
    return labels[type] || type
  }

  // useState with initializer is pure (runs once)
  const [thirtyDaysAgo] = useState(() => Date.now() - 30 * 24 * 60 * 60 * 1000)

  const isActive = useMemo(() => {
    return user.active_projects > 0 ||
      (user.last_active_at &&
        new Date(user.last_active_at).getTime() > thirtyDaysAgo)
  }, [user.active_projects, user.last_active_at, thirtyDaysAgo])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="space-y-4">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="text-lg">
                  {user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isActive && (
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-left">{user.full_name}</SheetTitle>
                {user.is_verified && (
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <SheetDescription className="text-left">
                {user.course ? `${user.course}${user.year ? ` - ${user.year}` : ""}` : "Client"}
              </SheetDescription>
              {onChat && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => onChat(user.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="font-bold">{user.total_projects}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="font-bold">{user.active_projects}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="font-bold">{user.completed_projects}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="font-bold text-sm">
                {user.average_project_value.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).replace("₹", "₹")}
              </p>
              <p className="text-xs text-muted-foreground">Avg Value</p>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="overview" className="m-0 space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Contact</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Academic Info */}
              {(user.college || user.course) && (
                <>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Academic Details</h4>
                    <div className="space-y-1">
                      {user.college && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{user.college}</span>
                        </div>
                      )}
                      {user.course && (
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {user.course}
                            {user.year && ` - ${user.year}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Account Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Account</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {formatDate(user.joined_at)}</span>
                  </div>
                  {user.last_active_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Last active {formatDate(user.last_active_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Spending Summary */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Spending Summary</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <IndianRupee className="h-4 w-4" />
                      <span className="text-xs">Total Spent</span>
                    </div>
                    <p className="text-lg font-bold">
                      {user.total_spent.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-xs">Avg Project</span>
                    </div>
                    <p className="text-lg font-bold">
                      {user.average_project_value.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="m-0 space-y-3">
              {isLoadingProjects ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">No projects yet</p>
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 border rounded-lg space-y-2 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {project.project_number}
                          </span>
                          <Badge className={cn("text-xs", getStatusColor(project.status))}>
                            {project.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="font-medium mt-1">{project.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {project.subject}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getServiceTypeLabel(project.service_type)}
                          </span>
                        </div>
                      </div>
                      {project.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{project.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        {project.doer_name && (
                          <span>Doer: {project.doer_name}</span>
                        )}
                      </div>
                      <span className="font-medium">
                        {project.user_amount.toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {project.status === "completed"
                        ? `Completed ${formatDate(project.completed_at!)}`
                        : `Due ${formatDate(project.deadline)}`}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
