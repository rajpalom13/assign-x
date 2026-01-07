"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  UserCircle,
  Wallet,
  FolderCheck,
  Gift,
  Users,
  ArrowUpRight,
  Plus,
  Copy,
  Share2,
  Check,
  Mail,
  Calendar,
  CheckCircle2,
  Camera,
  
  Shield,
  CreditCard,
  GraduationCap,
  Bell,
  ChevronRight,
  Sparkles,
  Crown,
  TrendingUp,
  Star,
  IndianRupee,
  Edit3,
  BadgeCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarUploadDialog } from "@/components/profile/avatar-upload-dialog";
import { toast } from "sonner";
import { getWallet, getProjects } from "@/lib/actions/data";
import type { UserProfile, UserSubscription } from "@/types/profile";

import "./profile.css";

/**
 * Props for ProfilePro component
 */
interface ProfileProProps {
  profile: UserProfile;
  subscription: UserSubscription;
  onAvatarChange: (file: File) => void;
  onSettingsClick: (tab: string) => void;
}

/**
 * Animated counter component
 */
function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{count.toLocaleString("en-IN")}{suffix}</span>;
}

/**
 * Mini stat card component - uses profile-stat-card CSS class
 * Displays a single statistic with icon, value, and label
 */
function MiniStat({
  icon: Icon,
  label,
  value,
  prefix = "",
  suffix = "",
  href,
  iconColor = "text-primary",
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  href?: string;
  iconColor?: string;
  trend?: "up" | "down";
}) {
  const content = (
    <div className={cn("profile-stat-card group", href && "cursor-pointer")}>
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="profile-stat-icon">
            <Icon className={cn("h-4 w-4", iconColor)} strokeWidth={2} />
          </div>
          {href && (
            <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          )}
          {trend && (
            <div className={cn("profile-stat-trend", trend)}>
              <TrendingUp className={cn("h-3 w-3", trend === "down" && "rotate-180")} />
            </div>
          )}
        </div>
        <div className="profile-stat-value">
          <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
        </div>
        <div className="profile-stat-label">{label}</div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

/**
 * Quick action button - uses profile-action-card CSS class
 * Displays a navigable action item with icon, label, and description
 */
function QuickAction({
  icon: Icon,
  label,
  description,
  onClick,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="profile-action-card group"
    >
      <div className="profile-action-icon">
        <Icon className="h-5 w-5" />
      </div>
      <div className="profile-action-content">
        <div className="profile-action-title">
          <span>{label}</span>
          {badge && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {badge}
            </Badge>
          )}
        </div>
        <p className="profile-action-description">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 profile-action-arrow" />
    </button>
  );
}

/**
 * ProfilePro - Premium profile page component
 * SAAS-style design with glassmorphism and Open Peeps
 */
export function ProfilePro({
  profile,
  subscription,
  onAvatarChange,
  onSettingsClick,
}: ProfileProProps) {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [projectsCompleted, setProjectsCompleted] = useState<number | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Mock referral data (would come from API)
  const referral = useMemo(() => ({
    code: "EXPERT20",
    totalReferrals: 3,
    totalEarnings: 150,
    pendingEarnings: 50,
  }), []);

  // Fetch stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [wallet, projects] = await Promise.all([
          getWallet(),
          getProjects("completed"),
        ]);
        setWalletBalance(wallet?.balance || 0);
        setProjectsCompleted(projects?.length || 0);
      } finally {
        setIsStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "U";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleAvatarUpload = (file: File) => {
    onAvatarChange(file);
    setUploadDialogOpen(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referral.code);
      setIsCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleShare = async () => {
    const shareText = `Use my referral code ${referral.code} to get 20% off your first project on AssignX!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join AssignX",
          text: shareText,
          url: `https://assignx.com/ref/${referral.code}`,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied to clipboard!");
    }
  };

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case "premium":
        return { color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white", icon: Crown };
      case "pro":
        return { color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white", icon: Sparkles };
      default:
        return { color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300", icon: Star };
    }
  };

  const tierConfig = getTierConfig(subscription.tier);
  const TierIcon = tierConfig.icon;

  return (
    <main className="profile-page flex-1 overflow-hidden">
      {/* Background mesh gradient */}
      <div className="profile-bg-mesh" aria-hidden="true" />

      <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-4xl mx-auto space-y-6">
        {/* Hero Section - Profile Card */}
        <section className="profile-hero">
          <div className="profile-hero-content">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
              {/* Avatar with edit button */}
              <div className="profile-avatar-wrapper">
                <Avatar className="profile-avatar">
                  <AvatarImage src={profile.avatar} alt={profile.firstName} />
                  <AvatarFallback className="text-2xl lg:text-3xl bg-gradient-to-br from-primary to-accent text-white font-semibold">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setUploadDialogOpen(true)}
                  className="profile-avatar-edit"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                {/* Name and tier badge */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 mb-2">
                  <h1 className="profile-user-name">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <span className={cn("profile-badge-tier", subscription.tier)}>
                    <TierIcon className="h-3 w-3" />
                    {subscription.tier}
                  </span>
                </div>

                {/* Email and verification */}
                <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 text-sm text-muted-foreground mb-3">
                  <div className="profile-user-email">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{profile.email}</span>
                    {profile.emailVerified && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                  </div>
                  <span className="hidden lg:inline text-border">|</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                </div>

                {/* Verification badges row */}
                <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                  {profile.emailVerified && (
                    <span className="profile-badge-verified">
                      <BadgeCheck className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  {subscription.tier !== "free" && (
                    <span className="profile-badge-premium">
                      <Zap className="h-3 w-3" />
                      Premium
                    </span>
                  )}
                </div>

                {/* Quick stats inline */}
                <div className="flex items-center justify-center lg:justify-start gap-6 mt-4 pt-4 border-t border-border/50">
                  <div className="text-center lg:text-left">
                    <div className="text-xl font-bold text-foreground">
                      {isStatsLoading ? (
                        <Skeleton className="h-6 w-10 mx-auto lg:mx-0" />
                      ) : (
                        projectsCompleted || 0
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Projects</div>
                  </div>
                  <div className="h-8 w-px bg-border/50" />
                  <div className="text-center lg:text-left">
                    <div className="text-xl font-bold text-foreground">
                      {isStatsLoading ? (
                        <Skeleton className="h-6 w-8 mx-auto lg:mx-0" />
                      ) : (
                        referral.totalReferrals
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Referrals</div>
                  </div>
                  <div className="h-8 w-px bg-border/50" />
                  <div className="text-center lg:text-left">
                    <div className="text-xl font-bold text-emerald-600">
                      {isStatsLoading ? (
                        <Skeleton className="h-6 w-16 mx-auto lg:mx-0" />
                      ) : (
                        `Rs.${walletBalance?.toLocaleString("en-IN") || 0}`
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Balance</div>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button (desktop only) */}
              <div className="hidden xl:block">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSettingsClick("personal")}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="profile-stats-grid">
          {isStatsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="profile-stat-card">
                  <Skeleton className="h-9 w-9 rounded-xl mb-3" />
                  <Skeleton className="h-7 w-20 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </>
          ) : (
            <>
              <MiniStat
                icon={Wallet}
                label="Wallet Balance"
                value={walletBalance || 0}
                prefix="Rs."
                href="/wallet"
                iconColor="text-emerald-600"
              />
              <MiniStat
                icon={FolderCheck}
                label="Projects Done"
                value={projectsCompleted || 0}
                href="/projects?tab=history"
                iconColor="text-blue-600"
              />
              <MiniStat
                icon={Users}
                label="Total Referrals"
                value={referral.totalReferrals}
                iconColor="text-purple-600"
              />
              <MiniStat
                icon={IndianRupee}
                label="Earnings"
                value={referral.totalEarnings}
                prefix="Rs."
                iconColor="text-amber-600"
                trend="up"
              />
            </>
          )}
        </section>

        {/* Wallet Top-up CTA */}
        <section className="profile-wallet-cta">
          <div className="profile-wallet-cta-content">
            <div className="flex items-center gap-4">
              <div className="profile-wallet-cta-icon">
                <Plus className="h-6 w-6" />
              </div>
              <div className="profile-wallet-cta-text">
                <h3>Add Money to Wallet</h3>
                <p>Top-up your balance for quick payments</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" asChild className="shrink-0">
              <Link href="/wallet?action=topup">
                Top Up
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Referral Section */}
        <section className="profile-referral">
          <div className="profile-referral-content">
            <div className="profile-referral-header">
              <div className="profile-referral-icon">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Refer & Earn</h3>
                <p className="text-xs text-muted-foreground">
                  Invite friends and earn Rs.50 per referral
                </p>
              </div>
            </div>

            {/* Referral Code */}
            <div className="flex gap-2 mb-4">
              <Input
                value={referral.code}
                readOnly
                className="profile-referral-code-input"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyCode}
                className="shrink-0 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                onClick={handleCopyCode}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Referral Stats */}
            <div className="profile-referral-stats">
              <div className="profile-referral-stat">
                <Users className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-lg font-bold text-foreground">{referral.totalReferrals}</p>
                  <p className="text-[10px] text-muted-foreground">Referrals</p>
                </div>
              </div>
              <div className="profile-referral-stat">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-lg font-bold text-foreground">Rs.{referral.totalEarnings}</p>
                  <p className="text-[10px] text-muted-foreground">Earned</p>
                </div>
              </div>
            </div>

            {referral.pendingEarnings > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-400 text-center mt-3">
                Rs.{referral.pendingEarnings} pending (credited after referral&apos;s first project)
              </p>
            )}
          </div>
        </section>

        {/* Quick Settings */}
        <section>
          <div className="profile-section-header">
            <h2 className="profile-section-title">Quick Settings</h2>
          </div>
          <div className="profile-actions-grid">
            <QuickAction
              icon={UserCircle}
              label="Personal Information"
              description="Update your name, phone, and other details"
              onClick={() => onSettingsClick("personal")}
            />
            <QuickAction
              icon={GraduationCap}
              label="Academic Details"
              description="Manage your university and course info"
              onClick={() => onSettingsClick("academic")}
            />
            <QuickAction
              icon={Bell}
              label="Notifications"
              description="Customize your notification preferences"
              onClick={() => onSettingsClick("preferences")}
            />
            <QuickAction
              icon={Shield}
              label="Security & Privacy"
              description="Password, 2FA, and session management"
              onClick={() => onSettingsClick("security")}
              badge="2FA"
            />
            <QuickAction
              icon={CreditCard}
              label="Subscription"
              description="Manage your plan and billing"
              onClick={() => onSettingsClick("subscription")}
              badge={subscription.tier === "free" ? "Upgrade" : undefined}
            />
          </div>
        </section>

        {/* App Info Footer */}
        <footer className="profile-footer">
          <p className="profile-footer-version">AssignX - Version 1.0.0</p>
          <div className="profile-footer-links">
            <Link href="/terms">Terms</Link>
            <span>-</span>
            <Link href="/privacy">Privacy</Link>
            <span>-</span>
            <Link href="/help">Help</Link>
          </div>
        </footer>
      </div>

      {/* Avatar Upload Dialog */}
      <AvatarUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleAvatarUpload}
        currentAvatar={profile.avatar}
      />
    </main>
  );
}
