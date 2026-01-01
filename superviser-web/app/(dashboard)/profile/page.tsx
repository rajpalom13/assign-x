/**
 * @fileoverview Supervisor profile page with account info, statistics, reviews, and settings management.
 * Uses real data from Supabase database via useSupervisor hook.
 * @module app/(dashboard)/profile/page
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import {
  User,
  Star,
  UserX,
  BarChart3,
  Phone,
  LogOut,
  ArrowLeft,
  Edit,
  Loader2,
  AlertCircle,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  ProfileEditor,
  MyReviews,
  DoerBlacklist,
  StatsDashboard,
  SupportContact,
  SupervisorProfile,
} from "@/components/profile"
import { useSupervisor, useSupervisorStats, useAuth } from "@/hooks"
import { createClient } from "@/lib/supabase/client"

type ProfileView =
  | "overview"
  | "edit"
  | "reviews"
  | "blacklist"
  | "stats"
  | "support"

interface MenuItemProps {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
  badge?: string
  variant?: "default" | "destructive"
  disabled?: boolean
}

function MenuItem({
  icon,
  label,
  description,
  onClick,
  badge,
  variant = "default",
  disabled = false,
}: MenuItemProps) {
  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md cursor-pointer group",
        variant === "destructive" && "hover:border-destructive/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              variant === "default" && "bg-primary/10 text-primary",
              variant === "destructive" && "bg-destructive/10 text-destructive"
            )}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "font-medium group-hover:text-primary transition-colors",
                  variant === "destructive" && "group-hover:text-destructive"
                )}
              >
                {label}
              </p>
              {badge && <Badge variant="secondary">{badge}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:ml-auto">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { supervisor, profile, isLoading: supervisorLoading, error: supervisorError, refetch } = useSupervisor()
  const { stats, isLoading: statsLoading } = useSupervisorStats()
  const { signOut } = useAuth()

  const [expertiseAreas, setExpertiseAreas] = useState<string[]>([])
  const [expertiseLoading, setExpertiseLoading] = useState(true)
  const [blacklistCount, setBlacklistCount] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const [activeView, setActiveView] = useState<ProfileView>("overview")

  // Fetch expertise areas
  useEffect(() => {
    async function fetchExpertise() {
      if (!supervisor?.id) {
        setExpertiseLoading(false)
        return
      }

      const supabase = createClient()
      try {
        const { data, error } = await supabase
          .from("supervisor_expertise")
          .select(`
            subjects (
              name
            )
          `)
          .eq("supervisor_id", supervisor.id)

        if (error) throw error

        const areas = data
          ?.map((item: { subjects: { name: string } | null }) => item.subjects?.name)
          .filter(Boolean) as string[]
        setExpertiseAreas(areas || [])
      } catch (err) {
        console.error("Failed to fetch expertise areas:", err)
      } finally {
        setExpertiseLoading(false)
      }
    }

    fetchExpertise()
  }, [supervisor?.id])

  // Fetch blacklist count
  useEffect(() => {
    async function fetchBlacklistCount() {
      if (!supervisor?.id) return

      const supabase = createClient()
      try {
        const { count, error } = await supabase
          .from("supervisor_blacklisted_doers")
          .select("*", { count: "exact", head: true })
          .eq("supervisor_id", supervisor.id)

        if (!error && count !== null) {
          setBlacklistCount(count)
        }
      } catch (err) {
        console.error("Failed to fetch blacklist count:", err)
      }
    }

    fetchBlacklistCount()
  }, [supervisor?.id])

  // Build the SupervisorProfile object from real data
  const buildProfile = useCallback((): SupervisorProfile | null => {
    if (!supervisor || !profile) return null

    return {
      id: supervisor.id,
      full_name: profile.full_name || "Unknown",
      email: profile.email || "",
      phone: profile.phone || "",
      avatar_url: profile.avatar_url || undefined,
      qualification: supervisor.qualification || "",
      years_of_experience: supervisor.years_of_experience || 0,
      expertise_areas: expertiseAreas,
      bio: undefined, // Bio not stored in current schema
      rating: supervisor.average_rating || 0,
      total_reviews: supervisor.total_reviews || 0,
      joined_at: profile.created_at || new Date().toISOString(),
      is_available: supervisor.is_available ?? true,
      bank_details: {
        bank_name: supervisor.bank_name || "",
        account_number: supervisor.bank_account_number
          ? `****${supervisor.bank_account_number.slice(-4)}`
          : "",
        ifsc_code: supervisor.bank_ifsc_code || "",
        upi_id: supervisor.upi_id || undefined,
        account_holder_name: supervisor.bank_account_name || "",
      },
    }
  }, [supervisor, profile, expertiseAreas])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      toast.success("Logged out successfully")
    } catch (err) {
      console.error("Logout error:", err)
      toast.error("Failed to log out. Please try again.")
      setIsLoggingOut(false)
    }
  }

  const handleProfileSave = async (updatedProfile: SupervisorProfile) => {
    if (!profile?.id || !supervisor?.id) {
      toast.error("Profile data not loaded. Please refresh the page.")
      return
    }

    const supabase = createClient()

    try {
      // Update profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: updatedProfile.full_name,
          phone: updatedProfile.phone,
        })
        .eq("id", profile.id)

      if (profileError) throw profileError

      // Update supervisor table
      const { error: supervisorError } = await supabase
        .from("supervisors")
        .update({
          qualification: updatedProfile.qualification,
          years_of_experience: updatedProfile.years_of_experience,
          bank_name: updatedProfile.bank_details.bank_name,
          bank_account_name: updatedProfile.bank_details.account_holder_name,
          bank_ifsc_code: updatedProfile.bank_details.ifsc_code,
          upi_id: updatedProfile.bank_details.upi_id || null,
        })
        .eq("id", supervisor.id)

      if (supervisorError) throw supervisorError

      await refetch()
      toast.success("Profile updated successfully")
      setActiveView("overview")
    } catch (err) {
      console.error("Failed to update profile:", err)
      toast.error("Failed to update profile")
      throw err
    }
  }

  const isLoading = supervisorLoading || expertiseLoading

  // Error state
  if (supervisorError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load profile</h3>
              <p className="text-muted-foreground mb-4">
                {supervisorError.message || "An error occurred while loading your profile"}
              </p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <ProfileSkeleton />
      </div>
    )
  }

  const profileData = buildProfile()

  if (!profileData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Profile not found</h3>
              <p className="text-muted-foreground">
                Your supervisor profile could not be found. Please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case "edit":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("overview")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <ProfileEditor
              profile={profileData}
              onSave={handleProfileSave}
              onCancel={() => setActiveView("overview")}
            />
          </div>
        )
      case "reviews":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("overview")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <MyReviews />
          </div>
        )
      case "blacklist":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("overview")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <DoerBlacklist />
          </div>
        )
      case "stats":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("overview")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <StatsDashboard />
          </div>
        )
      case "support":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("overview")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <SupportContact />
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar and Basic Info */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profileData.avatar_url} alt={profileData.full_name} />
                      <AvatarFallback className="text-2xl">
                        {profileData.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{profileData.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{profileData.qualification}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{profileData.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({profileData.total_reviews} reviews)
                          </span>
                        </div>
                        <Badge variant={profileData.is_available ? "default" : "secondary"}>
                          {profileData.is_available ? "Available" : "Busy"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:ml-auto">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">
                        {statsLoading ? "..." : stats?.totalProjects || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">
                        {statsLoading ? "..." : `${Math.round((stats?.completedProjects || 0) / Math.max(stats?.totalProjects || 1, 1) * 100)}%`}
                      </p>
                      <p className="text-xs text-muted-foreground">Success Rate</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">{profileData.years_of_experience}+</p>
                      <p className="text-xs text-muted-foreground">Years Exp</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-2xl font-bold">
                        {statsLoading ? "..." : stats?.totalDoers || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Doers Worked</p>
                    </div>
                  </div>
                </div>

                {/* Expertise Areas */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Areas of Expertise</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.expertise_areas.length > 0 ? (
                      profileData.expertise_areas.map((area) => (
                        <Badge key={area} variant="secondary">
                          {area}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No expertise areas added yet
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <div className="mt-4">
                  <Button variant="outline" onClick={() => setActiveView("edit")}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <div className="grid gap-4 md:grid-cols-2">
              <MenuItem
                icon={<BarChart3 className="h-5 w-5" />}
                label="Statistics Dashboard"
                description="View your performance metrics and stats"
                onClick={() => setActiveView("stats")}
              />
              <MenuItem
                icon={<Star className="h-5 w-5" />}
                label="My Reviews"
                description="See feedback from clients"
                onClick={() => setActiveView("reviews")}
                badge={`${profileData.total_reviews}`}
              />
              <MenuItem
                icon={<UserX className="h-5 w-5" />}
                label="Doer Blacklist"
                description="Manage flagged experts"
                onClick={() => setActiveView("blacklist")}
                badge={blacklistCount > 0 ? `${blacklistCount}` : undefined}
              />
              <MenuItem
                icon={<Phone className="h-5 w-5" />}
                label="Contact Support"
                description="Get help from our team"
                onClick={() => setActiveView("support")}
              />
            </div>

            <Separator />

            {/* Logout */}
            <Card
              className={cn(
                "transition-all hover:shadow-md cursor-pointer group hover:border-destructive/50",
                isLoggingOut && "opacity-50 cursor-not-allowed"
              )}
              onClick={isLoggingOut ? undefined : handleLogout}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-destructive/10 text-destructive">
                    {isLoggingOut ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LogOut className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium group-hover:text-destructive transition-colors">
                      {isLoggingOut ? "Logging out..." : "Log Out"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sign out of your account
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {activeView === "overview" && (
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      )}

      {renderContent()}
    </div>
  )
}
