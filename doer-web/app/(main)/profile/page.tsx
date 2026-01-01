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
  Settings,
  LogOut,
  ChevronRight,
  Edit2,
  Wallet,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  Scorecard,
  CompactScorecard,
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
const menuItems: { id: ProfileTab; label: string; icon: typeof User; description: string }[] = [
  { id: 'edit', label: 'Edit Profile', icon: Edit2, description: 'Update your information' },
  { id: 'payments', label: 'Payment History', icon: CreditCard, description: 'View transactions' },
  { id: 'bank', label: 'Bank Settings', icon: Building2, description: 'Manage bank details' },
  { id: 'earnings', label: 'Earnings', icon: TrendingUp, description: 'View earnings graph' },
  { id: 'ratings', label: 'Reviews & Ratings', icon: Star, description: 'See your feedback' },
  { id: 'skills', label: 'Skill Verification', icon: BadgeCheck, description: 'Verify your skills' },
  { id: 'support', label: 'Help & Support', icon: HelpCircle, description: 'Get assistance' },
]

/**
 * Profile page
 * Main profile hub with all profile-related features
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

  // Show loading state while auth or profile is loading
  if (authLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!profile || !doer || !stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
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
            {/* Profile header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                    <AvatarFallback className="text-2xl">
                      {profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                      {doer.is_activated && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                          <BadgeCheck className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <Badge variant="secondary" className="capitalize">
                        {doer.qualification?.replace('_', ' ')}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {doer.experience_level}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => setActiveTab('edit')} className="gap-2">
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => setActiveTab('payments')}>
                      <Wallet className="h-4 w-4" />
                      Request Payout
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scorecard */}
            <Scorecard stats={stats} />

            {/* Quick actions grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {menuItems.slice(0, 4).map((item) => {
                const Icon = item.icon
                return (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group"
                    onClick={() => setActiveTab(item.id)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">
                              {item.label}
                            </p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* More options */}
            <Card>
              <CardHeader>
                <CardTitle>More Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {menuItems.slice(4).map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )
                })}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-500/10 text-red-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="h-5 w-5" />
                    <span>Log Out</span>
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
              className="mb-4"
            >
              <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
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
