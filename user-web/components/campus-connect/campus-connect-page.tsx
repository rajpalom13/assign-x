"use client";

/**
 * Campus Connect Page - Community-First Design
 *
 * UNIQUE IDENTITY (Different from Projects Page):
 * - Vibrant gradient theme (blue/purple/teal) vs brown/stone
 * - Feature carousel showcasing Campus Connect features
 * - Community-focused visuals with student illustrations
 * - Horizontal scrolling category pills (Instagram/Twitter style)
 * - Pinterest-style masonry grid
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  X,
  AlertCircle,
  RefreshCw,
  Users,
  HelpCircle,
  Home,
  Briefcase,
  BookOpen,
  Calendar,
  ShoppingBag,
  Car,
  Trophy,
  Megaphone,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Heart,
  Star,
  Filter,
  GraduationCap,
  Zap,
  Globe,
  Shield,
  Search as SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { CampusConnectMasonryGrid } from "./masonry-grid";
import { CollegeFilterCompact } from "./college-filter";
import {
  getCampusConnectPosts,
  togglePostLike,
  togglePostSave,
  checkCollegeVerification,
} from "@/lib/actions/campus-connect";
import type { CampusConnectPost, CampusConnectCategory } from "@/types/campus-connect";
import { CAMPUS_CONNECT_CATEGORIES, getCategoryConfig } from "@/types/campus-connect";

// =============================================================================
// FEATURE CAROUSEL DATA
// =============================================================================

interface FeatureSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  bgPattern: string;
}

const featureSlides: FeatureSlide[] = [
  {
    id: "community",
    title: "Your Campus Community",
    subtitle: "Connect & Collaborate",
    description: "Join thousands of students sharing knowledge, opportunities, and experiences",
    icon: Users,
    gradient: "from-blue-500 via-indigo-500 to-purple-600",
    bgPattern: "radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
  },
  {
    id: "opportunities",
    title: "Find Opportunities",
    subtitle: "Jobs & Internships",
    description: "Discover internships, part-time jobs, and career opportunities from your campus network",
    icon: Briefcase,
    gradient: "from-purple-500 via-violet-500 to-fuchsia-600",
    bgPattern: "radial-gradient(circle at 30% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(192, 38, 211, 0.15) 0%, transparent 50%)",
  },
  {
    id: "housing",
    title: "Find Your Space",
    subtitle: "Housing & Roommates",
    description: "Discover PGs, flats, and hostels near your campus with verified listings",
    icon: Home,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    bgPattern: "radial-gradient(circle at 25% 75%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)",
  },
  {
    id: "events",
    title: "Campus Events",
    subtitle: "Never Miss Out",
    description: "Stay updated with fests, workshops, seminars, and social events happening around you",
    icon: Calendar,
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    bgPattern: "radial-gradient(circle at 20% 60%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
  },
  {
    id: "marketplace",
    title: "Campus Marketplace",
    subtitle: "Buy & Sell",
    description: "Trade textbooks, electronics, and more with fellow students safely",
    icon: ShoppingBag,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgPattern: "radial-gradient(circle at 30% 60%, rgba(245, 158, 11, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 40%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)",
  },
];

// =============================================================================
// FEATURED CATEGORIES (shown in hero section)
// =============================================================================

interface CategoryCardConfig {
  id: CampusConnectCategory;
  label: string;
  icon: React.ElementType;
  gradient: string;
  description: string;
}

const featuredCategories: CategoryCardConfig[] = [
  { id: "questions", label: "Questions", icon: HelpCircle, gradient: "from-blue-400 to-cyan-500", description: "Ask doubts" },
  { id: "housing", label: "Housing", icon: Home, gradient: "from-emerald-400 to-teal-500", description: "Find PGs" },
  { id: "opportunities", label: "Opportunities", icon: Briefcase, gradient: "from-purple-400 to-violet-500", description: "Jobs & internships" },
  { id: "events", label: "Events", icon: Calendar, gradient: "from-cyan-400 to-blue-500", description: "Campus events" },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, gradient: "from-amber-400 to-orange-500", description: "Buy & sell" },
  { id: "resources", label: "Resources", icon: BookOpen, gradient: "from-pink-400 to-rose-500", description: "Study materials" },
];

// All categories for tabs
const allCategories: CategoryCardConfig[] = [
  { id: "questions", label: "Questions", icon: HelpCircle, gradient: "from-blue-400 to-cyan-500", description: "Academic Q&A" },
  { id: "housing", label: "Housing", icon: Home, gradient: "from-emerald-400 to-teal-500", description: "PG & flats" },
  { id: "opportunities", label: "Opportunities", icon: Briefcase, gradient: "from-purple-400 to-violet-500", description: "Jobs" },
  { id: "events", label: "Events", icon: Calendar, gradient: "from-cyan-400 to-blue-500", description: "Events" },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag, gradient: "from-amber-400 to-orange-500", description: "Buy/Sell" },
  { id: "resources", label: "Resources", icon: BookOpen, gradient: "from-pink-400 to-rose-500", description: "Study tips" },
  { id: "lost_found", label: "Lost & Found", icon: SearchIcon, gradient: "from-red-400 to-rose-500", description: "Lost items" },
  { id: "rides", label: "Rides", icon: Car, gradient: "from-indigo-400 to-blue-500", description: "Carpool" },
  { id: "study_groups", label: "Study Groups", icon: Users, gradient: "from-violet-400 to-purple-500", description: "Study teams" },
  { id: "clubs", label: "Clubs", icon: Trophy, gradient: "from-yellow-400 to-amber-500", description: "Societies" },
  { id: "announcements", label: "Announcements", icon: Megaphone, gradient: "from-slate-400 to-gray-500", description: "Official" },
  { id: "discussions", label: "Discussions", icon: MessageSquare, gradient: "from-teal-400 to-emerald-500", description: "General" },
];

/**
 * Get greeting based on time
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

// =============================================================================
// FEATURE CAROUSEL COMPONENT
// =============================================================================

function FeatureCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % featureSlides.length);
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000);
  };

  const goToPrev = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + featureSlides.length) % featureSlides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % featureSlides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 6000);
  };

  const slide = featureSlides[currentSlide];
  const SlideIcon = slide.icon;

  // Slide animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-[24px] lg:rounded-[32px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background gradient transition */}
      <motion.div
        key={slide.id + "-bg"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          slide.gradient
        )}
      />

      {/* Main Carousel Container */}
      <div className="relative p-6 md:p-8 lg:p-10 min-h-[220px] md:min-h-[260px] lg:min-h-[280px]">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

        {/* Animated Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.3 },
            }}
            className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 h-full"
          >
            {/* Text Content */}
            <div className="flex-1 max-w-xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex items-center gap-3 mb-3"
              >
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <SlideIcon className="h-6 w-6 md:h-7 md:w-7 text-white" strokeWidth={1.5} />
                </div>
                <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium text-white/90">
                  {slide.subtitle}
                </span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight"
              >
                {slide.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-sm md:text-base text-white/80 leading-relaxed max-w-md"
              >
                {slide.description}
              </motion.p>
            </div>

            {/* Right Side - Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="hidden lg:flex items-center gap-4"
            >
              <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                <span className="text-3xl font-bold text-white">10K+</span>
                <span className="text-xs text-white/70">Students</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                <span className="text-3xl font-bold text-white">500+</span>
                <span className="text-xs text-white/70">Colleges</span>
              </div>
              <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-sm">
                <span className="text-3xl font-bold text-white">50K+</span>
                <span className="text-xs text-white/70">Posts</span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots Navigation with animation */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {featureSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative h-2 rounded-full overflow-hidden"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div className={cn(
                "h-full rounded-full transition-all duration-300",
                index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
              )} />
              {/* Progress bar for current slide */}
              {index === currentSlide && !isPaused && (
                <motion.div
                  className="absolute inset-0 bg-white/30 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 4, ease: "linear" }}
                  key={currentSlide}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export function CampusConnectPage() {
  const { user } = useUserStore();

  // State
  const [posts, setPosts] = useState<CampusConnectPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CampusConnectCategory | "all">("all");
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
  const [myCollegeOnly, setMyCollegeOnly] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const POSTS_PER_PAGE = 20;

  // User's first name
  const firstName = useMemo(() => {
    if (!user) return "there";
    const fullName = user.fullName || user.full_name || user.email?.split("@")[0] || "";
    return fullName.split(" ")[0] || "there";
  }, [user]);

  // Check verification status
  useEffect(() => {
    async function checkVerification() {
      if (user) {
        const { isVerified: verified } = await checkCollegeVerification();
        setIsVerified(verified);
      }
    }
    checkVerification();
  }, [user]);

  // Fetch posts
  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setPage(0);
      }
      setError(null);

      const currentPage = reset ? 0 : page;
      const { data, total, error: fetchError } = await getCampusConnectPosts({
        category: selectedCategory,
        universityId: myCollegeOnly ? undefined : selectedUniversityId,
        search: searchQuery || undefined,
        sortBy: "recent",
        limit: POSTS_PER_PAGE,
        offset: currentPage * POSTS_PER_PAGE,
      });

      if (fetchError) {
        setError(fetchError);
        toast.error(fetchError);
        return;
      }

      if (reset) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }

      setHasMore(data.length === POSTS_PER_PAGE && (currentPage + 1) * POSTS_PER_PAGE < total);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load posts";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedUniversityId, searchQuery, myCollegeOnly, page]);

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    fetchPosts(true);
  }, [selectedCategory, selectedUniversityId, myCollegeOnly]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchPosts(true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load more
  const handleLoadMore = useCallback(() => {
    setPage(prev => prev + 1);
    fetchPosts(false);
  }, [fetchPosts]);

  // Handle like
  const handleLike = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    // Optimistic update
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
            }
          : post
      )
    );

    const { success, error } = await togglePostLike(postId);

    if (!success || error) {
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );
      toast.error(error || "Failed to update like");
    }
  };

  // Handle save
  const handleSave = async (postId: string) => {
    if (!user) {
      toast.error("Please sign in to save posts");
      return;
    }

    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isSaved: !post.isSaved }
          : post
      )
    );

    const { success, isSaved, error } = await togglePostSave(postId);

    if (!success || error) {
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, isSaved: !post.isSaved }
            : post
        )
      );
      toast.error(error || "Failed to update save");
    } else {
      toast.success(isSaved ? "Post saved" : "Post unsaved");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedUniversityId(null);
    setMyCollegeOnly(false);
    setFilterSheetOpen(false);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedUniversityId || myCollegeOnly;
  const showLoading = isLoading && posts.length === 0;

  // Stats
  const stats = useMemo(() => {
    return {
      total: posts.length,
      trending: posts.filter(p => p.likeCount > 10).length,
    };
  }, [posts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-gradient-to-br from-violet-400/10 to-fuchsia-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 overflow-y-auto min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* FEATURE CAROUSEL */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-8 group">
            <FeatureCarousel />
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* QUICK ACTIONS BAR */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start lg:items-center justify-between mb-8">
            {/* Left - Greeting & Create Button */}
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-semibold text-foreground">
                  Good {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">{firstName}</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isVerified ? "Share something with your campus" : "Explore what's happening on campus"}
                </p>
              </div>
            </div>

            {/* Right - Create Post / Verify CTA */}
            {isVerified ? (
              <Link
                href="/campus-connect/create"
                className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
              >
                <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <span>Create Post</span>
                <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/verify-college"
                className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all"
              >
                <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span>Verify College</span>
                <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* FEATURED CATEGORIES - Wrapping Grid */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-medium text-foreground">Quick Access</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {featuredCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;

                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isActive ? "all" : cat.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r border-transparent text-white shadow-lg"
                        : "bg-white/80 dark:bg-white/5 backdrop-blur-sm border-border/50 hover:border-border hover:bg-white dark:hover:bg-white/10"
                    )}
                    style={isActive ? { backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` } : undefined}
                  >
                    <div className={cn(
                      "h-9 w-9 rounded-xl flex items-center justify-center",
                      isActive
                        ? "bg-white/20"
                        : `bg-gradient-to-br ${cat.gradient}`
                    )}>
                      <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-white")} strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <p className={cn("text-sm font-medium", isActive ? "text-white" : "text-foreground")}>{cat.label}</p>
                      <p className={cn("text-[11px]", isActive ? "text-white/70" : "text-muted-foreground")}>{cat.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SEARCH + FILTERS */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            {/* Search */}
            <div className="relative w-full sm:w-auto flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts, questions, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 text-sm bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-border/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              <CollegeFilterCompact
                selectedUniversityId={selectedUniversityId}
                onUniversityChange={setSelectedUniversityId}
              />
              <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                <SheetTrigger asChild>
                  <button className="relative h-12 w-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-border/50 hover:bg-white dark:hover:bg-white/10 transition-all">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    {hasActiveFilters && (
                      <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-3xl">
                  <SheetHeader className="pb-4">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">My College Only</Label>
                        <p className="text-xs text-muted-foreground">
                          Show posts from your university
                        </p>
                      </div>
                      <Switch
                        checked={myCollegeOnly}
                        onCheckedChange={setMyCollegeOnly}
                        disabled={!user}
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={clearFilters}>
                        Clear All
                      </Button>
                      <Button className="flex-1 h-12 rounded-xl" onClick={() => setFilterSheetOpen(false)}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ALL CATEGORY TABS - Wrapping Pills */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {/* All Tab */}
              <motion.button
                onClick={() => setSelectedCategory("all")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200",
                  selectedCategory === "all"
                    ? "bg-foreground text-background shadow-lg"
                    : "bg-white/80 dark:bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-white/10 border border-border/50"
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span>All</span>
              </motion.button>

              {allCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const Icon = cat.icon;

                return (
                  <motion.button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full transition-all duration-200",
                      isActive
                        ? "bg-foreground text-background shadow-lg"
                        : "bg-white/80 dark:bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-white/10 border border-border/50"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{cat.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1 text-xs rounded-full px-3 py-1">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery("")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="gap-1 text-xs capitalize rounded-full px-3 py-1">
                  {selectedCategory.replace("_", " ")}
                  <button onClick={() => setSelectedCategory("all")}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {myCollegeOnly && (
                <Badge variant="secondary" className="gap-1 text-xs rounded-full px-3 py-1">
                  My College
                  <button onClick={() => setMyCollegeOnly(false)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* MAIN CONTENT */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          {/* Error State */}
          {error && (
            <div className="flex items-start gap-3 p-5 rounded-2xl bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border border-red-200 dark:border-red-800 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchPosts(true)}
                  className="mt-2 h-8 text-xs gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          <AnimatePresence mode="wait">
            {showLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative mb-5">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl pointer-events-none animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground">Loading posts...</p>
              </motion.div>
            ) : posts.length === 0 ? (
              /* Empty State */
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <EmptyState
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  isVerified={isVerified}
                  onClearFilters={clearFilters}
                />
              </motion.div>
            ) : (
              /* Posts Grid */
              <motion.div
                key={`posts-${selectedCategory}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 pb-8"
              >
                <p className="text-xs text-muted-foreground text-center">
                  Showing {posts.length} {posts.length === 1 ? "post" : "posts"}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
                <CampusConnectMasonryGrid
                  posts={posts}
                  onLike={handleLike}
                  onSave={handleSave}
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                  isLoading={isLoading && posts.length > 0}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Create Button - Mobile */}
          {isVerified && (
            <div className="fixed bottom-24 right-6 lg:hidden z-30">
              <Button
                asChild
                size="lg"
                className="h-14 w-14 rounded-full shadow-xl shadow-blue-500/30 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-2xl hover:scale-105 transition-all"
              >
                <Link href="/campus-connect/create">
                  <Plus className="h-6 w-6" />
                  <span className="sr-only">Create Post</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptyState({
  searchQuery,
  selectedCategory,
  isVerified,
  onClearFilters,
}: {
  searchQuery: string;
  selectedCategory: CampusConnectCategory | "all";
  isVerified: boolean;
  onClearFilters: () => void;
}) {
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-border/50 flex items-center justify-center mb-5 shadow-lg">
          <Search className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No results found</h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          No posts match &quot;{searchQuery}&quot;
        </p>
        <Button variant="outline" className="rounded-xl h-11 px-6" onClick={onClearFilters}>
          Clear Search
        </Button>
      </div>
    );
  }

  const categoryConfig = allCategories.find(c => c.id === selectedCategory);
  const Icon = categoryConfig?.icon || Users;
  const gradient = categoryConfig?.gradient || "from-blue-500 to-purple-600";

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-5">
        <div className={cn("h-16 w-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg", gradient)}>
          <Icon className="h-7 w-7 text-white" />
        </div>
        <div className="absolute -inset-4 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl pointer-events-none" />
      </div>
      <h3 className="text-xl font-semibold mb-2">
        {selectedCategory !== "all" ? `No ${selectedCategory.replace("_", " ")} yet` : "No posts yet"}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Be the first to share something with your campus community!
      </p>
      {isVerified ? (
        <Button asChild className="gap-2 rounded-xl h-11 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <Link href="/campus-connect/create">
            <Plus className="h-4 w-4" />
            Create Post
          </Link>
        </Button>
      ) : (
        <Button asChild variant="outline" className="gap-2 rounded-xl h-11 px-6">
          <Link href="/verify-college">
            <GraduationCap className="h-4 w-4" />
            Verify College to Post
          </Link>
        </Button>
      )}
    </div>
  );
}

export default CampusConnectPage;
