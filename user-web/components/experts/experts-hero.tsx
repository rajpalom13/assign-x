"use client";

/**
 * ExpertsHero - Premium hero section for experts page
 * Matches the glassmorphic design from projects-pro.tsx
 * Features subtle gradients, animated stats, and search functionality
 */

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Stethoscope,
  Star,
  Users,
  Clock,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ExpertsHeroProps {
  onSearch?: (query: string) => void;
  className?: string;
}

/**
 * Stat card data - matching projects-pro style
 */
const STATS = [
  {
    icon: Users,
    value: 500,
    suffix: "+",
    label: "Verified Doctors",
    gradient: "from-violet-400 to-purple-500",
    shadowColor: "shadow-violet-500/20",
    bgOverlay: "from-violet-100/40 to-purple-50/20 dark:from-violet-900/10",
  },
  {
    icon: Star,
    value: 4.9,
    suffix: "",
    label: "Average Rating",
    gradient: "from-amber-400 to-orange-500",
    shadowColor: "shadow-amber-500/20",
    bgOverlay: "from-amber-100/40 to-orange-50/20 dark:from-amber-900/10",
  },
  {
    icon: Zap,
    value: 10,
    suffix: "K+",
    label: "Sessions Completed",
    gradient: "from-emerald-400 to-teal-500",
    shadowColor: "shadow-emerald-500/20",
    bgOverlay: "from-emerald-100/40 to-teal-50/20 dark:from-emerald-900/10",
  },
  {
    icon: Clock,
    value: 24,
    suffix: "/7",
    label: "Available Support",
    gradient: "from-blue-400 to-cyan-500",
    shadowColor: "shadow-blue-500/20",
    bgOverlay: "from-blue-100/40 to-cyan-50/20 dark:from-blue-900/10",
  },
];

/**
 * Animated counter hook
 */
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (target - startValue) * eased;

      countRef.current = current;
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration]);

  return count;
}

/**
 * Stat card component - glassmorphic style matching projects-pro
 */
function StatCard({
  icon: Icon,
  value,
  suffix,
  label,
  gradient,
  shadowColor,
  bgOverlay,
  index,
}: {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  gradient: string;
  shadowColor: string;
  bgOverlay: string;
  index: number;
}) {
  const animatedValue = useCounter(value, 2000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
      whileHover={{ y: -2 }}
      className="group relative"
    >
      {/* Glassmorphic card matching projects-pro */}
      <div className="relative overflow-hidden rounded-[20px] p-4 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:bg-white/90 dark:hover:bg-white/10">
        {/* Subtle gradient overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br pointer-events-none rounded-[20px] opacity-60",
            bgOverlay
          )}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div
            className={cn(
              "h-11 w-11 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0",
              gradient,
              shadowColor
            )}
          >
            <Icon className="h-5 w-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-foreground">
                {Number.isInteger(value)
                  ? Math.round(animatedValue)
                  : animatedValue.toFixed(1)}
              </span>
              <span className="text-lg font-bold text-foreground/70">
                {suffix}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * ExpertsHero component - matches projects-pro design
 */
export function ExpertsHero({ onSearch, className }: ExpertsHeroProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Content - no background here, background is on page level */}
      <div className="relative z-10 w-full py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Stethoscope className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-foreground/90 mb-2">
            Connect with{" "}
            <span className="font-semibold text-foreground">Top Doctors</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get personalized consultations from verified medical professionals,
            available 24/7 for your health needs
          </p>
        </motion.div>

        {/* Search Bar - glassmorphic style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-10"
        >
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              strokeWidth={2}
            />
            <input
              type="text"
              placeholder="Search doctors, specializations, conditions..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-12 pl-11 pr-4 text-sm bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
        </motion.div>

        {/* Stats Grid - matching projects-pro card style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExpertsHero;
