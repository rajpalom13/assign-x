"use client";

/**
 * @fileoverview Projects Page - Minimalist Design
 *
 * Clean, Notion/Linear inspired design with:
 * - Simple typography hierarchy
 * - Subtle hover states
 * - Clean project cards
 */

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { UploadSheet } from "@/components/dashboard/upload-sheet";

/**
 * Tab configuration
 */
interface TabConfig {
  value: ProjectTab;
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { value: "in_review", label: "In Review", icon: Eye },
  { value: "in_progress", label: "In Progress", icon: Zap },
  { value: "for_review", label: "For Review", icon: CheckCircle2 },
  { value: "history", label: "History", icon: Clock },
];

/**
 * Status configuration
 */
const statusConfig: Record<string, { dot: string; label: string }> = {
  submitted: { dot: "bg-amber-500", label: "Submitted" },
  analyzing: { dot: "bg-amber-500", label: "Analyzing" },
  quoted: { dot: "bg-orange-500", label: "Quoted" },
  payment_pending: { dot: "bg-orange-500", label: "Payment Due" },
  paid: { dot: "bg-blue-500", label: "Paid" },
  assigned: { dot: "bg-blue-500", label: "Assigned" },
  in_progress: { dot: "bg-blue-500", label: "In Progress" },
  completed: { dot: "bg-emerald-500", label: "Completed" },
  delivered: { dot: "bg-emerald-500", label: "Delivered" },
  qc_approved: { dot: "bg-emerald-500", label: "Approved" },
};

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
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);

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
    <>
      <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage your academic submissions
            </p>
          </div>
          <Button
            onClick={() => setUploadSheetOpen(true)}
            size="sm"
            className="h-8 rounded-lg"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Project
          </Button>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total" value={totalProjects} />
        <StatCard label="In Progress" value={inProgressCount} />
        <StatCard label="Need Review" value={pendingReviewCount} />
        <StatCard label="Completed" value={completedCount} />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {tabs.map((tab) => {
            const count = tabCounts[tab.value];
            const isActive = activeTab === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full tabular-nums",
                      isActive
                        ? "bg-foreground/10"
                        : "bg-muted"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1 md:max-w-[240px] md:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredProjects.length === 0 ? (
        <EmptyState tab={activeTab} searchQuery={searchQuery} onNewProject={() => setUploadSheetOpen(true)} />
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            {filteredProjects.length} {filteredProjects.length === 1 ? "project" : "projects"}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>

          <div className="space-y-px rounded-xl border border-border overflow-hidden">
            {filteredProjects.map((project, index) => (
              <ProjectRow
                key={project.id}
                project={project}
                onPayNow={onPayNow}
                isLast={index === filteredProjects.length - 1}
              />
            ))}
          </div>
        </div>
      )}
      </div>

      {/* Upload Sheet - What would you like to do? */}
      <UploadSheet open={uploadSheetOpen} onOpenChange={setUploadSheetOpen} />
    </>
  );
}

/**
 * Stat Card
 */
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

/**
 * Project Row
 */
function ProjectRow({
  project,
  onPayNow,
  isLast,
}: {
  project: Project;
  onPayNow?: (project: Project) => void;
  isLast: boolean;
}) {
  const router = useRouter();
  const projectNumber = project.projectNumber || project.project_number;
  const deadline = project.deadline ?? undefined;
  const progress = project.progress ?? project.progress_percentage ?? 0;
  const quoteAmount = project.quoteAmount || project.final_quote || project.user_quote;
  const status = statusConfig[project.status] || statusConfig.submitted;

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
    if (diffDays === 1) return { text: "Tomorrow", urgent: true };
    if (diffDays <= 3) return { text: `${diffDays}d left`, urgent: true };
    return { text: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }), urgent: false };
  };

  const deadlineInfo = formatDeadline(deadline);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex items-center gap-4 p-4 bg-card hover:bg-muted/50 cursor-pointer transition-colors",
        !isLast && "border-b border-border"
      )}
    >
      {/* Status dot */}
      <div className={cn("h-2 w-2 rounded-full shrink-0", status.dot)} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{project.title}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          {projectNumber && (
            <span className="font-mono">{projectNumber}</span>
          )}
          {(project.subjectName || project.subject?.name) && (
            <span>{project.subjectName || project.subject?.name}</span>
          )}
          {deadlineInfo && (
            <span className={cn("flex items-center gap-1", deadlineInfo.urgent && "text-amber-600")}>
              <Calendar className="h-3 w-3" />
              {deadlineInfo.text}
            </span>
          )}
        </div>

        {/* Progress bar for in_progress */}
        {project.status === "in_progress" && progress > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-muted rounded-full max-w-[120px]">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">{progress}%</span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        {quoteAmount && (
          <div className="text-right">
            <p className="text-sm font-medium tabular-nums">₹{quoteAmount.toLocaleString()}</p>
          </div>
        )}

        {isPaymentAction ? (
          <Button size="sm" className="h-7 text-xs rounded-md">
            Pay Now
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

/**
 * Loading Skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-px rounded-xl border border-border overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-card">
          <div className="h-2 w-2 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty State
 */
function EmptyState({
  tab,
  searchQuery,
  onNewProject
}: {
  tab: ProjectTab;
  searchQuery: string;
  onNewProject: () => void;
}) {
  const tabConfig = tabs.find((t) => t.value === tab);

  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Search className="h-8 w-8 text-muted-foreground mb-4" />
        <h3 className="text-sm font-medium mb-1">No results found</h3>
        <p className="text-sm text-muted-foreground">
          No projects match &quot;{searchQuery}&quot;
        </p>
      </div>
    );
  }

  const emptyMessages: Record<ProjectTab, string> = {
    in_review: "Projects you submit will appear here while experts review them.",
    in_progress: "Projects being worked on by experts will show up here.",
    for_review: "Completed work ready for your review will appear here.",
    history: "Your completed and closed projects will be stored here.",
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
        <FolderKanban className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium mb-1">
        No {tabConfig?.label.toLowerCase()} projects
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs">
        {emptyMessages[tab]}
      </p>
      <Button
        onClick={onNewProject}
        size="sm"
        className="h-8 rounded-lg"
      >
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        New Project
      </Button>
    </div>
  );
}
