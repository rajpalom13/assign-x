/**
 * Campus Connect Types
 * Pinterest-inspired community platform for verified college students
 * Categories: Doubts, Residentials, Jobs, Teacher Reviews, Subject Tips, Events
 */

// =============================================================================
// POST CATEGORIES
// =============================================================================

/**
 * Campus Connect post categories
 */
export type CampusConnectCategory =
  | "doubts"        // Academic Q&A
  | "residentials"  // PG, hostel, flat listings
  | "jobs"          // Internships, part-time
  | "teacher_reviews" // Teacher/professor reviews
  | "subject_tips"  // Subject study tips
  | "events";       // College events, fests

/**
 * Category configuration with display info
 */
export interface CategoryConfig {
  id: CampusConnectCategory;
  label: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * All category configurations
 */
export const CAMPUS_CONNECT_CATEGORIES: CategoryConfig[] = [
  {
    id: "doubts",
    label: "Doubts",
    description: "Academic questions & answers",
    icon: "HelpCircle",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "residentials",
    label: "Residentials",
    description: "PG, hostel & flat listings",
    icon: "Home",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "jobs",
    label: "Jobs",
    description: "Internships & part-time",
    icon: "Briefcase",
    color: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "teacher_reviews",
    label: "Teacher Reviews",
    description: "Rate your professors",
    icon: "GraduationCap",
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "subject_tips",
    label: "Subject Tips",
    description: "Study tips & resources",
    icon: "BookOpen",
    color: "text-pink-600 dark:text-pink-400",
  },
  {
    id: "events",
    label: "Events",
    description: "College events & fests",
    icon: "Calendar",
    color: "text-cyan-600 dark:text-cyan-400",
  },
];

// =============================================================================
// DATABASE TYPES
// =============================================================================

/**
 * Database post status
 */
export type PostStatus = "draft" | "published" | "archived" | "flagged";

/**
 * Database campus connect post
 */
export interface DBCampusConnectPost {
  id: string;
  author_id: string;
  category: CampusConnectCategory;
  title: string;
  content: string;
  image_urls: string[] | null;
  university_id: string | null;
  status: PostStatus;
  is_pinned: boolean;
  is_admin_post: boolean;
  like_count: number;
  comment_count: number;
  save_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Author profile (joined data)
 */
export interface PostAuthor {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_college_verified: boolean;
}

/**
 * University info (joined data)
 */
export interface PostUniversity {
  id: string;
  name: string;
  short_name: string | null;
  city: string | null;
}

/**
 * Database post with relations
 */
export interface DBCampusConnectPostWithRelations extends DBCampusConnectPost {
  author: PostAuthor | null;
  university: PostUniversity | null;
  is_liked?: boolean;
  is_saved?: boolean;
}

// =============================================================================
// COMMENT TYPES
// =============================================================================

/**
 * Database comment
 */
export interface DBCampusConnectComment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  like_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Comment with relations
 */
export interface DBCommentWithRelations extends DBCampusConnectComment {
  author: PostAuthor | null;
  replies?: DBCommentWithRelations[];
  is_liked?: boolean;
}

// =============================================================================
// UI TYPES
// =============================================================================

/**
 * Post display type for UI
 */
export interface CampusConnectPost {
  id: string;
  category: CampusConnectCategory;
  title: string;
  content: string;
  previewText: string;
  imageUrls: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  isAuthorVerified: boolean;
  universityId: string | null;
  universityName: string | null;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  viewCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isPinned: boolean;
  isAdminPost: boolean;
  createdAt: string;
  timeAgo: string;
}

/**
 * Comment display type for UI
 */
export interface CampusConnectComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  isAuthorVerified: boolean;
  parentId: string | null;
  content: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  timeAgo: string;
  replies: CampusConnectComment[];
}

// =============================================================================
// FILTER & INPUT TYPES
// =============================================================================

/**
 * Filter options for fetching posts
 */
export interface CampusConnectFilters {
  category?: CampusConnectCategory | "all";
  universityId?: string | null;
  search?: string;
  sortBy?: "recent" | "popular" | "most_comments";
  limit?: number;
  offset?: number;
}

/**
 * Input for creating a new post
 */
export interface CreatePostInput {
  category: CampusConnectCategory;
  title: string;
  content: string;
  imageUrls?: string[];
}

/**
 * Input for updating a post
 */
export interface UpdatePostInput {
  title?: string;
  content?: string;
  imageUrls?: string[];
  status?: PostStatus;
}

/**
 * Input for creating a comment
 */
export interface CreateCommentInput {
  postId: string;
  content: string;
  parentId?: string | null;
}

// =============================================================================
// TRANSFORMATION UTILITIES
// =============================================================================

import { formatDistanceToNow } from "date-fns";

/**
 * Transform database post to UI format
 */
export function transformDBPostToUI(
  dbPost: DBCampusConnectPostWithRelations
): CampusConnectPost {
  const previewText = dbPost.content.length > 150
    ? dbPost.content.substring(0, 150) + "..."
    : dbPost.content;

  return {
    id: dbPost.id,
    category: dbPost.category,
    title: dbPost.title,
    content: dbPost.content,
    previewText,
    imageUrls: dbPost.image_urls || [],
    authorId: dbPost.author_id,
    authorName: dbPost.author?.full_name || "Anonymous",
    authorAvatar: dbPost.author?.avatar_url || null,
    isAuthorVerified: dbPost.author?.is_college_verified || false,
    universityId: dbPost.university_id,
    universityName: dbPost.university?.name || null,
    likeCount: dbPost.like_count,
    commentCount: dbPost.comment_count,
    saveCount: dbPost.save_count,
    viewCount: dbPost.view_count,
    isLiked: dbPost.is_liked || false,
    isSaved: dbPost.is_saved || false,
    isPinned: dbPost.is_pinned,
    isAdminPost: dbPost.is_admin_post,
    createdAt: dbPost.created_at,
    timeAgo: formatDistanceToNow(new Date(dbPost.created_at), { addSuffix: true }),
  };
}

/**
 * Transform database comment to UI format
 */
export function transformDBCommentToUI(
  dbComment: DBCommentWithRelations
): CampusConnectComment {
  return {
    id: dbComment.id,
    postId: dbComment.post_id,
    authorId: dbComment.author_id,
    authorName: dbComment.author?.full_name || "Anonymous",
    authorAvatar: dbComment.author?.avatar_url || null,
    isAuthorVerified: dbComment.author?.is_college_verified || false,
    parentId: dbComment.parent_id,
    content: dbComment.content,
    likeCount: dbComment.like_count,
    isLiked: dbComment.is_liked || false,
    createdAt: dbComment.created_at,
    timeAgo: formatDistanceToNow(new Date(dbComment.created_at), { addSuffix: true }),
    replies: (dbComment.replies || []).map(transformDBCommentToUI),
  };
}

/**
 * Get category config by ID
 */
export function getCategoryConfig(categoryId: CampusConnectCategory): CategoryConfig {
  return CAMPUS_CONNECT_CATEGORIES.find(c => c.id === categoryId) || CAMPUS_CONNECT_CATEGORIES[0];
}
