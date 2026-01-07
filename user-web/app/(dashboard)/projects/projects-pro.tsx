"use client";

/**
 * @fileoverview Premium Projects Page with Workspace Design System
 *
 * Features:
 * - Gradient mesh hero background with ws-bg-mesh-hero styling
 * - Bento-style stat cards with animated counters
 * - Interactive project cards with hover lift effects
 * - Premium tab design with pill badges
 * - Smooth entrance animations with stagger delays
 * - Open Peeps illustrations for empty states
 * - Full Razorpay payment integration preserved
 */

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Plus,
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  Search,
  ArrowRight,
  Calendar,
  Zap,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProjectStore, type Project } from "@/stores";
import type { ProjectTab } from "@/types/project";
import "./projects.css";
import "@/styles/workspace.css";

// Dynamic import for Peep
const Peep = dynamic(
  () => import("react-peeps").then((mod) => {
    const Component = mod.default || (mod as any).Peep;
    if (!Component) {
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
// Tab Configuration
// ============================================================================

interface TabConfig {
  value: ProjectTab;
  label: string;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  description: string;
}

const tabs: TabConfig[] = [
  {
    value: "in_review",
    label: "In Review",
    icon: Eye,
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-600 dark:text-amber-400",
    description: "Awaiting expert review",
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: Zap,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
    description: "Being worked on",
  },
  {
    value: "for_review",
    label: "For Review",
    icon: CheckCircle2,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-600 dark:text-purple-400",
    description: "Ready for your review",
  },
  {
    value: "history",
    label: "History",
    icon: Clock,
    bgColor: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-600 dark:text-gray-400",
    description: "Completed projects",
  },
];

// ============================================================================
// Animated Counter
// ============================================================================

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start: number, frame: number;
    const animate = (time: number) => {
      if (!start) start = time;
      const progress = Math.min((time - start) / 600, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className="tabular-nums">{display}</span>;
}

// ============================================================================
// Main Component
// ============================================================================

interface ProjectsProProps {
  onPayNow?: (project: Project) => void;
}

export function ProjectsPro({ onPayNow }: ProjectsProProps) {
  const router = useRouter();
  const {
    activeTab,
    setActiveTab,
    getProjectsByTab,
    getPaginatedProjects,
    projects,
    isLoading,
    fetchProjects,
  } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    return tabs.reduce((acc, tab) => {
      acc[tab.value] = getProjectsByTab(tab.value).length;
      return acc;
    }, {} as Record<ProjectTab, number>);
  }, [getProjectsByTab, projects]);

  // Get paginated projects for active tab
  const { projects: displayProjects } = getPaginatedProjects(activeTab);

  // Filter by search
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return displayProjects;
    const query = searchQuery.toLowerCase();
    return displayProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.projectNumber || p.project_number || "").toLowerCase().includes(query)
    );
  }, [displayProjects, searchQuery]);

  // Stats
  const totalProjects = projects.length;
  const inProgressCount = tabCounts.in_progress;
  const completedCount = tabCounts.history;
  const pendingReviewCount = tabCounts.for_review;

  return (
    <div className="flex-1 relative overflow-hidden min-h-screen">
      {/* Background with gradient mesh */}
      <div className="projects-page-bg" />

      <div className="relative max-w-6xl mx-auto p-6 space-y-6">

        {/* ============================================================
            HERO SECTION WITH STATS
            ============================================================ */}
        <div className="projects-hero projects-animate-in">
          <div className="projects-hero-content">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">

              {/* Left: Icon Badge + Title */}
              <div className="flex items-center gap-4 flex-1">
                <div className="projects-hero-icon">
                  <FolderKanban />
                </div>
                <div>
                  <h1 className="projects-hero-title">My Projects</h1>
                  <p className="projects-hero-subtitle">Track and manage your academic submissions</p>
                </div>
              </div>

              {/* Right: New Project Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => router.push("/projects/new")}
                  className="projects-hero-btn"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
              </div>
            </div>

            {/* Stats Grid - Bento Style */}
            <div className="projects-stats-grid">
              <StatCard
                icon={<FolderKanban className="w-5 h-5" />}
                label="Total Projects"
                value={totalProjects}
                variant="primary"
                delay={1}
              />
              <StatCard
                icon={<Zap className="w-5 h-5" />}
                label="In Progress"
                value={inProgressCount}
                variant="blue"
                delay={2}
              />
              <StatCard
                icon={<AlertCircle className="w-5 h-5" />}
                label="Need Review"
                value={pendingReviewCount}
                variant="purple"
                delay={3}
              />
              <StatCard
                icon={<CheckCircle2 className="w-5 h-5" />}
                label="Completed"
                value={completedCount}
                variant="green"
                delay={4}
              />
            </div>
          </div>
        </div>

        {/* ============================================================
            FILTER SECTION: TABS + SEARCH
            ============================================================ */}
        <div className="projects-filter-section projects-animate-in projects-stagger-2">
          {/* Tab Pills */}
          <div className="projects-tabs">
            {tabs.map((tab) => {
              const count = tabCounts[tab.value];
              const isActive = activeTab === tab.value;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn("projects-tab", isActive && "active")}
                >
                  <div className={cn("projects-tab-icon", tab.bgColor, tab.textColor)}>
                    <Icon />
                  </div>
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className="projects-tab-count">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="projects-search">
            <Search className="projects-search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="projects-search-input"
            />
          </div>
        </div>

        {/* ============================================================
            PROJECT LIST
            ============================================================ */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredProjects.length === 0 ? (
          <EmptyState tab={activeTab} searchQuery={searchQuery} />
        ) : (
          <div className="space-y-4 projects-animate-in projects-stagger-3">
            {/* Results count */}
            <p className="projects-results-count">
              Showing {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>

            {/* Project Cards Grid */}
            <div className="projects-grid">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onPayNow={onPayNow}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ============================================================================
// Sub Components
// ============================================================================

/**
 * Stat Card with animated counter and gradient icon
 */
function StatCard({
  icon,
  label,
  value,
  variant,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  variant: "primary" | "blue" | "purple" | "green";
  delay: number;
}) {
  return (
    <div className={cn("projects-stat-card projects-animate-in", `projects-stagger-${delay}`)}>
      <div className={cn("projects-stat-icon", variant)}>
        {icon}
      </div>
      <div className="projects-stat-value">
        <AnimatedCounter value={value} />
      </div>
      <div className="projects-stat-label">{label}</div>
    </div>
  );
}

/**
 * Loading skeleton with shimmer animation
 */
function LoadingSkeleton() {
  return (
    <div className="projects-skeleton">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="projects-skeleton-card">
          <div className="projects-skeleton-icon" />
          <div className="projects-skeleton-content">
            <div className="projects-skeleton-line title" />
            <div className="projects-skeleton-line meta" />
            <div className="projects-skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state with Peep illustration
 */
function EmptyState({ tab, searchQuery }: { tab: ProjectTab; searchQuery: string }) {
  const tabConfig = tabs.find((t) => t.value === tab);

  // Search results empty state
  if (searchQuery) {
    return (
      <div className="projects-empty projects-animate-in projects-stagger-3">
        <div className="projects-empty-content">
          <div className="projects-empty-icon">
            <Search />
          </div>
          <h3 className="projects-empty-title">No results found</h3>
          <p className="projects-empty-description">
            No projects match &quot;{searchQuery}&quot;. Try a different search term.
          </p>
        </div>
      </div>
    );
  }

  // Different Peep poses for different tabs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const peepConfigs: Record<ProjectTab, { body: any; face: any; hair: any }> = {
    in_review: { body: "Coffee", face: "Calm", hair: "Bun" },
    in_progress: { body: "Device", face: "Driven", hair: "MediumBangs" },
    for_review: { body: "PointingUp", face: "Cute", hair: "ShortCurly" },
    history: { body: "Shirt", face: "Smile", hair: "Afro" },
  };

  const peepConfig = peepConfigs[tab];

  const emptyMessages: Record<ProjectTab, string> = {
    in_review: "Projects you submit will appear here while experts review them.",
    in_progress: "Projects being worked on by experts will show up here.",
    for_review: "Completed work ready for your review will appear here.",
    history: "Your completed and closed projects will be stored here.",
  };

  return (
    <div className="projects-empty projects-animate-in projects-stagger-3">
      <div className="projects-empty-content">
        {/* Peep Illustration with 3D shadow effect */}
        <div className="relative w-32 h-28 mx-auto mb-6">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2.5 bg-black/[0.06] dark:bg-black/15 rounded-[100%] blur-sm" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-10 rounded-2xl bg-gradient-to-br from-[var(--ws-primary)]/12 via-[var(--ws-secondary)]/8 to-[var(--ws-primary)]/5" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[130px] h-[150px] drop-shadow-sm">
            <Peep
              style={{ width: "100%", height: "100%" }}
              accessory="None"
              body={peepConfig.body}
              face={peepConfig.face}
              hair={peepConfig.hair}
              strokeColor="#A9714B"
              viewBox={{ x: "0", y: "50", width: "900", height: "1000" }}
            />
          </div>
        </div>

        <h3 className="projects-empty-title">
          No {tabConfig?.label.toLowerCase()} projects
        </h3>
        <p className="projects-empty-description">
          {emptyMessages[tab]}
        </p>

        <Button asChild className="projects-hero-btn">
          <Link href="/projects/new">
            <Plus className="w-4 h-4" />
            Start New Project
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Project Card
// ============================================================================

const statusConfig: Record<string, { statusClass: string; label: string; icon: React.ElementType }> = {
  submitted: { statusClass: "amber", label: "Submitted", icon: FileText },
  analyzing: { statusClass: "amber", label: "Analyzing", icon: Eye },
  quoted: { statusClass: "orange", label: "Quoted", icon: AlertCircle },
  payment_pending: { statusClass: "orange", label: "Payment Due", icon: AlertCircle },
  paid: { statusClass: "blue", label: "Paid", icon: CheckCircle2 },
  assigned: { statusClass: "blue", label: "Assigned", icon: Zap },
  in_progress: { statusClass: "blue", label: "In Progress", icon: Zap },
  completed: { statusClass: "green", label: "Completed", icon: CheckCircle2 },
  delivered: { statusClass: "green", label: "Delivered", icon: CheckCircle2 },
  qc_approved: { statusClass: "green", label: "Approved", icon: CheckCircle2 },
};

/**
 * Project Card with CSS-based styling and Razorpay payment integration
 * Uses workspace design system classes for consistent styling
 */
function ProjectCard({
  project,
  onPayNow,
  index,
}: {
  project: Project;
  onPayNow?: (project: Project) => void;
  index: number;
}) {
  const router = useRouter();
  const projectNumber = project.projectNumber || project.project_number;
  const deadline = project.deadline ?? undefined;
  const progress = project.progress ?? project.progress_percentage ?? 0;
  const quoteAmount = project.quoteAmount || project.final_quote || project.user_quote;
  const status = statusConfig[project.status] || statusConfig.submitted;
  const StatusIcon = status.icon;

  const isPaymentAction = project.status === "payment_pending" || project.status === "quoted";

  const handleClick = () => {
    if (isPaymentAction && onPayNow) {
      onPayNow(project);
    } else {
      router.push(`/project/${project.id}`);
    }
  };

  // Format deadline
  const formatDeadline = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", urgent: true };
    if (diffDays === 0) return { text: "Due today", urgent: true };
    if (diffDays === 1) return { text: "Due tomorrow", urgent: true };
    if (diffDays <= 3) return { text: `${diffDays} days left`, urgent: true };
    return { text: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), urgent: false };
  };

  const deadlineInfo = formatDeadline(deadline);

  return (
    <div
      onClick={handleClick}
      className={cn("project-card", isPaymentAction && "payment-pending")}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="project-card-inner">
        {/* Left: Icon + Info */}
        <div className="project-card-main">
          <div className={cn("project-status-icon", status.statusClass)}>
            <StatusIcon />
          </div>

          <div className="project-card-info">
            <div className="project-card-header">
              <h3 className="project-card-title">
                {project.title}
              </h3>
              <span className={cn("project-status-badge", status.statusClass)}>
                {status.label}
              </span>
            </div>

            <div className="project-card-meta">
              {projectNumber && (
                <span className="project-meta-number">{projectNumber}</span>
              )}
              {(project.subjectName || project.subject?.name) && (
                <span className="project-meta-subject">{project.subjectName || project.subject?.name}</span>
              )}
              {deadlineInfo && (
                <span className={cn("project-meta-deadline", deadlineInfo.urgent && "urgent")}>
                  <Calendar />
                  {deadlineInfo.text}
                </span>
              )}
            </div>

            {/* Progress bar for in_progress */}
            {project.status === "in_progress" && progress > 0 && (
              <div className="project-progress">
                <div className="project-progress-bar">
                  <div
                    className="project-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="project-progress-text">{progress}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Price + Action */}
        <div className="project-card-actions">
          {quoteAmount && (
            <div className="project-quote">
              <span className="project-quote-label">Quote</span>
              <span className="project-quote-amount">₹{quoteAmount.toLocaleString()}</span>
            </div>
          )}

          {isPaymentAction ? (
            <button className="project-pay-btn">
              Pay Now
              <ArrowRight />
            </button>
          ) : (
            <div className="project-card-arrow">
              <ChevronRight />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
