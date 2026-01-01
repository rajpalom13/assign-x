/**
 * @fileoverview Custom hooks for notifications management.
 * @module hooks/use-notifications
 */

"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Notification, NotificationType } from "@/types/database"

interface UseNotificationsOptions {
  type?: NotificationType | NotificationType[]
  isRead?: boolean
  limit?: number
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { type, isRead, limit = 50 } = options
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchNotifications = useCallback(async () => {
    const supabase = createClient()

    try {
      setIsLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Build query
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit)

      // Filter by type
      if (type) {
        if (Array.isArray(type)) {
          query = query.in("notification_type", type)
        } else {
          query = query.eq("notification_type", type)
        }
      }

      // Filter by read status
      if (isRead !== undefined) {
        query = query.eq("is_read", isRead)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      setNotifications(data || [])

      // Get unread count
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("profile_id", user.id)
        .eq("is_read", false)

      setUnreadCount(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch notifications"))
    } finally {
      setIsLoading(false)
    }
  }, [type, isRead, limit])

  const markAsRead = useCallback(async (notificationId: string) => {
    const supabase = createClient()

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)

    if (updateError) throw updateError

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("profile_id", user.id)
      .eq("is_read", false)

    if (updateError) throw updateError

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    const supabase = createClient()

    const notification = notifications.find(n => n.id === notificationId)

    const { error: deleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId)

    if (deleteError) throw deleteError

    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    if (notification && !notification.is_read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }, [notifications])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Real-time subscription for new notifications
  useEffect(() => {
    const supabase = createClient()

    let userId: string | undefined

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      userId = user.id

      const channel = supabase
        .channel("notifications_changes")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `profile_id=eq.${userId}`,
          },
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev])
            setUnreadCount(prev => prev + 1)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    })
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  }
}

// Notification type groupings
export const NOTIFICATION_GROUPS = {
  project: [
    "project_submitted",
    "quote_ready",
    "payment_received",
    "project_assigned",
    "work_submitted",
    "qc_approved",
    "qc_rejected",
    "revision_requested",
    "project_delivered",
    "project_completed",
  ] as NotificationType[],
  chat: ["new_message"] as NotificationType[],
  payment: ["payout_processed"] as NotificationType[],
  system: ["system_alert", "promotional"] as NotificationType[],
}

export function useNotificationsByGroup() {
  const { notifications, unreadCount, isLoading, error, refetch, markAsRead, markAllAsRead } =
    useNotifications()

  const groupedNotifications = {
    project: notifications.filter(n =>
      NOTIFICATION_GROUPS.project.includes(n.notification_type as NotificationType)
    ),
    chat: notifications.filter(n =>
      NOTIFICATION_GROUPS.chat.includes(n.notification_type as NotificationType)
    ),
    payment: notifications.filter(n =>
      NOTIFICATION_GROUPS.payment.includes(n.notification_type as NotificationType)
    ),
    system: notifications.filter(n =>
      NOTIFICATION_GROUPS.system.includes(n.notification_type as NotificationType)
    ),
  }

  return {
    notifications,
    groupedNotifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  }
}
