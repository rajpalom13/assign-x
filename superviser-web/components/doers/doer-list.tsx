/**
 * @fileoverview Doer listing component with filtering, sorting, and search.
 * @module components/doers/doer-list
 */

"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Users, X } from "lucide-react"
import { useDoers, useBlacklistedDoers } from "@/hooks"
import type { DoerWithProfile } from "@/types/database"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { DoerCard } from "./doer-card"
import { DoerDetails } from "./doer-details"
import { Doer, DoerFilterStatus, DoerSortOption } from "./types"

const SUBJECT_OPTIONS = [
  "All Subjects",
  "Computer Science",
  "Business Administration",
  "Environmental Science",
  "Finance",
  "Psychology",
  "Marketing",
  "Nursing",
  "Engineering",
  "Mathematics",
]

/** Stats card component for doer counts */
function StatCard({ label, value, color, isActive, onClick, isLoading }: {
  label: string
  value: number
  color: string
  isActive: boolean
  onClick: () => void
  isLoading?: boolean
}) {
  return (
    <Card
      className={`cursor-pointer hover:bg-muted/50 transition-colors ${isActive ? "ring-2 ring-primary" : ""}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-12 mb-1" />
            <Skeleton className="h-4 w-20" />
          </>
        ) : (
          <>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Main doer list component with comprehensive filtering and search capabilities.
 */
export function DoerList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<DoerFilterStatus>("all")
  const [subjectFilter, setSubjectFilter] = useState("All Subjects")
  const [sortOption, setSortOption] = useState<DoerSortOption>("rating_high")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [selectedDoer, setSelectedDoer] = useState<Doer | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Use real data hooks
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
    skills: [], // Would need to fetch from doer_skills table
    subjects: [], // Would need to fetch from doer_subjects table
    bio: doer.bio ?? undefined,
    rating: doer.average_rating || 0,
    total_reviews: 0, // Would need to calculate
    total_projects: doer.total_projects_completed || 0,
    completed_projects: doer.total_projects_completed || 0,
    active_projects: 0, // Would need to calculate
    success_rate: 95, // Would need to calculate
    joined_at: doer.created_at || new Date().toISOString(),
    is_available: doer.is_available ?? false,
    is_verified: doer.is_activated ?? false,
    is_blacklisted: false, // Will be set in useMemo below based on blacklistedDoers
    blacklist_reason: undefined, // Will be set in useMemo below based on blacklistedDoers
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

  /** Computed stats for quick filtering */
  const stats = useMemo(() => ({
    total: doers.length,
    available: doers.filter((d) => d.is_available && !d.is_blacklisted).length,
    busy: doers.filter((d) => !d.is_available && !d.is_blacklisted).length,
    blacklisted: blacklistedDoers.length,
  }), [doers, blacklistedDoers])

  /** Filtered and sorted doers list */
  const filteredDoers = useMemo(() => {
    let result = [...doers]

    // Status filter
    if (statusFilter === "available") result = result.filter((d) => d.is_available && !d.is_blacklisted)
    else if (statusFilter === "busy") result = result.filter((d) => !d.is_available && !d.is_blacklisted)
    else if (statusFilter === "blacklisted") result = result.filter((d) => d.is_blacklisted)

    // Subject filter
    if (subjectFilter !== "All Subjects") {
      result = result.filter((d) => d.subjects.includes(subjectFilter))
    }

    // Verified filter
    if (verifiedOnly) result = result.filter((d) => d.is_verified)

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
      name_asc: (a, b) => a.full_name.localeCompare(b.full_name),
      name_desc: (a, b) => b.full_name.localeCompare(a.full_name),
      rating_high: (a, b) => b.rating - a.rating,
      rating_low: (a, b) => a.rating - b.rating,
      projects_high: (a, b) => b.completed_projects - a.completed_projects,
      projects_low: (a, b) => a.completed_projects - b.completed_projects,
      recent: (a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime(),
    }
    return result.sort(sortFns[sortOption])
  }, [doers, searchQuery, statusFilter, subjectFilter, sortOption, verifiedOnly])

  const hasActiveFilters = searchQuery || statusFilter !== "all" || subjectFilter !== "All Subjects" || verifiedOnly

  /** Handle doer selection for details view */
  const handleDoerSelect = (doer: Doer) => {
    setSelectedDoer(doer)
    setDetailsOpen(true)
  }

  /** Clear all filters */
  const clearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSubjectFilter("All Subjects")
    setVerifiedOnly(false)
  }

  const LoadingCard = () => (
    <div className="p-6 rounded-lg border bg-card space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Doers" value={stats.total} color="" isActive={statusFilter === "all"} onClick={() => setStatusFilter("all")} isLoading={isLoading} />
        <StatCard label="Available" value={stats.available} color="text-green-600" isActive={statusFilter === "available"} onClick={() => setStatusFilter("available")} isLoading={isLoading} />
        <StatCard label="Busy" value={stats.busy} color="text-amber-600" isActive={statusFilter === "busy"} onClick={() => setStatusFilter("busy")} isLoading={isLoading} />
        <StatCard label="Blacklisted" value={stats.blacklisted} color="text-red-600" isActive={statusFilter === "blacklisted"} onClick={() => setStatusFilter("blacklisted")} isLoading={isLoading} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search doers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                {SUBJECT_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={(v) => setSortOption(v as DoerSortOption)}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rating_high">Rating: High to Low</SelectItem>
                <SelectItem value="rating_low">Rating: Low to High</SelectItem>
                <SelectItem value="projects_high">Projects: Most</SelectItem>
                <SelectItem value="name_asc">Name: A-Z</SelectItem>
                <SelectItem value="recent">Recently Joined</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch id="verified" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
              <Label htmlFor="verified" className="text-sm">Verified only</Label>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {statusFilter !== "all" && <Badge variant="secondary">{statusFilter}<X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setStatusFilter("all")} /></Badge>}
                {subjectFilter !== "All Subjects" && <Badge variant="secondary">{subjectFilter}<X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSubjectFilter("All Subjects")} /></Badge>}
                {verifiedOnly && <Badge variant="secondary">Verified<X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setVerifiedOnly(false)} /></Badge>}
                {searchQuery && <Badge variant="secondary">&quot;{searchQuery}&quot;<X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchQuery("")} /></Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doer Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <LoadingCard key={i} />)}
        </div>
      ) : filteredDoers.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No doers found</h3>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDoers.map((doer) => (
            <DoerCard key={doer.id} doer={doer} onClick={() => handleDoerSelect(doer)} />
          ))}
        </div>
      )}

      {/* Doer Details Sheet */}
      <DoerDetails doer={selectedDoer} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </div>
  )
}
