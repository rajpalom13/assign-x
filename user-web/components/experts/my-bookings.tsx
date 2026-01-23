"use client";

/**
 * MyBookings - Premium bookings management with glassmorphic design
 * Matches the design patterns from projects-pro.tsx
 * Features sub-tabs for Upcoming, Completed, and Cancelled bookings
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Video,
  MessageCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils";
import type { ConsultationBooking, SessionStatus } from "@/types/expert";
import { MOCK_EXPERTS } from "@/lib/data/experts";

interface MyBookingsProps {
  bookings: ConsultationBooking[];
  onMessage?: (bookingId: string) => void;
  onReschedule?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  onJoin?: (bookingId: string) => void;
  className?: string;
}

type BookingTab = "upcoming" | "completed" | "cancelled";

/**
 * Sub-tab configuration
 */
const TABS: Array<{
  id: BookingTab;
  label: string;
  icon: React.ElementType;
  statuses: SessionStatus[];
}> = [
  {
    id: "upcoming",
    label: "Upcoming",
    icon: CalendarClock,
    statuses: ["upcoming", "in_progress"],
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle2,
    statuses: ["completed"],
  },
  {
    id: "cancelled",
    label: "Cancelled",
    icon: XCircle,
    statuses: ["cancelled", "no_show"],
  },
];

/**
 * Get expert by ID
 */
function getExpertById(expertId: string) {
  return MOCK_EXPERTS.find((e) => e.id === expertId);
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format date for display
 */
function formatBookingDate(date: Date): string {
  const now = new Date();
  const bookingDate = new Date(date);
  const diff = bookingDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0 && days < 7) return `In ${days} days`;

  return bookingDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/**
 * Get time until booking
 */
function getTimeUntil(date: Date, startTime: string): string {
  const now = new Date();
  const bookingDate = new Date(date);
  const [hours, minutes] = startTime.split(":").map(Number);
  bookingDate.setHours(hours, minutes, 0, 0);

  const diff = bookingDate.getTime() - now.getTime();
  const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
  const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (diff < 0) return "Started";
  if (hoursUntil < 1) return `${minutesUntil}m`;
  if (hoursUntil < 24) return `${hoursUntil}h ${minutesUntil}m`;
  return `${Math.floor(hoursUntil / 24)}d`;
}

/**
 * Status badge configuration - matching glassmorphic design
 */
function getStatusConfig(status: SessionStatus) {
  switch (status) {
    case "upcoming":
      return {
        label: "Confirmed",
        className: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30",
      };
    case "in_progress":
      return {
        label: "In Progress",
        className: "bg-violet-100/80 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200/50 dark:border-violet-800/30",
      };
    case "completed":
      return {
        label: "Completed",
        className: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200/50 dark:border-red-800/30",
      };
    case "no_show":
      return {
        label: "No Show",
        className: "bg-gray-100/80 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200/50 dark:border-gray-800/30",
      };
  }
}

/**
 * Booking card component - glassmorphic style
 */
function BookingCard({
  booking,
  onMessage,
  onReschedule,
  onCancel,
  onJoin,
}: {
  booking: ConsultationBooking;
  onMessage?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  onJoin?: () => void;
}) {
  const expert = getExpertById(booking.expertId);
  const statusConfig = getStatusConfig(booking.status);
  const isUpcoming = booking.status === "upcoming" || booking.status === "in_progress";

  if (!expert) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      {/* Glassmorphic card */}
      <div className="relative overflow-hidden rounded-[20px] p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:bg-white/90 dark:hover:bg-white/10">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-100/30 to-purple-50/10 dark:from-violet-900/5 dark:to-transparent pointer-events-none rounded-[20px]" />

        <div className="relative z-10 flex flex-col md:flex-row gap-4">
          {/* Expert Info */}
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-14 w-14 border-2 border-white/80 dark:border-white/10 shadow-lg shrink-0">
              <AvatarImage src={expert.avatar} alt={expert.name} />
              <AvatarFallback className="text-base font-bold bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 text-foreground">
                {getInitials(expert.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate text-foreground">{expert.name}</h3>
                <Badge className={cn("border", statusConfig.className)}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {expert.designation}
              </p>

              {/* Date & Time */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatBookingDate(booking.date)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {booking.startTime} - {booking.endTime}
                  </span>
                </div>
                {booking.meetLink && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Video className="h-4 w-4" />
                    <span>Video Call</span>
                  </div>
                )}
              </div>

              {/* Topic */}
              {booking.topic && (
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium">Topic:</span> {booking.topic}
                </p>
              )}
            </div>
          </div>

          {/* Right Side - Time & Actions */}
          <div className="flex flex-col items-end justify-between shrink-0">
            {isUpcoming && (
              <div className="text-right mb-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Starts in
                </div>
                <div className="text-lg font-bold text-foreground">
                  {getTimeUntil(booking.date, booking.startTime)}
                </div>
              </div>
            )}

            <div className="text-right mb-3">
              <div className="text-xs text-muted-foreground">Amount Paid</div>
              <div className="font-semibold text-foreground">
                {formatINR(booking.totalAmount)}
              </div>
            </div>

            {/* Actions */}
            {isUpcoming && booking.status !== "in_progress" && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10"
                  onClick={onMessage}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Message</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 bg-white/50 dark:bg-white/5 border-white/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10"
                  onClick={onReschedule}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reschedule</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50/50 dark:hover:bg-red-950/20 border-white/50 dark:border-white/10"
                  onClick={onCancel}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
              </div>
            )}

            {booking.status === "in_progress" && booking.meetLink && (
              <Button
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/90 shadow-lg gap-1.5"
                onClick={onJoin}
              >
                <Video className="h-3.5 w-3.5" />
                Join Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Empty state component - glassmorphic style
 */
function EmptyState({ tab }: { tab: BookingTab }) {
  const config = {
    upcoming: {
      icon: CalendarClock,
      title: "No upcoming bookings",
      description: "Book a consultation with a doctor to get started",
    },
    completed: {
      icon: CheckCircle2,
      title: "No completed sessions",
      description: "Your completed consultations will appear here",
    },
    cancelled: {
      icon: XCircle,
      title: "No cancelled bookings",
      description: "Any cancelled sessions will appear here",
    },
  };

  const { icon: Icon, title, description } = config[tab];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="h-16 w-16 rounded-[20px] bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 flex items-center justify-center mb-5 shadow-lg">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
    </motion.div>
  );
}

/**
 * MyBookings component - glassmorphic design
 */
export function MyBookings({
  bookings,
  onMessage,
  onReschedule,
  onCancel,
  onJoin,
  className,
}: MyBookingsProps) {
  const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");

  /**
   * Filter bookings by tab
   */
  const filteredBookings = useMemo(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    if (!tab) return [];
    return bookings.filter((b) => tab.statuses.includes(b.status));
  }, [bookings, activeTab]);

  /**
   * Count bookings per tab
   */
  const tabCounts = useMemo(() => {
    return TABS.reduce((acc, tab) => {
      acc[tab.id] = bookings.filter((b) =>
        tab.statuses.includes(b.status)
      ).length;
      return acc;
    }, {} as Record<BookingTab, number>);
  }, [bookings]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Sub-tabs - glassmorphic container */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 p-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-white/10">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id];

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-foreground text-background shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      "min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center",
                      isActive
                        ? "bg-background/20 text-background"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings List */}
      <AnimatePresence mode="wait">
        {filteredBookings.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onMessage={() => onMessage?.(booking.id)}
                onReschedule={() => onReschedule?.(booking.id)}
                onCancel={() => onCancel?.(booking.id)}
                onJoin={() => onJoin?.(booking.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MyBookings;
