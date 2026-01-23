"use client";

/**
 * Dashboard Pro - Premium Design System
 * Unique bento cards with individual personalities
 * Responsive asymmetric grid layout
 */

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  CheckCircle,
  Sparkles,
  ChevronRight,
  GraduationCap,
  ArrowRight,
  Shield,
  Zap,
  FileText,
  Users,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useProjectStore } from "@/stores";
import { SkeletonBox, SkeletonText } from "@/components/skeletons/primitives";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { GreetingAnimation } from "@/components/dashboard/greeting-animation";

/**
 * Status configuration with consistent neutral theme
 */
const STATUS_CONFIG: Record<string, { label: string; dot: string }> = {
  submitted: { label: "Submitted", dot: "bg-muted-foreground" },
  analyzing: { label: "Reviewing", dot: "bg-muted-foreground" },
  quoted: { label: "Quote Ready", dot: "bg-primary" },
  payment_pending: { label: "Payment Due", dot: "bg-primary" },
  paid: { label: "Paid", dot: "bg-foreground" },
  assigned: { label: "Assigned", dot: "bg-muted-foreground" },
  in_progress: { label: "In Progress", dot: "bg-primary" },
  qc: { label: "Quality Check", dot: "bg-primary" },
  delivered: { label: "Delivered", dot: "bg-foreground" },
  completed: { label: "Completed", dot: "bg-foreground" },
  revision: { label: "Revision", dot: "bg-muted-foreground" },
};

/**
 * Main Dashboard Component - NO ANIMATIONS
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
  const firstName = user?.fullName?.split(" ")[0] || user?.full_name?.split(" ")[0] || "there";

  // Needs attention - projects requiring user action
  const ATTENTION_STATUSES = ["quoted", "payment_pending", "delivered", "revision"];
  const needsAttention = useMemo(() => {
    return projects
      .filter((p) => ATTENTION_STATUSES.includes(p.status))
      .slice(0, 3);
  }, [projects]);

  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={cn("mesh-background mesh-gradient-bottom-right-animated h-full overflow-hidden", getTimeBasedGradientClass())}>
      <div className="relative z-10 h-full px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 flex items-center justify-center">
        <div className="max-w-[1400px] w-full">
          {/* Main Content - Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center justify-between">
            {/* Left Column - Greeting */}
            <div className="flex-1 max-w-2xl space-y-4">
              {/* Greeting */}
              <div className="relative">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light tracking-tight text-foreground/90">
                  Good {getGreeting()},
                </h1>
                {/* Name with Lottie animation to the right */}
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight text-foreground">
                    {firstName}
                  </h2>
                  {/* Lottie animation to the right of name */}
                  <GreetingAnimation
                    className="hidden md:block"
                    size={64}
                  />
                </div>
              </div>
              <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-lg">
                Ready to optimize your workflow and generate insights.
              </p>

              {/* Quick Stats Row */}
              <QuickStats
                activeProjects={projects.filter(p => ["in_progress", "assigned", "qc"].includes(p.status)).length}
                pendingActions={projects.filter(p => ["quoted", "payment_pending", "delivered", "revision"].includes(p.status)).length}
                walletBalance={user?.wallet?.balance || 0}
                className="mt-2"
              />

              {/* Needs Attention Section - Below Greeting */}
              {needsAttention.length > 0 && (
                <div className="mt-8 pt-6 border-t border-border/40">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-muted-foreground">
                      Needs Attention
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      {needsAttention.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {needsAttention.slice(0, 3).map((project) => {
                      const status = STATUS_CONFIG[project.status] || {
                        label: project.status,
                        dot: "bg-muted-foreground",
                      };
                      return (
                        <button
                          key={project.id}
                          onClick={() => router.push(`/project/${project.id}`)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 text-left"
                        >
                          <div className={cn("h-2 w-2 rounded-full shrink-0", status.dot)} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{project.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{status.label}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Gen Z Glassmorphic Bento Grid */}
            <div className="w-full lg:w-auto lg:flex-shrink-0">
              <div className="grid grid-cols-2 gap-3 lg:gap-4 w-full lg:w-[460px]">
                {/* ====== HERO CARD - Create New Project ====== */}
                <Link
                  href="/projects/new"
                  className="col-span-2 group relative overflow-hidden rounded-[20px] p-5 lg:p-6 bg-gradient-to-br from-stone-800 via-stone-900 to-neutral-900 dark:from-stone-800 dark:via-stone-900 dark:to-neutral-950 text-white transition-all duration-300 hover:shadow-2xl hover:shadow-stone-900/30 hover:-translate-y-1"
                >
                  {/* Subtle warm glow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-rose-500/5 pointer-events-none" />

                  {/* Decorative circles */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-500/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-rose-400/15 to-transparent rounded-full blur-xl" />

                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                          <Plus className="h-5 w-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[11px] font-medium text-white/90 border border-white/10">
                          ✨ Start Here
                        </span>
                      </div>
                      <h3 className="text-xl lg:text-[22px] font-semibold mb-1.5 tracking-tight">
                        New Project
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Essays, research, assignments & more
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 transition-all duration-300 group-hover:bg-white/20 group-hover:scale-105 shrink-0">
                      <ArrowRight className="h-6 w-6 text-white/80 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>

                {/* ====== EXPERT CONSULTATIONS ====== */}
                <Link
                  href="/experts"
                  className="group relative overflow-hidden rounded-[20px] p-4 lg:p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-white/10"
                >
                  {/* Subtle warm tint */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-orange-50/20 dark:from-amber-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

                  <div className="relative z-10">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                      <GraduationCap className="h-5 w-5 text-white" strokeWidth={1.5} />
                    </div>

                    {/* Mini avatars */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex -space-x-1.5">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="h-5 w-5 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 dark:from-amber-600 dark:to-orange-500 border-2 border-white dark:border-stone-900"
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-full">
                        50+ experts
                      </span>
                    </div>

                    <h3 className="font-semibold text-foreground text-[15px] mb-0.5">
                      Expert Sessions
                    </h3>
                    <p className="text-xs text-muted-foreground/80">
                      1-on-1 video consultations
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <ChevronRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5" />
                </Link>

                {/* ====== GENERATE CONTENT ====== */}
                <Link
                  href="/projects/new?type=content"
                  className="group relative overflow-hidden rounded-[20px] p-4 lg:p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-white/10"
                >
                  {/* Subtle purple tint */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-100/40 to-purple-50/20 dark:from-violet-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

                  <div className="relative z-10">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
                      <Sparkles className="h-5 w-5 text-white" strokeWidth={1.5} />
                    </div>

                    {/* AI indicator */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-100/80 dark:bg-violet-900/40 mb-3">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
                      </span>
                      <span className="text-[10px] font-medium text-violet-700 dark:text-violet-300">AI-Powered</span>
                    </div>

                    <h3 className="font-semibold text-foreground text-[15px] mb-0.5">
                      Generate Content
                    </h3>
                    <p className="text-xs text-muted-foreground/80">
                      Outlines, drafts & ideas
                    </p>
                  </div>

                  {/* Hover indicator */}
                  <ChevronRight className="absolute bottom-4 right-4 h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5" />
                </Link>

                {/* ====== AI PLAGIARISM CHECK ====== */}
                <Link
                  href="/projects/new?type=plagiarism"
                  className="col-span-2 group relative overflow-hidden rounded-[20px] p-4 lg:p-5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-white/10"
                >
                  {/* Subtle green tint */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 via-teal-50/20 to-transparent dark:from-emerald-900/10 dark:to-transparent pointer-events-none rounded-[20px]" />

                  <div className="relative z-10 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                      <Shield className="h-6 w-6 text-white" strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground text-[15px]">
                          Plagiarism Check
                        </h3>
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-900/40 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                          <CheckCircle className="h-3 w-3" />
                          99.9%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80">
                        AI-powered originality detection
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="h-9 w-9 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 flex items-center justify-center transition-all duration-300 group-hover:bg-emerald-200/80 dark:group-hover:bg-emerald-800/50 shrink-0">
                      <ChevronRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * Dashboard Skeleton Component - Static, NO animations
 */
function DashboardSkeleton() {
  return (
    <div className={cn("mesh-background mesh-gradient-bottom-right-animated h-full overflow-hidden", getTimeBasedGradientClass())}>
      <div className="relative z-10 h-full px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 flex items-center justify-center">
        <div className="max-w-[1400px] w-full">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center justify-between">
            {/* Left Column Skeleton - Greeting Area */}
            <div className="flex-1 max-w-2xl space-y-4">
              {/* "Good Morning," text */}
              <SkeletonText width={280} lineHeight={64} animate="none" />
              {/* User name */}
              <SkeletonText width={240} lineHeight={64} animate="none" />
              {/* Subtitle */}
              <div className="mt-3">
                <SkeletonText width={360} lineHeight={24} animate="none" />
              </div>

              {/* Needs Attention Section Skeleton */}
              <div className="mt-8 pt-6 border-t border-border/40 space-y-3">
                <div className="flex items-center gap-2">
                  <SkeletonText width={120} lineHeight={16} animate="none" />
                  <SkeletonBox width={28} height={24} animate="none" className="rounded-full" />
                </div>
                {/* Attention items */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50"
                  >
                    <SkeletonBox width={8} height={8} animate="none" className="rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonText width={200} lineHeight={14} animate="none" />
                      <SkeletonText width={90} lineHeight={12} animate="none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Skeleton - Premium Bento Grid */}
            <div className="w-full lg:w-auto lg:flex-shrink-0">
              <div className="grid grid-cols-2 gap-3 lg:gap-4 w-full lg:w-[480px]">
                {/* Hero card skeleton */}
                <div className="col-span-2 h-[140px] rounded-2xl bg-muted/50 border border-border/30" />
                {/* Two medium cards */}
                <div className="h-[160px] rounded-2xl bg-muted/40 border border-border/30" />
                <div className="h-[160px] rounded-2xl bg-muted/40 border border-border/30" />
                {/* Bottom wide card */}
                <div className="col-span-2 h-[80px] rounded-2xl bg-muted/30 border border-border/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * Get greeting based on time of day
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

/**
 * Get time-based gradient class for subtle theming
 */
function getTimeBasedGradientClass(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "mesh-gradient-morning";
  if (hour >= 12 && hour < 17) return "mesh-gradient-afternoon";
  return "mesh-gradient-evening";
}
