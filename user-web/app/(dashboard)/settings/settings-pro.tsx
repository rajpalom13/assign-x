"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Settings,
  Download,
  Trash2,
  Loader2,
  MessageSquare,
  Info,
  ExternalLink,
  Shield,
  Bell,
  Moon,
  Sun,
  Bug,
  Lightbulb,
  Send,
  FileJson,
  AlertTriangle,
  Lock,
  FileText,
  Scale,
  Palette,
  UserX,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { exportUserData, submitFeedback } from "@/lib/actions/data";
import { appVersion } from "@/lib/data/settings";
import { format } from "date-fns";
import type { FeedbackData } from "@/types/settings";
import { signOut } from "@/lib/actions/auth";

/**
 * Settings section component
 */
function SettingsSection({
  icon: Icon,
  title,
  description,
  variant,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  variant?: "danger";
  children: React.ReactNode;
}) {
  return (
    <div className={cn(
      "rounded-xl border bg-card overflow-hidden",
      variant === "danger" ? "border-red-200 dark:border-red-900/50" : "border-border"
    )}>
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
          variant === "danger" ? "bg-red-100 dark:bg-red-900/30" : "bg-muted"
        )}>
          <Icon className={cn(
            "h-4.5 w-4.5",
            variant === "danger" ? "text-red-600 dark:text-red-400" : "text-muted-foreground"
          )} />
        </div>
        <div>
          <h3 className={cn(
            "text-sm font-medium",
            variant === "danger" ? "text-red-600 dark:text-red-400" : "text-foreground"
          )}>{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/**
 * Setting row with toggle switch
 */
function SettingToggle({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="ml-4 shrink-0" />
    </div>
  );
}

/**
 * Theme option button
 */
function ThemeOption({
  icon: Icon,
  label,
  value,
  currentTheme,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  currentTheme: string;
  onClick: () => void;
}) {
  const isActive = currentTheme === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors",
        isActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-foreground/20"
      )}
    >
      <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>{label}</span>
    </button>
  );
}

/**
 * Feedback type selection button
 */
function FeedbackTypeOption({
  icon: Icon,
  label,
  isSelected,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-foreground/20"
      )}
    >
      <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("text-xs font-medium", isSelected ? "text-primary" : "text-muted-foreground")}>{label}</span>
    </button>
  );
}

/**
 * Legal/Info link row
 */
function LegalLink({
  icon: Icon,
  label,
  description,
  href,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
    </a>
  );
}

/**
 * Settings Page Component
 */
export function SettingsPro() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({ type: "general", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    projectUpdates: true,
    marketingEmails: false,
    weeklyDigest: true,
  });

  const [privacy, setPrivacy] = useState({
    analyticsOptOut: false,
    showOnlineStatus: true,
  });

  const [appearance, setAppearance] = useState({
    reducedMotion: false,
    compactMode: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const lastUpdated = format(new Date(appVersion.lastUpdated), "MMM d, yyyy");

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const result = await exportUserData();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "assignx-data-" + Date.now() + ".json";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Cache cleared successfully");
    setClearDialogOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch {
      toast.error("Failed to log out");
      setIsLoggingOut(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.message.trim()) {
      toast.error("Please enter your feedback");
      return;
    }
    setIsSubmitting(true);
    try {
      const satisfactionMap = { bug: 2, feature: 4, general: 3 };
      const result = await submitFeedback({
        overallSatisfaction: satisfactionMap[feedback.type as keyof typeof satisfactionMap] || 3,
        feedbackText: feedback.message,
        improvementSuggestions: feedback.type === "feature" ? feedback.message : undefined,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Thank you for your feedback!");
      setFeedback({ type: "general", message: "" });
    } catch {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Preference updated");
  };

  const handlePrivacyToggle = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Setting updated");
  };

  const handleAppearanceToggle = (key: keyof typeof appearance) => {
    setAppearance((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Setting updated");
  };

  return (
    <main className="flex-1 p-6 md:p-8 max-w-3xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences and account</p>
      </div>

      {/* Two Column Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Notifications */}
        <SettingsSection icon={Bell} title="Notifications" description="Manage how you receive updates">
          <div className="space-y-1">
            <SettingToggle
              label="Push Notifications"
              description="Get push notifications on your device"
              checked={notifications.pushNotifications}
              onCheckedChange={() => handleNotificationToggle("pushNotifications")}
            />
            <SettingToggle
              label="Email Notifications"
              description="Receive important updates via email"
              checked={notifications.emailNotifications}
              onCheckedChange={() => handleNotificationToggle("emailNotifications")}
            />
            <SettingToggle
              label="Project Updates"
              description="Get notified when projects are updated"
              checked={notifications.projectUpdates}
              onCheckedChange={() => handleNotificationToggle("projectUpdates")}
            />
            <SettingToggle
              label="Marketing Emails"
              description="Receive promotional offers"
              checked={notifications.marketingEmails}
              onCheckedChange={() => handleNotificationToggle("marketingEmails")}
            />
          </div>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection icon={Palette} title="Appearance" description="Customize how the app looks">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-foreground mb-3">Theme</p>
              {mounted && (
                <div className="grid grid-cols-2 gap-3">
                  <ThemeOption
                    icon={Sun}
                    label="Light"
                    value="light"
                    currentTheme={theme || "light"}
                    onClick={() => setTheme("light")}
                  />
                  <ThemeOption
                    icon={Moon}
                    label="Dark"
                    value="dark"
                    currentTheme={theme || "light"}
                    onClick={() => setTheme("dark")}
                  />
                </div>
              )}
            </div>
            <div className="pt-2 border-t border-border space-y-1">
              <SettingToggle
                label="Reduced Motion"
                description="Minimize animations"
                checked={appearance.reducedMotion}
                onCheckedChange={() => handleAppearanceToggle("reducedMotion")}
              />
              <SettingToggle
                label="Compact Mode"
                description="Use a more compact layout"
                checked={appearance.compactMode}
                onCheckedChange={() => handleAppearanceToggle("compactMode")}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Privacy & Data */}
        <SettingsSection icon={Lock} title="Privacy & Data" description="Control your data">
          <div className="space-y-4">
            <div className="space-y-1">
              <SettingToggle
                label="Analytics Opt-out"
                description="Disable anonymous usage analytics"
                checked={privacy.analyticsOptOut}
                onCheckedChange={() => handlePrivacyToggle("analyticsOptOut")}
              />
              <SettingToggle
                label="Show Online Status"
                description="Let others see when you are online"
                checked={privacy.showOnlineStatus}
                onCheckedChange={() => handlePrivacyToggle("showOnlineStatus")}
              />
            </div>

            <div className="pt-3 border-t border-border space-y-2">
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <FileJson className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Export Data</p>
                    <p className="text-xs text-muted-foreground">Download your data as JSON</p>
                  </div>
                </div>
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Download className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              <button
                onClick={() => setClearDialogOpen(true)}
                className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Clear Cache</p>
                    <p className="text-xs text-muted-foreground">Clear local storage</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* About */}
        <SettingsSection icon={Info} title="About AssignX" description="App information">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Version</p>
                <p className="text-sm font-mono font-medium text-foreground">{appVersion.version}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Build</p>
                <p className="text-sm font-mono font-medium text-foreground">{appVersion.buildNumber}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium text-foreground">Beta</p>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">Updated: {lastUpdated}</p>

            <div className="space-y-1">
              <LegalLink icon={FileText} label="Terms of Service" description="Read our terms" href="#" />
              <LegalLink icon={Shield} label="Privacy Policy" description="How we handle data" href="#" />
              <LegalLink icon={Scale} label="Open Source" description="Third-party licenses" href="#" />
            </div>
          </div>
        </SettingsSection>
      </div>

      {/* Feedback - Full Width */}
      <SettingsSection icon={MessageSquare} title="Send Feedback" description="Help us improve">
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">Feedback Type</p>
            <div className="grid grid-cols-3 gap-3">
              <FeedbackTypeOption
                icon={Bug}
                label="Bug"
                isSelected={feedback.type === "bug"}
                onClick={() => setFeedback((p) => ({ ...p, type: "bug" }))}
              />
              <FeedbackTypeOption
                icon={Lightbulb}
                label="Feature"
                isSelected={feedback.type === "feature"}
                onClick={() => setFeedback((p) => ({ ...p, type: "feature" }))}
              />
              <FeedbackTypeOption
                icon={MessageSquare}
                label="General"
                isSelected={feedback.type === "general"}
                onClick={() => setFeedback((p) => ({ ...p, type: "general" }))}
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Your Feedback</p>
            <Textarea
              value={feedback.message}
              onChange={(e) => setFeedback((p) => ({ ...p, message: e.target.value }))}
              placeholder={
                feedback.type === "bug"
                  ? "Describe the issue..."
                  : feedback.type === "feature"
                    ? "Describe the feature..."
                    : "Share your thoughts..."
              }
              rows={4}
              className="resize-none"
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Feedback
              </>
            )}
          </Button>
        </form>
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection icon={AlertTriangle} title="Danger Zone" description="Irreversible actions" variant="danger">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Log Out</p>
              <p className="text-xs text-muted-foreground">Sign out of your account</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
            >
              {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-1" />}
              Log Out
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Deactivate Account</p>
              <p className="text-xs text-muted-foreground">Temporarily disable your account</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
            >
              <UserX className="h-4 w-4 mr-1" />
              Deactivate
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete all data</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteAccountDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* Clear Cache Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear cache?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all locally stored data. You may need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCache}>Clear Cache</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All your data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.error("Account deletion is not available in beta");
                setDeleteAccountDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
