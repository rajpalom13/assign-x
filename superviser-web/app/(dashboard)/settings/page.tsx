/**
 * @fileoverview Professional settings page for application preferences and configuration.
 * @module app/(dashboard)/settings/page
 */

"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  Clock,
  Moon,
  Sun,
  Monitor,
  Check,
  ChevronRight,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Key,
  HelpCircle,
  ExternalLink,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("notifications")

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNewProject: true,
    emailProjectUpdate: true,
    emailPayment: true,
    emailMarketing: false,
    pushNewProject: true,
    pushChat: true,
    pushDeadline: true,
    pushPayment: false,
    sound: true,
    quietHours: false,
    quietStart: "22:00",
    quietEnd: "08:00",
  })

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    showOnline: true,
    showActivity: true,
    showEarnings: false,
    twoFactor: false,
  })

  // Language & region
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState("Asia/Kolkata")

  const saveSettingsToSupabase = async (settingsData: Record<string, unknown>) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from("profiles")
        .update({
          settings: settingsData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error
    } catch (err) {
      console.error("Failed to save settings:", err)
      toast.error("Failed to save settings")
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value }
    setNotifications(updatedNotifications)
    saveSettingsToSupabase({ notifications: updatedNotifications, privacy, language, timezone })
    toast.success("Settings updated")
  }

  const handlePrivacyChange = (key: string, value: boolean) => {
    const updatedPrivacy = { ...privacy, [key]: value }
    setPrivacy(updatedPrivacy)
    saveSettingsToSupabase({ notifications, privacy: updatedPrivacy, language, timezone })
    toast.success("Privacy settings updated")
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-500/10 to-gray-500/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid p-1 rounded-xl bg-muted/50">
          <TabsTrigger
            value="notifications"
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger
            value="language"
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 animate-fade-in-up">
          {/* Email Notifications */}
          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">Email Notifications</CardTitle>
                  <CardDescription>Manage what emails you receive</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New project requests</Label>
                  <p className="text-sm text-muted-foreground">Get notified when new projects need quotes</p>
                </div>
                <Switch
                  checked={notifications.emailNewProject}
                  onCheckedChange={(v) => handleNotificationChange("emailNewProject", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Project updates</Label>
                  <p className="text-sm text-muted-foreground">Updates on project status changes</p>
                </div>
                <Switch
                  checked={notifications.emailProjectUpdate}
                  onCheckedChange={(v) => handleNotificationChange("emailProjectUpdate", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about payments and withdrawals</p>
                </div>
                <Switch
                  checked={notifications.emailPayment}
                  onCheckedChange={(v) => handleNotificationChange("emailPayment", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing emails</Label>
                  <p className="text-sm text-muted-foreground">Tips, product updates and offers</p>
                </div>
                <Switch
                  checked={notifications.emailMarketing}
                  onCheckedChange={(v) => handleNotificationChange("emailMarketing", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">Push Notifications</CardTitle>
                  <CardDescription>In-app and browser notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New projects</Label>
                  <p className="text-sm text-muted-foreground">Instant alerts for new project requests</p>
                </div>
                <Switch
                  checked={notifications.pushNewProject}
                  onCheckedChange={(v) => handleNotificationChange("pushNewProject", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chat messages</Label>
                  <p className="text-sm text-muted-foreground">New messages from clients and experts</p>
                </div>
                <Switch
                  checked={notifications.pushChat}
                  onCheckedChange={(v) => handleNotificationChange("pushChat", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Deadline reminders</Label>
                  <p className="text-sm text-muted-foreground">Reminders before project deadlines</p>
                </div>
                <Switch
                  checked={notifications.pushDeadline}
                  onCheckedChange={(v) => handleNotificationChange("pushDeadline", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notification sound</Label>
                  <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                </div>
                <Switch
                  checked={notifications.sound}
                  onCheckedChange={(v) => handleNotificationChange("sound", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">Quiet Hours</CardTitle>
                  <CardDescription>Pause notifications during specific hours</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable quiet hours</Label>
                  <p className="text-sm text-muted-foreground">Mute notifications during set times</p>
                </div>
                <Switch
                  checked={notifications.quietHours}
                  onCheckedChange={(v) => handleNotificationChange("quietHours", v)}
                />
              </div>
              {notifications.quietHours && (
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">From</Label>
                    <Input
                      type="time"
                      value={notifications.quietStart}
                      onChange={(e) => setNotifications((p) => ({ ...p, quietStart: e.target.value }))}
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">To</Label>
                    <Input
                      type="time"
                      value={notifications.quietEnd}
                      onChange={(e) => setNotifications((p) => ({ ...p, quietEnd: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6 animate-fade-in-up">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Theme</CardTitle>
              <CardDescription>Select your preferred appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = theme === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center",
                          isSelected ? "bg-primary/10" : "bg-background"
                        )}
                      >
                        <Icon className={cn("h-6 w-6", isSelected && "text-primary")} />
                      </div>
                      <span className={cn("font-medium", isSelected && "text-primary")}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pro tip</AlertTitle>
            <AlertDescription>
              System theme automatically matches your device settings and adapts to light/dark modes.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6 animate-fade-in-up">
          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">Profile Visibility</CardTitle>
                  <CardDescription>Control what others can see</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show online status</Label>
                  <p className="text-sm text-muted-foreground">Let others see when you&apos;re online</p>
                </div>
                <Switch
                  checked={privacy.showOnline}
                  onCheckedChange={(v) => handlePrivacyChange("showOnline", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show activity status</Label>
                  <p className="text-sm text-muted-foreground">Show your recent activity to doers</p>
                </div>
                <Switch
                  checked={privacy.showActivity}
                  onCheckedChange={(v) => handlePrivacyChange("showActivity", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show earnings badge</Label>
                  <p className="text-sm text-muted-foreground">Display your earnings tier on profile</p>
                </div>
                <Switch
                  checked={privacy.showEarnings}
                  onCheckedChange={(v) => handlePrivacyChange("showEarnings", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">Security</CardTitle>
                  <CardDescription>Protect your account</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label>Two-factor authentication</Label>
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={privacy.twoFactor}
                  onCheckedChange={(v) => handlePrivacyChange("twoFactor", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active sessions</Label>
                  <p className="text-sm text-muted-foreground">Manage your logged in devices</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  Manage
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Delete account</Label>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language" className="space-y-6 animate-fade-in-up">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Language & Region</CardTitle>
              <CardDescription>Set your preferred language and timezone</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Display language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                    <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
                    <SelectItem value="te">Telugu (తెలుగు)</SelectItem>
                    <SelectItem value="kn">Kannada (ಕನ್ನಡ)</SelectItem>
                    <SelectItem value="ml">Malayalam (മലയാളം)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                    <SelectItem value="Asia/Dubai">Gulf Standard Time (GST)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Current time: {new Date().toLocaleTimeString("en-IN", { timeZone: timezone })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg">Help & Support</CardTitle>
              <CardDescription>Get help when you need it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="/support">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Help Center
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Contact Support
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Documentation
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
