'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  CreditCard,
  Building2,
  Star,
  TrendingUp,
  BadgeCheck,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit2,
  Wallet,
  Shield,
  Award,
  Clock,
  IndianRupee,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  Scorecard,
  EditProfile,
  PaymentHistory,
  BankSettings,
  SupportSection,
  RequestPayout,
  EarningsGraph,
  RatingBreakdown,
  SkillVerification,
} from '@/components/profile'
import { useAuth } from '@/hooks/useAuth'
import { getDoerProfile } from '@/services/profile.service'
import { signOut } from '@/services/auth.service'
import { toast } from 'sonner'
import { ROUTES } from '@/lib/constants'
import type { Profile, Doer, DoerStats } from '@/types/database'

/** Profile tab types */
type ProfileTab =
  | 'overview'
  | 'edit'
  | 'payments'
  | 'bank'
  | 'earnings'
  | 'ratings'
  | 'skills'
  | 'support'

/** Menu items */
const menuItems: { id: ProfileTab; label: string; icon: typeof User; description: string; color: string }[] = [
  { id: 'edit', label: 'Edit Profile', icon: Edit2, description: 'Update your information', color: 'teal' },
  { id: 'payments', label: 'Payment History', icon: CreditCard, description: 'View transactions', color: 'emerald' },
  { id: 'bank', label: 'Bank Settings', icon: Building2, description: 'Manage bank details', color: 'cyan' },
  { id: 'earnings', label: 'Earnings', icon: TrendingUp, description: 'View earnings graph', color: 'purple' },
  { id: 'ratings', label: 'Reviews & Ratings', icon: Star, description: 'See your feedback', color: 'amber' },
  { id: 'skills', label: 'Skill Verification', icon: BadgeCheck, description: 'Verify your skills', color: 'blue' },
  { id: 'support', label: 'Help & Support', icon: HelpCircle, description: 'Get assistance', color: 'slate' },
]

const colorMap: Record<string, { bg: string; icon: string }> = {
  teal: { bg: 'bg-teal-100 dark:bg-teal-900/30', icon: 'text-teal-600 dark:text-teal-400' },
  emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-600 dark:text-emerald-400' },
  cyan: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', icon: 'text-cyan-600 dark:text-cyan-400' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-600 dark:text-purple-400' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600 dark:text-amber-400' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', icon: 'text-blue-600 dark:text-blue-400' },
  slate: { bg: 'bg-slate-100 dark:bg-slate-800/50', icon: 'text-slate-600 dark:text-slate-400' },
}

/**
 * Profile page
 * Professional design with modern card layouts
 */
export default function ProfilePage() {
  const router = useRouter()
  const { user, doer: authDoer, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [doer, setDoer] = useState<Doer | null>(null)
  const [stats, setStats] = useState<DoerStats | null>(null)

  /**
   * Load profile data from Supabase
   */
  const loadProfile = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const data = await getDoerProfile(user.id)
      setProfile(data.profile)
      setDoer(data.doer)
      setStats(data.stats)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  /** Load profile data on mount and when user changes */
  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id, loadProfile])

  /** Handle logout */
  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      router.push(ROUTES.login)
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Failed to log out')
    }
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!profile || !doer || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Failed to load profile</p>
        <Button onClick={loadProfile}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Profile Header Card */}
            <Card className="overflow-hidden">
              <div className="h-24 gradient-primary" />
              <CardContent className="relative pt-0 pb-6">
                <div className="flex flex-col sm:flex-row gap-6 -mt-12 sm:-mt-10">
                  {/* Avatar */}
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                      {profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 pt-4 sm:pt-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                      {doer.is_activated && (
                        <Badge className="w-fit gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                          <BadgeCheck className="h-3 w-3" />
                          Verified Doer
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {doer.qualification?.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {doer.experience_level}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {stats.averageRating.toFixed(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-row sm:flex-col gap-2 sm:pt-6">
                    <Button onClick={() => setActiveTab('edit')} className="gap-2 flex-1 sm:flex-none gradient-primary">
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={() => setActiveTab('payments')}>
                      <Wallet className="h-4 w-4" />
                      Payout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="stat-gradient-teal">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">Total Earnings</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-gradient-emerald">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.completedProjects}</p>
                      <p className="text-xs text-muted-foreground">Projects Done</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-gradient-amber">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
                      <p className="text-xs text-muted-foreground">{stats.totalReviews} reviews</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-gradient-purple">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.onTimeDeliveryRate.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">On-time Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Earnings Alert */}
            {stats.pendingEarnings > 0 && (
              <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <IndianRupee className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                        ₹{stats.pendingEarnings.toLocaleString('en-IN')} pending
                      </p>
                      <p className="text-sm text-emerald-600/70 dark:text-emerald-400/70">
                        From projects awaiting approval
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('payments')}
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-400"
                    >
                      Request Payout
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {menuItems.slice(0, 4).map((item) => {
                const Icon = item.icon
                const colors = colorMap[item.color]
                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer card-interactive group"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", colors.bg)}>
                          <Icon className={cn("h-6 w-6", colors.icon)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {item.label}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* More Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">More Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {menuItems.slice(4).map((item) => {
                  const Icon = item.icon
                  const colors = colorMap[item.color]
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors group"
                    >
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", colors.bg)}>
                        <Icon className={cn("h-5 w-5", colors.icon)} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium group-hover:text-primary transition-colors">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </button>
                  )
                })}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group mt-2"
                >
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-red-600 dark:text-red-400">Log Out</p>
                    <p className="text-sm text-muted-foreground">Sign out of your account</p>
                  </div>
                </button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Back button */}
            <Button
              variant="ghost"
              onClick={() => setActiveTab('overview')}
              className="mb-6 gap-2"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to Profile
            </Button>

            {/* Tab content */}
            {activeTab === 'edit' && (
              <EditProfile
                profile={profile}
                doer={doer}
                onCancel={() => setActiveTab('overview')}
              />
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <RequestPayout doer={doer} />
                <PaymentHistory />
              </div>
            )}

            {activeTab === 'bank' && <BankSettings doer={doer} />}

            {activeTab === 'earnings' && <EarningsGraph />}

            {activeTab === 'ratings' && (
              <RatingBreakdown
                overall={stats.averageRating}
                quality={stats.qualityRating}
                timeliness={stats.timelinessRating}
                communication={stats.communicationRating}
                totalReviews={stats.totalReviews}
              />
            )}

            {activeTab === 'skills' && <SkillVerification />}

            {activeTab === 'support' && <SupportSection />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
