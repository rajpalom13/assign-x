"use client";

/**
 * @fileoverview Professional Dashboard with Bento Grid Layout
 *
 * Features:
 * - Bento Grid layout with hero section and stat cards
 * - Enhanced stat cards with gradient icons and trend indicators
 * - Staggered entrance animations using workspace.css
 * - Open Peeps illustrations for personality
 * - Dark mode support
 */

import "@/styles/workspace.css";
import "./home.css";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  FileText,
  FolderKanban,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Zap,
  ChevronRight,
  ShoppingBag,
  Lightbulb,
  BarChart3,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useProjectStore, type Project } from "@/stores";
import { getMarketplaceListings } from "@/lib/actions/marketplace";
import { services } from "@/lib/data/services";
import type { AnyListing } from "@/types/marketplace";

// Dynamic import for Peep to avoid SSR issues
const Peep = dynamic(
  () => import("react-peeps").then((mod) => {
    const Component = mod.default || (mod as any).Peep;
    if (!Component) {
      console.warn("react-peeps: Could not find Peep component");
      return () => <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl" />;
    }
    return Component;
  }),
  {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl animate-pulse" />,
  }
);

// ============================================================================
// Animated Counter
// ============================================================================

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start: number, frame: number;
    const animate = (time: number) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / 800, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className="tabular-nums">{prefix}{display.toLocaleString()}{suffix}</span>;
}

// ============================================================================
// Status Colors (using ws-badge classes)
// ============================================================================

const statusColors: Record<string, string> = {
  submitted: "ws-badge-warning",
  analyzing: "ws-badge-warning",
  quoted: "ws-badge-warning",
  in_progress: "ws-badge-info",
  completed: "ws-badge-success",
  delivered: "ws-badge-success",
};

function formatStatus(status: string): string {
  return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

// ============================================================================
// Enhanced Stat Card Component
// ============================================================================

type IconVariant = "primary" | "secondary" | "success" | "info";

interface StatCardEnhancedProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  variant?: IconVariant;
  trend?: { value: number; direction: "up" | "down" | "neutral" };
  delay?: number;
}

function StatCardEnhanced({
  icon,
  label,
  value,
  prefix = "",
  suffix = "",
  variant = "primary",
  trend,
  delay = 0,
}: StatCardEnhancedProps) {
  return (
    <div
      className={cn("stat-card-enhanced ws-animate-slide-up", delay > 0 && `ws-stagger-${delay}`)}
    >
      <div className={cn("stat-icon-badge", variant)}>
        {icon}
      </div>
      <div className="stat-value-large">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <p className="stat-label-text">{label}</p>
      {trend && (
        <div className={cn("stat-trend-indicator", trend.direction)}>
          {trend.direction === "up" && <TrendingUp className="w-3 h-3" />}
          {trend.direction === "down" && <TrendingDown className="w-3 h-3" />}
          {trend.direction === "neutral" && <Minus className="w-3 h-3" />}
          <span>{trend.direction === "neutral" ? "No change" : `${trend.value}%`}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Progress Row Component
// ============================================================================

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-sm text-[var(--ws-text-secondary)] w-24">{label}</span>
      <div className="flex-1 ws-progress-bar">
        <div
          className={cn("ws-progress-fill", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-[var(--ws-text-primary)] w-12 text-right">{value}</span>
    </div>
  );
}

// ============================================================================
// Empty State with Peep
// ============================================================================

function EmptyStateWithPeep({
  title,
  description,
  action,
  peepConfig
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  peepConfig: {
    accessory: any;
    body: any;
    face: any;
    hair: any;
  };
}) {
  return (
    <div className="text-center py-6">
      <div className="dashboard-peep-container mx-auto mb-4" style={{ width: 120, height: 100 }}>
        <div className="dashboard-peep-shadow" />
        <div className="dashboard-peep-platform" style={{ width: 90, height: 40 }} />
        <div className="dashboard-peep-character" style={{ width: 120, height: 140 }}>
          <Peep
            style={{ width: "100%", height: "100%" }}
            accessory={peepConfig.accessory}
            body={peepConfig.body}
            face={peepConfig.face}
            hair={peepConfig.hair}
            strokeColor="#A9714B"
            viewBox={{ x: "0", y: "50", width: "900", height: "1000" }}
          />
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <Lightbulb className="w-4 h-4 text-amber-500" />
        <h4 className="font-medium text-[var(--ws-text-primary)]">{title}</h4>
      </div>
      <p className="text-sm text-[var(--ws-text-muted)] mb-4">{description}</p>
      {action}
    </div>
  );
}

// ============================================================================
// Main Dashboard
// ============================================================================

export function DashboardPro() {
  const router = useRouter();
  const { user, isLoading: userLoading, fetchUser } = useUserStore();
  const { projects, isLoading: projectsLoading, fetchProjects } = useProjectStore();
  const [pulseItems, setPulseItems] = useState<AnyListing[]>([]);
  const [pulseLoading, setPulseLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchProjects();
  }, [fetchUser, fetchProjects]);

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        const { listings } = await getMarketplaceListings({ limit: 4, sortBy: "recent" });
        setPulseItems(listings || []);
      } finally {
        setPulseLoading(false);
      }
    };
    fetchPulse();
  }, []);

  const isLoading = userLoading || projectsLoading;

  // Calculate stats
  const activeStatuses = ["submitted", "analyzing", "quoted", "payment_pending", "paid", "assigned", "in_progress"];
  const completedStatuses = ["completed", "qc_approved"];
  const activeProjects = projects.filter(p => activeStatuses.includes(p.status)).length;
  const completedProjects = projects.filter(p => completedStatuses.includes(p.status)).length;
  const inProgressProjects = projects.filter(p => p.status === "in_progress").length;
  const walletBalance = user?.wallet?.balance || 0;
  const recentProjects = projects.slice(0, 4);
  const totalProjects = projects.length;

  if (isLoading) {
    return (
      <div className="flex-1 relative overflow-hidden ws-bg-mesh">
        <div className="relative max-w-6xl mx-auto p-6 space-y-6">
          <Skeleton className="h-[280px] rounded-3xl ws-card" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-[320px] rounded-3xl ws-card" />
            <Skeleton className="h-[320px] rounded-3xl ws-card" />
            <Skeleton className="h-[320px] rounded-3xl ws-card" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden ws-bg-mesh">
      <div className="relative max-w-6xl mx-auto p-6 space-y-6">

        {/* ============================================================
            HERO SECTION WITH BENTO GRID
            ============================================================ */}
        <div className="dashboard-hero ws-animate-slide-up">
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-6">

              {/* Left: Peep Illustration with greeting */}
              <div className="flex items-center gap-5 lg:w-[280px] shrink-0">
                <div className="dashboard-peep-container hidden md:block">
                  <div className="dashboard-peep-shadow" />
                  <div className="dashboard-peep-platform" />
                  <div className="dashboard-peep-character">
                    <Peep
                      style={{ width: "100%", height: "100%" }}
                      accessory="GlassRoundThick"
                      body="Explaining"
                      face="Smile"
                      hair="MediumBangs"
                      strokeColor="#A9714B"
                      viewBox={{ x: "0", y: "0", width: "1000", height: "1100" }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[var(--ws-text-primary)] mb-1">
                    Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}!
                  </h1>
                  <p className="text-sm text-[var(--ws-text-secondary)]">
                    Here&apos;s your project overview
                  </p>
                </div>
              </div>

              {/* Right: Stats Grid */}
              <div className="flex-1 dashboard-stats-mini-grid">
                <StatCardEnhanced
                  icon={<FolderKanban className="w-5 h-5" />}
                  label="Active Projects"
                  value={activeProjects}
                  variant="primary"
                  trend={{ value: 12, direction: activeProjects > 0 ? "up" : "neutral" }}
                  delay={1}
                />
                <StatCardEnhanced
                  icon={<Wallet className="w-5 h-5" />}
                  label="Wallet Balance"
                  value={walletBalance}
                  prefix="₹"
                  variant="secondary"
                  delay={2}
                />
                <StatCardEnhanced
                  icon={<Clock className="w-5 h-5" />}
                  label="In Progress"
                  value={inProgressProjects}
                  variant="info"
                  delay={3}
                />
                <StatCardEnhanced
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  label="Completed"
                  value={completedProjects}
                  variant="success"
                  trend={{ value: 8, direction: completedProjects > 0 ? "up" : "neutral" }}
                  delay={4}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-[var(--ws-border-light)]">
              <Button
                onClick={() => router.push("/projects/new")}
                className="gap-2 ws-btn-primary rounded-xl"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/projects")}
                className="gap-2 rounded-xl"
              >
                View All Projects
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ============================================================
            ACTIVITY OVERVIEW - BENTO GRID
            ============================================================ */}
        <div className="dashboard-bento-grid ws-animate-slide-up ws-stagger-2">
          {/* Left: Activity Chart Placeholder */}
          <div className="dashboard-section-card dashboard-activity-card">
            <div className="dashboard-section-header">
              <div className="dashboard-section-title-group">
                <div className="dashboard-section-icon">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ws-text-primary)]">Project Overview</h3>
                  <p className="text-xs text-[var(--ws-text-muted)]">Your activity this month</p>
                </div>
              </div>
            </div>
            <div className="dashboard-section-content">
              <ProgressRow label="Active" value={activeProjects} total={totalProjects || 1} color="ws-progress-primary" />
              <ProgressRow label="In Progress" value={inProgressProjects} total={totalProjects || 1} color="ws-progress-info" />
              <ProgressRow label="Completed" value={completedProjects} total={totalProjects || 1} color="ws-progress-success" />
            </div>
          </div>

          {/* Right: Quick Stats */}
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <div className="dashboard-section-title-group">
                <div className="dashboard-section-icon">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-[var(--ws-text-primary)]">Quick Actions</h3>
              </div>
            </div>
            <div className="dashboard-section-content">
              <div className="space-y-2">
                {services.filter(s => !s.disabled).slice(0, 4).map((service) => (
                  <Link
                    key={service.id}
                    href={service.href}
                    className="dashboard-list-item"
                  >
                    <div className={cn("dashboard-list-item-icon", service.color)}>
                      <service.icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="dashboard-list-item-content">
                      <p className="dashboard-list-item-title">{service.title}</p>
                      <p className="dashboard-list-item-subtitle">{service.description}</p>
                    </div>
                    <div className="dashboard-list-item-arrow">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            THREE COLUMN CARDS
            ============================================================ */}
        <div className="grid md:grid-cols-3 gap-6 ws-animate-slide-up ws-stagger-3">

          {/* Recent Projects Card */}
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <div className="dashboard-section-title-group">
                <div className="dashboard-section-icon">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-[var(--ws-text-primary)]">Recent Projects</h3>
              </div>
              {recentProjects.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[var(--ws-text-muted)] hover:text-[var(--ws-primary)] h-auto p-0"
                  onClick={() => router.push("/projects")}
                >
                  View all
                </Button>
              )}
            </div>
            <div className="dashboard-section-content">
              {recentProjects.length === 0 ? (
                <EmptyStateWithPeep
                  title="Start your first project!"
                  description="Get expert help with assignments, reports & more"
                  action={
                    <Button size="sm" onClick={() => router.push("/projects/new")} className="rounded-xl">
                      <Plus className="w-4 h-4 mr-1" />
                      New Project
                    </Button>
                  }
                  peepConfig={{
                    accessory: "None",
                    body: "PointingUp",
                    face: "Cute",
                    hair: "ShortCurly",
                  }}
                />
              ) : (
                <div className="space-y-1">
                  {recentProjects.map((project) => (
                    <ProjectItem key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Campus Pulse Card */}
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <div className="dashboard-section-title-group">
                <div className="dashboard-section-icon">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ws-text-primary)]">Campus Pulse</h3>
                  <p className="text-xs text-[var(--ws-text-muted)]">Trending at your campus</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[var(--ws-text-muted)] hover:text-[var(--ws-primary)] h-auto p-0"
                onClick={() => router.push("/connect")}
              >
                See all
              </Button>
            </div>
            <div className="dashboard-section-content">
              {pulseLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : pulseItems.length === 0 ? (
                <EmptyStateWithPeep
                  title="Nothing trending yet"
                  description="Check back later for campus updates"
                  peepConfig={{
                    accessory: "None",
                    body: "Coffee",
                    face: "Calm",
                    hair: "Bun",
                  }}
                />
              ) : (
                <div className="space-y-2">
                  {pulseItems.map((item) => (
                    <PulseItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Wallet Card */}
          <div className="dashboard-section-card">
            <div className="dashboard-section-header">
              <div className="dashboard-section-title-group">
                <div className="dashboard-section-icon">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-[var(--ws-text-primary)]">Wallet</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[var(--ws-text-muted)] hover:text-[var(--ws-primary)] h-auto p-0"
                onClick={() => router.push("/profile")}
              >
                Top up
              </Button>
            </div>
            <div className="dashboard-section-content">
              <div className="text-center py-4">
                <p className="text-xs text-[var(--ws-text-muted)] mb-1">Available Balance</p>
                <p className="text-3xl font-bold text-[var(--ws-text-primary)]">
                  <AnimatedCounter value={walletBalance} prefix="₹" />
                </p>
                <div className="mt-4 pt-4 border-t border-[var(--ws-border-light)]">
                  <Button
                    onClick={() => router.push("/profile")}
                    className="w-full rounded-xl gap-2"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                    Add Funds
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// Sub Components
// ============================================================================

function ProjectItem({ project }: { project: Project }) {
  const router = useRouter();
  const projectNumber = project.projectNumber || project.project_number;

  return (
    <div
      onClick={() => router.push(`/project/${project.id}`)}
      className="dashboard-list-item"
    >
      <div className="dashboard-list-item-icon bg-[var(--ws-bg-muted)]">
        <FileText className="w-4 h-4 text-[var(--ws-text-muted)]" />
      </div>
      <div className="dashboard-list-item-content">
        <p className="dashboard-list-item-title">{project.title}</p>
        <p className="dashboard-list-item-subtitle">{projectNumber}</p>
      </div>
      <Badge className={cn("text-[10px] shrink-0 font-medium", statusColors[project.status] || "ws-badge-default")}>
        {formatStatus(project.status)}
      </Badge>
    </div>
  );
}

function PulseItem({ item }: { item: AnyListing }) {
  const price = "price" in item ? item.price : "monthlyRent" in item ? item.monthlyRent : undefined;

  return (
    <Link
      href={`/connect?item=${item.id}`}
      className="dashboard-list-item"
    >
      <div className="dashboard-list-item-icon bg-gradient-to-br from-[var(--ws-primary-muted)] to-[var(--ws-secondary-muted)]">
        <ShoppingBag className="w-4.5 h-4.5 text-[var(--ws-primary)]" />
      </div>
      <div className="dashboard-list-item-content">
        <p className="dashboard-list-item-title">{item.title}</p>
        {price !== undefined && (
          <p className="text-sm font-semibold text-[var(--ws-primary)]">
            ₹{price.toLocaleString()}
          </p>
        )}
      </div>
      <div className="dashboard-list-item-arrow">
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}

