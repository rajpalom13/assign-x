"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Eye,
  HelpCircle,
  Home,
  Briefcase,
  GraduationCap,
  BookOpen,
  Calendar,
  BadgeCheck,
  Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { CampusConnectPost, CampusConnectCategory } from "@/types/campus-connect";

interface PostCardProps {
  post: CampusConnectPost;
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
  className?: string;
}

/**
 * Get category icon component
 */
function getCategoryIcon(category: CampusConnectCategory) {
  switch (category) {
    case "doubts":
      return HelpCircle;
    case "residentials":
      return Home;
    case "jobs":
      return Briefcase;
    case "teacher_reviews":
      return GraduationCap;
    case "subject_tips":
      return BookOpen;
    case "events":
      return Calendar;
    default:
      return HelpCircle;
  }
}

/**
 * Get category badge config
 */
function getCategoryConfig(category: CampusConnectCategory) {
  const configs: Record<CampusConnectCategory, { label: string; color: string; bgColor: string }> = {
    doubts: {
      label: "Doubt",
      color: "text-blue-700 dark:text-blue-300",
      bgColor: "bg-blue-100 dark:bg-blue-900/40",
    },
    residentials: {
      label: "Residential",
      color: "text-emerald-700 dark:text-emerald-300",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
    },
    jobs: {
      label: "Job",
      color: "text-purple-700 dark:text-purple-300",
      bgColor: "bg-purple-100 dark:bg-purple-900/40",
    },
    teacher_reviews: {
      label: "Review",
      color: "text-amber-700 dark:text-amber-300",
      bgColor: "bg-amber-100 dark:bg-amber-900/40",
    },
    subject_tips: {
      label: "Tip",
      color: "text-pink-700 dark:text-pink-300",
      bgColor: "bg-pink-100 dark:bg-pink-900/40",
    },
    events: {
      label: "Event",
      color: "text-cyan-700 dark:text-cyan-300",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/40",
    },
  };
  return configs[category] || configs.doubts;
}

/**
 * PostCard - Pinterest-style card for campus connect posts
 * Features glassmorphism, smooth animations, and responsive design
 */
export const PostCard = memo(function PostCard({
  post,
  onLike,
  onSave,
  className,
}: PostCardProps) {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isSaveAnimating, setIsSaveAnimating] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 300);
    onLike?.(post.id);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaveAnimating(true);
    setTimeout(() => setIsSaveAnimating(false), 300);
    onSave?.(post.id);
  };

  const categoryConfig = getCategoryConfig(post.category);
  const CategoryIcon = getCategoryIcon(post.category);
  const hasImage = post.imageUrls.length > 0;

  return (
    <Link href={`/campus-connect/${post.id}`} className="block group">
      <motion.article
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "rounded-2xl overflow-hidden border border-border/50 bg-card",
          "hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
          "transition-all duration-300",
          className
        )}
      >
        {/* Image Section */}
        {hasImage && (
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <motion.div
              className="relative w-full h-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={post.imageUrls[0]}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </motion.div>

            {/* Pinned Badge */}
            {post.isPinned && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="gap-1 bg-background/90 backdrop-blur-sm">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              </div>
            )}

            {/* Category Badge - Top Right */}
            <div className="absolute top-2 right-2">
              <Badge
                className={cn(
                  "gap-1 backdrop-blur-sm border-0",
                  categoryConfig.bgColor,
                  categoryConfig.color
                )}
              >
                <CategoryIcon className="h-3 w-3" />
                {categoryConfig.label}
              </Badge>
            </div>

            {/* Save Button - Overlay */}
            <motion.button
              onClick={handleSave}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "absolute bottom-2 right-2 p-2 rounded-full",
                "bg-background/80 backdrop-blur-sm border border-border/50",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                post.isSaved && "opacity-100"
              )}
            >
              <motion.div animate={isSaveAnimating ? { scale: [1, 1.3, 1] } : {}}>
                <Bookmark
                  className={cn(
                    "h-4 w-4",
                    post.isSaved
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  )}
                />
              </motion.div>
            </motion.button>
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Category Badge (when no image) */}
          {!hasImage && (
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "gap-1 border-0",
                  categoryConfig.bgColor,
                  categoryConfig.color
                )}
              >
                <CategoryIcon className="h-3 w-3" />
                {categoryConfig.label}
              </Badge>
              {post.isPinned && (
                <Badge variant="secondary" className="gap-1">
                  <Pin className="h-3 w-3" />
                  Pinned
                </Badge>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          {/* Preview Text */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {post.previewText}
          </p>

          {/* Author Info */}
          <div className="flex items-center gap-2 pt-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.authorAvatar || undefined} alt={post.authorName} />
              <AvatarFallback className="text-[10px]">
                {post.authorName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="text-xs font-medium text-foreground/80 truncate">
                {post.authorName}
              </span>
              {post.isAuthorVerified && (
                <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              )}
            </div>
          </div>

          {/* University */}
          {post.universityName && (
            <p className="text-[10px] text-muted-foreground truncate -mt-1">
              {post.universityName}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              {/* Like Button */}
              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-1 text-muted-foreground hover:text-red-500 transition-colors"
              >
                <motion.div animate={isLikeAnimating ? { scale: [1, 1.4, 1] } : {}}>
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      post.isLiked && "fill-red-500 text-red-500"
                    )}
                  />
                </motion.div>
                <span className="text-xs font-medium">{post.likeCount}</span>
              </motion.button>

              {/* Comments */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs font-medium">{post.commentCount}</span>
              </div>
            </div>

            {/* Time Ago */}
            <span className="text-[10px] text-muted-foreground">{post.timeAgo}</span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
});

export default PostCard;
