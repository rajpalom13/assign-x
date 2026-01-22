"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Star,
  Shield,
  TrendingUp,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExpertCard } from "@/components/experts";
import {
  MOCK_EXPERTS,
  getFeaturedExperts,
} from "@/lib/data/experts";
import type { ExpertFilters } from "@/types/expert";
import { cn } from "@/lib/utils";

/**
 * Default filter state
 */
const DEFAULT_FILTERS: ExpertFilters = {
  specializations: [],
  minRating: 0,
  maxPrice: 5000,
  availability: [],
  languages: [],
  sortBy: "rating",
};

/**
 * Specialization options
 */
const SPECIALIZATIONS = [
  { value: "academic_writing", label: "Academic Writing" },
  { value: "research_methodology", label: "Research" },
  { value: "data_analysis", label: "Data Analysis" },
  { value: "programming", label: "Programming" },
  { value: "mathematics", label: "Mathematics" },
];

// Spring configuration for ultra smooth animations
const springConfig = {
  type: "spring" as const,
  stiffness: 260,
  damping: 26,
  mass: 0.6,
};

// Smooth easing configuration for hover effects
const smoothEasing = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1] as const,
};

/**
 * Bento Stat Card Component with asymmetrical sizing - Monotonous brown theme
 */
interface BentoStatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  cardIndex: number;
  isTall: boolean;
  onHover: () => void;
}

function BentoStatCard({
  icon: Icon,
  value,
  label,
  cardIndex,
  isTall,
  onHover,
}: BentoStatCardProps) {
  const tallHeight = 200;
  const shortHeight = 140;
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        height: isTall ? tallHeight : shortHeight,
      }}
      transition={{
        opacity: { duration: 0.4, delay: 0.1 + cardIndex * 0.1 },
        y: { duration: 0.4, delay: 0.1 + cardIndex * 0.1 },
        height: springConfig,
      }}
      onMouseEnter={() => {
        onHover();
        setIsHovering(true);
      }}
      onMouseLeave={() => setIsHovering(false)}
      className="relative will-change-[height] cursor-pointer"
    >
      <div
        className="h-full rounded-2xl bg-background border border-[#8B7355] hover:border-[#6B5845] transition-all overflow-hidden relative group"
        style={{
          backgroundColor: '#FAFAF9',
          borderWidth: '1px',
        }}
      >
        {/* Hover background effect */}
        <motion.div
          className="absolute inset-0 bg-[#8B7355]/5 pointer-events-none rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovering ? 1 : 0 }}
          transition={smoothEasing}
        />

        <div className="flex flex-col h-full relative z-10 items-center justify-center text-center px-4 py-6">
          {/* Icon */}
          <motion.div
            animate={{
              scale: isTall ? 1.1 : 1,
              rotate: isHovering ? [0, -10, 10, 0] : 0,
            }}
            transition={{
              scale: springConfig,
              rotate: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
            }}
            className="mb-4"
          >
            <Icon
              className="text-[#8B7355]"
              size={isTall ? 32 : 28}
              strokeWidth={1.5}
            />
          </motion.div>

          {/* Content */}
          <div className="space-y-2">
            <motion.p
              className="font-bold text-foreground"
              animate={{
                fontSize: isTall ? "2rem" : "1.75rem",
              }}
              transition={springConfig}
            >
              {value}
            </motion.p>
            <motion.p
              className="text-muted-foreground font-medium"
              animate={{
                opacity: isTall ? 1 : 0.8,
                fontSize: isTall ? "0.875rem" : "0.75rem",
              }}
              transition={{
                fontSize: springConfig,
                opacity: smoothEasing,
              }}
            >
              {label}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Expert Listing Page - Perfect Layout
 */
// Default expanded indices: left=0 (first card tall), right=1 (second card tall)
const DEFAULT_LEFT_EXPANDED = 0;
const DEFAULT_RIGHT_EXPANDED = 1;

// Stat cards configuration - Monotonous with brown accents
const STAT_CARDS = {
  left: [
    {
      id: "experts",
      icon: Users,
      value: "50+",
      label: "Verified Experts",
    },
    {
      id: "sessions",
      icon: TrendingUp,
      value: "5K+",
      label: "Sessions Done",
    },
  ],
  right: [
    {
      id: "rating",
      icon: Star,
      value: "4.8",
      label: "Average Rating",
    },
    {
      id: "secure",
      icon: Shield,
      value: "100%",
      label: "Secure Payment",
    },
  ],
};

export default function ExpertsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ExpertFilters>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const carouselRef = useRef<NodeJS.Timeout | null>(null);

  // Track which column has the expanded card
  const [leftHovered, setLeftHovered] = useState<number | null>(null);
  const [rightHovered, setRightHovered] = useState<number | null>(null);

  // Effective expanded states (use hover or default)
  const leftExpanded = leftHovered ?? DEFAULT_LEFT_EXPANDED;
  const rightExpanded = rightHovered ?? DEFAULT_RIGHT_EXPANDED;

  const featuredExperts = getFeaturedExperts();

  /**
   * Auto-scroll carousel
   */
  useEffect(() => {
    if (featuredExperts.length > 1) {
      carouselRef.current = setInterval(() => {
        setCurrentFeaturedIndex((prev) => (prev + 1) % featuredExperts.length);
      }, 5000); // Change every 5 seconds

      return () => {
        if (carouselRef.current) clearInterval(carouselRef.current);
      };
    }
  }, [featuredExperts.length]);

  /**
   * Manual carousel navigation
   */
  const goToSlide = (index: number) => {
    setCurrentFeaturedIndex(index);
    // Reset auto-scroll timer
    if (carouselRef.current) clearInterval(carouselRef.current);
    carouselRef.current = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % featuredExperts.length);
    }, 5000);
  };

  const nextSlide = () => {
    goToSlide((currentFeaturedIndex + 1) % featuredExperts.length);
  };

  const prevSlide = () => {
    goToSlide((currentFeaturedIndex - 1 + featuredExperts.length) % featuredExperts.length);
  };

  /**
   * Filter and sort experts
   */
  const filteredExperts = useMemo(() => {
    let result = [...MOCK_EXPERTS];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (expert) =>
          expert.name.toLowerCase().includes(query) ||
          expert.designation.toLowerCase().includes(query)
      );
    }

    if (selectedSpecializations.length > 0) {
      result = result.filter((expert) =>
        expert.specializations.some((spec) =>
          selectedSpecializations.includes(spec)
        )
      );
    }

    if (showAvailableOnly) {
      result = result.filter((expert) => expert.availability === "available");
    }

    result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [searchQuery, selectedSpecializations, showAvailableOnly]);

  const handleExpertClick = (expertId: string) => {
    router.push(`/experts/${expertId}`);
  };

  const handleBookClick = (expertId: string) => {
    router.push(`/experts/booking/${expertId}`);
  };

  const toggleSpecialization = (value: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  // Handlers for left column
  const handleLeftHover = useCallback((index: number) => {
    setLeftHovered(index);
  }, []);

  const handleLeftLeave = useCallback(() => {
    setLeftHovered(null);
  }, []);

  // Handlers for right column
  const handleRightHover = useCallback((index: number) => {
    setRightHovered(index);
  }, []);

  const handleRightLeave = useCallback(() => {
    setRightHovered(null);
  }, []);

  return (
    <div className="relative min-h-full pb-32 mesh-background mesh-gradient-experts">
      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN - Header & Stats */}
          <div className="lg:col-span-4 space-y-8">

            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold tracking-tight">Expert Consultations</h1>
              <p className="text-base text-muted-foreground leading-relaxed">
                Connect with verified mentors and get personalized guidance for your academic journey
              </p>
            </motion.div>

            {/* Stats Bento Grid - Asymmetrical */}
            <div className="flex gap-4">
              {/* Left Column of Cards */}
              <div
                className="flex-1 flex flex-col gap-4"
                onMouseLeave={handleLeftLeave}
              >
                {STAT_CARDS.left.map((card, index) => (
                  <BentoStatCard
                    key={card.id}
                    {...card}
                    cardIndex={index}
                    isTall={leftExpanded === index}
                    onHover={() => handleLeftHover(index)}
                  />
                ))}
              </div>

              {/* Right Column of Cards */}
              <div
                className="flex-1 flex flex-col gap-4"
                onMouseLeave={handleRightLeave}
              >
                {STAT_CARDS.right.map((card, index) => (
                  <BentoStatCard
                    key={card.id}
                    {...card}
                    cardIndex={index}
                    isTall={rightExpanded === index}
                    onHover={() => handleRightHover(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Featured, Search, List */}
          <div className="lg:col-span-8 space-y-6">

            {/* Top Experts Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold tracking-tight">Top Experts</h2>

              {/* Featured Experts Carousel */}
              <div className="relative">
                {/* Carousel */}
                <AnimatePresence mode="wait">
                  {featuredExperts.length > 0 && (
                    <motion.div
                      key={currentFeaturedIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ExpertCard
                        expert={featuredExperts[currentFeaturedIndex]}
                        variant="featured"
                        onClick={() => handleExpertClick(featuredExperts[currentFeaturedIndex].id)}
                        onBook={() => handleBookClick(featuredExperts[currentFeaturedIndex].id)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dots Navigation */}
                {featuredExperts.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {featuredExperts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          index === currentFeaturedIndex
                            ? "w-8 bg-primary"
                            : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Search Bar with Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex gap-3"
            >
              <div className="flex-1 glass-card rounded-xl p-1.5 border border-border/20">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={2} />
                  <Input
                    type="text"
                    placeholder="Search experts by name or expertise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-4 h-11 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "gap-2 px-4",
                  showFilters && "bg-muted"
                )}
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </motion.div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card rounded-xl p-5 border border-border/20 space-y-5"
                >
                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Specialization</p>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALIZATIONS.map((spec) => (
                        <button
                          key={spec.value}
                          onClick={() => toggleSpecialization(spec.value)}
                          className={cn(
                            "text-xs px-3 py-1.5 rounded-lg transition-all duration-200 border",
                            selectedSpecializations.includes(spec.value)
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : "bg-background/50 border-border/30 hover:bg-muted/50"
                          )}
                        >
                          {spec.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Availability</p>
                    <button
                      onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-lg transition-all duration-200 border",
                        showAvailableOnly
                          ? "bg-green-500 text-white border-green-500 shadow-sm"
                          : "bg-background/50 border-border/30 hover:bg-muted/50"
                      )}
                    >
                      Available Now
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Count */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <p className="text-sm text-muted-foreground">
                {filteredExperts.length} expert{filteredExperts.length !== 1 && "s"} available
              </p>
            </motion.div>

            {/* Expert List */}
            {filteredExperts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="glass-card rounded-2xl p-16 text-center border border-border/20"
              >
                <div className="max-w-sm mx-auto space-y-3">
                  <Search className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                  <div>
                    <p className="font-semibold mb-1">No experts found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="space-y-4"
              >
                {filteredExperts.map((expert, idx) => (
                  <motion.div
                    key={expert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + idx * 0.05 }}
                  >
                    <ExpertCard
                      expert={expert}
                      variant="default"
                      onClick={() => handleExpertClick(expert.id)}
                      onBook={() => handleBookClick(expert.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
