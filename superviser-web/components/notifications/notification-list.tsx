/**
 * @fileoverview Notification list with filtering and batch actions.
 * @module components/notifications/notification-list
 */

"use client"

import { useState, useMemo } from "react"
import {
  Bell,
  BellOff,
  CheckCheck,
  Filter,
  Search,
  Trash2,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { NotificationItem } from "./notification-item"
import { Notification, NotificationType, NotificationGroup } from "./types"

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "project_submitted",
    title: "New Project Request",
    message: "A new project 'Marketing Research Paper' has been submitted and needs your analysis.",
    project_id: "proj-123",
    project_number: "AX-00456",
    action_url: "/requests/proj-123",
    is_read: false,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-2",
    type: "payment_received",
    title: "Payment Received",
    message: "Payment of ₹3,500 received for project AX-00445. Ready to assign doer.",
    project_id: "proj-122",
    project_number: "AX-00445",
    action_url: "/requests/proj-122",
    is_read: false,
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-3",
    type: "work_submitted",
    title: "Work Submitted for QC",
    message: "Doer Amit Sharma has submitted work for 'Economics Essay'. Please review.",
    project_id: "proj-120",
    project_number: "AX-00432",
    action_url: "/projects/proj-120",
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-4",
    type: "new_message",
    title: "New Message",
    message: "Client Neha sent a message regarding project AX-00440.",
    project_id: "proj-121",
    project_number: "AX-00440",
    action_url: "/chat/proj-121",
    is_read: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-5",
    type: "payout_processed",
    title: "Payout Processed",
    message: "Your withdrawal of ₹8,000 has been processed and transferred to your bank account.",
    is_read: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-6",
    type: "qc_approved",
    title: "QC Approved",
    message: "You approved project AX-00425 and it has been delivered to the client.",
    project_id: "proj-115",
    project_number: "AX-00425",
    is_read: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-7",
    type: "revision_requested",
    title: "Revision Requested",
    message: "Client has requested revisions for project AX-00420. Please coordinate with the doer.",
    project_id: "proj-110",
    project_number: "AX-00420",
    action_url: "/projects/proj-110",
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-8",
    type: "project_completed",
    title: "Project Completed",
    message: "Project AX-00418 has been marked as completed. Commission: ₹375",
    project_id: "proj-108",
    project_number: "AX-00418",
    is_read: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-9",
    type: "system_alert",
    title: "System Maintenance",
    message: "Scheduled maintenance on Dec 28, 2025 from 2:00 AM to 4:00 AM IST.",
    is_read: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

type FilterType = "all" | "unread" | NotificationType

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  )

  const filteredNotifications = useMemo(() => {
    let result = [...notifications]

    // Tab filter
    if (activeTab === "unread") {
      result = result.filter((n) => !n.is_read)
    }

    // Type filter
    if (filterType !== "all" && filterType !== "unread") {
      result = result.filter((n) => n.type === filterType)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query) ||
          n.project_number?.toLowerCase().includes(query)
      )
    }

    return result
  }, [notifications, searchQuery, filterType, activeTab])

  const groupedNotifications = useMemo(() => {
    const groups: NotificationGroup[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const todayNotifs: Notification[] = []
    const yesterdayNotifs: Notification[] = []
    const thisWeekNotifs: Notification[] = []
    const olderNotifs: Notification[] = []

    filteredNotifications.forEach((n) => {
      const date = new Date(n.created_at)
      if (date >= today) {
        todayNotifs.push(n)
      } else if (date >= yesterday) {
        yesterdayNotifs.push(n)
      } else if (date >= weekAgo) {
        thisWeekNotifs.push(n)
      } else {
        olderNotifs.push(n)
      }
    })

    if (todayNotifs.length) groups.push({ date: "Today", notifications: todayNotifs })
    if (yesterdayNotifs.length) groups.push({ date: "Yesterday", notifications: yesterdayNotifs })
    if (thisWeekNotifs.length) groups.push({ date: "This Week", notifications: thisWeekNotifs })
    if (olderNotifs.length) groups.push({ date: "Older", notifications: olderNotifs })

    return groups
  }, [filteredNotifications])

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    toast.success("Marked as read")
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    toast.success("All notifications marked as read")
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast.success("Notification deleted")
  }

  const handleDeleteAll = () => {
    setNotifications([])
    toast.success("All notifications deleted")
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id)
    }
    if (notification.action_url) {
      // Navigate to action URL
      console.log("Navigate to:", notification.action_url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search & Filter */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filterType}
                onValueChange={(v) => setFilterType(v as FilterType)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="project_submitted">New Projects</SelectItem>
                  <SelectItem value="payment_received">Payments</SelectItem>
                  <SelectItem value="work_submitted">Work Submissions</SelectItem>
                  <SelectItem value="new_message">Messages</SelectItem>
                  <SelectItem value="payout_processed">Payouts</SelectItem>
                  <SelectItem value="system_alert">System Alerts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Mark all read</span>
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                    disabled={notifications.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear all</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all notifications. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAll}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs & Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <Bell className="h-4 w-4" />
            All
            <Badge variant="secondary" className="ml-1">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            <BellOff className="h-4 w-4" />
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-1 bg-primary">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No notifications</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTab === "unread"
                      ? "You're all caught up! No unread notifications."
                      : "You don't have any notifications yet."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                {groupedNotifications.map((group) => (
                  <div key={group.date}>
                    <div className="px-4 py-2 bg-muted/50 border-b">
                      <p className="text-sm font-medium text-muted-foreground">
                        {group.date}
                      </p>
                    </div>
                    {group.notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onClick={handleNotificationClick}
                      />
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
