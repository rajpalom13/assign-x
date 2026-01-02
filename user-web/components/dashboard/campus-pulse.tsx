"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, TrendingUp, Loader2, Package, Home, Briefcase, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { getMarketplaceListings, type ListingType } from "@/lib/actions/marketplace";

/**
 * Campus Pulse item interface
 */
interface PulseItem {
  id: string;
  title: string;
  price?: number;
  distance?: string;
  category: "product" | "housing" | "opportunity" | "community";
  imageUrl?: string;
  isHot?: boolean;
}

/**
 * Map database listing_type to display category
 */
function mapListingTypeToCategory(listingType: ListingType): PulseItem["category"] {
  switch (listingType) {
    case "sell":
    case "rent":
    case "free":
      return "product";
    case "housing":
      return "housing";
    case "opportunity":
      return "opportunity";
    default:
      return "community";
  }
}

/**
 * Category colors and icons
 */
const categoryConfig = {
  product: { color: "bg-blue-100 text-blue-700", label: "For Sale" },
  housing: { color: "bg-green-100 text-green-700", label: "Housing" },
  opportunity: { color: "bg-purple-100 text-purple-700", label: "Opportunity" },
  community: { color: "bg-orange-100 text-orange-700", label: "Community" },
};

/**
 * Campus Pulse Section
 * Shows trending items at user's university with horizontal scroll
 * Implements U17 and U21 from feature spec
 */
export function CampusPulse() {
  const { user } = useUserStore();
  const [items, setItems] = useState<PulseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get university name from user profile
  const universityName = user?.students?.university?.name || "Your Campus";

  useEffect(() => {
    const fetchPulseItems = async () => {
      try {
        // Fetch trending listings from marketplace (most recent, limited to 6)
        const { listings, error } = await getMarketplaceListings({
          limit: 6,
          sortBy: "recent",
        });

        if (error || !listings) {
          setItems([]);
          return;
        }

        // Convert listings to PulseItem format
        const pulseItems: PulseItem[] = listings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          price: listing.price || undefined,
          category: mapListingTypeToCategory(listing.listing_type as ListingType),
          imageUrl: listing.images?.[0] || undefined,
          isHot: listing.favorites_count > 5, // Mark as hot if has many favorites
        }));

        setItems(pulseItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPulseItems();
  }, []);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Campus Pulse</h2>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Campus Pulse</h2>
            <p className="text-xs text-muted-foreground">
              Trending at {universityName}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/connect" className="flex items-center gap-1">
            See all
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Horizontal scroll container */}
      <div className="relative -mx-4 px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {items.map((item) => (
            <PulseCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Individual pulse item card
 */
function PulseCard({ item }: { item: PulseItem }) {
  const config = categoryConfig[item.category];

  return (
    <Link href={`/connect?item=${item.id}`}>
      <Card className="group relative min-w-[160px] max-w-[160px] cursor-pointer overflow-hidden transition-all hover:shadow-md">
        {/* Image placeholder / gradient background */}
        <div
          className={cn(
            "flex h-24 items-center justify-center",
            item.imageUrl
              ? "bg-muted"
              : item.category === "product"
              ? "bg-gradient-to-br from-blue-50 to-blue-100"
              : item.category === "housing"
              ? "bg-gradient-to-br from-green-50 to-green-100"
              : item.category === "opportunity"
              ? "bg-gradient-to-br from-purple-50 to-purple-100"
              : "bg-gradient-to-br from-orange-50 to-orange-100"
          )}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="opacity-50">
              {item.category === "product" ? (
                <Package className="h-10 w-10 text-blue-500" />
              ) : item.category === "housing" ? (
                <Home className="h-10 w-10 text-green-500" />
              ) : item.category === "opportunity" ? (
                <Briefcase className="h-10 w-10 text-purple-500" />
              ) : (
                <Users className="h-10 w-10 text-orange-500" />
              )}
            </div>
          )}
        </div>

        {/* Hot badge */}
        {item.isHot && (
          <Badge className="absolute right-2 top-2 bg-red-500 text-[10px] text-white">
            Hot
          </Badge>
        )}

        {/* Content */}
        <div className="p-3 space-y-1">
          <p className="line-clamp-2 text-sm font-medium leading-tight">
            {item.title}
          </p>

          <div className="flex items-center justify-between">
            {item.price !== undefined && (
              <span className="text-sm font-bold text-primary">
                ₹{item.price}
              </span>
            )}

            {item.distance && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {item.distance}
              </span>
            )}
          </div>

          <Badge
            variant="secondary"
            className={cn("text-[10px] px-1.5 py-0", config.color)}
          >
            {config.label}
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
