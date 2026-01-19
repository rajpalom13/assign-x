"use client";

import { useCallback, useEffect, useRef } from "react";
import Masonry from "react-masonry-css";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PostCard } from "./post-card";
import type { CampusConnectPost } from "@/types/campus-connect";

/**
 * Props for CampusConnectMasonryGrid component
 */
interface MasonryGridProps {
  posts: CampusConnectPost[];
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * Breakpoint configuration for Masonry columns
 * 1 column mobile, 2 tablet, 3-4 desktop
 */
const breakpointColumns = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 2,
  640: 1,
};

/**
 * CampusConnectMasonryGrid - Pinterest-style masonry layout
 * Renders post cards in a responsive masonry grid
 * Supports infinite scroll loading
 */
export function CampusConnectMasonryGrid({
  posts,
  onLike,
  onSave,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className,
}: MasonryGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [onLoadMore, hasMore, isLoading]);

  /**
   * Renders a single post card
   */
  const renderPostCard = useCallback(
    (post: CampusConnectPost) => (
      <div key={post.id} className="mb-4">
        <PostCard
          post={post}
          onLike={onLike}
          onSave={onSave}
        />
      </div>
    ),
    [onLike, onSave]
  );

  // Empty state
  if (posts.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="font-medium text-foreground mb-1">No posts found</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Be the first to share something with your campus community!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Masonry
        breakpointCols={breakpointColumns}
        className="flex w-auto -ml-4"
        columnClassName="pl-4 bg-clip-padding"
      >
        {posts.map(renderPostCard)}
      </Masonry>

      {/* Load More Trigger */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className="flex items-center justify-center py-8"
        >
          {isLoading && (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
      )}

      {/* Loading State - Initial Load */}
      {isLoading && posts.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}

export default CampusConnectMasonryGrid;
