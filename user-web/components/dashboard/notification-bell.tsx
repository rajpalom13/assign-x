"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationStore, type Notification } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

/**
 * Notification bell with dropdown
 * Fetches notifications from Supabase and shows unread count badge
 */
export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotificationStore();
  const [open, setOpen] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications(20);
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    if (notification.link || notification.action_url) {
      setOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 hover:bg-muted/80 transition-colors">
          {isLoading ? (
            <Loader2 className="h-[18px] w-[18px] animate-spin" />
          ) : (
            <Bell className="h-[18px] w-[18px]" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification) => {
              const link = notification.link || notification.action_url;
              const isRead = notification.read ?? notification.is_read;

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    "flex cursor-pointer flex-col items-start gap-1 p-4",
                    !isRead && "bg-muted/50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  asChild={!!link}
                >
                  {link ? (
                    <Link href={link}>
                      <NotificationContent notification={notification} />
                    </Link>
                  ) : (
                    <div>
                      <NotificationContent notification={notification} />
                    </div>
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Notification content renderer
 */
function NotificationContent({ notification }: { notification: Notification }) {
  const isRead = notification.read ?? notification.is_read;
  const message = notification.message || notification.body;
  const createdAt = notification.createdAt || notification.created_at;

  return (
    <>
      <div className="flex w-full items-start justify-between gap-2">
        <span className="font-medium">{notification.title}</span>
        {!isRead && (
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
        )}
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(createdAt), {
          addSuffix: true,
        })}
      </span>
    </>
  );
}
