"use server";

/**
 * Marketplace data functions using server actions
 * Connects to Supabase marketplace_listings table via server actions
 *
 * NOTE: Mock data exports are kept for backward compatibility during migration.
 * Components should migrate to using the async functions.
 */

import { createClient } from "@/lib/supabase/server";
import type {
  ProductListing,
  HousingListing,
  OpportunityListing,
  CommunityPost,
  AnyListing,
  MarketplaceFilters,
  ListingType,
  ProductCondition,
} from "@/types/marketplace";

/**
 * Database listing type mapping
 */
const listingTypeMap: Record<string, ListingType> = {
  sell: "product",
  housing: "housing",
  opportunity: "opportunity",
  community_post: "community",
};

const reverseListingTypeMap: Record<ListingType, string> = {
  product: "sell",
  housing: "housing",
  opportunity: "opportunity",
  community: "community_post",
};

/**
 * Transform database listing to frontend type
 */
function transformListing(dbListing: any): AnyListing | null {
  if (!dbListing) return null;

  const type = listingTypeMap[dbListing.listing_type] || "product";
  const baseListing = {
    id: dbListing.id,
    type,
    title: dbListing.title,
    description: dbListing.description,
    userId: dbListing.seller_id,
    userName: dbListing.seller?.full_name || "Unknown",
    userAvatar: dbListing.seller?.avatar_url,
    universityId: dbListing.university_id,
    universityName: dbListing.university?.name,
    createdAt: dbListing.created_at,
    imageUrl: dbListing.image_urls?.[0],
    likes: dbListing.favorite_count || 0,
    isLiked: dbListing.is_favorited || false,
    comments: dbListing.comment_count || 0,
    views: dbListing.view_count || 0,
  };

  // Type-specific fields
  const metadata = dbListing.metadata || {};

  switch (type) {
    case "product":
      return {
        ...baseListing,
        type: "product",
        price: dbListing.price || 0,
        condition: (metadata.condition as ProductCondition) || "good",
        category: dbListing.category?.name || metadata.category || "Other",
        distance: metadata.distance,
        isSold: metadata.is_sold || false,
        isNegotiable: metadata.is_negotiable || false,
      } as ProductListing;

    case "housing":
      return {
        ...baseListing,
        type: "housing",
        monthlyRent: dbListing.price || 0,
        roomType: metadata.room_type || "single",
        location: dbListing.location || "",
        distance: metadata.distance,
        availableFrom: metadata.available_from,
        amenities: metadata.amenities || [],
        isAvailable: metadata.is_available !== false,
      } as HousingListing;

    case "opportunity":
      return {
        ...baseListing,
        type: "opportunity",
        opportunityType: metadata.opportunity_type || "internship",
        company: metadata.company,
        location: dbListing.location,
        isRemote: metadata.is_remote || false,
        deadline: metadata.deadline,
        stipend: metadata.stipend,
        duration: metadata.duration,
      } as OpportunityListing;

    case "community":
      return {
        ...baseListing,
        type: "community",
        postType: metadata.post_type || "discussion",
        pollOptions: metadata.poll_options,
        tags: metadata.tags || [],
      } as CommunityPost;

    default:
      return null;
  }
}

// ============================================================================
// MOCK DATA - Kept for backward compatibility during migration
// Components should migrate to using the async server action functions below
// ============================================================================

/**
 * Mock product listings
 * @deprecated Use getProducts() server action instead
 */
export const mockProducts: ProductListing[] = [
  {
    id: "prod-1",
    type: "product",
    title: "TI-84 Plus Calculator",
    description: "Barely used, perfect for engineering students",
    price: 4500,
    condition: "like_new",
    category: "Electronics",
    distance: "0.5 km",
    userId: "user-1",
    userName: "Rahul S.",
    universityName: "Delhi University",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 12,
    comments: 3,
    views: 45,
    isNegotiable: true,
  },
  {
    id: "prod-2",
    type: "product",
    title: "Engineering Drawing Kit",
    description: "Complete drafter set with compass, scales, and more",
    price: 800,
    condition: "good",
    category: "Stationery",
    distance: "1.2 km",
    userId: "user-2",
    userName: "Priya M.",
    universityName: "IIT Delhi",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 8,
    comments: 2,
    views: 32,
  },
  {
    id: "prod-3",
    type: "product",
    title: "Data Structures Textbook (Cormen)",
    description: "CLRS 3rd Edition, some highlights",
    price: 350,
    condition: "good",
    category: "Books",
    distance: "0.8 km",
    userId: "user-3",
    userName: "Amit K.",
    universityName: "Delhi University",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: 15,
    comments: 5,
    views: 78,
    imageUrl: "/placeholder.svg",
  },
  {
    id: "prod-4",
    type: "product",
    title: "MacBook Pro M1 2021",
    description: "16GB RAM, 512GB SSD, excellent condition with charger",
    price: 85000,
    condition: "like_new",
    category: "Electronics",
    distance: "2.1 km",
    userId: "user-4",
    userName: "Sneha R.",
    universityName: "DTU",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 45,
    comments: 12,
    views: 234,
    isNegotiable: true,
  },
];

/**
 * Mock housing listings
 * @deprecated Use getHousing() server action instead
 */
export const mockHousing: HousingListing[] = [
  {
    id: "house-1",
    type: "housing",
    title: "Looking for Flatmate - 2BHK Karol Bagh",
    description: "Spacious room in 2BHK, near metro station. Students preferred.",
    monthlyRent: 8500,
    roomType: "shared",
    location: "Karol Bagh, Delhi",
    distance: "1.5 km",
    userId: "user-5",
    userName: "Vikram P.",
    universityName: "Delhi University",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likes: 6,
    comments: 4,
    views: 56,
    isAvailable: true,
    amenities: ["WiFi", "AC", "Washing Machine"],
  },
  {
    id: "house-2",
    type: "housing",
    title: "Single Room Available - Kamla Nagar",
    description: "Fully furnished single room with attached bathroom. Girls only.",
    monthlyRent: 12000,
    roomType: "single",
    location: "Kamla Nagar, Delhi",
    distance: "0.8 km",
    userId: "user-6",
    userName: "Meera J.",
    universityName: "Delhi University",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    likes: 18,
    comments: 7,
    views: 89,
    isAvailable: true,
    amenities: ["WiFi", "AC", "Geyser", "Study Table"],
  },
];

/**
 * Mock opportunity listings
 * @deprecated Use getOpportunities() server action instead
 */
export const mockOpportunities: OpportunityListing[] = [
  {
    id: "opp-1",
    type: "opportunity",
    title: "Marketing Intern @ Zomato",
    description: "3-month internship with PPO opportunity. Flexible hours.",
    opportunityType: "internship",
    company: "Zomato",
    location: "Gurugram",
    isRemote: false,
    stipend: 25000,
    duration: "3 months",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    userId: "user-7",
    userName: "Career Cell",
    universityName: "Delhi University",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 156,
    comments: 23,
    views: 890,
  },
  {
    id: "opp-2",
    type: "opportunity",
    title: "Hackathon: CodeFest 2025",
    description: "48-hour hackathon with prizes worth 5 Lakhs. Team size: 2-4",
    opportunityType: "event",
    location: "IIT Delhi Campus",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    userId: "user-8",
    userName: "Tech Club DU",
    universityName: "Delhi University",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 234,
    comments: 45,
    views: 1200,
  },
  {
    id: "opp-3",
    type: "opportunity",
    title: "Freelance Content Writer Needed",
    description: "Looking for content writers. Rs 500/article. Remote work.",
    opportunityType: "gig",
    isRemote: true,
    userId: "user-9",
    userName: "StartupXYZ",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 34,
    comments: 8,
    views: 156,
  },
];

/**
 * Mock community posts
 * @deprecated Use getCommunityPosts() server action instead
 */
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: "comm-1",
    type: "community",
    postType: "poll",
    title: "Best mess in North Campus?",
    description: "Trying to find a good mess for daily meals. What do you recommend?",
    pollOptions: [
      { id: "opt-1", text: "Sharma Mess", votes: 45, percentage: 38 },
      { id: "opt-2", text: "GTB Nagar Canteen", votes: 32, percentage: 27 },
      { id: "opt-3", text: "Kamla Nagar Dhaba", votes: 28, percentage: 23 },
      { id: "opt-4", text: "PG Tiffin", votes: 15, percentage: 12 },
    ],
    tags: ["food", "north-campus"],
    userId: "user-10",
    userName: "Anonymous",
    universityName: "Delhi University",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    likes: 67,
    comments: 23,
    views: 345,
  },
  {
    id: "comm-2",
    type: "community",
    postType: "question",
    title: "How's the placement scene in BA Economics this year?",
    description:
      "Final year student here. Anyone with info about companies visiting this semester?",
    tags: ["placements", "economics"],
    userId: "user-11",
    userName: "Curious Student",
    universityName: "Delhi University",
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    likes: 89,
    comments: 34,
    views: 567,
  },
  {
    id: "comm-3",
    type: "community",
    postType: "review",
    title: "Review: Professor Sharma's Statistics Class",
    description:
      "Taking Stats next sem? Here's my honest review after completing the course...",
    tags: ["review", "statistics", "professors"],
    userId: "user-12",
    userName: "Grad Student",
    universityName: "Delhi University",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 123,
    comments: 45,
    views: 789,
  },
];

// ============================================================================
// SERVER ACTIONS - Database-backed functions for production use
// ============================================================================

/**
 * Get all listings from database
 * Replaces static mock data with database query
 */
export async function getAllListings(): Promise<AnyListing[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { data: listings, error } = await supabase
      .from("marketplace_listings")
      .select(
        `
        *,
        seller:profiles!seller_id(id, full_name, avatar_url),
        category:marketplace_categories!category_id(id, name, slug),
        university:universities!university_id(id, name)
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    // Transform listings to frontend format
    const transformedListings = (listings || [])
      .map((listing) => transformListing(listing))
      .filter((l): l is AnyListing => l !== null);

    // Check if user has favorited listings
    if (user && transformedListings.length > 0) {
      const listingIds = transformedListings.map((l) => l.id);
      const { data: favorites } = await supabase
        .from("marketplace_favorites")
        .select("listing_id")
        .eq("user_id", user.id)
        .in("listing_id", listingIds);

      const favoriteIds = new Set(favorites?.map((f) => f.listing_id) || []);
      transformedListings.forEach((listing) => {
        listing.isLiked = favoriteIds.has(listing.id);
      });
    }

    return transformedListings;
  } catch {
    return [];
  }
}

/**
 * Get listings by category from database
 * Replaces static mock data filtering with database query
 */
export async function getListingsByCategory(
  category: string
): Promise<AnyListing[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    let query = supabase
      .from("marketplace_listings")
      .select(
        `
        *,
        seller:profiles!seller_id(id, full_name, avatar_url),
        category:marketplace_categories!category_id(id, name, slug),
        university:universities!university_id(id, name)
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Apply category filter
    if (category !== "all") {
      const typeMap: Record<string, string> = {
        products: "sell",
        housing: "housing",
        opportunities: "opportunity",
        community: "community_post",
      };

      const dbType = typeMap[category];
      if (dbType) {
        query = query.eq("listing_type", dbType);
      }
    }

    const { data: listings, error } = await query;

    if (error) {
      return [];
    }

    // Transform listings to frontend format
    const transformedListings = (listings || [])
      .map((listing) => transformListing(listing))
      .filter((l): l is AnyListing => l !== null);

    // Check if user has favorited listings
    if (user && transformedListings.length > 0) {
      const listingIds = transformedListings.map((l) => l.id);
      const { data: favorites } = await supabase
        .from("marketplace_favorites")
        .select("listing_id")
        .eq("user_id", user.id)
        .in("listing_id", listingIds);

      const favoriteIds = new Set(favorites?.map((f) => f.listing_id) || []);
      transformedListings.forEach((listing) => {
        listing.isLiked = favoriteIds.has(listing.id);
      });
    }

    return transformedListings;
  } catch {
    return [];
  }
}

/**
 * Get product listings from database
 */
export async function getProducts(): Promise<ProductListing[]> {
  const listings = await getListingsByCategory("products");
  return listings.filter((l): l is ProductListing => l.type === "product");
}

/**
 * Get housing listings from database
 */
export async function getHousing(): Promise<HousingListing[]> {
  const listings = await getListingsByCategory("housing");
  return listings.filter((l): l is HousingListing => l.type === "housing");
}

/**
 * Get opportunity listings from database
 */
export async function getOpportunities(): Promise<OpportunityListing[]> {
  const listings = await getListingsByCategory("opportunities");
  return listings.filter(
    (l): l is OpportunityListing => l.type === "opportunity"
  );
}

/**
 * Get community posts from database
 */
export async function getCommunityPosts(): Promise<CommunityPost[]> {
  const listings = await getListingsByCategory("community");
  return listings.filter((l): l is CommunityPost => l.type === "community");
}

/**
 * Get filtered listings with advanced options
 */
export async function getFilteredListings(
  filters?: MarketplaceFilters
): Promise<AnyListing[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    let query = supabase
      .from("marketplace_listings")
      .select(
        `
        *,
        seller:profiles!seller_id(id, full_name, avatar_url),
        category:marketplace_categories!category_id(id, name, slug),
        university:universities!university_id(id, name)
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Apply category filter
    if (filters?.category && filters.category !== "all") {
      const dbType = reverseListingTypeMap[filters.category as ListingType];
      if (dbType) {
        query = query.eq("listing_type", dbType);
      }
    }

    // Apply price range filter
    if (filters?.priceRange) {
      const [minPrice, maxPrice] = filters.priceRange;
      if (minPrice > 0) {
        query = query.gte("price", minPrice);
      }
      if (maxPrice > 0) {
        query = query.lte("price", maxPrice);
      }
    }

    // Apply university filter
    if (filters?.universityOnly && user) {
      const { data: profile } = await supabase
        .from("students")
        .select("university_id")
        .eq("profile_id", user.id)
        .single();

      if (profile?.university_id) {
        query = query.eq("university_id", profile.university_id);
      }
    }

    const { data: listings, error } = await query;

    if (error) {
      return [];
    }

    // Transform listings to frontend format
    const transformedListings = (listings || [])
      .map((listing) => transformListing(listing))
      .filter((l): l is AnyListing => l !== null);

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "price_low":
          transformedListings.sort((a, b) => {
            const priceA =
              "price" in a ? a.price : "monthlyRent" in a ? a.monthlyRent : 0;
            const priceB =
              "price" in b ? b.price : "monthlyRent" in b ? b.monthlyRent : 0;
            return priceA - priceB;
          });
          break;
        case "price_high":
          transformedListings.sort((a, b) => {
            const priceA =
              "price" in a ? a.price : "monthlyRent" in a ? a.monthlyRent : 0;
            const priceB =
              "price" in b ? b.price : "monthlyRent" in b ? b.monthlyRent : 0;
            return priceB - priceA;
          });
          break;
        case "popular":
          transformedListings.sort((a, b) => b.views - a.views);
          break;
        // 'recent' is default from DB ordering
      }
    }

    // Check if user has favorited listings
    if (user && transformedListings.length > 0) {
      const listingIds = transformedListings.map((l) => l.id);
      const { data: favorites } = await supabase
        .from("marketplace_favorites")
        .select("listing_id")
        .eq("user_id", user.id)
        .in("listing_id", listingIds);

      const favoriteIds = new Set(favorites?.map((f) => f.listing_id) || []);
      transformedListings.forEach((listing) => {
        listing.isLiked = favoriteIds.has(listing.id);
      });
    }

    return transformedListings;
  } catch {
    return [];
  }
}
