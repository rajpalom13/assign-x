"use client";

/**
 * @fileoverview Premium Campus Connect Page with SAAS-style Design
 *
 * Features:
 * - Three main tabs: Marketplace, Tutors, Q&A
 * - Open Peeps illustrations for empty states
 * - Glassmorphism cards with blur
 * - Stats overview header
 * - Premium category tabs
 * - Smooth animations
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Package,
  Home,
  Briefcase,
  Users,
  Loader2,
  X,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  Heart,
  Eye,
  MessageCircle,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  MapPin,
  Star,
  BadgeCheck,
  HelpCircle,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import { MasonryGrid, type ListingDisplay } from "@/components/marketplace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  getMarketplaceListings,
  toggleMarketplaceFavorite,
} from "@/lib/actions/marketplace";
import type { AnyListing, ListingType, MarketplaceCategory } from "@/types/marketplace";
import type { Tutor, Question } from "@/types/connect";
import { featuredTutors, questions } from "@/lib/data/connect";
import { BookSessionSheet } from "@/components/connect/book-session-sheet";
import { TutorProfileSheet } from "@/components/connect/tutor-profile-sheet";
import { AskQuestionSheet } from "@/components/connect/ask-question-sheet";
import "./connect.css";

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
// Type Maps
// ============================================================================

const listingTypeToDbType: Record<ListingType, string> = {
  product: "sell",
  housing: "housing",
  opportunity: "opportunity",
  community: "community_post",
};

type MainTab = "marketplace" | "tutors" | "qa";
type CategoryTab = "all" | "product" | "housing" | "opportunity" | "community";

const categoryTabToMarketplace: Record<CategoryTab, MarketplaceCategory> = {
  all: "all",
  product: "products",
  housing: "housing",
  opportunity: "opportunities",
  community: "community",
};

// ============================================================================
// Category Configuration
// ============================================================================

interface CategoryConfig {
  id: CategoryTab;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
}

const categories: CategoryConfig[] = [
  {
    id: "all",
    label: "All",
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/20",
    description: "Everything",
  },
  {
    id: "product",
    label: "Products",
    icon: Package,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Buy & sell items",
  },
  {
    id: "housing",
    label: "Housing",
    icon: Home,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    description: "Find roommates",
  },
  {
    id: "opportunity",
    label: "Opportunities",
    icon: Briefcase,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    description: "Jobs & internships",
  },
  {
    id: "community",
    label: "Community",
    icon: Users,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    description: "Connect & share",
  },
];

// ============================================================================
// Transform Function
// ============================================================================

function transformToListingDisplay(listing: AnyListing): ListingDisplay {
  const dbListingType = listingTypeToDbType[listing.type];

  let price: number | undefined;
  if (listing.type === "product") {
    price = listing.price;
  } else if (listing.type === "housing") {
    price = listing.monthlyRent;
  } else if (listing.type === "opportunity") {
    price = listing.stipend;
  }

  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price,
    listing_type: dbListingType,
    is_active: true,
    view_count: listing.views,
    created_at: listing.createdAt,
    updated_at: listing.createdAt,
    seller_id: listing.userId,
    seller: {
      id: listing.userId,
      full_name: listing.userName,
      avatar_url: listing.userAvatar || null,
    },
    category: listing.type === "product" && "category" in listing
      ? { id: "", name: listing.category, slug: listing.category.toLowerCase(), is_active: true }
      : undefined,
    is_favorited: listing.isLiked,
    image_url: listing.imageUrl,
  };
}

// ============================================================================
// Animated Counter
// ============================================================================

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
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

  return <span className="tabular-nums">{display.toLocaleString()}{suffix}</span>;
}

// ============================================================================
// Main Component
// ============================================================================

export function ConnectPro() {
  const { user } = useUserStore();

  // Main tab state
  const [mainTab, setMainTab] = useState<MainTab>("marketplace");

  // Marketplace state
  const [allListings, setAllListings] = useState<AnyListing[]>([]);
  const [listings, setListings] = useState<ListingDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [universityOnly, setUniversityOnly] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [total, setTotal] = useState(0);

  // Tutors state
  const [tutors] = useState<Tutor[]>(featuredTutors);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showBookSession, setShowBookSession] = useState(false);
  const [showTutorProfile, setShowTutorProfile] = useState(false);
  const tutorScrollRef = useRef<HTMLDivElement>(null);

  // Q&A state
  const [qaList] = useState<Question[]>(questions);
  const [showAskQuestion, setShowAskQuestion] = useState(false);

  // Stats calculations
  const stats = useMemo(() => {
    return {
      listings: allListings.length || 156,
      tutors: tutors.length || 24,
      questions: qaList.length || 89,
    };
  }, [allListings, tutors, qaList]);

  // Fetch listings
  const fetchListings = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setError(null);

        const filters = {
          category: categoryTabToMarketplace[selectedCategory],
          priceRange: priceRange[0] > 0 || priceRange[1] < 50000
            ? (priceRange as [number, number])
            : undefined,
          universityOnly,
        };

        const { data, error: fetchError } = await getMarketplaceListings(filters);

        if (fetchError) {
          setError(`Failed to load listings: ${fetchError}`);
          toast.error(`Failed to load listings: ${fetchError}`);
          return;
        }

        const fetchedListings = data || [];

        // Apply search filter
        let filtered = fetchedListings;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (l) =>
              l.title?.toLowerCase().includes(query) ||
              l.description?.toLowerCase().includes(query)
          );
        }

        setAllListings(filtered);
        const displayListings = filtered.map(transformToListingDisplay);
        setListings(displayListings);
        setTotal(displayListings.length);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load listings";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategory, searchQuery, priceRange, universityOnly]
  );

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, searchQuery, priceRange, universityOnly]);

  // Handle favorite toggle
  const handleFavorite = async (listingId: string) => {
    if (!user?.id) {
      toast.error("Please sign in to save favorites");
      return;
    }

    const listing = listings.find((l) => l.id === listingId);
    const wasLiked = listing?.is_favorited;

    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, is_favorited: !l.is_favorited } : l
      )
    );

    const { success, isFavorited, error } = await toggleMarketplaceFavorite(listingId);

    if (!success || error) {
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, is_favorited: wasLiked } : l
        )
      );
      toast.error(error || "Failed to update favorite");
      return;
    }

    setAllListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, isLiked: isFavorited } : l
      )
    );

    toast.success(isFavorited ? "Added to favorites" : "Removed from favorites");
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 50000]);
    setUniversityOnly(false);
    setFilterSheetOpen(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000 ||
    universityOnly;

  // Tutor carousel scroll
  const scrollTutors = (direction: "left" | "right") => {
    if (tutorScrollRef.current) {
      const scrollAmount = 320;
      tutorScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Handle tutor actions
  const handleBookSession = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowBookSession(true);
  };

  const handleViewTutor = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowTutorProfile(true);
  };

  return (
    <div className="flex-1 relative overflow-hidden min-h-screen">
      {/* Background */}
      <ConnectBackground />

      <div className="relative max-w-6xl mx-auto p-6 space-y-6">

        {/* HERO HEADER */}
        <div className="connect-hero">
          <div className="connect-hero-mesh" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="hidden md:flex w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 items-center justify-center shrink-0">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  Campus Connect
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Buy, sell, learn, and connect with your campus community
                </p>
              </div>
              <div className="shrink-0">
                <Button asChild className="gap-2 shadow-lg shadow-primary/25 rounded-xl w-full md:w-auto">
                  <Link href="/connect/create">
                    <Plus className="h-4 w-4" />
                    Post Listing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="connect-stats-grid">
          <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="Active Listings" value={stats.listings} color="primary" />
          <StatCard icon={<GraduationCap className="w-5 h-5" />} label="Available Tutors" value={stats.tutors} color="emerald" />
          <StatCard icon={<HelpCircle className="w-5 h-5" />} label="Questions Asked" value={stats.questions} color="amber" />
        </div>

        {/* MAIN TABS */}
        <div className="connect-tabs-container">
          <button onClick={() => setMainTab("marketplace")} className={cn("connect-tab", mainTab === "marketplace" && "connect-tab-active")}>
            <ShoppingBag className="w-4 h-4" />
            Marketplace
          </button>
          <button onClick={() => setMainTab("tutors")} className={cn("connect-tab", mainTab === "tutors" && "connect-tab-active")}>
            <GraduationCap className="w-4 h-4" />
            Tutors
          </button>
          <button onClick={() => setMainTab("qa")} className={cn("connect-tab", mainTab === "qa" && "connect-tab-active")}>
            <HelpCircle className="w-4 h-4" />
            Q&A
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="connect-tab-content">
          {/* MARKETPLACE TAB */}
          {mainTab === "marketplace" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Search + Filter Bar */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products, housing, opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 shadow-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 relative">
                      <SlidersHorizontal className="h-4 w-4" />
                      {hasActiveFilters && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-gray-800" />}
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">My Campus Only</Label>
                          <p className="text-sm text-gray-500">Show listings from your university</p>
                        </div>
                        <Switch checked={universityOnly} onCheckedChange={setUniversityOnly} />
                      </div>
                      <div className="space-y-4">
                        <Label>Price Range</Label>
                        <Slider value={priceRange} onValueChange={(value) => setPriceRange(value as [number, number])} min={0} max={50000} step={100} />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{priceRange[0].toLocaleString()}</span>
                          <span>{priceRange[1].toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button variant="outline" className="flex-1 rounded-xl" onClick={clearFilters}>Clear All</Button>
                        <Button className="flex-1 rounded-xl" onClick={() => setFilterSheetOpen(false)}>Apply</Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const Icon = cat.icon;
                  return (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={cn("connect-category-tab", isActive && "connect-category-tab-active")}>
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", cat.bgColor)}>
                        <Icon className={cn("w-3.5 h-3.5", cat.color)} />
                      </div>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
                <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 shrink-0 self-center" />
                <button onClick={() => setUniversityOnly(!universityOnly)} className={cn("connect-category-tab", universityOnly && "connect-category-tab-active bg-primary text-white")}>
                  <GraduationCap className="w-4 h-4" />
                  <span>{universityOnly ? "My Campus" : "All Campuses"}</span>
                </button>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">Filters:</span>
                  {searchQuery && <Badge variant="secondary" className="gap-1 rounded-lg bg-white/80 dark:bg-gray-800/80">&quot;{searchQuery}&quot;<button onClick={() => setSearchQuery("")}><X className="h-3 w-3" /></button></Badge>}
                  {selectedCategory !== "all" && <Badge variant="secondary" className="gap-1 rounded-lg bg-white/80 dark:bg-gray-800/80">{categories.find((c) => c.id === selectedCategory)?.label}<button onClick={() => setSelectedCategory("all")}><X className="h-3 w-3" /></button></Badge>}
                  {(priceRange[0] > 0 || priceRange[1] < 50000) && <Badge variant="secondary" className="gap-1 rounded-lg bg-white/80 dark:bg-gray-800/80">{priceRange[0]} - {priceRange[1]}<button onClick={() => setPriceRange([0, 50000])}><X className="h-3 w-3" /></button></Badge>}
                  {universityOnly && <Badge variant="secondary" className="gap-1 rounded-lg bg-white/80 dark:bg-gray-800/80">My Campus<button onClick={() => setUniversityOnly(false)}><X className="h-3 w-3" /></button></Badge>}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                      <Button variant="outline" size="sm" onClick={() => fetchListings()} className="mt-2 gap-2 rounded-xl">
                        <RefreshCw className="h-3 w-3" />Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Listings Grid */}
              {isLoading && listings.length === 0 ? (
                <LoadingSkeleton />
              ) : listings.length === 0 ? (
                <MarketplaceEmptyState category={selectedCategory} searchQuery={searchQuery} onClear={clearFilters} />
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {listings.length} {listings.length === 1 ? "listing" : "listings"}
                    {searchQuery && ` matching "${searchQuery}"`}
                  </p>
                  <MasonryGrid listings={listings} onFavorite={handleFavorite} isLoading={isLoading} />
                </div>
              )}
            </div>
          )}

          {/* TUTORS TAB */}
          {mainTab === "tutors" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Featured Tutors</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Connect with verified tutors from your campus</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => scrollTutors("left")} className="rounded-xl h-10 w-10"><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => scrollTutors("right")} className="rounded-xl h-10 w-10"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
              {tutors.length > 0 ? (
                <div ref={tutorScrollRef} className="connect-tutor-carousel">
                  {tutors.map((tutor) => (
                    <TutorCard key={tutor.id} tutor={tutor} onBook={() => handleBookSession(tutor)} onView={() => handleViewTutor(tutor)} />
                  ))}
                </div>
              ) : (
                <EmptyState icon={<GraduationCap className="w-8 h-8" />} title="No tutors available" description="Check back soon for verified tutors from your campus" />
              )}
            </div>
          )}

          {/* Q&A TAB */}
          {mainTab === "qa" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Community Q&A</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ask questions and help fellow students</p>
                </div>
                <Button onClick={() => setShowAskQuestion(true)} className="gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />Ask Question
                </Button>
              </div>
              {qaList.length > 0 ? (
                <div className="connect-qa-grid">
                  {qaList.map((question) => <QuestionCard key={question.id} question={question} />)}
                </div>
              ) : (
                <EmptyState icon={<HelpCircle className="w-8 h-8" />} title="No questions yet" description="Be the first to ask a question!" action={<Button onClick={() => setShowAskQuestion(true)} className="rounded-xl">Ask Question</Button>} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sheets */}
      {selectedTutor && (
        <>
          <BookSessionSheet open={showBookSession} onOpenChange={setShowBookSession} tutor={selectedTutor} />
          <TutorProfileSheet open={showTutorProfile} onOpenChange={setShowTutorProfile} tutor={selectedTutor} onBook={() => { setShowTutorProfile(false); setShowBookSession(true); }} />
        </>
      )}
      <AskQuestionSheet open={showAskQuestion} onOpenChange={setShowAskQuestion} />
    </div>
  );
}

// ============================================================================
// Sub Components
// ============================================================================

function ConnectBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAF9F7] via-[#F5F2ED] to-[#EDF1E8] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
      <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-bl from-accent/[0.18] via-accent/[0.10] to-transparent rounded-full blur-[80px]" />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-primary/[0.15] via-primary/[0.08] to-transparent rounded-full blur-[60px]" />
      <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-gradient-to-r from-emerald-400/[0.08] to-blue-400/[0.05] rounded-full blur-[80px]" />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: "primary" | "emerald" | "amber" }) {
  const colorClasses = {
    primary: "from-primary/10 to-primary/5 text-primary",
    emerald: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    amber: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="connect-stat-card">
      <div className={cn("connect-stat-icon", `bg-gradient-to-br ${colorClasses[color]}`)}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white"><AnimatedCounter value={value} /></p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function TutorCard({ tutor, onBook, onView }: { tutor: Tutor; onBook: () => void; onView: () => void }) {
  return (
    <div className="connect-tutor-card" onClick={onView}>
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 ring-2 ring-white dark:ring-gray-800 shadow-md">
          <AvatarImage src={tutor.avatar} alt={tutor.name} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-medium">
            {tutor.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{tutor.name}</h3>
            {tutor.verified && <BadgeCheck className="h-4 w-4 text-primary shrink-0" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{tutor.subjects.slice(0, 2).join(", ")}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{tutor.rating}</span>
            </div>
            <span className="text-xs text-gray-400">{tutor.completedSessions} sessions</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
        <p className="text-lg font-bold text-gray-900 dark:text-white">{tutor.hourlyRate}/hr</p>
        <Button size="sm" className="rounded-xl gap-1" onClick={(e) => { e.stopPropagation(); onBook(); }}>
          Book<ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function QuestionCard({ question }: { question: Question }) {
  return (
    <div className="connect-question-card">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={question.author?.avatar} alt={question.author.name} />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-sm">
            {question.author.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">{question.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{question.content}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 flex-wrap">
          {question.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full text-xs bg-gray-100 dark:bg-gray-800">
              <Tag className="h-3 w-3 mr-1" />{tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{question.answerCount}</span>
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded-2xl bg-white/60 dark:bg-gray-800/60" />
          <Skeleton className="h-4 w-3/4 rounded-lg bg-white/60 dark:bg-gray-800/60" />
          <Skeleton className="h-4 w-1/2 rounded-lg bg-white/60 dark:bg-gray-800/60" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="connect-empty-state">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

function MarketplaceEmptyState({ category, searchQuery, onClear }: { category: CategoryTab; searchQuery: string; onClear: () => void }) {
  const categoryConfig = categories.find((c) => c.id === category);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const peepConfigs: Record<CategoryTab, { body: any; face: any; hair: any }> = {
    all: { body: "Explaining", face: "Smile", hair: "MediumBangs" },
    product: { body: "PointingUp", face: "Cute", hair: "ShortCurly" },
    housing: { body: "Coffee", face: "Calm", hair: "Bun" },
    opportunity: { body: "Device", face: "Driven", hair: "MediumBangs" },
    community: { body: "Shirt", face: "Smile", hair: "Afro" },
  };
  const peepConfig = peepConfigs[category];

  if (searchQuery) {
    return (
      <div className="connect-empty-state">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Search className="w-7 h-7 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">No listings match &quot;{searchQuery}&quot;. Try a different search term.</p>
        <Button variant="outline" onClick={onClear} className="rounded-xl">Clear Search</Button>
      </div>
    );
  }

  return (
    <div className="connect-empty-state relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
      <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      <div className="relative w-32 h-28 mx-auto mb-6">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2.5 bg-black/[0.06] dark:bg-black/15 rounded-[100%] blur-sm" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-10 rounded-2xl bg-gradient-to-br from-accent/12 via-primary/8 to-accent/5 dark:from-accent/20 dark:via-primary/12 dark:to-accent/8" />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[130px] h-[150px] drop-shadow-sm">
          <Peep style={{ width: "100%", height: "100%" }} accessory="None" body={peepConfig.body} face={peepConfig.face} hair={peepConfig.hair} strokeColor="#A9714B" viewBox={{ x: "0", y: "50", width: "900", height: "1000" }} />
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No {category === "all" ? "" : categoryConfig?.label.toLowerCase() + " "}listings yet
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {category === "all" && "Be the first to post something for your campus community!"}
        {category === "product" && "List items you want to sell to fellow students."}
        {category === "housing" && "Post housing listings or find roommates."}
        {category === "opportunity" && "Share job openings, internships, or gigs."}
        {category === "community" && "Start a discussion or share something with your campus."}
      </p>
      <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
        <Link href="/connect/create"><Plus className="w-4 h-4 mr-2" />Create Listing</Link>
      </Button>
    </div>
  );
}
