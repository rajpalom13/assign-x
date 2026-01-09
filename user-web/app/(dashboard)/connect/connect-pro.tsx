"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Package,
  Home,
  Briefcase,
  Users,
  X,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Star,
  BadgeCheck,
  HelpCircle,
  Clock,
  ArrowRight,
  Tag,
  MessageCircle,
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
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
import { BookSessionSheet } from "@/components/connect/book-session-sheet";
import { TutorProfileSheet } from "@/components/connect/tutor-profile-sheet";
import { AskQuestionSheet } from "@/components/connect/ask-question-sheet";
import { QuestionDetailSheet } from "@/components/connect/question-detail-sheet";

// Type Maps
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

// Category Configuration
interface CategoryConfig {
  id: CategoryTab;
  label: string;
  icon: React.ElementType;
}

const categories: CategoryConfig[] = [
  { id: "all", label: "All", icon: ShoppingBag },
  { id: "product", label: "Products", icon: Package },
  { id: "housing", label: "Housing", icon: Home },
  { id: "opportunity", label: "Opportunities", icon: Briefcase },
  { id: "community", label: "Community", icon: Users },
];

// Transform Function
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

/**
 * Campus Connect - Minimalist Design
 */
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

  // Tutors state
  const [tutors] = useState<Tutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showBookSession, setShowBookSession] = useState(false);
  const [showTutorProfile, setShowTutorProfile] = useState(false);
  const tutorScrollRef = useRef<HTMLDivElement>(null);

  // Q&A state
  const [qaList] = useState<Question[]>([]);
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showQuestionDetail, setShowQuestionDetail] = useState(false);

  // Stats calculations
  const stats = useMemo(() => ({
    listings: allListings.length,
    tutors: tutors.length,
    questions: qaList.length,
  }), [allListings, tutors, qaList]);

  // Fetch listings
  const fetchListings = useCallback(async () => {
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load listings";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, priceRange, universityOnly]);

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
    <div className="flex-1 p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campus Connect</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buy, sell, learn, and connect with your campus community
          </p>
        </div>
        <Button asChild>
          <Link href="/connect/create">
            <Plus className="h-4 w-4 mr-2" />
            Post Listing
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <AnimatedCounter value={stats.listings} className="text-2xl font-semibold" />
          <p className="text-xs text-muted-foreground">Active Listings</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <AnimatedCounter value={stats.tutors} className="text-2xl font-semibold" />
          <p className="text-xs text-muted-foreground">Available Tutors</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl border border-border bg-card"
        >
          <AnimatedCounter value={stats.questions} className="text-2xl font-semibold" />
          <p className="text-xs text-muted-foreground">Questions Asked</p>
        </motion.div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit mb-6">
        {[
          { id: "marketplace" as MainTab, label: "Marketplace", icon: ShoppingBag },
          { id: "tutors" as MainTab, label: "Tutors", icon: GraduationCap },
          { id: "qa" as MainTab, label: "Q&A", icon: HelpCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              mainTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* MARKETPLACE TAB */}
        {mainTab === "marketplace" && (
          <div className="space-y-6">
            {/* Search + Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, housing, opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 relative">
                    <SlidersHorizontal className="h-4 w-4" />
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[320px] sm:w-[380px]">
                  <SheetHeader className="pb-4">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">My Campus Only</Label>
                        <p className="text-xs text-muted-foreground">Show listings from your university</p>
                      </div>
                      <Switch checked={universityOnly} onCheckedChange={setUniversityOnly} />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Price Range</Label>
                      <Slider
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        min={0}
                        max={50000}
                        step={100}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>₹{priceRange[0].toLocaleString()}</span>
                        <span>₹{priceRange[1].toLocaleString()}</span>
                      </div>
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

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
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
                  <Badge variant="secondary" className="gap-1 text-xs">
                    {categories.find((c) => c.id === selectedCategory)?.label}
                    <button onClick={() => setSelectedCategory("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    ₹{priceRange[0]} - ₹{priceRange[1]}
                    <button onClick={() => setPriceRange([0, 50000])}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {universityOnly && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    My Campus
                    <button onClick={() => setUniversityOnly(false)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchListings()}
                    className="mt-2 h-8 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {/* Listings Grid */}
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                      <Skeleton className="aspect-[4/3] w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex items-center justify-between pt-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-5 w-12 rounded" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No listings found</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                  {searchQuery
                    ? `No results for "${searchQuery}"`
                    : "Be the first to post something for your campus community!"}
                </p>
                {searchQuery ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Search
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Link href="/connect/create">
                      <Plus className="h-4 w-4 mr-1" />
                      Create Listing
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <p className="text-xs text-muted-foreground">
                  Showing {listings.length} {listings.length === 1 ? "listing" : "listings"}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
                <MasonryGrid listings={listings} onFavorite={handleFavorite} isLoading={isLoading} />
              </motion.div>
            )}
          </div>
        )}

        {/* TUTORS TAB */}
        {mainTab === "tutors" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Featured Tutors</h2>
                <p className="text-sm text-muted-foreground">Connect with verified tutors from your campus</p>
              </div>
            </div>

            {tutors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutors.map((tutor, index) => (
                  <motion.div
                    key={tutor.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="p-4 rounded-xl border border-border bg-card cursor-pointer hover:border-foreground/20 transition-colors"
                    onClick={() => handleViewTutor(tutor)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={tutor.avatar} alt={tutor.name} />
                        <AvatarFallback className="text-sm">
                          {tutor.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium truncate">{tutor.name}</p>
                          {tutor.verified && <BadgeCheck className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {tutor.subjects.slice(0, 2).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-1">
                        <motion.div whileHover={{ scale: 1.2, rotate: 15 }} transition={{ duration: 0.2 }}>
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        </motion.div>
                        <span className="text-sm font-medium">{tutor.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{tutor.completedSessions} sessions</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <p className="font-semibold">{tutor.hourlyRate}/hr</p>
                      <motion.div whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookSession(tutor);
                          }}
                        >
                          Book
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No tutors available</h3>
                <p className="text-sm text-muted-foreground">Check back soon for verified tutors</p>
              </div>
            )}
          </div>
        )}

        {/* Q&A TAB */}
        {mainTab === "qa" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Community Q&A</h2>
                <p className="text-sm text-muted-foreground">Ask questions and help fellow students</p>
              </div>
              <Button onClick={() => setShowAskQuestion(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ask Question
              </Button>
            </div>

            {qaList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {qaList.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className="p-4 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedQuestion(question);
                      setShowQuestionDetail(true);
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={question.author?.avatar} alt={question.author.name} />
                        <AvatarFallback className="text-xs">
                          {question.author.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{question.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{question.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        {question.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs h-5 px-2">
                            <Tag className="h-2.5 w-2.5 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {question.answerCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No questions yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Be the first to ask a question!</p>
                <Button onClick={() => setShowAskQuestion(true)}>Ask Question</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sheets */}
      {selectedTutor && (
        <>
          <BookSessionSheet
            open={showBookSession}
            onOpenChange={setShowBookSession}
            tutor={selectedTutor}
          />
          <TutorProfileSheet
            open={showTutorProfile}
            onOpenChange={setShowTutorProfile}
            tutor={selectedTutor}
            onBook={() => {
              setShowTutorProfile(false);
              setShowBookSession(true);
            }}
          />
        </>
      )}
      <AskQuestionSheet open={showAskQuestion} onOpenChange={setShowAskQuestion} />
      <QuestionDetailSheet
        question={selectedQuestion}
        open={showQuestionDetail}
        onOpenChange={setShowQuestionDetail}
      />
    </div>
  );
}
