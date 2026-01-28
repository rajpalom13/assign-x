'use client'

import { useState } from 'react'
import {
  User,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  Save,
  Moon,
  Sun,
  Globe,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  Palette,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

type SettingsClientProps = {
  userEmail: string
  profile: any
  doer: any
}

/**
 * Settings client component
 * Professional tabbed interface for user preferences
 */
export function SettingsClient({ userEmail, profile, doer }: SettingsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('account')

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [taskAlerts, setTaskAlerts] = useState(true)
  const [paymentNotifications, setPaymentNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)

  // Privacy settings
  const [profileVisible, setProfileVisible] = useState(true)
  const [showEarnings, setShowEarnings] = useState(false)

  // Language and timezone
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('Asia/Kolkata')

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          settings: {
            emailNotifications,
            taskAlerts,
            paymentNotifications,
            pushNotifications,
            profileVisible,
            showEarnings,
            language,
            timezone,
          },
        })
        .eq('id', profile?.id)

      if (error) throw error
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push(ROUTES.login)
      router.refresh()
    } catch (error) {
      toast.error('Failed to log out')
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-2xl h-12">
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profile?.full_name || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile?.phone || 'Not set'}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doerId">Doer ID</Label>
                  <Input
                    id="doerId"
                    value={doer?.id?.slice(0, 8).toUpperCase() || 'N/A'}
                    disabled
                    className="bg-muted font-mono"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    doer?.is_activated
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : "bg-amber-100 dark:bg-amber-900/30"
                  )}>
                    <Check className={cn(
                      "h-6 w-6",
                      doer?.is_activated
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium">Account Status</p>
                    <p className="text-sm text-muted-foreground">
                      {doer?.is_activated ? 'Fully Activated' : 'Pending Activation'}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    doer?.is_activated
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  )}
                >
                  {doer?.is_activated ? 'Active' : 'Pending'}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Member since</span>
                <span className="font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                </div>
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="America/New_York">New York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive email updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-0.5">
                  <Label className="cursor-pointer">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your tasks
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-0.5">
                  <Label className="cursor-pointer">Task Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new tasks match your skills
                  </p>
                </div>
                <Switch
                  checked={taskAlerts}
                  onCheckedChange={setTaskAlerts}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-0.5">
                  <Label className="cursor-pointer">Payment Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Alerts for payment processing and payouts
                  </p>
                </div>
                <Switch
                  checked={paymentNotifications}
                  onCheckedChange={setPaymentNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Smartphone className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                Push Notifications
              </CardTitle>
              <CardDescription>
                Receive notifications on your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-0.5">
                  <Label className="cursor-pointer">Enable Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get instant alerts on your browser
                  </p>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveSettings} disabled={isLoading} className="gap-2 gradient-primary">
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Palette className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                Theme
              </CardTitle>
              <CardDescription>
                Choose your preferred appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Smartphone },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      theme === option.value
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        theme === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        <option.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {option.value === 'system' ? 'Match device' : `${option.label} mode`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="space-y-0.5">
                  <Label>Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow supervisors to view your profile
                  </p>
                </div>
                <Switch
                  checked={profileVisible}
                  onCheckedChange={setProfileVisible}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="space-y-0.5">
                  <Label>Show Earnings</Label>
                  <p className="text-sm text-muted-foreground">
                    Display earnings on your public profile
                  </p>
                </div>
                <Switch
                  checked={showEarnings}
                  onCheckedChange={setShowEarnings}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Security
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </Button>

              <Button variant="outline" className="w-full justify-start gap-2">
                <CreditCard className="h-4 w-4" />
                Update Bank Details
              </Button>

              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add extra security to your account
                    </p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                <LogOut className="h-5 w-5" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/10">
                <div>
                  <p className="font-medium">Log Out</p>
                  <p className="text-sm text-muted-foreground">
                    Sign out from your account on this device
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
