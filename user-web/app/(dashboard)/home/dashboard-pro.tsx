"use client";

/**
 * Dashboard Pro - New Design System
 * Matching the design with corner-positioned pastel mesh gradients,
 * asymmetric bento grid with smooth hover animations, and glass morphism cards
 *
 * Updated to use the unified skeleton system with:
 * - PageSkeletonProvider for loading state management
 * - Minimum 1000ms skeleton display
 * - StaggerItem for choreographed reveal animations
 */

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  CheckCircle,
  Sparkles,
  BarChart3,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { useProjectStore } from "@/stores";
import { motion } from "framer-motion";
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
 * Layout: Left column [tall, short], Right column [short, tall]
 */
const ACTION_CARDS = [
  {
    id: "new-project",
    icon: Plus,
    title: "Create New Project",
    description: "Start a new AI-driven initiative.",
    href: "/projects/new",
    column: "left" as const,
  },
  {
    id: "experts",
    icon: GraduationCap,
    title: "Expert Consultations",
    description: "Book 1-on-1 sessions with verified experts.",
    href: "/experts",
    column: "left" as const,
  },
  {
    id: "content",
    icon: Sparkles,
    title: "Generate Content",
    description: "Instantly create high-quality text and visuals.",
    href: "/projects/new?type=content",
    column: "right" as const,
  },
  {
    id: "plagiarism",
    icon: CheckCircle,
    title: "AI Plagiarism Check",
    description: "Ensure content originality and compliance.",
    href: "/projects/new?type=plagiarism",
    column: "right" as const,
  },
];

// Default expanded indices: left=0 (first card tall), right=1 (second card tall)
const DEFAULT_LEFT_EXPANDED = 0;
const DEFAULT_RIGHT_EXPANDED = 1;

/**
 * Main Dashboard Component - New Design
 * Uses PageSkeletonProvider for unified loading experience
 */
export function DashboardPro() {
  const router = useRouter();
  const { user, isLoading: userLoading, fetchUser } = useUserStore();
  const { projects, isLoading: projectsLoading, fetchProjects } = useProjectStore();

  // Track which column has the expanded card (null = use default)
  const [leftHovered, setLeftHovered] = useState<number | null>(null);
  const [rightHovered, setRightHovered] = useState<number | null>(null);

  // Effective expanded states (use hover or default)
  const leftExpanded = leftHovered ?? DEFAULT_LEFT_EXPANDED;
  const rightExpanded = rightHovered ?? DEFAULT_RIGHT_EXPANDED;

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

  // Get left and right column cards
  const leftCards = ACTION_CARDS.filter((c) => c.column === "left");
  const rightCards = ACTION_CARDS.filter((c) => c.column === "right");

  // Handlers for left column
  const handleLeftHover = useCallback((index: number) => {
    setLeftHovered(index);
  }, []);

  const handleLeftLeave = useCallback(() => {
    setLeftHovered(null);
  }, []);

  // Handlers for right column
  const handleRightHover = useCallback((index: number) => {
    setRightHovered(index);
  }, []);

  const handleRightLeave = useCallback(() => {
    setRightHovered(null);
  }, []);

  return (
    <PageSkeletonProvider
      isLoading={isLoading}
      skeleton={<DashboardBentoSkeleton />}
      minimumDuration={1000}
      className="h-full min-h-full"
    >
      <div className={cn("mesh-background mesh-gradient-bottom-right-animated min-h-full h-full", getTimeBasedGradientClass())}>
        <div className="relative z-10 min-h-full h-full p-6 md:p-6 lg:p-8 flex items-center justify-center overflow-auto">
          <div className="max-w-6xl w-full">
            {/* Main Content - Two Column Layout */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start lg:items-center">
              {/* Left Column - Greeting */}
              <StaggerItem className="flex-1 space-y-4">
                {/* Greeting with subtle animation */}
                <div className="relative">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground/90"
                  >
                    Good {getGreeting()},
                  </motion.h1>
                  {/* Name with Lottie animation to the right */}
                  <div className="flex items-center gap-3">
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.05 }}
                      className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground"
                    >
                      {firstName}
                    </motion.h2>
                    {/* Lottie animation to the right of name */}
                    <GreetingAnimation
                      className="hidden md:block"
                      size={72}
                    />
                  </div>
                </div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg text-muted-foreground mt-4 max-w-md"
                >
                  Ready to optimize your workflow and generate insights.
                </motion.p>

                {/* Quick Stats Row */}
                <QuickStats
                  activeProjects={projects.filter(p => ["in_progress", "assigned", "qc"].includes(p.status)).length}
                  pendingActions={projects.filter(p => ["quoted", "payment_pending", "delivered", "revision"].includes(p.status)).length}
                  walletBalance={user?.wallet?.balance || 0}
                  className="mt-2"
                />

                {/* Needs Attention Section - Below Greeting */}
                {needsAttention.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mt-8 pt-6 border-t border-border/40"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Needs Attention
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                        {needsAttention.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {needsAttention.map((project, index) => {
                        const status = STATUS_CONFIG[project.status] || {
                          label: project.status,
                          dot: "bg-muted-foreground",
                        };
                        return (
                          <motion.button
                            key={project.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 + index * 0.05, duration: 0.3 }}
                            onClick={() => router.push(`/project/${project.id}`)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl action-card-glass text-left group"
                          >
                            <div className={cn("h-2 w-2 rounded-full shrink-0", status.dot)} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{project.title}</p>
                              <p className="text-xs text-muted-foreground">{status.label}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </StaggerItem>

              {/* Right Column - Bento Grid Action Cards */}
              <StaggerItem className="w-full lg:w-auto">
                <div className="flex gap-4 lg:gap-5 max-w-md lg:max-w-lg">
                  {/* Left Column of Cards */}
                  <div
                    className="flex-1 flex flex-col gap-4 lg:gap-5"
                    onMouseLeave={handleLeftLeave}
                  >
                    {leftCards.map((card, index) => (
                      <BentoCard
                        key={card.id}
                        {...card}
                        cardIndex={index}
                        isTall={leftExpanded === index}
                        onHover={() => handleLeftHover(index)}
                      />
                    ))}
                  </div>

                  {/* Right Column of Cards */}
                  <div
                    className="flex-1 flex flex-col gap-4 lg:gap-5"
                    onMouseLeave={handleRightLeave}
                  >
                    {rightCards.map((card, index) => (
                      <BentoCard
                        key={card.id}
                        {...card}
                        cardIndex={index}
                        isTall={rightExpanded === index}
                        onHover={() => handleRightHover(index)}
                      />
                    ))}
                  </div>
                </div>
              </StaggerItem>
            </div>
          </div>
        </div>
      </div>
    </PageSkeletonProvider>
  );
}

// Spring configuration for ultra smooth animations
const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

/**
 * Bento Card Component - Glass morphism with smooth height animation
 */
function BentoCard({
  icon: Icon,
  title,
  description,
  href,
  cardIndex,
  isTall,
  onHover,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  cardIndex: number;
  isTall: boolean;
  onHover: () => void;
}) {
  // Height values for tall and short states
  const tallHeight = 220;
  const shortHeight = 140;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        height: isTall ? tallHeight : shortHeight,
      }}
      transition={{
        opacity: { duration: 0.4, delay: 0.1 + cardIndex * 0.1 },
        y: { duration: 0.4, delay: 0.1 + cardIndex * 0.1 },
        height: springConfig,
      }}
      onMouseEnter={onHover}
      className="relative will-change-[height]"
    >
      <Link
        href={href}
        className="block h-full rounded-2xl p-5 lg:p-6 action-card-glass group cursor-pointer overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Icon */}
          <div className="mb-4">
            <motion.div
              animate={{
                scale: isTall ? 1.1 : 1,
              }}
              transition={springConfig}
            >
              <Icon
                className="h-7 w-7 text-foreground/70 group-hover:text-foreground transition-colors duration-200"
                strokeWidth={1.5}
              />
            </motion.div>
          </div>

          {/* Content */}
          <div className="mt-auto">
            <motion.h3
              className="font-semibold text-foreground mb-1"
              animate={{
                fontSize: isTall ? "1.125rem" : "0.9375rem",
              }}
              transition={springConfig}
            >
              {title}
            </motion.h3>
            <motion.p
              className="text-muted-foreground leading-relaxed overflow-hidden"
              animate={{
                opacity: isTall ? 1 : 0.7,
                fontSize: isTall ? "0.875rem" : "0.75rem",
                maxHeight: isTall ? 60 : 20,
              }}
              transition={{
                ...springConfig,
                opacity: { duration: 0.2 },
              }}
            >
              {description}
            </motion.p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Dashboard Bento Skeleton Component
 * Custom skeleton that matches the unique bento grid layout
 * Uses staggered shimmer animations for a polished loading experience
 */
function DashboardBentoSkeleton() {
  return (
    <div className={cn("mesh-background mesh-gradient-bottom-right-animated min-h-full h-full", getTimeBasedGradientClass())}>
      <div className="relative z-10 min-h-full h-full p-6 md:p-6 lg:p-8 flex items-center justify-center overflow-auto">
        <div className="max-w-6xl w-full">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start lg:items-center">
            {/* Left Column Skeleton - Greeting Area */}
            <div className="flex-1 space-y-4">
              {/* "Good Morning," text */}
              <SkeletonText width={260} lineHeight={56} delay={0} />
              {/* User name */}
              <SkeletonText width={200} lineHeight={56} delay={50} />
              {/* Subtitle */}
              <div className="mt-4">
                <SkeletonText width={320} lineHeight={24} delay={100} />
              </div>

              {/* Needs Attention Section Skeleton */}
              <div className="mt-8 pt-6 border-t border-border/40 space-y-3">
                <div className="flex items-center gap-2">
                  <SkeletonText width={110} lineHeight={16} delay={150} />
                  <SkeletonBox width={24} height={20} delay={175} className="rounded-full" />
                </div>
                {/* Attention items */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50"
                  >
                    <SkeletonBox width={8} height={8} delay={200 + i * 50} className="rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <SkeletonText width={180} lineHeight={14} delay={225 + i * 50} />
                      <SkeletonText width={80} lineHeight={12} delay={250 + i * 50} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Skeleton - Bento Grid */}
            <div className="w-full lg:w-auto">
              <div className="flex gap-4 lg:gap-5 max-w-md lg:max-w-lg">
                {/* Left Column of Cards */}
                <div className="flex-1 flex flex-col gap-4 lg:gap-5">
                  <BentoCardSkeleton height={220} delay={300} />
                  <BentoCardSkeleton height={140} delay={350} />
                </div>
                {/* Right Column of Cards */}
                <div className="flex-1 flex flex-col gap-4 lg:gap-5">
                  <BentoCardSkeleton height={140} delay={400} />
                  <BentoCardSkeleton height={220} delay={450} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Bento Card Skeleton - Individual card skeleton for the bento grid
 */
function BentoCardSkeleton({ height, delay }: { height: number; delay: number }) {
  return (
    <div
      className="rounded-2xl p-5 lg:p-6 bg-card/60 border border-border/50 backdrop-blur-sm"
      style={{ height }}
    >
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
 * Morning: warm peachy tones, Afternoon: neutral, Evening: cool purple tones
 */
function getTimeBasedGradientClass(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "mesh-gradient-morning";
  if (hour >= 12 && hour < 17) return "mesh-gradient-afternoon";
  return "mesh-gradient-evening";
}
