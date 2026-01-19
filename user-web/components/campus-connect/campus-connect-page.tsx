"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  X,
  AlertCircle,
  RefreshCw,
  SlidersHorizontal,
  Users,
} from "lucide-react";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
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
import { useUserStore } from "@/stores/user-store";
import { CampusConnectMasonryGrid } from "./masonry-grid";
import { CategoryFilter } from "./category-filter";
import { CollegeFilterCompact } from "./college-filter";
import {
  getCampusConnectPosts,
  togglePostLike,
  togglePostSave,
  checkCollegeVerification,
} from "@/lib/actions/campus-connect";
import type { CampusConnectPost, CampusConnectCategory } from "@/types/campus-connect";

/**
 * CampusConnectPage - Main page component for Campus Connect
 * Pinterest-inspired community platform with filtering and infinite scroll
 */
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
  const [isClient, setIsClient] = useState(false);
  const [animationData, setAnimationData] = useState<object | null>(null);

  const POSTS_PER_PAGE = 20;

  // Load animation data from local file (use existing animation)
  useEffect(() => {
    setIsClient(true);
    // Use existing computer animation as fallback
    fetch("/lottie/icons/computer.json")
      .then((res) => {
        if (!res.ok) throw new Error("Animation not found");
        return res.json();
      })
      .then((data) => setAnimationData(data))
      .catch(() => {
        // Silently fail - fallback icon will be shown
      });
  }, []);

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

    const { success, isLiked, error } = await togglePostLike(postId);

    if (!success || error) {
      // Revert on error
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

    // Optimistic update
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isSaved: !post.isSaved }
          : post
      )
    );

    const { success, isSaved, error } = await togglePostSave(postId);

    if (!success || error) {
      // Revert on error
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

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedUniversityId ||
    myCollegeOnly;

  // Loading state check
  const showLoading = isLoading && posts.length === 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      {/* Curved Hero Banner with Image */}
      <div className="connect-curved-hero">
        <div className="relative h-52 md:h-64">
          <Image
            src="/gradient.jpg"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          {/* Gradient overlay for smooth transition */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90" />
        </div>
      </div>

      {/* Animated Icon */}
      <div className="relative z-10 -mt-16 md:-mt-20 flex justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          className="relative"
        >
          {/* Animated ring effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl border-2 border-primary/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative w-28 h-28 md:w-36 md:h-36 bg-gradient-to-br from-white via-white to-blue-50 dark:from-card dark:via-card dark:to-blue-950/20 rounded-3xl shadow-xl shadow-black/10 flex items-center justify-center overflow-hidden">
            {isClient && animationData ? (
              <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
                style={{ width: "95%", height: "95%" }}
              />
            ) : (
              <Users className="h-14 w-14 md:h-18 md:w-18 text-primary/60" strokeWidth={1.5} />
            )}
            {/* Decorative dots */}
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{ y: [0, -3, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="h-4 w-4 rounded-full bg-blue-400/70 shadow-sm" />
            </motion.div>
            <motion.div
              className="absolute -bottom-1 -left-2"
              animate={{ y: [0, 3, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="h-3 w-3 rounded-full bg-orange-400/70 shadow-sm" />
            </motion.div>
            <motion.div
              className="absolute top-2 -left-3"
              animate={{ x: [0, -2, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="h-2.5 w-2.5 rounded-full bg-pink-400/60" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Title */}
      <div className="text-center pt-6 pb-4 px-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground/90">
          Campus Connect
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Your college community hub
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-6 md:px-8 pb-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white dark:bg-card border border-border/30 shadow-lg shadow-black/5">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search posts, doubts, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <CollegeFilterCompact
              selectedUniversityId={selectedUniversityId}
              onUniversityChange={setSelectedUniversityId}
            />
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                  {hasActiveFilters && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-xl">
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
                    <Button variant="outline" className="flex-1" onClick={clearFilters}>
                      Clear All
                    </Button>
                    <Button className="flex-1" onClick={() => setFilterSheetOpen(false)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-6 md:px-8 py-4">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 lg:px-10 xl:px-12 pt-2">
        <div className="w-full">
          {/* Active Filters */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 flex-wrap mb-6 justify-center overflow-hidden"
              >
                <span className="text-xs text-muted-foreground">Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="gap-1 text-xs capitalize">
                    {selectedCategory.replace("_", " ")}
                    <button onClick={() => setSelectedCategory("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {myCollegeOnly && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    My College
                    <button onClick={() => setMyCollegeOnly(false)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error State */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mb-6">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchPosts(true)}
                  className="mt-2 h-8 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {showLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-sm text-muted-foreground">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No posts found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : "Be the first to share something with your campus community!"}
              </p>
              {searchQuery ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Search
                </Button>
              ) : isVerified ? (
                <Button asChild size="sm">
                  <Link href="/campus-connect/create">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Post
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : (
            /* Posts Grid */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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

          {/* Floating Create Button */}
          {isVerified && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-30"
            >
              <Button
                asChild
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-transform"
              >
                <Link href="/campus-connect/create">
                  <Plus className="h-6 w-6" />
                  <span className="sr-only">Create Post</span>
                </Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CampusConnectPage;
