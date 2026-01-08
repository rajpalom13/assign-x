"use client";

/**
 * Dashboard - Minimalist Design with Charts
 * Inspired by Notion and Linear
 */

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  FolderKanban,
  ChevronRight,
  Search,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Circle,
  Wallet,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useProjectStore, type Project } from "@/stores";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  AnimatedList,
  AnimatedListItem,
  FadeIn,
  cardHover,
  staggerContainer,
  staggerItem,
} from "@/components/ui/motion";

/**
 * Status configuration
 */
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  submitted: { label: "Submitted", color: "text-amber-600 bg-amber-500/10", dot: "bg-amber-500" },
  analyzing: { label: "Reviewing", color: "text-amber-600 bg-amber-500/10", dot: "bg-amber-500" },
  quoted: { label: "Quote Ready", color: "text-blue-600 bg-blue-500/10", dot: "bg-blue-500" },
  payment_pending: { label: "Payment Due", color: "text-orange-600 bg-orange-500/10", dot: "bg-orange-500" },
  paid: { label: "Paid", color: "text-emerald-600 bg-emerald-500/10", dot: "bg-emerald-500" },
  assigned: { label: "Assigned", color: "text-blue-600 bg-blue-500/10", dot: "bg-blue-500" },
  in_progress: { label: "In Progress", color: "text-blue-600 bg-blue-500/10", dot: "bg-blue-500" },
  qc: { label: "Quality Check", color: "text-purple-600 bg-purple-500/10", dot: "bg-purple-500" },
  delivered: { label: "Delivered", color: "text-emerald-600 bg-emerald-500/10", dot: "bg-emerald-500" },
  completed: { label: "Completed", color: "text-emerald-600 bg-emerald-500/10", dot: "bg-emerald-500" },
  revision: { label: "Revision", color: "text-orange-600 bg-orange-500/10", dot: "bg-orange-500" },
};

/**
 * Generate chart data from projects
 */
function generateChartData(projects: Project[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const currentMonth = new Date().getMonth();

  return months.map((month, index) => {
    const monthIndex = (currentMonth - 5 + index + 12) % 12;
    const projectsInMonth = projects.filter((p) => {
      const date = new Date(p.created_at || Date.now());
      return date.getMonth() === monthIndex;
    }).length;

    return {
      name: month,
      projects: projectsInMonth,
    };
  });
}

/**
 * Custom Tooltip for Chart
 */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{payload[0].value} projects</p>
      </div>
    );
  }
  return null;
}

/**
 * Main Dashboard Component
 */
export function DashboardPro() {
  const router = useRouter();
  const { user, isLoading: userLoading, fetchUser } = useUserStore();
  const { projects, isLoading: projectsLoading, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchUser();
    fetchProjects();
  }, [fetchUser, fetchProjects]);

  const isLoading = userLoading || projectsLoading;

  // Calculate stats
  const activeStatuses = ["submitted", "analyzing", "quoted", "payment_pending", "paid", "assigned", "in_progress", "qc"];
  const completedStatuses = ["completed", "delivered", "qc_approved"];

  const activeProjects = projects.filter((p) => activeStatuses.includes(p.status)).length;
  const completedProjects = projects.filter((p) => completedStatuses.includes(p.status)).length;
  const totalProjects = projects.length;
  const walletBalance = user?.wallet?.balance || 0;
  const recentProjects = projects.slice(0, 4);
  const firstName = user?.fullName?.split(" ")[0] || "there";

  // Chart data
  const chartData = useMemo(() => generateChartData(projects), [projects]);

  // Completion rate
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  // Recent activity (last 3 project updates)
  const recentActivity = useMemo(() => {
    return projects
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        time: formatRelativeTime(p.updated_at || p.created_at),
      }));
  }, [projects]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-14 w-72" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Skeleton className="h-[88px]" />
          <Skeleton className="h-[88px]" />
          <Skeleton className="h-[88px]" />
          <Skeleton className="h-[88px]" />
        </div>
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[300px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Good {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Here's what's happening with your projects
            </p>
          </div>
          <Button
            size="sm"
            className="h-9 rounded-lg"
            onClick={() => router.push("/projects/new")}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New project
          </Button>
        </div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            label="Active"
            value={activeProjects}
            icon={<Clock className="h-4 w-4" />}
            trend={activeProjects > 0 ? "up" : undefined}
            onClick={() => router.push("/projects")}
            index={0}
          />
          <StatCard
            label="Completed"
            value={completedProjects}
            icon={<CheckCircle2 className="h-4 w-4" />}
            trend={completedProjects > 0 ? "up" : undefined}
            onClick={() => router.push("/projects")}
            index={1}
          />
          <StatCard
            label="Success rate"
            value={completionRate}
            suffix="%"
            icon={<TrendingUp className="h-4 w-4" />}
            onClick={() => router.push("/projects")}
            index={2}
          />
          <StatCard
            label="Balance"
            value={walletBalance}
            prefix="₹"
            icon={<Wallet className="h-4 w-4" />}
            onClick={() => router.push("/wallet")}
            index={3}
          />
        </motion.div>

        {/* Chart Section */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium">Project activity</h2>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {totalProjects} total
            </span>
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="projects"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorProjects)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Quick Actions (Left Column) */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-medium mb-3">Quick actions</h2>
            <div className="space-y-2">
              <QuickAction
                icon={<FileText className="h-4 w-4" />}
                label="Report"
                href="/projects/new?type=report"
              />
              <QuickAction
                icon={<Search className="h-4 w-4" />}
                label="AI Check"
                href="/projects/new?type=plagiarism"
              />
              <QuickAction
                icon={<BookOpen className="h-4 w-4" />}
                label="Proofread"
                href="/projects/new?type=proofreading"
              />
              <QuickAction
                icon={<FolderKanban className="h-4 w-4" />}
                label="Projects"
                href="/projects"
              />
            </div>
          </div>

          {/* Recent Projects & Activity (Right Column) */}
          <div className="space-y-4">
            {/* Recent Projects */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium">Recent projects</h2>
                {recentProjects.length > 0 && (
                  <button
                    onClick={() => router.push("/projects")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all
                  </button>
                )}
              </div>

              {recentProjects.length === 0 ? (
                <EmptyState
                  title="No projects yet"
                  description="Create your first project"
                  action={{
                    label: "New project",
                    onClick: () => router.push("/projects/new"),
                  }}
                />
              ) : (
                <div className="space-y-1">
                  {recentProjects.map((project) => (
                    <ProjectRow key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-medium mb-3">Recent activity</h2>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <ActivityItem
                      key={activity.id}
                      title={activity.title}
                      status={activity.status}
                      time={activity.time}
                      isLast={index === recentActivity.length - 1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component with animations
 */
function StatCard({
  label,
  value,
  icon,
  trend,
  onClick,
  prefix = "",
  suffix = "",
  index = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down";
  onClick?: () => void;
  prefix?: string;
  suffix?: string;
  index?: number;
}) {
  const isNumeric = typeof value === "number";

  return (
    <motion.button
      onClick={onClick}
      className="p-4 rounded-xl border border-border bg-card text-left group"
      variants={staggerItem}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <motion.span
          className="text-muted-foreground"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.span>
        {trend && (
          <motion.span
            className={cn(
              "flex items-center text-[10px] font-medium",
              trend === "up" ? "text-emerald-600" : "text-red-600"
            )}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
          </motion.span>
        )}
      </div>
      <p className="text-xl font-semibold tabular-nums">
        {isNumeric ? (
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} duration={1} />
        ) : (
          value
        )}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </motion.button>
  );
}

/**
 * Project Row Component with hover animation
 */
function ProjectRow({ project }: { project: Project }) {
  const router = useRouter();
  const status = STATUS_CONFIG[project.status] || {
    label: project.status,
    color: "text-muted-foreground bg-muted",
    dot: "bg-muted-foreground",
  };

  return (
    <motion.button
      onClick={() => router.push(`/project/${project.id}`)}
      className="w-full flex items-center gap-3 p-2.5 -mx-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className={cn("h-2 w-2 rounded-full shrink-0", status.dot)}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{project.title}</p>
      </div>
      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", status.color)}>
        {status.label}
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}

/**
 * Activity Item Component
 */
function ActivityItem({
  title,
  status,
  time,
  isLast,
}: {
  title: string;
  status: string;
  time: string;
  isLast: boolean;
}) {
  const statusConfig = STATUS_CONFIG[status] || { dot: "bg-muted-foreground", label: status };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={cn("h-2 w-2 rounded-full mt-1.5", statusConfig.dot)} />
        {!isLast && <div className="w-px flex-1 bg-border mt-1" />}
      </div>
      <div className="flex-1 pb-3">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground">
          {statusConfig.label} · {time}
        </p>
      </div>
    </div>
  );
}

/**
 * Quick Action Component with hover animation
 */
function QuickAction({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
      <Link
        href={href}
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group border border-transparent hover:border-border"
      >
        <motion.span
          className="text-muted-foreground group-hover:text-foreground transition-colors"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.span>
        <span className="text-sm font-medium">{label}</span>
        <motion.div
          className="ml-auto"
          initial={{ opacity: 0, x: -5 }}
          whileHover={{ opacity: 1, x: 0 }}
        >
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
      </Link>
    </motion.div>
  );
}

/**
 * Empty State Component
 */
function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-2">
        <FolderKanban className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5 mb-3">{description}</p>
      {action && (
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={action.onClick}>
          <Plus className="h-3 w-3 mr-1" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Get greeting based on time of day
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string | undefined): string {
  if (!dateString) return "Recently";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
