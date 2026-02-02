/**
 * @fileoverview Expert Doers Management Page - Premium SaaS Design
 * 
 * A comprehensive doer management page with:
 * - Gradient hero section with decorative blur circles
 * - Animated stat cards with sparklines
 * - Advanced filtering and search
 * - Card-based grid layout with Framer Motion animations
 * - Empty state with CTA
 * 
 * @module app/(dashboard)/doers/page
 */

"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Star,
  Briefcase,
  Clock,
  CheckCircle2,
  X,
  MessageSquare,
  Eye,
  Award,
  TrendingUp,
  AlertTriangle,
  Ban,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDoers, useBlacklistedDoers } from "@/hooks"
import type { DoerWithProfile } from "@/types/database"
import { DoerDetails } from "@/components/doers/doer-details"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

interface Doer {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  qualification: string
  years_of_experience: number
  skills: string[]
  subjects: string[]
  bio?: string
  rating: number
  total_reviews: number
  total_projects: number
  completed_projects: number
  active_projects: number
  success_rate: number
  total_earnings?: number
  joined_at: string
  is_available: boolean
  is_verified: boolean
  is_blacklisted?: boolean
  blacklist_reason?: string
  last_active_at?: string
}

type DoerFilterStatus = "all" | "available" | "busy" | "blacklisted"
type DoerSortOption = "rating_high" | "rating_low" | "projects_high" | "earnings_high" | "recent"
type RatingFilter = "all" | "4plus" | "4_5plus" | "5"

// ============================================================================
// Animation Constants
// ============================================================================

const EASE = [0.16, 1, 0.3, 1] as const
const DURATIONS = { fast: 0.2, entrance: 0.5, counter: 0.8 }

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

// ============================================================================
// Animated Counter Hook
// ============================================================================

function useCountUp(end: number, duration: number = 800, delay: number = 0) {
  const prefersReducedMotion = useReducedMotion()
  const [count, setCount] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    if (prefersReducedMotion) {
      const timeoutId = setTimeout(() => setCount(end), delay)
      return () => clearTimeout(timeoutId)
    }

    if (end === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(0)
      return
    }

    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp
        const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
        const easeOutExpo = 1 - Math.pow(2, -10 * progress)
        if (progress >= 1) {
          setCount(end)
          return
        }
        setCount(Math.floor(easeOutExpo * end))
        requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      startTimeRef.current = null
    }
  }, [end, duration, delay, prefersReducedMotion])

  return count
}

function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const count = useCountUp(value, 800, 100)
  return <span className="tabular-nums">{prefix}{count.toLocaleString()}{suffix}</span>
}

// ============================================================================
// Sparkline Component
// ============================================================================

function Sparkline({ data, color = "var(--color-sage)", height = 30 }: { data: number[]; color?: string; height?: number }) {
  const prefersReducedMotion = useReducedMotion()
  if (data.length < 2) return <div style={{ height }} />

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((val, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 100 - ((val - min) / range) * 80 - 10,
  }))

  const pathD = points.reduce((acc, p, i) => 
    acc + (i === 0 ? `M ${p.x},${p.y}` : ` L ${p.x},${p.y}`), "")

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={prefersReducedMotion ? {} : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  )
}

// ============================================================================
// Animated Background Component
// ============================================================================

function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary gradient blob - top right */}
      <div className="absolute -top-20 -right-20 w-[450px] h-[450px] bg-gradient-to-bl from-[var(--color-sage)]/15 via-[var(--color-sage)]/10 to-transparent rounded-full blur-3xl animate-morph" />
      {/* Secondary gradient blob - bottom left */}
      <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] bg-gradient-to-tr from-[var(--color-terracotta)]/10 via-amber-400/[0.08] to-transparent rounded-full blur-3xl animate-morph-delayed" />
      {/* Accent orb */}
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-to-br from-emerald-400/[0.08] to-teal-400/[0.05] rounded-full blur-[60px]" />
      
      {/* Floating particles */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-[var(--color-sage)]/20' : 'bg-[var(--color-terracotta)]/20'}`}
          style={{
            left: `${15 + i * 20}%`,
            top: `${25 + (i % 2) * 35}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Hero Section Component
// ============================================================================

function HeroSection({
  stats,
  isLoading,
  onAddDoer,
}: {
  stats: { total: number; available: number; averageRating: number; topPerformers: number }
  isLoading: boolean
  onAddDoer: () => void
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.entrance, ease: EASE }}
      className="relative rounded-3xl overflow-hidden mb-8"
      style={{
        background: "linear-gradient(135deg, from-[var(--color-sage)]/10 via-[var(--color-sage)]/5 to-transparent)",
      }}
    >
      {/* Gradient Background */}
      <div 
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(74, 103, 65, 0.1) 0%, rgba(74, 103, 65, 0.05) 50%, transparent 100%)",
        }}
      />
      <AnimatedBackground />

      <div className="relative z-10 px-8 py-10">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div>
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center gap-3 mb-3"
            >
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                style={{
                  background: "linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-light) 100%)",
                  boxShadow: "0 8px 24px rgba(74, 103, 65, 0.25)",
                }}
              >
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                Expert Doers
              </h1>
            </motion.div>
            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[var(--color-text-secondary)] max-w-md"
            >
              Manage your expert network - view ratings, availability, and assign projects
            </motion.p>
          </div>

          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              onClick={onAddDoer}
              className="gap-2 rounded-xl px-6 py-5 text-sm font-semibold shadow-lg shadow-[var(--color-sage)]/20 hover:shadow-xl hover:shadow-[var(--color-sage)]/30 transition-all"
              style={{
                background: "linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-light) 100%)",
              }}
            >
              <UserPlus className="h-4 w-4" />
              Add Doer
            </Button>
          </motion.div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Doers", value: stats.total, icon: Users, color: "var(--color-sage)" },
            { label: "Available Now", value: stats.available, icon: CheckCircle2, color: "var(--color-terracotta)" },
            { label: "Average Rating", value: stats.averageRating, icon: Star, color: "#D4A853", suffix: "" },
            { label: "Top Performers", value: stats.topPerformers, icon: Award, color: "#6FCF97" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-[var(--color-border-default)]/50 hover:bg-white/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)]">{stat.label}</p>
                  <p className="text-xl font-bold text-[var(--color-text-primary)]">
                    {isLoading ? (
                      <Skeleton className="h-6 w-12" />
                    ) : (
                      <AnimatedCounter value={stat.value} suffix={stat.suffix || ""} />
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom gradient line */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, var(--color-sage)/20 50%, transparent 100%)",
          }}
        />
      </div>
    </motion.div>
  )
}

// ============================================================================
// Stats Cards Row Component
// ============================================================================

function StatsCardsRow({
  stats,
  isLoading,
  onStatClick,
}: {
  stats: { total: number; available: number; averageRating: number; projectsCompleted: number }
  isLoading: boolean
  onStatClick: (filter: DoerFilterStatus) => void
}) {
  const prefersReducedMotion = useReducedMotion()

  const statCards = [
    {
      label: "Total Doers",
      value: stats.total,
      icon: Users,
      color: "var(--color-sage)",
      sparkline: [40, 55, 45, 60, 55, 70, 65, stats.total],
      filter: "all" as DoerFilterStatus,
    },
    {
      label: "Available Now",
      value: stats.available,
      icon: CheckCircle2,
      color: "var(--color-terracotta)",
      sparkline: [20, 25, 30, 28, 35, 32, 38, stats.available],
      filter: "available" as DoerFilterStatus,
    },
    {
      label: "Average Rating",
      value: stats.averageRating,
      icon: Star,
      color: "#D4A853",
      sparkline: [4.2, 4.3, 4.1, 4.4, 4.3, 4.5, 4.4, stats.averageRating],
      isDecimal: true,
      filter: "all" as DoerFilterStatus,
    },
    {
      label: "Projects Completed",
      value: stats.projectsCompleted,
      icon: Briefcase,
      color: "#6FCF97",
      sparkline: [120, 145, 130, 160, 155, 180, 175, stats.projectsCompleted],
      filter: "all" as DoerFilterStatus,
    },
  ]

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white rounded-2xl p-5 border border-[var(--color-border-default)]/50 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
          onClick={() => onStatClick(stat.filter)}
        >
          <div className="flex items-center justify-between mb-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: `${stat.color}15` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <TrendingUp className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="mb-2">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">
                {stat.isDecimal ? stat.value.toFixed(1) : <AnimatedCounter value={stat.value} />}
              </p>
            )}
          </div>
          
          <p className="text-sm text-[var(--color-text-muted)] mb-3">{stat.label}</p>
          
          {/* Sparkline */}
          <div className="mt-auto">
            <Sparkline data={stat.sparkline} color={stat.color} height={30} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ============================================================================
// Filter & Search Bar Component
// ============================================================================

function FilterSearchBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  ratingFilter,
  onRatingChange,
  sortOption,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
}: {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: DoerFilterStatus
  onStatusChange: (value: DoerFilterStatus) => void
  ratingFilter: RatingFilter
  onRatingChange: (value: RatingFilter) => void
  sortOption: DoerSortOption
  onSortChange: (value: DoerSortOption) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-2xl p-5 border border-[var(--color-border-default)]/50 shadow-sm mb-8"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Search doers by name, skill, or subject..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 rounded-xl border-[var(--color-border-default)] bg-[var(--color-bg-light)] focus:bg-white transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Availability Filter */}
          <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as DoerFilterStatus)}>
            <SelectTrigger className="w-[140px] h-11 rounded-xl border-[var(--color-border-default)]">
              <Filter className="h-4 w-4 mr-2 text-[var(--color-text-muted)]" />
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="blacklisted">Blacklisted</SelectItem>
            </SelectContent>
          </Select>

          {/* Rating Filter */}
          <Select value={ratingFilter} onValueChange={(v) => onRatingChange(v as RatingFilter)}>
            <SelectTrigger className="w-[140px] h-11 rounded-xl border-[var(--color-border-default)]">
              <Star className="h-4 w-4 mr-2 text-[var(--color-text-muted)]" />
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="4plus">4+ Stars</SelectItem>
              <SelectItem value="4_5plus">4.5+ Stars</SelectItem>
              <SelectItem value="5">5 Stars Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortOption} onValueChange={(v) => onSortChange(v as DoerSortOption)}>
            <SelectTrigger className="w-[160px] h-11 rounded-xl border-[var(--color-border-default)]">
              <Clock className="h-4 w-4 mr-2 text-[var(--color-text-muted)]" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating_high">Rating: High to Low</SelectItem>
              <SelectItem value="rating_low">Rating: Low to High</SelectItem>
              <SelectItem value="projects_high">Most Projects</SelectItem>
              <SelectItem value="earnings_high">Highest Earnings</SelectItem>
              <SelectItem value="recent">Recently Joined</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border-default)]/50"
          >
            <span className="text-sm text-[var(--color-text-muted)]">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {statusFilter !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-[var(--color-bg-muted)]"
                  onClick={() => onStatusChange("all")}
                >
                  {statusFilter}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {ratingFilter !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-[var(--color-bg-muted)]"
                  onClick={() => onRatingChange("all")}
                >
                  {ratingFilter === "4plus" ? "4+ stars" : ratingFilter === "4_5plus" ? "4.5+ stars" : "5 stars"}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
              {searchQuery && (
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer hover:bg-[var(--color-bg-muted)]"
                  onClick={() => onSearchChange("")}
                >
                  &quot;{searchQuery}&quot;
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-[var(--color-sage)]">
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// Doer Card Component
// ============================================================================

function DoerCard({
  doer,
  onViewProfile,
  onAssignProject,
  onMessage,
  index,
}: {
  doer: Doer
  onViewProfile: () => void
  onAssignProject: () => void
  onMessage: () => void
  index: number
}) {
  const prefersReducedMotion = useReducedMotion()
  const initials = doer.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: EASE }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-[var(--color-border-default)]/50 shadow-sm hover:shadow-xl transition-all overflow-hidden group"
    >
      {/* Card Header with Avatar */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="h-14 w-14 ring-2 ring-white shadow-md">
              <AvatarImage src={doer.avatar_url} alt={doer.full_name} />
              <AvatarFallback 
                className="text-white font-semibold text-lg"
                style={{ background: "linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-light) 100%)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Availability Indicator */}
            <span 
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white",
                doer.is_blacklisted ? "bg-red-500" : doer.is_available ? "bg-[#22C55E]" : "bg-gray-400"
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-sage)] transition-colors">
                {doer.full_name}
              </h3>
              {doer.is_verified && (
                <CheckCircle2 className="h-4 w-4 text-[var(--color-sage)] shrink-0" />
              )}
              {doer.is_blacklisted && (
                <Ban className="h-4 w-4 text-red-500 shrink-0" />
              )}
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">{doer.qualification}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-3.5 w-3.5",
                      star <= Math.round(doer.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[var(--color-text-primary)]">{doer.rating.toFixed(1)}</span>
              <span className="text-xs text-[var(--color-text-muted)]">({doer.total_reviews})</span>
            </div>
          </div>
        </div>

        {/* Specialization Tags */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {doer.skills.slice(0, 3).map((skill) => (
            <Badge 
              key={skill} 
              variant="secondary" 
              className="text-xs font-normal px-2 py-0.5 bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border-0"
            >
              {skill}
            </Badge>
          ))}
          {doer.skills.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal px-2 py-0.5">
              +{doer.skills.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[var(--color-border-default)]/50">
          <div className="text-center">
            <p className="text-lg font-bold text-[var(--color-text-primary)]">{doer.completed_projects}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Projects</p>
          </div>
          <div className="text-center border-x border-[var(--color-border-default)]/50">
            <p className="text-lg font-bold text-[var(--color-text-primary)]">
              ${((doer.total_earnings || 0) / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">Earnings</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-[var(--color-text-primary)]">{doer.success_rate}%</p>
            <p className="text-xs text-[var(--color-text-muted)]">Completion</p>
          </div>
        </div>
      </div>

      {/* Availability Badge */}
      <div className="px-5 pb-3">
        {doer.is_blacklisted ? (
          <Badge 
            variant="destructive" 
            className="w-full justify-center gap-1 py-1.5 rounded-lg"
          >
            <AlertTriangle className="h-3 w-3" />
            Blacklisted
          </Badge>
        ) : doer.is_available ? (
          <Badge 
            className="w-full justify-center gap-1 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white"
          >
            <CheckCircle2 className="h-3 w-3" />
            Available Now
          </Badge>
        ) : (
          <Badge 
            variant="secondary" 
            className="w-full justify-center gap-1 py-1.5 rounded-lg bg-gray-100 text-gray-600"
          >
            <Clock className="h-3 w-3" />
            Currently Busy
          </Badge>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-1 p-2 bg-[var(--color-bg-muted)]/50">
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-lg text-xs font-medium hover:bg-white hover:text-[var(--color-sage)]"
          onClick={onViewProfile}
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          View
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-lg text-xs font-medium hover:bg-white hover:text-[var(--color-sage)]"
          onClick={onAssignProject}
          disabled={!doer.is_available || doer.is_blacklisted}
        >
          <Briefcase className="h-3.5 w-3.5 mr-1" />
          Assign
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-lg text-xs font-medium hover:bg-white hover:text-[var(--color-sage)]"
          onClick={onMessage}
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1" />
          Message
        </Button>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Empty State Component
// ============================================================================

function EmptyState({ onAddDoer }: { onAddDoer: () => void }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATIONS.entrance, ease: EASE }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {/* Animated illustration */}
      <div className="relative mb-8">
        <motion.div
          className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--color-sage)]/20 to-emerald-400/10 blur-xl"
          animate={prefersReducedMotion ? {} : {
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-[var(--color-border-default)]/50 shadow-lg"
          animate={prefersReducedMotion ? {} : {
            y: [0, -6, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Users className="h-10 w-10 text-[var(--color-text-muted)]" />
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--color-sage)] flex items-center justify-center shadow-lg"
            animate={prefersReducedMotion ? {} : {
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <UserPlus className="w-4 h-4 text-white" />
          </motion.div>
        </motion.div>
      </div>

      <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
        No experts found
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-8 leading-relaxed">
        Try adjusting your filters or search criteria, or add a new expert to your network.
      </p>

      <Button
        onClick={onAddDoer}
        className="gap-2 rounded-xl px-6 py-5 text-sm font-semibold"
        style={{
          background: "linear-gradient(135deg, var(--color-sage) 0%, var(--color-sage-light) 100%)",
        }}
      >
        <UserPlus className="h-4 w-4" />
        Add Expert
      </Button>
    </motion.div>
  )
}

// ============================================================================
// Loading Skeleton Component
// ============================================================================

function LoadingCard() {
  return (
    <Card className="rounded-2xl border border-[var(--color-border-default)]/50 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
        <Skeleton className="h-8 w-full mt-3 rounded-lg" />
        <div className="grid grid-cols-3 gap-1 mt-2">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Main Page Component
// ============================================================================

export default function DoersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<DoerFilterStatus>("all")
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all")
  const [sortOption, setSortOption] = useState<DoerSortOption>("rating_high")
  const [selectedDoer, setSelectedDoer] = useState<Doer | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Data hooks
  const { doers: allDoers, isLoading: allLoading } = useDoers()
  const { doers: blacklistedDoers, isLoading: blacklistLoading } = useBlacklistedDoers()

  const isLoading = allLoading || blacklistLoading

  // Transform database doers to component format
  const transformDoer = (doer: DoerWithProfile): Doer => ({
    id: doer.id,
    full_name: doer.profiles?.full_name || "Unknown",
    email: doer.profiles?.email || "",
    phone: doer.profiles?.phone ?? undefined,
    avatar_url: doer.profiles?.avatar_url ?? undefined,
    qualification: doer.qualification || "Graduate",
    years_of_experience: doer.years_of_experience || 0,
    skills: doer.skills || [],
    subjects: doer.subjects || [],
    bio: doer.bio ?? undefined,
    rating: doer.average_rating || 0,
    total_reviews: doer.total_reviews || 0,
    total_projects: doer.total_projects_completed || 0,
    completed_projects: doer.total_projects_completed || 0,
    active_projects: doer.active_projects_count || 0,
    success_rate: doer.success_rate || 95,
    total_earnings: doer.total_earnings || 0,
    joined_at: doer.created_at || new Date().toISOString(),
    is_available: doer.is_available ?? false,
    is_verified: doer.is_activated ?? false,
    is_blacklisted: false,
    last_active_at: doer.updated_at ?? undefined,
  })

  const doers = useMemo(() => {
    const transformed = allDoers.map(transformDoer)
    const blacklistedMap = new Map(blacklistedDoers.map((d) => [d.id, d.blacklistReason]))

    return transformed.map(d => ({
      ...d,
      is_blacklisted: blacklistedMap.has(d.id),
      blacklist_reason: blacklistedMap.get(d.id),
    }))
  }, [allDoers, blacklistedDoers])

  // Stats calculation
  const stats = useMemo(() => {
    const available = doers.filter((d) => d.is_available && !d.is_blacklisted).length
    const ratings = doers.filter((d) => !d.is_blacklisted).map((d) => d.rating)
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    const topPerformers = doers.filter((d) => d.rating >= 4.5 && !d.is_blacklisted).length
    const projectsCompleted = doers.reduce((acc, d) => acc + d.completed_projects, 0)

    return {
      total: doers.length,
      available,
      averageRating,
      topPerformers,
      projectsCompleted,
    }
  }, [doers])

  // Filter and sort doers
  const filteredDoers = useMemo(() => {
    let result = [...doers]

    // Status filter
    if (statusFilter === "available") result = result.filter((d) => d.is_available && !d.is_blacklisted)
    else if (statusFilter === "busy") result = result.filter((d) => !d.is_available && !d.is_blacklisted)
    else if (statusFilter === "blacklisted") result = result.filter((d) => d.is_blacklisted)

    // Rating filter
    if (ratingFilter === "4plus") result = result.filter((d) => d.rating >= 4)
    else if (ratingFilter === "4_5plus") result = result.filter((d) => d.rating >= 4.5)
    else if (ratingFilter === "5") result = result.filter((d) => d.rating === 5)

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((d) =>
        d.full_name.toLowerCase().includes(query) ||
        d.email.toLowerCase().includes(query) ||
        d.skills.some((s) => s.toLowerCase().includes(query)) ||
        d.subjects.some((s) => s.toLowerCase().includes(query))
      )
    }

    // Sorting
    const sortFns: Record<DoerSortOption, (a: Doer, b: Doer) => number> = {
      rating_high: (a, b) => b.rating - a.rating,
      rating_low: (a, b) => a.rating - b.rating,
      projects_high: (a, b) => b.completed_projects - a.completed_projects,
      earnings_high: (a, b) => (b.total_earnings || 0) - (a.total_earnings || 0),
      recent: (a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime(),
    }
    return result.sort(sortFns[sortOption])
  }, [doers, searchQuery, statusFilter, ratingFilter, sortOption])

  const hasActiveFilters = Boolean(searchQuery) || statusFilter !== "all" || ratingFilter !== "all"

  const handleDoerSelect = (doer: Doer) => {
    setSelectedDoer(doer)
    setDetailsOpen(true)
  }

  const handleAddDoer = () => {
    // TODO: Implement add doer functionality
    console.log("Add doer clicked")
  }

  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setRatingFilter("all")
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #faf8f5 0%, #f5f2ed 50%, #edf1e8 100%)",
          }}
        />
        <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-gradient-to-bl from-[var(--color-sage)]/[0.15] via-[var(--color-sage)]/[0.08] to-transparent rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-gradient-to-tr from-[var(--color-terracotta)]/[0.12] via-amber-400/[0.06] to-transparent rounded-full blur-[80px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-7xl mx-auto p-6 md:p-8"
      >
        {/* Hero Section */}
        <HeroSection 
          stats={stats} 
          isLoading={isLoading} 
          onAddDoer={handleAddDoer} 
        />

        {/* Stats Cards Row */}
        <StatsCardsRow 
          stats={stats} 
          isLoading={isLoading}
          onStatClick={setStatusFilter}
        />

        {/* Filter & Search Bar */}
        <FilterSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          ratingFilter={ratingFilter}
          onRatingChange={setRatingFilter}
          sortOption={sortOption}
          onSortChange={setSortOption}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {/* Doer Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        ) : filteredDoers.length === 0 ? (
          <Card className="rounded-2xl border border-[var(--color-border-default)]/50">
            <CardContent>
              <EmptyState onAddDoer={handleAddDoer} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredDoers.map((doer, index) => (
                <DoerCard
                  key={doer.id}
                  doer={doer}
                  index={index}
                  onViewProfile={() => handleDoerSelect(doer)}
                  onAssignProject={() => handleDoerSelect(doer)}
                  onMessage={() => handleDoerSelect(doer)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Doer Details Sheet */}
        <DoerDetails 
          doer={selectedDoer} 
          open={detailsOpen} 
          onOpenChange={setDetailsOpen} 
        />
      </motion.div>
    </div>
  )
}
