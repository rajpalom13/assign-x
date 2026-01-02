"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Listing type enum matching database schema
 */
export type ListingType = "item" | "housing" | "opportunity" | "community";

/**
 * Options for fetching marketplace listings
 */
export interface GetListingsOptions {
  category?: ListingType | "all";
  search?: string;
  limit?: number;
  offset?: number;
  priceMin?: number;
  priceMax?: number;
  sortBy?: "recent" | "price_low" | "price_high" | "popular";
  universityOnly?: boolean;
}

/**
 * Data for creating a new marketplace listing
 */
export interface CreateListingData {
  listingType: ListingType;
  title: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  categoryId?: string;
  // Type-specific fields stored in metadata
  metadata?: Record<string, unknown>;
}

/**
 * Get marketplace listings with filtering, search, and pagination
 * Fetches from marketplace_listings table with seller profile relations
 */
export async function getMarketplaceListings(options: GetListingsOptions = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Build base query with seller relation
  let query = supabase
    .from("marketplace_listings")
    .select(`
      *,
      seller:profiles!marketplace_listings_seller_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      category:marketplace_categories (
        id,
        name,
        slug,
        is_active
      )
    `)
    .eq("is_active", true);

  // Filter by category/listing_type
  if (options.category && options.category !== "all") {
    query = query.eq("listing_type", options.category);
  }

  // Search in title and description
  if (options.search) {
    const searchTerm = `%${options.search}%`;
    query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }

  // Price range filters
  if (options.priceMin !== undefined && options.priceMin > 0) {
    query = query.gte("price", options.priceMin);
  }
  if (options.priceMax !== undefined) {
    query = query.lte("price", options.priceMax);
  }

  // University-only filter (requires user to be authenticated)
  if (options.universityOnly && user) {
    // Get user's university from their student profile
    const { data: studentProfile } = await supabase
      .from("students")
      .select("university_id")
      .eq("profile_id", user.id)
      .single();

    if (studentProfile?.university_id) {
      query = query.eq("university_id", studentProfile.university_id);
    }
  }

  // Sorting
  switch (options.sortBy) {
    case "price_low":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_high":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "popular":
      query = query.order("view_count", { ascending: false });
      break;
    case "recent":
    default:
      query = query.order("created_at", { ascending: false });
  }

  // Pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data: listings, error, count } = await query;

  if (error) {
    return { listings: [], total: 0, error: error.message };
  }

  // If user is authenticated, check for favorites
  let listingsWithFavorites = listings || [];
  if (user && listings && listings.length > 0) {
    const listingIds = listings.map((l) => l.id);
    const { data: favorites } = await supabase
      .from("marketplace_favorites")
      .select("listing_id")
      .eq("profile_id", user.id)
      .in("listing_id", listingIds);

    const favoriteIds = new Set(favorites?.map((f) => f.listing_id) || []);
    listingsWithFavorites = listings.map((listing) => ({
      ...listing,
      is_favorited: favoriteIds.has(listing.id),
    }));
  }

  return {
    listings: listingsWithFavorites,
    total: count || listings?.length || 0,
    error: null,
  };
}

/**
 * Get a single marketplace listing by ID
 */
export async function getListingById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return null;
  }

  const { data: listing, error } = await supabase
    .from("marketplace_listings")
    .select(`
      *,
      seller:profiles!marketplace_listings_seller_id_fkey (
        id,
        full_name,
        avatar_url
      ),
      category:marketplace_categories (
        id,
        name,
        slug,
        is_active
      )
    `)
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error) {
    return null;
  }

  // Increment view count
  await supabase
    .from("marketplace_listings")
    .update({ view_count: (listing.view_count || 0) + 1 })
    .eq("id", id);

  // Check if favorited by current user
  let isFavorited = false;
  if (user) {
    const { data: favorite } = await supabase
      .from("marketplace_favorites")
      .select("id")
      .eq("profile_id", user.id)
      .eq("listing_id", id)
      .single();

    isFavorited = !!favorite;
  }

  return {
    ...listing,
    is_favorited: isFavorited,
  };
}

/**
 * Get listings created by the current user
 */
export async function getUserListings(status?: "active" | "inactive" | "all") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("marketplace_listings")
    .select(`
      *,
      category:marketplace_categories (
        id,
        name,
        slug,
        is_active
      )
    `)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }
  // "all" doesn't filter by is_active

  const { data: listings, error } = await query;

  if (error) {
    return [];
  }

  return listings || [];
}

/**
 * Create a new marketplace listing
 */
export async function createListing(data: CreateListingData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Validate required fields
  if (!data.title || data.title.trim().length === 0) {
    return { error: "Title is required" };
  }
  if (!data.listingType) {
    return { error: "Listing type is required" };
  }

  // Get user's university for university_id if they're a student
  let universityId: string | null = null;
  const { data: studentProfile } = await supabase
    .from("students")
    .select("university_id")
    .eq("profile_id", user.id)
    .single();

  if (studentProfile?.university_id) {
    universityId = studentProfile.university_id;
  }

  const { data: listing, error } = await supabase
    .from("marketplace_listings")
    .insert({
      seller_id: user.id,
      listing_type: data.listingType,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      price: data.price || null,
      image_url: data.imageUrl || null,
      category_id: data.categoryId || null,
      university_id: universityId,
      metadata: data.metadata || {},
      is_active: true,
      view_count: 0,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/connect");
  return { success: true, listing };
}

/**
 * Update a marketplace listing
 */
export async function updateListing(
  id: string,
  data: Partial<CreateListingData> & { isActive?: boolean }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify ownership
  const { data: existingListing } = await supabase
    .from("marketplace_listings")
    .select("seller_id")
    .eq("id", id)
    .single();

  if (!existingListing || existingListing.seller_id !== user.id) {
    return { error: "Listing not found or access denied" };
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description?.trim() || null;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
  if (data.metadata !== undefined) updateData.metadata = data.metadata;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  const { error } = await supabase
    .from("marketplace_listings")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/connect");
  revalidatePath(`/connect/${id}`);
  return { success: true };
}

/**
 * Delete a marketplace listing
 */
export async function deleteListing(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Verify ownership
  const { data: existingListing } = await supabase
    .from("marketplace_listings")
    .select("seller_id")
    .eq("id", id)
    .single();

  if (!existingListing || existingListing.seller_id !== user.id) {
    return { error: "Listing not found or access denied" };
  }

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from("marketplace_listings")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/connect");
  return { success: true };
}

/**
 * Toggle favorite status for a listing
 */
export async function toggleFavorite(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if already favorited
  const { data: existingFavorite } = await supabase
    .from("marketplace_favorites")
    .select("id")
    .eq("profile_id", user.id)
    .eq("listing_id", listingId)
    .single();

  if (existingFavorite) {
    // Remove favorite
    const { error } = await supabase
      .from("marketplace_favorites")
      .delete()
      .eq("id", existingFavorite.id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/connect");
    return { success: true, isFavorited: false };
  } else {
    // Add favorite
    const { error } = await supabase
      .from("marketplace_favorites")
      .insert({
        profile_id: user.id,
        listing_id: listingId,
      });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/connect");
    return { success: true, isFavorited: true };
  }
}

/**
 * Get user's favorite listings
 */
export async function getFavoriteListings(limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: favorites, error } = await supabase
    .from("marketplace_favorites")
    .select(`
      listing:marketplace_listings (
        *,
        seller:profiles!marketplace_listings_seller_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        category:marketplace_categories (
          id,
          name,
          slug,
          is_active
        )
      )
    `)
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  // Extract listings and mark as favorited
  return (favorites || [])
    .map((f) => f.listing)
    .filter((l) => l !== null && l.is_active)
    .map((l) => ({ ...l, is_favorited: true }));
}

/**
 * Get marketplace categories
 */
export async function getMarketplaceCategories() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("marketplace_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) {
    return [];
  }

  return categories || [];
}

/**
 * Search marketplace listings with autocomplete
 * Returns limited results for search suggestions
 */
export async function searchListings(query: string, limit = 5) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const supabase = await createClient();
  const searchTerm = `%${query.trim()}%`;

  const { data: listings, error } = await supabase
    .from("marketplace_listings")
    .select("id, title, listing_type, price")
    .eq("is_active", true)
    .ilike("title", searchTerm)
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return listings || [];
}
