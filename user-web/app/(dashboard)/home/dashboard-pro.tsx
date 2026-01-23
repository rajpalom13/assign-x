"use client";

/**
 * Dashboard Pro - Clean Design System
 * No animations except for the gradient background
 * Clean, responsive bento grid layout
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useProjectStore } from "@/stores";
import { PageSkeletonProvider, StaggerItem } from "@/components/skeletons";
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
 * Action card data configuration
 */
const ACTION_CARDS = [
  {
    id: "new-project",
    icon: Plus,
    title: "Create New Project",
    description: "Start a new AI-driven initiative.",
    href: "/projects/new",
  },
  {
    id: "experts",
    icon: GraduationCap,
    title: "Expert Consultations",
    description: "Book 1-on-1 sessions with verified experts.",
    href: "/experts",
  },
  {
    id: "content",
    icon: Sparkles,
    title: "Generate Content",
    description: "Instantly create high-quality text and visuals.",
    href: "/projects/new?type=content",
  },
  {
    id: "plagiarism",
    icon: CheckCircle,
    title: "AI Plagiarism Check",
    description: "Ensure content originality and compliance.",
    href: "/projects/new?type=plagiarism",
  },
];

/**
 * Main Dashboard Component - Clean Design
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

  return (
    <PageSkeletonProvider
      isLoading={isLoading}
      skeleton={<DashboardBentoSkeleton />}
      minimumDuration={1000}
      className="h-full"
    >
      <div className={cn("mesh-background mesh-gradient-bottom-right-animated h-full overflow-hidden", getTimeBasedGradientClass())}>
        <div className="relative z-10 h-full px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 flex items-center justify-center">
          <div className="max-w-[1400px] w-full">
            {/* Main Content - Two Column Layout */}
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center justify-between">
              {/* Left Column - Greeting */}
              <StaggerItem className="flex-1 max-w-2xl space-y-4">
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
                            className="w-full flex items-center gap-3 p-3 rounded-xl action-card-glass text-left group"
                          >
                            <div className={cn("h-2 w-2 rounded-full shrink-0", status.dot)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{project.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{status.label}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </StaggerItem>

              {/* Right Column - Bento Grid Action Cards */}
              <StaggerItem className="w-full lg:w-auto lg:flex-shrink-0">
                <div className="grid grid-cols-2 gap-4 lg:gap-5 w-full lg:w-[440px]">
                  {ACTION_CARDS.map((card) => (
                    <BentoCard
                      key={card.id}
                      icon={card.icon}
                      title={card.title}
                      description={card.description}
                      href={card.href}
                    />
                  ))}
                </div>
              </StaggerItem>
            </div>
          </div>
        </div>
      </div>
    </PageSkeletonProvider>
  );
}

/**
 * Bento Card Component - Clean glass morphism design
 */
function BentoCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block h-[180px] sm:h-[200px] rounded-2xl p-5 lg:p-6 action-card-glass group"
    >
      <div className="flex flex-col h-full">
        {/* Icon */}
        <div className="mb-4">
          <Icon
            className="h-7 w-7 text-foreground/70"
            strokeWidth={1.5}
          />
        </div>

        {/* Content */}
        <div className="mt-auto">
          <h3 className="font-semibold text-foreground text-sm sm:text-base mb-1">
            {title}
          </h3>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

/**
 * Dashboard Bento Skeleton Component
 */
function DashboardBentoSkeleton() {
  return (
    <div className={cn("mesh-background mesh-gradient-bottom-right-animated h-full overflow-hidden", getTimeBasedGradientClass())}>
      <div className="relative z-10 h-full px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 flex items-center justify-center">
        <div className="max-w-[1400px] w-full">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start lg:items-center justify-between">
            {/* Left Column Skeleton - Greeting Area */}
            <div className="flex-1 max-w-2xl space-y-4">
              {/* "Good Morning," text */}
              <SkeletonText width={280} lineHeight={64} delay={0} />
              {/* User name */}
              <SkeletonText width={240} lineHeight={64} delay={50} />
              {/* Subtitle */}
              <div className="mt-3">
                <SkeletonText width={360} lineHeight={24} delay={100} />
              </div>

              {/* Needs Attention Section Skeleton */}
              <div className="mt-8 pt-6 border-t border-border/40 space-y-3">
                <div className="flex items-center gap-2">
                  <SkeletonText width={120} lineHeight={16} delay={150} />
                  <SkeletonBox width={28} height={24} delay={175} className="rounded-full" />
                </div>
                {/* Attention items */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50"
                  >
                    <SkeletonBox width={8} height={8} delay={200 + i * 50} className="rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonText width={200} lineHeight={14} delay={225 + i * 50} />
                      <SkeletonText width={90} lineHeight={12} delay={250 + i * 50} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Skeleton - Bento Grid */}
            <div className="w-full lg:w-auto lg:flex-shrink-0">
              <div className="grid grid-cols-2 gap-4 lg:gap-5 w-full lg:w-[440px]">
                {[1, 2, 3, 4].map((i) => (
                  <BentoCardSkeleton key={i} delay={300 + i * 50} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Bento Card Skeleton
 */
function BentoCardSkeleton({ delay }: { delay: number }) {
  return (
    <div className="h-[180px] sm:h-[200px] rounded-2xl p-5 lg:p-6 bg-card/60 border border-border/50 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        {/* Icon placeholder */}
        <SkeletonBox width={28} height={28} delay={delay} className="rounded-lg mb-4" />

        {/* Content at bottom */}
        <div className="mt-auto space-y-2">
          <SkeletonText width={120} lineHeight={18} delay={delay + 25} />
          <SkeletonText width={160} lineHeight={14} delay={delay + 50} />
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
