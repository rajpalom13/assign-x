"use client";

import { useRef } from "react";
import { Grid3X3, GraduationCap, FileText, Users, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConnectCategory } from "@/types/connect";

interface CategoryFilterProps {
  selected: ConnectCategory;
  onChange: (category: ConnectCategory) => void;
  className?: string;
}

const categories: { id: ConnectCategory; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "tutors", label: "Tutors", icon: GraduationCap },
  { id: "resources", label: "Resources", icon: FileText },
  { id: "study-groups", label: "Study Groups", icon: Users },
  { id: "qa", label: "Q&A", icon: MessageCircle },
];

/**
 * Horizontal scrolling category filter chips
 * Used to filter content on the Student Connect page
 */
export function CategoryFilter({ selected, onChange, className }: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={cn("relative", className)}>
      {/* Scroll buttons - hidden on mobile, visible on larger screens */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-md lg:flex"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-background shadow-md lg:flex"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:px-4"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selected === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
