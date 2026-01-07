"use client";

/**
 * @fileoverview Premium Settings Page with SAAS-style Design
 *
 * Features:
 * - Gradient mesh hero section with icon badge
 * - Organized settings sections (Notifications, Privacy, Appearance, etc.)
 * - Interactive toggle switches
 * - Theme selector with visual previews
 * - Danger zone with warning styling
 * - Feedback form with type selection
 * - Smooth entrance animations
 */

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
  Monitor,
  Globe,
  Bug,
  Lightbulb,
  Send,
  Sparkles,
  FileJson,
  AlertTriangle,
  Check,
  Lock,
  FileText,
  Scale,
  Palette,
  UserX,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import "./settings.css";

/**
 * Settings section component with icon and title
 */
function SettingsSection({
  icon: Icon,
  title,
  description,
  iconColor = "primary",
  variant,
  children,
  className,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  iconColor?: "primary" | "blue" | "purple" | "green" | "amber" | "destructive";
  variant?: "danger";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("settings-section", variant === "danger" && "danger", className)}>
      <div className="settings-section-header">
        <div className={cn("settings-section-icon", iconColor)}>
          <Icon />
        </div>
        <div>
          <h3 className="settings-section-title">{title}</h3>
          {description && <p className="settings-section-subtitle">{description}</p>}
        </div>
      </div>
      <div className="settings-section-content">{children}</div>
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
    <div className="settings-row">
      <div className="settings-row-info">
        <p className="settings-row-label">{label}</p>
        <p className="settings-row-description">{description}</p>
      </div>
      <div className="settings-row-action">
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("settings-theme-option", currentTheme === value && "active")}
    >
      <Icon />
      <span className="settings-theme-label">{label}</span>
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
      className={cn("settings-feedback-type", isSelected && "active")}
    >
      <Icon />
      <span>{label}</span>
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
      className="settings-legal-link"
    >
      <div className="settings-legal-link-info">
        <div className="settings-legal-link-icon">
          <Icon />
        </div>
        <div>
          <p className="settings-legal-link-label">{label}</p>
          <p className="settings-legal-link-description">{description}</p>
        </div>
      </div>
      <div className="settings-legal-link-arrow">
        <ExternalLink />
      </div>
    </a>
  );
}

/**
 * Premium Settings Page Component
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

  // Notification settings state
  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailNotifications: true,
    projectUpdates: true,
    marketingEmails: false,
    weeklyDigest: true,
  });

  // Privacy settings state
  const [privacy, setPrivacy] = useState({
    analyticsOptOut: false,
    showOnlineStatus: true,
  });

  // Appearance settings state
  const [appearance, setAppearance] = useState({
    reducedMotion: false,
    compactMode: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const lastUpdated = format(new Date(appVersion.lastUpdated), "MMMM d, yyyy");

  /**
   * Exports user data as JSON
   */
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

  /**
   * Clears local cache and storage
   */
  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success("Cache cleared successfully");
    setClearDialogOpen(false);
  };

  /**
   * Handles logout
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
    } catch {
      toast.error("Failed to log out");
      setIsLoggingOut(false);
    }
  };

  /**
   * Submits feedback to server
   */
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

  /**
   * Handles notification toggle
   */
  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success("Notification preference updated");
  };

  /**
   * Handles privacy toggle
   */
  const handlePrivacyToggle = (key: keyof typeof privacy) => {
    setPrivacy((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success("Privacy setting updated");
  };

  /**
   * Handles appearance toggle
   */
  const handleAppearanceToggle = (key: keyof typeof appearance) => {
    setAppearance((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success("Appearance setting updated");
  };

  return (
    <main className="flex-1 p-4 lg:p-6 space-y-6 pb-24">
      {/* Background */}
      <div className="settings-page-bg" />

      {/* Hero Section */}
      <section className="settings-hero settings-animate-in">
        <div className="settings-hero-content">
          <div className="flex items-center gap-4 mb-4">
            <div className="settings-hero-icon">
              <Settings />
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              App Settings
            </Badge>
          </div>
          <h1 className="settings-hero-title">Settings</h1>
          <p className="settings-hero-subtitle">
            Manage your app preferences, notifications, privacy, and data settings.
          </p>

          {/* Quick Stats */}
          <div className="settings-hero-stats">
            <div className="settings-hero-stat success">
              <Check className="h-4 w-4" />
              <span>Data Synced</span>
            </div>
            <div className="settings-hero-stat info">
              <Shield className="h-4 w-4" />
              <span>Account Secure</span>
            </div>
            <div className="settings-hero-stat purple">
              <Globe className="h-4 w-4" />
              <span>v{appVersion.version}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Grid */}
      <div className="settings-grid">
        {/* Two Column Layout */}
        <div className="settings-grid-2">
          {/* Notifications Section */}
          <SettingsSection
            icon={Bell}
            title="Notifications"
            description="Manage how you receive updates"
            iconColor="blue"
            className="settings-animate-in settings-stagger-1"
          >
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
              description="Get notified when your projects are updated"
              checked={notifications.projectUpdates}
              onCheckedChange={() => handleNotificationToggle("projectUpdates")}
            />
            <SettingToggle
              label="Marketing Emails"
              description="Receive promotional offers and news"
              checked={notifications.marketingEmails}
              onCheckedChange={() => handleNotificationToggle("marketingEmails")}
            />
            <SettingToggle
              label="Weekly Digest"
              description="Get a weekly summary of your activity"
              checked={notifications.weeklyDigest}
              onCheckedChange={() => handleNotificationToggle("weeklyDigest")}
            />
          </SettingsSection>

          {/* Appearance Section */}
          <SettingsSection
            icon={Palette}
            title="Appearance"
            description="Customize how AssignX looks"
            iconColor="purple"
            className="settings-animate-in settings-stagger-2"
          >
            {/* Theme Selector */}
            <div className="mb-4">
              <p className="settings-row-label mb-3">Theme</p>
              {mounted && (
                <div className="settings-theme-grid">
                  <ThemeOption
                    icon={Sun}
                    label="Light"
                    value="light"
                    currentTheme={theme || "system"}
                    onClick={() => setTheme("light")}
                  />
                  <ThemeOption
                    icon={Moon}
                    label="Dark"
                    value="dark"
                    currentTheme={theme || "system"}
                    onClick={() => setTheme("dark")}
                  />
                  <ThemeOption
                    icon={Monitor}
                    label="System"
                    value="system"
                    currentTheme={theme || "system"}
                    onClick={() => setTheme("system")}
                  />
                </div>
              )}
            </div>

            <SettingToggle
              label="Reduced Motion"
              description="Minimize animations throughout the app"
              checked={appearance.reducedMotion}
              onCheckedChange={() => handleAppearanceToggle("reducedMotion")}
            />
            <SettingToggle
              label="Compact Mode"
              description="Use a more compact layout"
              checked={appearance.compactMode}
              onCheckedChange={() => handleAppearanceToggle("compactMode")}
            />
          </SettingsSection>
        </div>

        {/* Two Column Layout - Row 2 */}
        <div className="settings-grid-2">
          {/* Privacy & Data Section */}
          <SettingsSection
            icon={Lock}
            title="Privacy & Data"
            description="Control your data and privacy"
            iconColor="green"
            className="settings-animate-in settings-stagger-3"
          >
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

            {/* Data Actions */}
            <div className="settings-data-actions mt-4 pt-4 border-t border-[var(--ws-border-light)]">
              <div className="settings-data-action">
                <div className="settings-data-action-info">
                  <div className="settings-data-action-icon blue">
                    <FileJson />
                  </div>
                  <div>
                    <p className="settings-data-action-label">Export Data</p>
                    <p className="settings-data-action-description">Download all your data as JSON</p>
                  </div>
                </div>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="settings-data-action-btn"
                >
                  {isExporting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download />
                  )}
                  Export
                </button>
              </div>

              <div className="settings-data-action">
                <div className="settings-data-action-info">
                  <div className="settings-data-action-icon destructive">
                    <Trash2 />
                  </div>
                  <div>
                    <p className="settings-data-action-label">Clear Cache</p>
                    <p className="settings-data-action-description">Clear local storage and cached data</p>
                  </div>
                </div>
                <button
                  onClick={() => setClearDialogOpen(true)}
                  className="settings-data-action-btn destructive"
                >
                  <Trash2 />
                  Clear
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* About AssignX Section */}
          <SettingsSection
            icon={Info}
            title="About AssignX"
            description="App version and legal information"
            iconColor="amber"
            className="settings-animate-in settings-stagger-4"
          >
            {/* Version Info */}
            <div className="settings-app-info">
              <div className="settings-info-card">
                <p className="settings-info-label">Version</p>
                <p className="settings-info-value">{appVersion.version}</p>
              </div>
              <div className="settings-info-card">
                <p className="settings-info-label">Build</p>
                <p className="settings-info-value">{appVersion.buildNumber}</p>
              </div>
              <div className="settings-info-card">
                <p className="settings-info-label">Status</p>
                <Badge variant="secondary" className="text-xs">
                  Beta
                </Badge>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground mb-4">
              Last updated: {lastUpdated}
            </p>

            {/* Legal Links */}
            <div className="settings-legal-links">
              <LegalLink
                icon={FileText}
                label="Terms of Service"
                description="Read our terms and conditions"
                href="#"
              />
              <LegalLink
                icon={Shield}
                label="Privacy Policy"
                description="How we handle your data"
                href="#"
              />
              <LegalLink
                icon={Scale}
                label="Open Source Licenses"
                description="Third-party attributions"
                href="#"
              />
            </div>
          </SettingsSection>
        </div>

        {/* Feedback Section - Full Width */}
        <SettingsSection
          icon={MessageSquare}
          title="Send Feedback"
          description="Help us improve AssignX"
          iconColor="primary"
          className="settings-animate-in settings-stagger-5"
        >
          <form onSubmit={handleSubmitFeedback}>
            {/* Feedback Type Selection */}
            <div className="mb-4">
              <p className="settings-row-label mb-3">Feedback Type</p>
              <div className="settings-feedback-types">
                <FeedbackTypeOption
                  icon={Bug}
                  label="Bug Report"
                  isSelected={feedback.type === "bug"}
                  onClick={() => setFeedback((p) => ({ ...p, type: "bug" }))}
                />
                <FeedbackTypeOption
                  icon={Lightbulb}
                  label="Feature Request"
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

            {/* Message Input */}
            <div className="mb-4">
              <p className="settings-row-label mb-2">Your Feedback</p>
              <Textarea
                value={feedback.message}
                onChange={(e) => setFeedback((p) => ({ ...p, message: e.target.value }))}
                placeholder={
                  feedback.type === "bug"
                    ? "Describe the issue you encountered..."
                    : feedback.type === "feature"
                      ? "Tell us about the feature you would like to see..."
                      : "Share your thoughts with us..."
                }
                rows={4}
                className="settings-feedback-textarea"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Feedback
                </>
              )}
            </Button>
          </form>
        </SettingsSection>

        {/* Danger Zone Section */}
        <SettingsSection
          icon={AlertTriangle}
          title="Danger Zone"
          description="Irreversible actions"
          iconColor="destructive"
          variant="danger"
          className="settings-animate-in settings-stagger-6"
        >
          <div className="settings-danger-item">
            <div className="settings-danger-info">
              <p className="settings-danger-label">Log Out</p>
              <p className="settings-danger-description">Sign out of your account on this device</p>
            </div>
            <button onClick={handleLogout} disabled={isLoggingOut} className="settings-danger-btn">
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2 inline" />
                  Log Out
                </>
              )}
            </button>
          </div>

          <div className="settings-danger-item">
            <div className="settings-danger-info">
              <p className="settings-danger-label">Deactivate Account</p>
              <p className="settings-danger-description">Temporarily disable your account</p>
            </div>
            <button className="settings-danger-btn">
              <UserX className="h-4 w-4 mr-2 inline" />
              Deactivate
            </button>
          </div>

          <div className="settings-danger-item">
            <div className="settings-danger-info">
              <p className="settings-danger-label">Delete Account</p>
              <p className="settings-danger-description">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => setDeleteAccountDialogOpen(true)}
              className="settings-danger-btn"
            >
              <Trash2 className="h-4 w-4 mr-2 inline" />
              Delete
            </button>
          </div>
        </SettingsSection>
      </div>

      {/* Clear Cache Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 w-fit">
              <Trash2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle className="text-center">Clear cache?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This will clear all locally stored data including preferences and cached information.
              You may need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCache} className="flex-1 bg-amber-600 hover:bg-amber-700">
              Clear Cache
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 p-3 rounded-full bg-red-100 dark:bg-red-900/30 w-fit">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-center">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This action cannot be undone. This will permanently delete your account and remove all
              your data from our servers. All projects, payments, and history will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.error("Account deletion is not available in beta");
                setDeleteAccountDialogOpen(false);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
