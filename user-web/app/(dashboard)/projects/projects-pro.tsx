"use client";

/**
 * @fileoverview Projects Page - Premium Design with Micro-interactions
 *
 * Features:
 * - Fixed viewport height (no scrolling, content fits the screen)
 * - Animated sliding tab indicator
 * - Smooth card transitions with AnimatePresence
 * - Enhanced micro-interactions and hover effects
 * - Professional glassmorphism design
 * - Creative header with Lottie animation
 */

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, LayoutGroup, useMotionValue, useTransform, animate } from "framer-motion";
import { StaggerItem } from "@/components/skeletons";
import {
  Plus,
  FolderKanban,
  Search,
  ArrowRight,
  Zap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  BookOpen,
  Timer,
  ChevronRight,
  Briefcase,
  Target,
  Award,
  Eye,
  CreditCard,
  CheckCheck,
  Hourglass,
  Filter,
  Sparkles,
} from "lucide-react";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProjectStore, type Project } from "@/stores";
import { useUserStore } from "@/stores/user-store";
import type { ProjectTab } from "@/types/project";
import { UploadSheet } from "@/components/dashboard/upload-sheet";
import { formatDistanceToNow, differenceInDays, differenceInHours } from "date-fns";

/**
 * Tab configuration - Clean labels without emojis
 */
interface TabConfig {
  value: ProjectTab | "all";
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { value: "all", label: "All", icon: FolderKanban },
  { value: "in_progress", label: "Active", icon: Zap },
  { value: "in_review", label: "Review", icon: Eye },
  { value: "for_review", label: "Pending", icon: Hourglass },
  { value: "history", label: "Done", icon: CheckCircle2 },
];

/**
 * Status configuration - Professional, muted colors
 */
const statusConfig: Record<string, { bg: string; text: string; label: string; border?: string }> = {
  draft: { bg: "bg-muted/50", text: "text-muted-foreground", label: "Draft", border: "border-muted" },
  submitted: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", label: "Submitted", border: "border-amber-200 dark:border-amber-800" },
  analyzing: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", label: "Analyzing", border: "border-amber-200 dark:border-amber-800" },
  quoted: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-400", label: "Quote Ready", border: "border-orange-200 dark:border-orange-800" },
  payment_pending: { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-700 dark:text-rose-400", label: "Payment Required", border: "border-rose-300 dark:border-rose-800" },
  paid: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", label: "Paid", border: "border-blue-200 dark:border-blue-800" },
  assigning: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", label: "Matching Expert", border: "border-blue-200 dark:border-blue-800" },
  assigned: { bg: "bg-sky-50 dark:bg-sky-950/30", text: "text-sky-700 dark:text-sky-400", label: "Expert Assigned", border: "border-sky-200 dark:border-sky-800" },
  in_progress: { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-700 dark:text-violet-400", label: "In Progress", border: "border-violet-200 dark:border-violet-800" },
  submitted_for_qc: { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-400", label: "Quality Check", border: "border-indigo-200 dark:border-indigo-800" },
  qc_in_progress: { bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-700 dark:text-indigo-400", label: "QC Review", border: "border-indigo-200 dark:border-indigo-800" },
  qc_approved: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", label: "Approved", border: "border-emerald-200 dark:border-emerald-800" },
  qc_rejected: { bg: "bg-red-50 dark:bg-red-950/30", text: "text-red-700 dark:text-red-400", label: "Revision Needed", border: "border-red-200 dark:border-red-800" },
  delivered: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", label: "Delivered", border: "border-emerald-200 dark:border-emerald-800" },
  revision_requested: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-700 dark:text-orange-400", label: "Revision Requested", border: "border-orange-200 dark:border-orange-800" },
  in_revision: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-400", label: "In Revision", border: "border-blue-200 dark:border-blue-800" },
  completed: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", label: "Completed", border: "border-emerald-200 dark:border-emerald-800" },
  auto_approved: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", label: "Completed", border: "border-emerald-200 dark:border-emerald-800" },
  cancelled: { bg: "bg-muted/50", text: "text-muted-foreground", label: "Cancelled", border: "border-muted" },
  refunded: { bg: "bg-muted/50", text: "text-muted-foreground", label: "Refunded", border: "border-muted" },
};

/**
 * Subject icon mapping
 */
const subjectIcons: Record<string, React.ElementType> = {
  default: BookOpen,
  essay: FileText,
  research: Search,
  thesis: Award,
  assignment: Briefcase,
  dissertation: Target,
};

interface ProjectsProProps {
  onPayNow?: (project: Project) => void;
}

/**
 * Get time-based gradient class
 */
function getTimeBasedGradientClass(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "mesh-gradient-morning";
  if (hour >= 12 && hour < 17) return "mesh-gradient-afternoon";
  return "mesh-gradient-evening";
}

/**
 * Spring config for smooth animations
 */
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

const smoothSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 28,
  mass: 0.8,
};

/**
 * Animated Counter - Smooth number animation
 */
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, count]);

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => setDisplayValue(latest));
    return unsubscribe;
  }, [rounded]);

  return (
    <span className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  );
}

/**
 * Creative Header with Lottie Animation
 */
function ProjectsHeader({
  stats,
  onNewProject,
}: {
  stats: { total: number; inProgress: number; completed: number; successRate: number };
  onNewProject: () => void;
}) {
  const [isClient, setIsClient] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    setIsClient(true);
    fetch("/lottie/icons/computer.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Failed to load animation:", err));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothSpring}
      className="relative mb-4"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <motion.div
          className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Main Header Content */}
      <div className="relative p-4 md:p-5 rounded-2xl bg-background/60 backdrop-blur-xl border border-border/30">
        <div className="flex items-start gap-4">
          {/* Lottie Animation Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, ...smoothSpring }}
            className="relative shrink-0 hidden sm:block"
          >
            {/* Animated ring */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-primary/20"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-primary/10 via-violet-500/10 to-primary/5 flex items-center justify-center overflow-hidden">
              {isClient && animationData ? (
                <Lottie
                  animationData={animationData}
                  loop={true}
                  autoplay={true}
                  style={{ width: "90%", height: "90%" }}
                />
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <FolderKanban className="h-10 w-10 text-primary/60" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Title & Stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, ...smoothSpring }}
                  className="flex items-center gap-2 mb-1"
                >
                  <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
                    Projects
                  </h1>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 2 }}
                  >
                    <Sparkles className="h-4 w-4 text-primary/60" />
                  </motion.div>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-muted-foreground"
                >
                  Manage your assignments and track progress
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button onClick={onNewProject} size="sm" className="h-9 px-4 gap-2 shadow-sm">
                  <Plus className="h-4 w-4" />
                  <span className="hidden md:inline">New Project</span>
                </Button>
              </motion.div>
            </div>

            {/* Stats Row - Creative Circular Design */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-3 md:gap-4 flex-wrap"
            >
              <StatCircle
                value={stats.total}
                label="Total"
                icon={FolderKanban}
                delay={0.3}
              />
              <div className="h-8 w-px bg-border/40 hidden md:block" />
              <StatCircle
                value={stats.inProgress}
                label="Active"
                icon={Zap}
                accent
                delay={0.35}
              />
              <div className="h-8 w-px bg-border/40 hidden md:block" />
              <StatCircle
                value={stats.completed}
                label="Done"
                icon={CheckCircle2}
                delay={0.4}
              />
              <div className="h-8 w-px bg-border/40 hidden md:block" />
              <StatCircle
                value={stats.successRate}
                suffix="%"
                label="Success"
                icon={TrendingUp}
                delay={0.45}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Stat Circle - Compact circular stat display with animation
 */
function StatCircle({
  value,
  suffix = "",
  label,
  icon: Icon,
  accent,
  delay,
}: {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  accent?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, ...smoothSpring }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="flex items-center gap-2"
    >
      <motion.div
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
          accent
            ? "bg-primary/15 text-primary"
            : "bg-muted/60 text-muted-foreground"
        )}
        whileHover={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.4 }}
      >
        <Icon className="h-4 w-4" />
      </motion.div>
      <div className="flex flex-col">
        <span className={cn(
          "text-lg font-semibold leading-tight",
          accent && "text-primary"
        )}>
          <AnimatedCounter value={value} suffix={suffix} />
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
    </motion.div>
  );
}

export function ProjectsPro({ onPayNow }: ProjectsProProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const { getProjectsByTab, projects } = useProjectStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ProjectTab | "all">("all");
  const tabsRef = useRef<HTMLDivElement>(null);

  const displayProjects = useMemo(() => {
    if (selectedTab === "all") return projects;
    return getProjectsByTab(selectedTab);
  }, [selectedTab, projects, getProjectsByTab]);

  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = getProjectsByTab("in_progress").length;
    const completed = getProjectsByTab("history").filter(p => p.status === "completed").length;
    const pendingPayment = projects.filter(p => p.status === "payment_pending" || p.status === "quoted").length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, inProgress, completed, pendingPayment, successRate };
  }, [projects, getProjectsByTab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: projects.length };
    tabs.forEach((tab) => {
      if (tab.value !== "all") {
        counts[tab.value] = getProjectsByTab(tab.value as ProjectTab).length;
      }
    });
    return counts;
  }, [getProjectsByTab, projects]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return displayProjects;
    const query = searchQuery.toLowerCase();
    return displayProjects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.projectNumber || p.project_number || "").toLowerCase().includes(query) ||
        (p.subject?.name || "").toLowerCase().includes(query)
    );
  }, [displayProjects, searchQuery]);

  return (
    <>
      {/* Fixed Gradient Background - Full viewport */}
      <div className={cn("fixed inset-0 mesh-background mesh-gradient-bottom-right-animated", getTimeBasedGradientClass())} />

      {/* Main Content - Fixed height, no scroll */}
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full flex flex-col h-full">
            {/* Creative Header with Lottie Animation */}
            <StaggerItem>
              <ProjectsHeader
                stats={stats}
                onNewProject={() => setUploadSheetOpen(true)}
              />
            </StaggerItem>

            {/* Tabs with Sliding Indicator */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smoothSpring, delay: 0.1 }}
                className="mb-4"
              >
                <LayoutGroup>
                  <div
                    ref={tabsRef}
                    className="flex items-center gap-1 p-1 bg-muted/50 backdrop-blur-sm rounded-xl overflow-x-auto scrollbar-none"
                  >
                    {tabs.map((tab) => {
                      const isActive = selectedTab === tab.value;
                      const count = tabCounts[tab.value];
                      const Icon = tab.icon;

                      return (
                        <motion.button
                          key={tab.value}
                          onClick={() => setSelectedTab(tab.value)}
                          className={cn(
                            "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          whileHover={{ scale: isActive ? 1 : 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Sliding Background Indicator */}
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute inset-0 bg-background rounded-lg shadow-sm"
                              transition={springTransition}
                            />
                          )}

                          {/* Tab Content */}
                          <span className="relative z-10 flex items-center gap-1.5">
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {count > 0 && (
                              <span className={cn(
                                "text-xs px-1.5 py-0.5 rounded-full tabular-nums transition-colors",
                                isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                              )}>
                                {count}
                              </span>
                            )}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </LayoutGroup>
              </motion.div>
            </StaggerItem>

            {/* Search Bar */}
            <StaggerItem>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...smoothSpring, delay: 0.15 }}
                className="mb-4"
              >
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <motion.input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-4 text-sm bg-background/80 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
              </motion.div>
            </StaggerItem>

            {/* Payment Alert Banner */}
            <AnimatePresence>
              {stats.pendingPayment > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={smoothSpring}
                  className="overflow-hidden"
                >
                  <motion.div
                    whileHover={{ scale: 1.005 }}
                    className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-800/50 backdrop-blur-sm cursor-pointer"
                    onClick={() => setSelectedTab("in_review")}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0"
                      >
                        <CreditCard className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {stats.pendingPayment} project{stats.pendingPayment > 1 ? "s" : ""} awaiting payment
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-rose-500 shrink-0" />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Projects Grid - Scrollable area */}
            <div className="flex-1 overflow-y-auto scrollbar-thin rounded-xl">
              <AnimatePresence mode="wait">
                {filteredProjects.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={smoothSpring}
                  >
                    <EmptyState
                      tab={selectedTab}
                      searchQuery={searchQuery}
                      onNewProject={() => setUploadSheetOpen(true)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={smoothSpring}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {filteredProjects.map((project, index) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onPayNow={onPayNow}
                          index={index}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <UploadSheet open={uploadSheetOpen} onOpenChange={setUploadSheetOpen} />
    </>
  );
}

/**
 * Get deadline urgency
 */
function getDeadlineUrgency(deadline: string | null | undefined): {
  label: string;
  urgent: boolean;
} | null {
  if (!deadline) return null;

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysLeft = differenceInDays(deadlineDate, now);
  const hoursLeft = differenceInHours(deadlineDate, now);

  if (hoursLeft < 0) return { label: "Overdue", urgent: true };
  if (hoursLeft <= 24) return { label: `${hoursLeft}h`, urgent: true };
  if (daysLeft <= 2) return { label: `${daysLeft}d`, urgent: true };
  if (daysLeft <= 7) return { label: `${daysLeft}d`, urgent: false };
  return { label: `${daysLeft}d`, urgent: false };
}

/**
 * Get card variant based on project status
 */
type CardVariant = "payment" | "in_progress" | "review" | "delivered" | "completed" | "draft" | "default";

function getCardVariant(status: string): CardVariant {
  if (status === "payment_pending" || status === "quoted") return "payment";
  if (status === "in_progress" || status === "assigned" || status === "assigning") return "in_progress";
  if (status === "submitted" || status === "analyzing" || status === "submitted_for_qc" || status === "qc_in_progress") return "review";
  if (status === "delivered" || status === "qc_approved") return "delivered";
  if (status === "completed" || status === "auto_approved") return "completed";
  if (status === "draft") return "draft";
  return "default";
}

/**
 * Project Card - Routes to variant-specific components
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
  const progress = project.progress ?? project.progress_percentage ?? 0;
  const status = statusConfig[project.status] || statusConfig.submitted;
  const variant = getCardVariant(project.status);
  const isPaymentAction = variant === "payment";
  const deadlineUrgency = getDeadlineUrgency(project.deadline);

  const handleClick = () => {
    if (isPaymentAction && onPayNow) {
      onPayNow(project);
    } else {
      router.push(`/project/${project.id}`);
    }
  };

  const SubjectIcon = subjectIcons[project.subject?.slug || "default"] || subjectIcons.default;
  const quoteAmount = project.final_quote || project.user_quote || project.quoteAmount;
  const lastUpdated = project.updated_at || project.created_at;

  const cardProps = {
    project,
    status,
    lastUpdated,
    deadlineUrgency,
    index,
    onClick: handleClick,
  };

  switch (variant) {
    case "payment":
      return <PaymentCard {...cardProps} quoteAmount={quoteAmount} onPayNow={onPayNow} />;
    case "in_progress":
      return <InProgressCard {...cardProps} progress={progress} />;
    case "delivered":
      return <DeliveredCard {...cardProps} />;
    case "completed":
      return <CompletedCard {...cardProps} />;
    case "review":
      return <ReviewCard {...cardProps} />;
    case "draft":
      return <DraftCard {...cardProps} />;
    default:
      return <DefaultCard {...cardProps} SubjectIcon={SubjectIcon} quoteAmount={quoteAmount} />;
  }
}

/**
 * Card animation variants
 */
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.03,
      ...smoothSpring,
    },
  }),
  hover: {
    y: -4,
    scale: 1.01,
    transition: springTransition,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

/**
 * Payment Card - Subtle urgency indicator
 */
function PaymentCard({
  project,
  status,
  quoteAmount,
  lastUpdated,
  deadlineUrgency,
  index,
  onPayNow,
  onClick,
}: {
  project: Project;
  status: typeof statusConfig[string];
  quoteAmount: number | undefined;
  lastUpdated: string | undefined;
  deadlineUrgency: ReturnType<typeof getDeadlineUrgency>;
  index: number;
  onPayNow?: (project: Project) => void;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      onClick={onClick}
      className="group cursor-pointer relative p-4 rounded-xl bg-background/80 backdrop-blur-sm border-2 border-rose-200/70 dark:border-rose-800/70 overflow-hidden"
    >
      {/* Animated top accent */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-400 via-orange-400 to-rose-400"
        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ backgroundSize: "200% 100%" }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground line-clamp-1 text-sm">{project.title}</h3>
          <p className="text-xs text-muted-foreground font-mono">#{project.project_number || project.projectNumber}</p>
        </div>
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0", status.bg, status.text)}>
          {status.label}
        </span>
      </div>

      {/* Amount */}
      {quoteAmount && (
        <div className="mb-3 p-2.5 rounded-lg bg-muted/40">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Amount Due</p>
          <p className="text-lg font-semibold text-foreground">₹{quoteAmount.toLocaleString()}</p>
        </div>
      )}

      {/* Deadline */}
      {deadlineUrgency && (
        <div className={cn(
          "flex items-center gap-1.5 mb-3 text-xs",
          deadlineUrgency.urgent ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
        )}>
          <Timer className="h-3.5 w-3.5" />
          <span>{deadlineUrgency.label}</span>
        </div>
      )}

      {/* Pay Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full h-8 bg-foreground text-background text-sm font-medium rounded-lg flex items-center justify-center gap-1.5"
        onClick={(e) => {
          e.stopPropagation();
          if (onPayNow) onPayNow(project);
        }}
      >
        Pay Now
        <ArrowRight className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
}

/**
 * In Progress Card - Active status with progress bar
 */
function InProgressCard({
  project,
  status,
  progress,
  lastUpdated,
  deadlineUrgency,
  index,
  onClick,
}: {
  project: Project;
  status: typeof statusConfig[string];
  progress: number;
  lastUpdated: string | undefined;
  deadlineUrgency: ReturnType<typeof getDeadlineUrgency>;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      onClick={onClick}
      className="group cursor-pointer p-4 rounded-xl bg-background/80 backdrop-blur-sm border border-violet-200/70 dark:border-violet-800/70"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-violet-500"
            />
            <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400 uppercase tracking-wide">Active</span>
          </div>
          <h3 className="font-medium text-foreground line-clamp-1 text-sm">{project.title}</h3>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-medium tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
            className="h-full bg-violet-500 rounded-full"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">#{project.project_number || project.projectNumber}</span>
        {deadlineUrgency && (
          <span className={cn(deadlineUrgency.urgent && "text-rose-500")}>{deadlineUrgency.label}</span>
        )}
      </div>

      {/* Hover arrow */}
      <motion.div
        initial={{ opacity: 0, x: -5 }}
        whileHover={{ opacity: 1, x: 0 }}
        className="absolute bottom-4 right-4"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </motion.div>
    </motion.div>
  );
}

/**
 * Delivered Card - Ready for review
 */
function DeliveredCard({
  project,
  status,
  lastUpdated,
  index,
  onClick,
}: {
  project: Project;
  status: typeof statusConfig[string];
  lastUpdated: string | undefined;
  deadlineUrgency: ReturnType<typeof getDeadlineUrgency>;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      onClick={onClick}
      className="group cursor-pointer p-4 rounded-xl bg-background/80 backdrop-blur-sm border border-emerald-200/70 dark:border-emerald-800/70"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0"
        >
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground line-clamp-1 text-sm">{project.title}</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Ready for review</p>
        </div>
      </div>

      {/* Review Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full h-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-lg flex items-center justify-center gap-1.5 border border-emerald-200/50 dark:border-emerald-800/50"
      >
        Review Now
        <ArrowRight className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
}

/**
 * Completed Card - Simple completion status
 */
function CompletedCard({
  project,
  status,
  lastUpdated,
  index,
  onClick,
}: {
  project: Project;
  status: typeof statusConfig[string];
  lastUpdated: string | undefined;
  deadlineUrgency: ReturnType<typeof getDeadlineUrgency>;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      onClick={onClick}
      className="group cursor-pointer p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/30"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
          <CheckCheck className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground line-clamp-1 text-sm">{project.title}</h3>
          <span className={cn("text-[10px] font-medium", status.text)}>Completed</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/20">
        <span className="font-mono">#{project.project_number || project.projectNumber}</span>
        <span>{lastUpdated ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }) : "recently"}</span>
      </div>
    </motion.div>
  );
}

/**
 * Review Card - Dashed border, waiting state
 */
function ReviewCard({
  project,
  status,
  lastUpdated,
  index,
  onClick,
}: {
  project: Project;
  status: typeof statusConfig[string];
  lastUpdated: string | undefined;
  deadlineUrgency: ReturnType<typeof getDeadlineUrgency>;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      onClick={onClick}
      className="group cursor-pointer relative p-4 rounded-xl bg-background/50 backdrop-blur-sm border-2 border-dashed border-amber-300/70 dark:border-amber-700/70"
    >
      {/* Animated dots */}
      <div className="absolute top-3 right-3 flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-amber-400 dark:bg-amber-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
          <Hourglass className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground line-clamp-1 text-sm">{project.title}</h3>
          <p className="text-xs text-amber-600 dark:text-amber-400">{status.label}</p>
        </div>
      </div>

      {/* Message */}
      <p className="text-xs text-muted-foreground mb-2">
        Under review. You&apos;ll be notified when ready.
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">#{project.project_number || project.projectNumber}</span>
        <span>{lastUpdated ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }) : "recently"}</span>
      </div>
    </motion.div>
  );
}

/**
 * Draft Card - Muted, incomplete state
 */
function DraftCard({
  project,
  lastUpdated,
  index,
  onClick,
}: {
  project: Project;
  lastUpdated: string | undefined;
  deadlineUrgency: ReturnType<typeof getDeadlineUrgency>;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      onClick={onClick}
      className="group cursor-pointer relative p-4 rounded-xl bg-muted/20 border-2 border-dashed border-muted-foreground/15"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <FileText className="h-4.5 w-4.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-muted-foreground line-clamp-1 text-sm">{project.title}</h3>
          <span className="text-[10px] text-muted-foreground/60">Draft</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/60 mb-3">Continue editing to submit</p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full h-7 bg-muted/50 text-muted-foreground text-xs font-medium rounded-lg flex items-center justify-center gap-1"
      >
        Continue
        <ChevronRight className="h-3 w-3" />
      </motion.button>
    </motion.div>
  );
}

/**
 * Default Card - Standard project display
 */
function DefaultCard({
  project,
  status,
  SubjectIcon,
  quoteAmount,
  lastUpdated,
  index,
  onClick,
}: {
  project: Project;
  status: typeof statusConfig[string];
  SubjectIcon: React.ElementType;
  quoteAmount: number | undefined;
  lastUpdated: string | undefined;
  deadlineUrgency: ReturnType<typeof getDeadlineUrgency>;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      onClick={onClick}
      className="group cursor-pointer p-4 rounded-xl bg-background/70 backdrop-blur-sm border border-border/40 hover:border-border/70 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <SubjectIcon className="h-4.5 w-4.5 text-primary" />
        </div>
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", status.bg, status.text)}>
          {status.label}
        </span>
      </div>

      <h3 className="font-medium text-foreground line-clamp-1 text-sm mb-1">{project.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-1 mb-3">
        {project.description || project.subject?.name || "No description"}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded font-mono">
          #{project.project_number || project.projectNumber}
        </span>
        {quoteAmount && (
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            ₹{quoteAmount.toLocaleString()}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/20">
        <span className="text-[10px] text-muted-foreground">
          {lastUpdated ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }) : "recently"}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.div>
  );
}

/**
 * Empty State - Clean, professional
 */
function EmptyState({
  tab,
  searchQuery,
  onNewProject,
}: {
  tab: ProjectTab | "all";
  searchQuery: string;
  onNewProject: () => void;
}) {
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springTransition}
          className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4"
        >
          <Search className="h-6 w-6 text-muted-foreground" />
        </motion.div>
        <h3 className="text-base font-medium mb-1">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          No projects match &quot;{searchQuery}&quot;
        </p>
      </div>
    );
  }

  const emptyConfig: Record<string, { icon: React.ElementType; title: string; message: string }> = {
    all: {
      icon: FolderKanban,
      title: "No projects yet",
      message: "Create your first project to get started",
    },
    in_review: {
      icon: Eye,
      title: "Nothing in review",
      message: "Projects under review will appear here",
    },
    in_progress: {
      icon: Zap,
      title: "No active projects",
      message: "Projects being worked on will show here",
    },
    for_review: {
      icon: Hourglass,
      title: "Nothing pending",
      message: "Completed work ready for review appears here",
    },
    history: {
      icon: CheckCircle2,
      title: "No completed projects",
      message: "Your finished projects will be stored here",
    },
  };

  const config = emptyConfig[tab] || emptyConfig.all;
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={springTransition}
        className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4"
      >
        <Icon className="h-6 w-6 text-muted-foreground" />
      </motion.div>
      <h3 className="text-base font-medium mb-1">{config.title}</h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-xs">{config.message}</p>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button onClick={onNewProject} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Create Project
        </Button>
      </motion.div>
    </div>
  );
}
