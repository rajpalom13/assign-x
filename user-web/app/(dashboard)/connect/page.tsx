"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MasonryGrid, type ListingDisplay } from "@/components/marketplace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  getMarketplaceListings,
  toggleMarketplaceFavorite,
} from "@/lib/actions/marketplace";
import type { AnyListing, ListingType, MarketplaceCategory } from "@/types/marketplace";

/**
 * Map frontend ListingType to database listing_type for display
 */
const listingTypeToDbType: Record<ListingType, string> = {
  product: "sell",
  housing: "housing",
  opportunity: "opportunity",
  community: "community_post",
};

/**
 * Transform AnyListing to ListingDisplay format for MasonryGrid
 */
function transformToListingDisplay(listing: AnyListing): ListingDisplay {
  const dbListingType = listingTypeToDbType[listing.type];

  // Get price based on listing type
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
 * Category type for filtering - maps to MarketplaceCategory
 */
type CategoryTab = "all" | "product" | "housing" | "opportunity" | "community";

/**
 * Map CategoryTab to MarketplaceCategory for API filter
 */
const categoryTabToMarketplace: Record<CategoryTab, MarketplaceCategory> = {
  all: "all",
  product: "products",
  housing: "housing",
  opportunity: "opportunities",
  community: "community",
};

/**
 * Category configuration
 */
const categories: { id: CategoryTab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: null },
  { id: "product", label: "Products", icon: <Package className="h-4 w-4" /> },
  { id: "housing", label: "Housing", icon: <Home className="h-4 w-4" /> },
  { id: "opportunity", label: "Opportunities", icon: <Briefcase className="h-4 w-4" /> },
  { id: "community", label: "Community", icon: <Users className="h-4 w-4" /> },
];

const ITEMS_PER_PAGE = 20;

/**
 * Student Connect / Campus Marketplace page
 * Pinterest-style marketplace with multiple categories
 * Implements U73-U85 from feature spec
 */
export default function ConnectPage() {
  const { user } = useUserStore();

  // State
  const [allListings, setAllListings] = useState<AnyListing[]>([]);
  const [listings, setListings] = useState<ListingDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [universityOnly, setUniversityOnly] = useState(true); // Default to showing university content
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Fetch listings from Supabase
  const fetchListings = useCallback(
    async (reset = false, pageOverride?: number) => {
      try {
        setIsLoading(true);
        setError(null);

        // Build filters for Supabase query
        const filters = {
          category: categoryTabToMarketplace[selectedCategory],
          priceRange: priceRange[0] > 0 || priceRange[1] < 50000
            ? (priceRange as [number, number])
            : undefined,
          universityOnly,
        };

        const { data, error: fetchError } = await getMarketplaceListings(filters);

        if (fetchError) {
          setError("Failed to load marketplace listings. Please try again.");
          toast.error("Failed to load listings");
          return;
        }

        const fetchedListings = data || [];

        // Apply client-side search filter
        let filtered = fetchedListings;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (l) =>
              l.title?.toLowerCase().includes(query) ||
              l.description?.toLowerCase().includes(query)
          );
        }

        // Store all listings for toggling favorites
        setAllListings(filtered);

        // Transform to display format
        const displayListings = filtered.map(transformToListingDisplay);

        if (reset) {
          setListings(displayListings);
          setPage(1);
        } else {
          setListings((prev) => [...prev, ...displayListings]);
        }

        setTotal(displayListings.length);
        setHasMore(false);
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

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    fetchListings(true);
  }, [selectedCategory, searchQuery, priceRange, universityOnly]);

  // Handle favorite toggle using Supabase
  const handleFavorite = async (listingId: string) => {
    if (!user?.id) {
      toast.error("Please sign in to save favorites");
      return;
    }

    // Optimistic update
    const listing = listings.find((l) => l.id === listingId);
    const wasLiked = listing?.is_favorited;

    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, is_favorited: !l.is_favorited } : l
      )
    );

    // Call Supabase to toggle favorite
    const { success, isFavorited, error } = await toggleMarketplaceFavorite(listingId);

    if (!success || error) {
      // Revert on error
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, is_favorited: wasLiked } : l
        )
      );
      toast.error(error || "Failed to update favorite");
      return;
    }

    // Update allListings to keep state in sync
    setAllListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, isLiked: isFavorited } : l
      )
    );

    toast.success(isFavorited ? "Added to favorites" : "Removed from favorites");
  };

  // Handle load more for infinite scroll
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const newPage = page + 1;
      setPage(newPage);
      fetchListings(false, newPage);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 50000]);
    setUniversityOnly(true); // Reset to default (university content)
    setFilterSheetOpen(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000 ||
    !universityOnly;

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Campus Connect</h1>
              <p className="text-sm text-muted-foreground">
                Buy, sell, and connect with your campus community
              </p>
            </div>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/connect/create">
              <Plus className="h-4 w-4 mr-2" />
              Post Listing
            </Link>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, housing, opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <SlidersHorizontal className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
</SheetHeader>
              <div className="mt-6 space-y-6">
                {/* University Filter - U74 */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="university-filter" className="text-base">My University Only</Label>
                    <p className="text-sm text-muted-foreground">
                      Show listings from your campus
                    </p>
                  </div>
                  <Switch
                    id="university-filter"
                    checked={universityOnly}
                    onCheckedChange={setUniversityOnly}
                  />
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <Label>Price Range</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) =>
                      setPriceRange(value as [number, number])
                    }
                    min={0}
                    max={50000}
                    step={100}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>₹{priceRange[0].toLocaleString()}</span>
                    <span>₹{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
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

        {/* Category Tabs & University Toggle - U74, U76 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Category Tabs */}
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "shrink-0",
                selectedCategory === cat.id && "bg-primary text-primary-foreground"
              )}
            >
              {cat.icon}
              <span className={cat.icon ? "ml-1.5" : ""}>{cat.label}</span>
            </Button>
          ))}

          {/* Divider */}
          <div className="h-6 w-px bg-border shrink-0" />

          {/* University Filter Toggle - U74 */}
          <Button
            variant={universityOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setUniversityOnly(!universityOnly)}
            className={cn(
              "shrink-0 gap-1.5",
              universityOnly && "bg-primary text-primary-foreground"
            )}
          >
            <GraduationCap className="h-4 w-4" />
            <span>{universityOnly ? "My Campus" : "All Campuses"}</span>
          </Button>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {categories.find((c) => c.id === selectedCategory)?.label}
                <button onClick={() => setSelectedCategory("all")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 50000) && (
              <Badge variant="secondary" className="gap-1">
                ₹{priceRange[0]} - ₹{priceRange[1]}
                <button onClick={() => setPriceRange([0, 50000])}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {!universityOnly && (
              <Badge variant="secondary" className="gap-1">
                All Campuses
                <button onClick={() => setUniversityOnly(true)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchListings(true)}
                    className="mt-2 gap-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && listings.length === 0 ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Results Count */}
            {total > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {listings.length} of {total} listings
              </p>
            )}

            {/* Listings Grid */}
            {listings.length > 0 ? (
              <>
                <MasonryGrid
                  listings={listings}
                  onFavorite={handleFavorite}
                  isLoading={isLoading}
                />

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      variant="outline"
                      className="gap-2"
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Load More
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <h3 className="text-lg font-medium">No listings found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your filters or search query
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}