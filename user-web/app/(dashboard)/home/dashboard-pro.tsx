"use client";

/**
 * Dashboard Pro - Minimal Design
 * Clean, Notion/Linear inspired design matching projects page
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  FileText,
  FolderKanban,
  ChevronRight,
  Search,
  BookOpen,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useProjectStore, type Project } from "@/stores";
import { motion } from "framer-motion";

/**
 * Status configuration with consistent neutral theme
 */
const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; bg: string }> = {
  submitted: { label: "Submitted", color: "text-muted-foreground", dot: "bg-muted-foreground", bg: "bg-muted/50" },
  analyzing: { label: "Reviewing", color: "text-muted-foreground", dot: "bg-muted-foreground", bg: "bg-muted/50" },
  quoted: { label: "Quote Ready", color: "text-primary", dot: "bg-primary", bg: "bg-primary/10" },
  payment_pending: { label: "Payment Due", color: "text-primary", dot: "bg-primary", bg: "bg-primary/10" },
  paid: { label: "Paid", color: "text-foreground", dot: "bg-foreground", bg: "bg-foreground/10" },
  assigned: { label: "Assigned", color: "text-muted-foreground", dot: "bg-muted-foreground", bg: "bg-muted/50" },
  in_progress: { label: "In Progress", color: "text-primary", dot: "bg-primary", bg: "bg-primary/10" },
  qc: { label: "Quality Check", color: "text-primary", dot: "bg-primary", bg: "bg-primary/10" },
  delivered: { label: "Delivered", color: "text-foreground", dot: "bg-foreground", bg: "bg-foreground/10" },
  completed: { label: "Completed", color: "text-foreground", dot: "bg-foreground", bg: "bg-foreground/10" },
  revision: { label: "Revision", color: "text-muted-foreground", dot: "bg-muted-foreground", bg: "bg-muted/50" },
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

    const completedInMonth = projects.filter((p) => {
      const date = new Date(p.updated_at || p.created_at || Date.now());
      return date.getMonth() === monthIndex && ["completed", "delivered"].includes(p.status);
    }).length;

    return {
      name: month,
      projects: projectsInMonth,
      completed: completedInMonth,
    };
  });
}

/**
 * Enhanced Custom Tooltip for Chart
 */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl px-4 py-3 shadow-xl"
      >
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <div className="space-y-1">
          <p className="text-sm font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-foreground" />
            {payload[0]?.value || 0} created
          </p>
          {payload[1] && (
            <p className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              {payload[1]?.value || 0} completed
            </p>
          )}
        </div>
      </motion.div>
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
  const [chartPeriod, setChartPeriod] = useState<"6m" | "3m" | "1m">("6m");

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

  // Needs attention - projects requiring user action
  const ATTENTION_STATUSES = ["quoted", "payment_pending", "delivered", "revision"];
  const needsAttention = useMemo(() => {
    return projects
      .filter((p) => ATTENTION_STATUSES.includes(p.status))
      .slice(0, 4);
  }, [projects]);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-[260px] rounded-xl" />
          <Skeleton className="h-[260px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Good {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here's what's happening with your projects today
            </p>
          </div>
          <Button
            size="sm"
            className="h-8 rounded-lg"
            onClick={() => router.push("/projects/new")}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Project
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Active" value={activeProjects} />
          <StatCard label="Completed" value={completedProjects} />
          <StatCard label="Success Rate" value={`${completionRate}%`} />
          <StatCard label="Wallet" value={`₹${walletBalance.toLocaleString()}`} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Chart Section - Takes 2 columns */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Project Activity</h2>
                <p className="text-sm text-muted-foreground">Track your project trends</p>
              </div>
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                {(["6m", "3m", "1m"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      chartPeriod === period
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {period === "6m" ? "6 months" : period === "3m" ? "3 months" : "1 month"}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    width={35}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="projects"
                    stroke="hsl(var(--foreground))"
                    strokeWidth={2}
                    fill="url(#colorProjects)"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    fill="url(#colorCompleted)"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-foreground" />
                <span className="text-xs text-muted-foreground">Created</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <span className="text-xs text-muted-foreground ml-auto">
                {totalProjects} total
              </span>
            </div>
          </div>

          {/* Needs Attention Widget */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">Needs Attention</h2>
                <p className="text-xs text-muted-foreground">
                  {needsAttention.length} item{needsAttention.length !== 1 ? "s" : ""} require action
                </p>
              </div>
            </div>

            {needsAttention.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">All caught up</p>
                <p className="text-xs text-muted-foreground mt-1">No pending actions</p>
              </div>
            ) : (
              <div className="space-y-1">
                {needsAttention.map((project) => {
                  const status = STATUS_CONFIG[project.status] || {
                    label: project.status,
                    dot: "bg-muted-foreground",
                  };
                  return (
                    <button
                      key={project.id}
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                    >
                      <div className={cn("h-2 w-2 rounded-full shrink-0", status.dot)} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.title}</p>
                        <p className="text-xs text-muted-foreground">{status.label}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <QuickAction
                icon={<FileText className="h-4 w-4" />}
                label="New Project"
                description="Submit a new project"
                href="/projects/new"
              />
              <QuickAction
                icon={<Search className="h-4 w-4" />}
                label="AI Check"
                description="Verify content originality"
                href="/projects/new?type=plagiarism"
              />
              <QuickAction
                icon={<BookOpen className="h-4 w-4" />}
                label="Proofread"
                description="Review and polish documents"
                href="/projects/new?type=proofreading"
              />
              <QuickAction
                icon={<FolderKanban className="h-4 w-4" />}
                label="All Projects"
                description="View project history"
                href="/projects"
              />
            </div>
          </div>

          {/* Recent Projects */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Recent Projects</h2>
              {recentProjects.length > 0 && (
                <button
                  onClick={() => router.push("/projects")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>

            {recentProjects.length === 0 ? (
              <EmptyState
                title="No projects yet"
                description="Create your first project to get started"
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
        </div>
      </div>
    </div>
  );
}

/**
 * Stat Card Component - Minimal design matching projects page
 */
function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

/**
 * Project Row Component - Minimal design matching projects page
 */
function ProjectRow({ project }: { project: Project }) {
  const router = useRouter();
  const status = STATUS_CONFIG[project.status] || {
    label: project.status,
    dot: "bg-muted-foreground",
  };

  return (
    <button
      onClick={() => router.push(`/project/${project.id}`)}
      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left group"
    >
      <div className={cn("h-2 w-2 rounded-full shrink-0", status.dot)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{project.title}</p>
      </div>
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
        {status.label}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
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
 * Quick Action Component - Enhanced design
 */
function QuickAction({
  icon,
  label,
  description,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-lg border-2 border-border bg-card hover:border-[#765341]/50 hover:bg-gradient-to-r hover:from-[#765341]/10 hover:to-[#A07A65]/10 hover:shadow-md hover:-translate-y-0.5 transition-all group"
    >
      <div className="h-10 w-10 rounded-lg border border-border bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-[#765341] group-hover:text-white group-hover:border-[#765341] transition-all">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-[#765341] transition-all" />
    </Link>
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
