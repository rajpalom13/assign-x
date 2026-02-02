/**
 * @fileoverview Client Users page - Redesigned with agiready/saas design system
 * @module app/(dashboard)/users/page
 */

"use client"

import { useState, useMemo } from "react"
import { motion, type Variants } from "framer-motion"
import {
  Users,
  FolderKanban,
  IndianRupee,
  UserPlus,
  Search,
  SlidersHorizontal,
  X,
  ArrowUpRight,
  MoreHorizontal,
  Mail,
  Calendar,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatCard } from "@/components/shared/stat-card"
import { useUsers, useUserStats } from "@/hooks/use-users"
import { User, UserFilterStatus, UserSortOption } from "@/components/users/types"
import { UserDetails } from "@/components/users/user-details"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Animation variants
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  hover: {
    y: -4,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
}

// Generate mock sparkline data
function generateSparklineData(points: number, trend: "up" | "down" | "stable" = "up"): { date: string; value: number }[] {
  const data: { date: string; value: number }[] = []
  let value = trend === "up" ? 30 : trend === "down" ? 80 : 50

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * 20
    value = Math.max(10, Math.min(90, value + change))
    data.push({
      date: new Date(Date.now() - (points - i) * 24 * 60 * 60 * 1000).toISOString(),
      value,
    })
  }
  return data
}

// User Card Component
function EnhancedUserCard({
  user,
  onClick,
}: {
  user: User
  onClick?: () => void
}) {
  const [thirtyDaysAgo] = useState(() => Date.now() - 30 * 24 * 60 * 60 * 1000)

  const isActive = useMemo(() => {
    return (
      user.active_projects > 0 ||
      (user.last_active_at &&
        new Date(user.last_active_at).getTime() > thirtyDaysAgo)
    )
  }, [user.active_projects, user.last_active_at, thirtyDaysAgo])

  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const lastActiveText = user.last_active_at
    ? new Date(user.last_active_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Never"

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="group"
    >
      <Card
        className="bg-white border-border/50 rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-200 hover:shadow-lg hover:shadow-[var(--color-sage)]/5 hover:border-[var(--color-sage)]/30"
        onClick={onClick}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-12 w-12 ring-2 ring-[var(--color-sage)]/10">
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                  <AvatarFallback className="bg-[var(--color-sage)]/10 text-[var(--color-sage)] font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isActive && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[var(--color-sage)] border-2 border-white" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-sage)] transition-colors line-clamp-1">
                  {user.full_name}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="line-clamp-1">{user.email}</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>View Projects</DropdownMenuItem>
                <DropdownMenuItem>Send Message</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[var(--color-bg-muted)] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-1">
                <FolderKanban className="h-3.5 w-3.5" />
                Projects
              </div>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {user.total_projects}
              </p>
            </div>
            <div className="bg-[var(--color-bg-muted)] rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-1">
                <IndianRupee className="h-3.5 w-3.5" />
                Total Spent
              </div>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                ₹{user.total_spent.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <Clock className="h-3.5 w-3.5" />
              <span>Last active {lastActiveText}</span>
            </div>
            <Badge
              variant={isActive ? "default" : "outline"}
              className={cn(
                "text-xs",
                isActive
                  ? "bg-[var(--color-sage)]/10 text-[var(--color-sage)] hover:bg-[var(--color-sage)]/20 border-[var(--color-sage)]/20"
                  : "text-[var(--color-text-muted)] border-[var(--color-border-default)]"
              )}
            >
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Empty State
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-20 h-20 bg-[var(--color-sage)]/10 rounded-full flex items-center justify-center mb-4">
        <Users className="h-10 w-10 text-[var(--color-sage)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
        No users found
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] text-center max-w-sm mb-6">
        Try adjusting your search or filters to find what you're looking for
      </p>
      <Button
        variant="outline"
        onClick={onClear}
        className="border-[var(--color-sage)]/30 text-[var(--color-sage)] hover:bg-[var(--color-sage)]/10"
      >
        Clear Filters
      </Button>
    </motion.div>
  )
}

// Loading Skeleton
function UsersLoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="bg-white border-border/50 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function UsersPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<UserFilterStatus>("all")
  const [sortBy, setSortBy] = useState<UserSortOption>("recent")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Data fetching
  const { users, isLoading, error, totalCount } = useUsers()
  const { stats } = useUserStats(users)

  // Filter logic
  const [thirtyDaysAgo] = useState(() => Date.now() - 30 * 24 * 60 * 60 * 1000)

  const filteredUsers = useMemo(() => {
    let result = [...users]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.college?.toLowerCase().includes(query)
      )
    }

    if (filterStatus === "active") {
      result = result.filter(
        (u) =>
          u.active_projects > 0 ||
          (u.last_active_at &&
            new Date(u.last_active_at).getTime() > thirtyDaysAgo)
      )
    }
    if (filterStatus === "inactive") {
      result = result.filter(
        (u) =>
          u.active_projects === 0 &&
          (!u.last_active_at ||
            new Date(u.last_active_at).getTime() <= thirtyDaysAgo)
      )
    }

    const sortFns: Record<UserSortOption, (a: User, b: User) => number> = {
      name_asc: (a, b) => a.full_name.localeCompare(b.full_name),
      name_desc: (a, b) => b.full_name.localeCompare(a.full_name),
      projects_high: (a, b) => b.total_projects - a.total_projects,
      projects_low: (a, b) => a.total_projects - b.total_projects,
      spent_high: (a, b) => b.total_spent - a.total_spent,
      spent_low: (a, b) => a.total_spent - b.total_spent,
      recent: (a, b) =>
        new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime(),
    }
    return result.sort(sortFns[sortBy])
  }, [users, searchQuery, filterStatus, sortBy, thirtyDaysAgo])

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("")
    setFilterStatus("all")
    setSortBy("recent")
  }

  const hasActiveFilters = searchQuery || filterStatus !== "all"

  // Calculate new users this month
  const newUsersThisMonth = useMemo(() => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    return users.filter((u) => new Date(u.joined_at) >= startOfMonth).length
  }, [users])

  // Sparkline data
  const sparklines = useMemo(
    () => ({
      users: generateSparklineData(12, "up"),
      projects: generateSparklineData(12, "up"),
      revenue: generateSparklineData(12, "stable"),
      newUsers: generateSparklineData(12, "up"),
    }),
    []
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-sage)]/10 via-[var(--color-sage)]/5 to-transparent">
        {/* Decorative Blur Circles */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-sage)]/10 rounded-full blur-3xl" />
        <div className="absolute -top-48 right-1/4 w-72 h-72 bg-[var(--color-terracotta)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-[var(--color-sage)]/5 rounded-full blur-3xl" />

        <div className="relative z-10 px-6 py-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
              Client Users
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)]">
              View and manage client accounts
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={itemVariants}>
            <StatCard
              label="Total Users"
              value={stats.total}
              icon={<Users className="h-5 w-5" />}
              color="sage"
              sparklineData={sparklines.users}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              label="Active Projects"
              value={users.reduce((sum, u) => sum + u.active_projects, 0)}
              icon={<FolderKanban className="h-5 w-5" />}
              color="terracotta"
              sparklineData={sparklines.projects}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              label="Total Revenue"
              value={`₹${(stats.totalSpent / 1000).toFixed(1)}k`}
              icon={<IndianRupee className="h-5 w-5" />}
              color="primary"
              sparklineData={sparklines.revenue}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              label="New This Month"
              value={newUsersThisMonth}
              icon={<UserPlus className="h-5 w-5" />}
              color="accent"
              sparklineData={sparklines.newUsers}
            />
          </motion.div>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="bg-white border-border/50 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                  <Input
                    placeholder="Search by name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-11 bg-[var(--color-bg-muted)] border-[var(--color-border-default)] rounded-xl focus-visible:ring-[var(--color-sage)]"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select
                    value={filterStatus}
                    onValueChange={(v) =>
                      setFilterStatus(v as UserFilterStatus)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-[160px] h-11 bg-[var(--color-bg-muted)] border-[var(--color-border-default)] rounded-xl">
                      <span className="text-[var(--color-text-muted)]">
                        Status:
                      </span>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(v) =>
                      setSortBy(v as UserSortOption)
                    }
                  >
                    <SelectTrigger className="w-full sm:w-[180px] h-11 bg-[var(--color-bg-muted)] border-[var(--color-border-default)] rounded-xl">
                      <SlidersHorizontal className="h-4 w-4 mr-2 text-[var(--color-text-muted)]" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Newest First</SelectItem>
                      <SelectItem value="projects_high">
                        Most Projects
                      </SelectItem>
                      <SelectItem value="spent_high">
                        Highest Value
                      </SelectItem>
                      <SelectItem value="name_asc">Name A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/50">
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Active filters:
                  </span>
                  {searchQuery && (
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
                    >
                      Search: {searchQuery}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSearchQuery("")}
                      />
                    </Badge>
                  )}
                  {filterStatus !== "all" && (
                    <Badge
                      variant="secondary"
                      className="gap-1 bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] capitalize"
                    >
                      Status: {filterStatus}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setFilterStatus("all")}
                      />
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-[var(--color-sage)] hover:text-[var(--color-sage)] hover:bg-[var(--color-sage)]/10"
                  >
                    Clear All
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-[var(--color-text-muted)]">
            Showing{" "}
            <span className="font-medium text-[var(--color-text-primary)]">
              {filteredUsers.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-[var(--color-text-primary)]">
              {totalCount}
            </span>{" "}
            users
          </p>
        </motion.div>

        {/* Users Grid */}
        {isLoading ? (
          <UsersLoadingSkeleton />
        ) : error ? (
          <Card className="bg-white border-border/50 rounded-2xl">
            <CardContent className="p-8 text-center">
              <p className="text-red-500">Error loading users: {error.message}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredUsers.map((user) => (
              <EnhancedUserCard
                key={user.id}
                user={user}
                onClick={() => setSelectedUser(user)}
              />
            ))}
          </motion.div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <UserDetails
            user={selectedUser}
            open={!!selectedUser}
            onOpenChange={(open) => !open && setSelectedUser(null)}
            onChat={(userId) => console.log("Chat with user:", userId)}
          />
        )}
      </div>
    </div>
  )
}
