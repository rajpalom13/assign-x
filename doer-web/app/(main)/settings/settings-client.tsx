'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bell, Shield, Palette } from 'lucide-react'
import {
  SettingsHero,
  AccountSettings,
  NotificationSettings,
  PrivacySettings,
  DisplaySettings,
  SettingsSidebar,
} from '@/components/settings'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type SettingsClientProps = {
  userEmail: string
  profile: any
  doer: any
}

type SettingsTab = 'account' | 'notifications' | 'privacy' | 'display'

/**
 * Settings client component
 * Comprehensive settings page with account, notifications, privacy, and display preferences
 */
export function SettingsClient({ userEmail, profile, doer }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account')

  return (
    <div className="relative min-h-screen">
      {/* Background gradient overlay - matches dashboard */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(90,124,255,0.18),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(73,197,255,0.16),transparent_50%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Hero Section */}
        <SettingsHero
          userName={profile?.full_name || doer?.full_name || 'User'}
          userEmail={userEmail}
        />

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SettingsTab)}>
          <TabsList className="grid w-full max-w-3xl grid-cols-4 h-12 rounded-full bg-white/85 p-1 shadow-[0_14px_28px_rgba(30,58,138,0.08)]">
            <TabsTrigger
              value="account"
              className="rounded-full text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5A7CFF] data-[state=active]:to-[#49C5FF] data-[state=active]:text-white transition-all"
            >
              <User className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-full text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5A7CFF] data-[state=active]:to-[#49C5FF] data-[state=active]:text-white transition-all"
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="rounded-full text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5A7CFF] data-[state=active]:to-[#49C5FF] data-[state=active]:text-white transition-all"
            >
              <Shield className="mr-2 h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger
              value="display"
              className="rounded-full text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#5A7CFF] data-[state=active]:to-[#49C5FF] data-[state=active]:text-white transition-all"
            >
              <Palette className="mr-2 h-4 w-4" />
              Display
            </TabsTrigger>
          </TabsList>

          {/* Two-column layout: Settings content (65%) + Sidebar (35%) */}
          <div className="grid gap-6 mt-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* Main content area */}
            <motion.main
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="min-w-0"
            >
              <AnimatePresence mode="wait">
                <TabsContent value="account" className="mt-0">
                  <AccountSettings profile={profile} />
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                  <NotificationSettings />
                </TabsContent>

                <TabsContent value="privacy" className="mt-0">
                  <PrivacySettings />
                </TabsContent>

                <TabsContent value="display" className="mt-0">
                  <DisplaySettings />
                </TabsContent>
              </AnimatePresence>
            </motion.main>

            {/* Sidebar */}
            <SettingsSidebar />
          </div>
        </Tabs>
      </motion.div>
    </div>
  )
}
