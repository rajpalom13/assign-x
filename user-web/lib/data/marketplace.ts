/**
 * Mock marketplace data
 * In production, this would come from Supabase marketplace_listings table
 */

import type {
  ProductListing,
  HousingListing,
  OpportunityListing,
  CommunityPost,
  AnyListing,
} from "@/types/marketplace";

/**
 * Mock product listings
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

/**
 * Get all listings combined and shuffled
 */
export function getAllListings(): AnyListing[] {
  const all: AnyListing[] = [
    ...mockProducts,
    ...mockHousing,
    ...mockOpportunities,
    ...mockCommunityPosts,
  ];

  // Shuffle for discovery mix (U75)
  return all.sort(() => Math.random() - 0.5);
}

/**
 * Get listings by category
 */
export function getListingsByCategory(category: string): AnyListing[] {
  const all = getAllListings();

  if (category === "all") return all;

  const typeMap: Record<string, string> = {
    products: "product",
    housing: "housing",
    opportunities: "opportunity",
    community: "community",
  };

  return all.filter((listing) => listing.type === typeMap[category]);
}
