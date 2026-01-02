"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Package,
  Home,
  Briefcase,
  Users,
  X,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MasonryGrid } from "@/components/marketplace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";
import {
  getMarketplaceListings,
  toggleFavorite,
  type ListingType,
} from "@/lib/actions/marketplace";
import type { ListingDisplay } from "@/components/marketplace/masonry-grid";

/**
 * Category type for filtering
 */
type CategoryTab = "all" | "item" | "housing" | "opportunity" | "community";

/**
 * Category configuration
 */
const categories: { id: CategoryTab; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All", icon: null },
  { id: "item", label: "Products", icon: <Package className="h-4 w-4" /> },
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
  const [listings, setListings] = useState<ListingDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryTab>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Fetch listings from Supabase
  const fetchListings = useCallback(
    async (reset = false, pageOverride?: number) => {
      try {
        setIsLoading(true);

        const currentPage = reset ? 1 : (pageOverride ?? page);
        const offset = reset ? 0 : (currentPage - 1) * ITEMS_PER_PAGE;

        // Map category tab to listing type
        const categoryFilter: ListingType | "all" =
          selectedCategory === "all" ? "all" : selectedCategory;

        const { listings: fetchedListings, total: fetchedTotal, error } =
          await getMarketplaceListings({
            category: categoryFilter,
            search: searchQuery || undefined,
            limit: ITEMS_PER_PAGE,
            offset,
            priceMin: priceRange[0] > 0 ? priceRange[0] : undefined,
            priceMax: priceRange[1] < 50000 ? priceRange[1] : undefined,
            sortBy: "recent",
          });

        if (error) {
          toast.error("Failed to load listings");
          return;
        }

        // Cast to ListingDisplay type for the MasonryGrid component
        const listingsData = fetchedListings as ListingDisplay[];

        if (reset) {
          setListings(listingsData);
          setPage(1);
        } else {
          setListings((prev) => [...prev, ...listingsData]);
        }

        setTotal(fetchedTotal);
        setHasMore(offset + listingsData.length < fetchedTotal);
      } catch {
        toast.error("Failed to load listings");
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategory, searchQuery, priceRange, page]
  );

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    fetchListings(true);
  }, [selectedCategory, searchQuery, priceRange]);

  // Handle favorite toggle using Supabase
  const handleFavorite = async (listingId: string) => {
    if (!user?.id) {
      toast.error("Please sign in to save favorites");
      return;
    }

    // Optimistic update
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, is_favorited: !l.is_favorited } : l
      )
    );

    const result = await toggleFavorite(listingId);

    if (result.error) {
      // Revert on error
      setListings((prev) =>
        prev.map((l) =>
          l.id === listingId ? { ...l, is_favorited: !l.is_favorited } : l
        )
      );
      toast.error(result.error);
      return;
    }

    toast.success(
      result.isFavorited ? "Added to favorites" : "Removed from favorites"
    );
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
    setFilterSheetOpen(false);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    priceRange[0] > 0 ||
    priceRange[1] < 50000;

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

        {/* Category Tabs - U76: Optional Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "listing" : "listings"} found
          </p>
        )}

        {/* Loading Skeleton */}
        {isLoading && listings.length === 0 && <LoadingSkeleton />}

        {/* Pinterest-style Masonry Grid - U73 */}
        {(!isLoading || listings.length > 0) && (
          <MasonryGrid
            listings={listings}
            onFavorite={handleFavorite}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            isLoading={isLoading}
          />
        )}

        {/* Empty State */}
        {!isLoading && listings.length === 0 && (
          <div className="relative overflow-hidden rounded-xl border border-dashed bg-gradient-to-br from-muted/30 to-muted/10 py-16 text-center">
            {/* Decorative background */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/5" />
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-pink-500/5" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/10">
                <Package className="h-10 w-10 text-orange-500" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {hasActiveFilters ? "No listings found" : "Start the marketplace"}
              </h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                {hasActiveFilters
                  ? "Try adjusting your filters or search terms"
                  : "Be the first to post something! List items, housing, or opportunities."}
              </p>

              {/* Quick categories */}
              {!hasActiveFilters && (
                <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1">
                    <Package className="h-3.5 w-3.5 text-blue-500" />
                    <span>Products</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1">
                    <Home className="h-3.5 w-3.5 text-green-500" />
                    <span>Housing</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1">
                    <Briefcase className="h-3.5 w-3.5 text-purple-500" />
                    <span>Jobs</span>
                  </div>
                </div>
              )}

              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/connect/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Listing
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
