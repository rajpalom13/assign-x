import { create } from "zustand";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/actions/data";

/**
 * Notification interface matching Supabase schema
 */
export interface Notification {
  id: string;
  profile_id: string;
  notification_type: string;
  title: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  // Computed fields for backward compatibility
  message?: string;
  type?: "info" | "success" | "warning" | "error";
  read?: boolean;
  createdAt?: string;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (limit?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
  setLoading: (isLoading: boolean) => void;
}

/**
 * Maps notification type to display type
 */
function mapNotificationType(
  type: string
): "info" | "success" | "warning" | "error" {
  switch (type) {
    case "quote_ready":
    case "project_completed":
    case "payment_success":
      return "success";
    case "payment_failed":
    case "project_cancelled":
      return "error";
    case "deadline_approaching":
    case "revision_requested":
      return "warning";
    default:
      return "info";
  }
}

/**
 * Transforms database notification to component format
 */
function transformNotification(n: Notification): Notification {
  return {
    ...n,
    message: n.body,
    type: mapNotificationType(n.notification_type),
    read: n.is_read,
    createdAt: n.created_at,
    link: n.action_url || undefined,
  };
}

/**
 * Notification state store
 * Manages user notifications with Supabase integration
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  /**
   * Fetches notifications from Supabase
   */
  fetchNotifications: async (limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getNotifications(limit);
      const notifications = data.map(transformNotification);
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch notifications",
        isLoading: false,
      });
    }
  },

  /**
   * Marks a single notification as read
   */
  markAsRead: async (id) => {
    const result = await markNotificationRead(id);
    if (result.error) {
      set({ error: result.error });
      return;
    }

    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.is_read) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, is_read: true, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return state;
    });
  },

  /**
   * Marks all notifications as read
   */
  markAllAsRead: async () => {
    const result = await markAllNotificationsRead();
    if (result.error) {
      set({ error: result.error });
      return;
    }

    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        is_read: true,
        read: true,
      })),
      unreadCount: 0,
    }));
  },

  /**
   * Clears all notifications from state
   */
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  /**
   * Sets loading state
   */
  setLoading: (isLoading) => set({ isLoading }),
}));
