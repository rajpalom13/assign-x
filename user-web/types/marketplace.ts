/**
 * Marketplace types for Student Connect / Campus Marketplace
 * Implements U73-U85 from feature spec
 */

/**
 * Listing types per spec
 */
export type ListingType =
  | "product" // Hard goods: books, drafters, calculators
  | "housing" // Flatmates, room availability
  | "opportunity" // Internships, gigs, events
  | "community"; // Polls, reviews, questions

/**
 * Marketplace categories for filtering
 */
export type MarketplaceCategory =
  | "all"
  | "products"
  | "housing"
  | "opportunities"
  | "community";

/**
 * Listing condition for products
 */
export type ProductCondition = "new" | "like_new" | "good" | "fair";

/**
 * Base listing interface
 */
export interface MarketplaceListing {
  id: string;
  type: ListingType;
  title: string;
  description?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  universityId?: string;
  universityName?: string;
  createdAt: string;
  imageUrl?: string;
  likes: number;
  isLiked?: boolean;
  comments: number;
  views: number;
}

/**
 * Product listing (U77: Hard Goods)
 */
export interface ProductListing extends MarketplaceListing {
  type: "product";
  price: number;
  condition: ProductCondition;
  category: string;
  distance?: string;
  isSold?: boolean;
  isNegotiable?: boolean;
}

/**
 * Housing listing (U78: Housing)
 */
export interface HousingListing extends MarketplaceListing {
  type: "housing";
  monthlyRent: number;
  roomType: "single" | "shared" | "flat";
  location: string;
  distance?: string;
  availableFrom?: string;
  amenities?: string[];
  isAvailable: boolean;
}

/**
 * Opportunity listing (U79: Opportunities)
 */
export interface OpportunityListing extends MarketplaceListing {
  type: "opportunity";
  opportunityType: "internship" | "job" | "event" | "gig" | "workshop";
  company?: string;
  location?: string;
  isRemote?: boolean;
  deadline?: string;
  stipend?: number;
  duration?: string;
}

/**
 * Community post (U80: Community)
 */
export interface CommunityPost extends MarketplaceListing {
  type: "community";
  postType: "question" | "review" | "poll" | "discussion";
  pollOptions?: PollOption[];
  tags?: string[];
}

/**
 * Poll option for community posts
 */
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
}

/**
 * Filter state for marketplace
 */
export interface MarketplaceFilters {
  category: MarketplaceCategory;
  priceRange?: [number, number];
  condition?: ProductCondition[];
  distance?: number; // km
  sortBy?: "recent" | "price_low" | "price_high" | "popular";
  universityOnly?: boolean;
}

/**
 * Union type for all listing types
 */
export type AnyListing =
  | ProductListing
  | HousingListing
  | OpportunityListing
  | CommunityPost;
