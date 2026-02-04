'use client'

import { useState, useEffect, useCallback } from 'react'
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
  IndianRupee,
  LayoutGrid,
  Sparkles,
  Layers,
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
import { toast } from 'sonner'
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
  { id: 'overview', label: 'Overview', icon: LayoutGrid, description: 'Your profile dashboard', color: 'teal' },
  { id: 'edit', label: 'Edit Profile', icon: Edit2, description: 'Update your information', color: 'emerald' },
  { id: 'payments', label: 'Payment History', icon: CreditCard, description: 'View transactions', color: 'cyan' },
  { id: 'bank', label: 'Bank Settings', icon: Building2, description: 'Manage bank details', color: 'blue' },
  { id: 'earnings', label: 'Earnings', icon: TrendingUp, description: 'View earnings trend', color: 'purple' },
  { id: 'ratings', label: 'Reviews & Ratings', icon: Star, description: 'See your feedback', color: 'amber' },
  { id: 'skills', label: 'Skill Verification', icon: BadgeCheck, description: 'Verify your skills', color: 'teal' },
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

/** Tab metadata */
const tabMeta: Record<ProfileTab, { title: string; description: string; eyebrow: string }> = {
  overview: {
    title: 'Profile Overview',
    description: 'Track your performance, earnings, and growth insights.',
    eyebrow: 'Dashboard',
  },
  edit: {
    title: 'Edit Profile',
    description: 'Keep your personal details and skills up to date.',
    eyebrow: 'Profile',
  },
  payments: {
    title: 'Payments',
    description: 'Review payouts, balances, and transaction history.',
    eyebrow: 'Finance',
  },
  bank: {
    title: 'Bank Settings',
    description: 'Manage payout methods and verified details.',
    eyebrow: 'Finance',
  },
  earnings: {
    title: 'Earnings',
    description: 'Visualize your earnings across time periods.',
    eyebrow: 'Performance',
  },
  ratings: {
    title: 'Ratings',
    description: 'Understand your feedback and recent reviews.',
    eyebrow: 'Reputation',
  },
  skills: {
    title: 'Skill Verification',
    description: 'Showcase verified expertise to win more work.',
    eyebrow: 'Profile',
  },
  support: {
    title: 'Support Center',
    description: 'Get help or raise a ticket in minutes.',
    eyebrow: 'Help',
  },
}

/**
 * Profile page
 * Professional design with modern card layouts
 */
export default function ProfilePage() {
  const { user, isLoading: authLoading, signOut } = useAuth()
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

  const completionFields = [
    Boolean(profile.full_name),
    Boolean(profile.email),
    Boolean(profile.phone),
    Boolean(profile.avatar_url),
    Boolean(doer.qualification),
    Boolean(doer.experience_level),
    Boolean(doer.bio),
    Boolean(doer.university_name),
    Boolean(doer.bank_account_name),
    Boolean(doer.bank_account_number),
    Boolean(doer.bank_ifsc_code),
  ]
  const profileCompletion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  )
  const activeMeta = tabMeta[activeTab]

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-gradient-to-b from-emerald-500/10 via-teal-500/10 to-transparent" />
      <div className="relative grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <Card className="overflow-hidden">
            <div className="h-16 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20" />
            <CardContent className="-mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                    {profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Profile strength</span>
                <span className="font-medium">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
              <div className="flex flex-wrap gap-2">
                {doer.is_activated && (
                  <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-0">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
                <Badge variant="secondary" className="capitalize">
                  {doer.experience_level}
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {stats.averageRating.toFixed(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Navigation
              </CardTitle>
              <CardDescription>Manage your profile workflow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const colors = colorMap[item.color]
                const isActive = activeTab === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                      isActive ? 'bg-muted/80 shadow-sm' : 'hover:bg-muted'
                    )}
                  >
                    <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', colors.bg)}>
                      <Icon className={cn('h-4 w-4', colors.icon)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                    <ChevronRight className={cn('h-4 w-4 transition-transform', isActive ? 'text-primary translate-x-1' : 'text-muted-foreground')} />
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-xs text-muted-foreground">Security and verification</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs">
                <span className="text-muted-foreground">Activation</span>
                <span className={cn('font-medium', doer.is_activated ? 'text-emerald-600' : 'text-amber-600')}>
                  {doer.is_activated ? 'Active' : 'Pending'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-xs">
                <span className="text-muted-foreground">On-time delivery</span>
                <span className="font-medium">{stats.onTimeDeliveryRate.toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 text-red-600" />
            Log Out
          </Button>
        </aside>

        <main className="space-y-6">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.18),transparent_55%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.18),transparent_55%)]" />
            <CardContent className="relative space-y-6 p-6">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-xl">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
                      {profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-semibold">{profile.full_name}</h1>
                      {doer.is_activated && (
                        <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-0">
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
                </div>

                <div className="flex-1 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border bg-background/70 p-4">
                    <p className="text-xs text-muted-foreground">Total earnings</p>
                    <p className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground">All-time</p>
                  </div>
                  <div className="rounded-2xl border bg-background/70 p-4">
                    <p className="text-xs text-muted-foreground">Projects done</p>
                    <p className="text-2xl font-bold">{stats.completedProjects}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="rounded-2xl border bg-background/70 p-4">
                    <p className="text-xs text-muted-foreground">On-time rate</p>
                    <p className="text-2xl font-bold">{stats.onTimeDeliveryRate.toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">Last 90 days</p>
                  </div>
                </div>

                <div className="flex flex-row flex-wrap gap-2 lg:flex-col">
                  <Button onClick={() => setActiveTab('edit')} className="gap-2 gradient-primary">
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="gap-2" onClick={() => setActiveTab('payments')}>
                    <Wallet className="h-4 w-4" />
                    Payouts
                  </Button>
                  <Button variant="ghost" className="gap-2" onClick={() => setActiveTab('earnings')}>
                    <TrendingUp className="h-4 w-4" />
                    Earnings
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Profile completion</span>
                    <span className="font-medium">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Top performer
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Award className="h-3 w-3 text-emerald-600" />
                    {stats.totalReviews} reviews
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {stats.pendingEarnings > 0 && (
                  <Card className="border-emerald-200/70 bg-emerald-50/60">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                            <IndianRupee className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-emerald-700">
                              ₹{stats.pendingEarnings.toLocaleString('en-IN')} pending
                            </p>
                            <p className="text-sm text-emerald-600/70">From projects awaiting approval</p>
                          </div>
                        </div>
                        <div className="sm:ml-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab('payments')}
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                          >
                            Request Payout
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.4fr)]">
                  <div className="space-y-6">
                    <Scorecard stats={stats} />
                    <EarningsGraph />
                    <RatingBreakdown
                      overall={stats.averageRating}
                      quality={stats.qualityRating}
                      timeliness={stats.timelinessRating}
                      communication={stats.communicationRating}
                      totalReviews={stats.totalReviews}
                    />
                  </div>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="h-5 w-5 text-primary" />
                          Quick Actions
                        </CardTitle>
                        <CardDescription>Jump to your most used tools</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {menuItems.filter((item) => item.id !== 'overview').slice(0, 4).map((item) => {
                          const Icon = item.icon
                          const colors = colorMap[item.color]
                          return (
                            <button
                              key={item.id}
                              onClick={() => setActiveTab(item.id)}
                              className="w-full flex items-center gap-3 rounded-xl border px-3 py-2 text-left hover:border-primary/40 hover:bg-muted/50 transition-all"
                            >
                              <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', colors.bg)}>
                                <Icon className={cn('h-4 w-4', colors.icon)} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </button>
                          )}
                      </CardContent>
                    </Card>
                    <RequestPayout doer={doer} />
                    <SkillVerification />
                    <SupportSection variant="compact" />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{activeMeta.eyebrow}</p>
                      <h2 className="text-2xl font-semibold">{activeMeta.title}</h2>
                      <p className="text-sm text-muted-foreground">{activeMeta.description}</p>
                    </div>
                    <Button variant="ghost" onClick={() => setActiveTab('overview')} className="gap-2">
                      <ChevronRight className="h-4 w-4 rotate-180" />
                      Back to Overview
                    </Button>
                  </CardContent>
                </Card>

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
        </main>
      </div>
    </div>
  )
}
