"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Share2,
  MoreHorizontal,
  BadgeCheck,
  Eye,
  Calendar,
  Loader2,
  AlertCircle,
  HelpCircle,
  Home,
  Briefcase,
  GraduationCap,
  BookOpen,
  MapPin,
  Clock,
  IndianRupee,
  Building,
  Star,
  MessageCircle,
  Users,
  ExternalLink,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUserStore } from "@/stores/user-store";
import { CommentSection } from "./comment-section";
import {
  getCampusConnectPostById,
  getPostComments,
  togglePostLike,
  togglePostSave,
  createComment,
  toggleCommentLike,
  deleteCampusConnectPost,
  checkCollegeVerification,
} from "@/lib/actions/campus-connect";
import type { CampusConnectPost, CampusConnectComment, CampusConnectCategory } from "@/types/campus-connect";

/**
 * Get time-based gradient class for dynamic theming
 */
function getTimeBasedGradientClass(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "mesh-gradient-morning";
  if (hour >= 12 && hour < 18) return "mesh-gradient-afternoon";
  return "mesh-gradient-evening";
}

/**
 * Get category icon
 */
function getCategoryIcon(category: CampusConnectCategory) {
  switch (category) {
    case "doubts": return HelpCircle;
    case "residentials": return Home;
    case "jobs": return Briefcase;
    case "teacher_reviews": return GraduationCap;
    case "subject_tips": return BookOpen;
    case "events": return Calendar;
    default: return HelpCircle;
  }
}

/**
 * Get category config
 */
function getCategoryConfig(category: CampusConnectCategory) {
  const configs: Record<CampusConnectCategory, { label: string; color: string }> = {
    doubts: { label: "Doubt", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
    residentials: { label: "Residential", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
    jobs: { label: "Job", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" },
    teacher_reviews: { label: "Review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
    subject_tips: { label: "Tip", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300" },
    events: { label: "Event", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
  };
  return configs[category] || configs.doubts;
}

interface PostDetailViewProps {
  postId: string;
}

/**
 * PostDetailView - Full post view with comments
 */
export function PostDetailView({ postId }: PostDetailViewProps) {
  const router = useRouter();
  const { user } = useUserStore();

  // Memoize time-based gradient class
  const gradientClass = useMemo(() => getTimeBasedGradientClass(), []);

  // State
  const [post, setPost] = useState<CampusConnectPost | null>(null);
  const [comments, setComments] = useState<CampusConnectComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Check verification
  useEffect(() => {
    async function check() {
      if (user) {
        const { isVerified: verified } = await checkCollegeVerification();
        setIsVerified(verified);
      }
    }
    check();
  }, [user]);

  // Fetch post and comments
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      const { data: postData, error: postError } = await getCampusConnectPostById(postId);

      if (postError || !postData) {
        setError(postError || "Post not found");
        setIsLoading(false);
        return;
      }

      setPost(postData);
      setIsLoading(false);

      // Fetch comments
      setIsCommentsLoading(true);
      const { data: commentsData } = await getPostComments(postId);
      setComments(commentsData);
      setIsCommentsLoading(false);
    }

    fetchData();
  }, [postId]);

  // Handle like
  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }
    if (isLiking || !post) return;

    setIsLiking(true);
    const prevPost = { ...post };

    // Optimistic update
    setPost({
      ...post,
      isLiked: !post.isLiked,
      likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
    });

    const { success, error } = await togglePostLike(postId);

    if (!success || error) {
      setPost(prevPost);
      toast.error(error || "Failed to like post");
    }

    setIsLiking(false);
  };

  // Handle save
  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save posts");
      return;
    }
    if (isSaving || !post) return;

    setIsSaving(true);
    const prevPost = { ...post };

    // Optimistic update
    setPost({ ...post, isSaved: !post.isSaved });

    const { success, isSaved, error } = await togglePostSave(postId);

    if (!success || error) {
      setPost(prevPost);
      toast.error(error || "Failed to save post");
    } else {
      toast.success(isSaved ? "Post saved" : "Post unsaved");
    }

    setIsSaving(false);
  };

  // Handle share
  const handleShare = async () => {
    const url = `${window.location.origin}/campus-connect/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.previewText,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  };

  // Handle add comment
  const handleAddComment = async (content: string, parentId?: string | null) => {
    const { data, error } = await createComment({
      postId,
      content,
      parentId,
    });

    if (error) {
      toast.error(error);
      return;
    }

    if (data) {
      if (parentId) {
        // Add as reply
        setComments(prev =>
          prev.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...comment.replies, data],
              };
            }
            return comment;
          })
        );
      } else {
        // Add as top-level comment
        setComments(prev => [...prev, data]);
      }

      // Update post comment count
      if (post) {
        setPost({ ...post, commentCount: post.commentCount + 1 });
      }

      toast.success("Comment added");
    }
  };

  // Handle comment like
  const handleCommentLike = async (commentId: string) => {
    if (!user) {
      toast.error("Please sign in to like comments");
      return;
    }

    // Optimistic update
    setComments(prev =>
      prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likeCount: comment.isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
          };
        }
        // Check replies
        return {
          ...comment,
          replies: comment.replies.map(reply => {
            if (reply.id === commentId) {
              return {
                ...reply,
                isLiked: !reply.isLiked,
                likeCount: reply.isLiked ? reply.likeCount - 1 : reply.likeCount + 1,
              };
            }
            return reply;
          }),
        };
      })
    );

    const { success, error } = await toggleCommentLike(commentId);

    if (!success || error) {
      toast.error(error || "Failed to like comment");
      // Revert would be complex, so we just show error
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!post || post.authorId !== user?.id) return;

    const { success, error } = await deleteCampusConnectPost(postId);

    if (success) {
      toast.success("Post deleted");
      router.push("/campus-connect");
    } else {
      toast.error(error || "Failed to delete post");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("min-h-[calc(100vh-3.5rem)] flex items-center justify-center mesh-background mesh-gradient-bottom-right-animated", gradientClass)}>
        <div className="action-card-glass p-6 rounded-2xl">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <div className={cn("min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-6 mesh-background mesh-gradient-bottom-right-animated", gradientClass)}>
        <div className="action-card-glass max-w-md text-center p-8 rounded-2xl">
          <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error || "This post may have been deleted or doesn't exist."}
          </p>
          <Button asChild>
            <Link href="/campus-connect">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campus Connect
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const categoryConfig = getCategoryConfig(post.category);
  const CategoryIcon = getCategoryIcon(post.category);
  const isOwner = user?.id === post.authorId;

  return (
    <div className={cn("min-h-[calc(100vh-3.5rem)] pb-8 mesh-background mesh-gradient-bottom-right-animated", gradientClass)}>
      {/* Header */}
      <div className="sticky top-14 z-20 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/campus-connect">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              disabled={isLiking}
              className={post.isLiked ? "text-red-500" : ""}
            >
              <Heart className={cn("h-5 w-5", post.isLiked && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSave}
              disabled={isSaving}
              className={post.isSaved ? "text-primary" : ""}
            >
              <Bookmark className={cn("h-5 w-5", post.isSaved && "fill-current")} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>Share</DropdownMenuItem>
                <DropdownMenuItem>Report</DropdownMenuItem>
                {isOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/campus-connect/${postId}/edit`}>Edit Post</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={handleDelete}
                    >
                      Delete Post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Main Content Card */}
        <div className="action-card-glass rounded-2xl p-6 mb-6">
          {/* Category Badge */}
          <Badge className={cn("mb-4", categoryConfig.color)}>
            <CategoryIcon className="h-3.5 w-3.5 mr-1" />
            {categoryConfig.label}
          </Badge>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.authorAvatar || undefined} alt={post.authorName} />
              <AvatarFallback>
                {post.authorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{post.authorName}</span>
                {post.isAuthorVerified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                )}
              </div>
              {post.universityName && (
                <p className="text-sm text-muted-foreground truncate">
                  {post.universityName}
                </p>
              )}
            </div>
          </div>

        {/* Images */}
        {post.imageUrls.length > 0 && (
          <div className="mb-6 space-y-3">
            {/* Main Image */}
            <motion.div
              className="relative aspect-video rounded-2xl overflow-hidden bg-muted"
              layoutId={`post-image-${postId}`}
            >
              <Image
                src={post.imageUrls[selectedImageIndex]}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            {/* Image Thumbnails */}
            {post.imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {post.imageUrls.map((url, index) => (
                  <button
                    key={url}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors",
                      selectedImageIndex === index
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    )}
                  >
                    <Image
                      src={url}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
          <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
            <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {post.content}
            </p>
          </div>

          {/* Category-specific content sections */}
          <CategorySpecificSection post={post} category={post.category} />

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Heart className={cn("h-4 w-4", post.isLiked && "fill-red-500 text-red-500")} />
              <span>{post.likeCount} likes</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{post.viewCount} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{post.timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="action-card-glass rounded-2xl p-6">
          <CommentSection
            comments={comments}
            postId={postId}
            onAddComment={handleAddComment}
            onLikeComment={handleCommentLike}
            isVerified={isVerified}
            isLoading={isCommentsLoading}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Category-specific content sections
 * Renders additional structured information based on post category
 */
function CategorySpecificSection({
  post,
  category
}: {
  post: CampusConnectPost;
  category: CampusConnectCategory;
}) {
  // Parse structured data from content (if available in format like "Location: xyz")
  const parseContentField = (content: string, field: string): string | null => {
    const regex = new RegExp(`${field}:\\s*(.+?)(?:\\n|$)`, "i");
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  };

  switch (category) {
    case "doubts":
      return (
        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/30 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Academic Question</span>
          </div>
          <p className="text-xs text-blue-600/70 dark:text-blue-400/70">
            Have an answer? Leave a comment below to help your fellow students!
          </p>
        </div>
      );

    case "residentials": {
      const location = parseContentField(post.content, "Location") || parseContentField(post.content, "Area");
      const rent = parseContentField(post.content, "Rent") || parseContentField(post.content, "Price");
      return (
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/30 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Home className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Residential Listing</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{location}</span>
              </div>
            )}
            {rent && (
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{rent}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/30">
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              💡 Tip: Always verify the location before visiting
            </p>
          </div>
        </div>
      );
    }

    case "jobs": {
      const company = parseContentField(post.content, "Company");
      const stipend = parseContentField(post.content, "Stipend") || parseContentField(post.content, "Salary");
      const jobType = parseContentField(post.content, "Type") || parseContentField(post.content, "Role");
      return (
        <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/30 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Job / Internship</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {company && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{company}</span>
              </div>
            )}
            {stipend && (
              <div className="flex items-center gap-2 text-sm">
                <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{stipend}</span>
              </div>
            )}
            {jobType && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{jobType}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/30">
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70">
              💼 Apply through official channels when possible
            </p>
          </div>
        </div>
      );
    }

    case "teacher_reviews": {
      const subject = parseContentField(post.content, "Subject") || parseContentField(post.content, "Course");
      const rating = parseContentField(post.content, "Rating");
      return (
        <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/30 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Teacher Review</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {subject && (
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{subject}</span>
              </div>
            )}
            {rating && (
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span>{rating}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-amber-200/50 dark:border-amber-800/30">
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
              📚 Reviews help students make informed choices
            </p>
          </div>
        </div>
      );
    }

    case "subject_tips":
      return (
        <div className="bg-pink-50/50 dark:bg-pink-900/10 rounded-xl p-4 border border-pink-200/50 dark:border-pink-800/30 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-pink-600 dark:text-pink-400" />
            <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Study Tip</span>
          </div>
          <p className="text-xs text-pink-600/70 dark:text-pink-400/70">
            💡 Found this helpful? Save it for later and share with classmates!
          </p>
        </div>
      );

    case "events": {
      const date = parseContentField(post.content, "Date") || parseContentField(post.content, "When");
      const venue = parseContentField(post.content, "Venue") || parseContentField(post.content, "Location");
      return (
        <div className="bg-cyan-50/50 dark:bg-cyan-900/10 rounded-xl p-4 border border-cyan-200/50 dark:border-cyan-800/30 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-medium text-cyan-700 dark:text-cyan-300">Event</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {date && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{date}</span>
              </div>
            )}
            {venue && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{venue}</span>
              </div>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-cyan-200/50 dark:border-cyan-800/30">
            <p className="text-xs text-cyan-600/70 dark:text-cyan-400/70">
              🎉 Don't miss out! Mark your calendar
            </p>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

export default PostDetailView;
