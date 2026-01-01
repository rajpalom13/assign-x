"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  Clock,
  Loader2,
  FileText,
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Scale,
  Briefcase,
  Heart,
  Cpu,
  Palette,
  Music,
  Languages,
  GraduationCap,
  Building2,
  Microscope,
  type LucideIcon,
} from "lucide-react";

/**
 * Icon map for subject icons - avoids wildcard import (~500KB savings)
 * Add new icons here as subjects are added to the database
 */
const SUBJECT_ICONS: Record<string, LucideIcon> = {
  FileText,
  BookOpen,
  Calculator,
  Beaker,
  Globe,
  Scale,
  Briefcase,
  Heart,
  Cpu,
  Palette,
  Music,
  Languages,
  GraduationCap,
  Building2,
  Microscope,
};
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectStore, type Project } from "@/stores";
import { cn } from "@/lib/utils";

/**
 * Status badge colors
 */
const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  analyzing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  quoted: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  payment_pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  assigned: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  in_progress: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  qc_approved: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

/**
 * Format status for display
 */
function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Recent projects section for dashboard
 * Fetches and displays 3 most recent projects
 */
export function RecentProjects() {
  const { projects, isLoading, fetchProjects } = useProjectStore();

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Get 3 most recent projects
  const recentProjects = projects.slice(0, 3);

  if (isLoading) {
    return (
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Projects</h2>
        </div>
        <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (recentProjects.length === 0) {
    return (
      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold">Recent Projects</h2>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-dashed bg-gradient-to-br from-muted/30 to-muted/10 p-8 text-center">
          {/* Decorative background */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5" />
          <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-primary/5" />

          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Start Your First Project</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get expert help with essays, reports, or any academic task
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Recent Projects</h2>
            <p className="text-xs text-muted-foreground">Your latest submissions</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects" className="gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="space-y-3">
        {recentProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

/**
 * Individual project card
 */
function ProjectCard({ project }: { project: Project }) {
  const iconName = project.subjectIcon || project.subject?.icon;
  const projectNumber = project.projectNumber || project.project_number;
  const createdAt = project.createdAt || project.created_at;

  // Get icon component - use FileText as fallback
  const Icon = iconName && SUBJECT_ICONS[iconName] ? SUBJECT_ICONS[iconName] : FileText;

  return (
    <Link
      href={`/project/${project.id}`}
      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      {/* Subject Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">{project.title}</p>
            <p className="text-sm text-muted-foreground">{projectNumber}</p>
          </div>
          <Badge
            variant="secondary"
            className={cn("shrink-0", statusColors[project.status])}
          >
            {formatStatus(project.status)}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </div>
      </div>
    </Link>
  );
}
