"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { CheckCircle2, Clock, Shield, Users, Sparkles, TrendingUp, Star, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GoogleSignInButton } from "@/components/auth/google-signin-button";
import { cn } from "@/lib/utils";

/**
 * Login page with Google OAuth
 * Features split layout with animated benefits and subtle hover effects
 */

// Floating notification card component
function FloatingNotification({
  className,
  delay = 0
}: {
  className?: string;
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay,
        ease: "power2.out",
      }
    );
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/20",
        "animate-[float_6s_ease-in-out_infinite]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
          <TrendingUp className="size-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">+127%</p>
          <p className="text-xs text-muted-foreground">Success rate</p>
        </div>
      </div>
    </div>
  );
}

function FloatingBadge({
  className,
  delay = 0
}: {
  className?: string;
  delay?: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        delay,
        ease: "power2.out",
      }
    );
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "absolute bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-full px-4 py-2 shadow-xl border border-white/20",
        "animate-[float_5s_ease-in-out_infinite_0.5s]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Star className="size-4 text-yellow-500 fill-yellow-500" />
        <span className="text-sm font-medium text-foreground">4.9 Rating</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: CheckCircle2,
      title: "Expert Professionals",
      description: "Access to 500+ verified experts across all subjects",
      color: "from-indigo-500 to-purple-600",
      bgColor: "bg-indigo-500/10",
    },
    {
      icon: Clock,
      title: "On-Time Delivery",
      description: "99.8% of projects delivered before deadline",
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Shield,
      title: "Secure & Confidential",
      description: "Your data and projects are always protected",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Users,
      title: "24/7 Support",
      description: "Round-the-clock assistance whenever you need it",
      color: "from-orange-500 to-amber-600",
      bgColor: "bg-orange-500/10",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate features
      if (featuresRef.current) {
        const featureItems = featuresRef.current.querySelectorAll(".feature-item");
        gsap.fromTo(
          featureItems,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.2,
          }
        );
      }

      // Animate form
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.3,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex min-h-screen">
      {/* Left side - Features/Benefits (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />

        {/* Animated orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 max-w-xl mx-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="size-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trusted by 10,000+ Students</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Welcome back to{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]">
                AssignX
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Your trusted partner for academic and professional project assistance.
            </p>
          </div>

          {/* Feature list with hover effects */}
          <div ref={featuresRef} className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "feature-item group flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer",
                  "hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-lg hover:shadow-primary/5",
                  "border border-transparent hover:border-primary/10",
                  hoveredFeature === index && "bg-white/60 dark:bg-slate-800/60 shadow-lg border-primary/10"
                )}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                  feature.bgColor,
                  "group-hover:scale-110 group-hover:shadow-lg"
                )}>
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {feature.description}
                  </p>
                </div>
                <ArrowRight className={cn(
                  "size-5 text-muted-foreground transition-all duration-300 opacity-0 -translate-x-2",
                  "group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary"
                )} />
              </div>
            ))}
          </div>

          {/* Stats with hover effects */}
          <div className="mt-12 flex gap-6">
            {[
              { value: "10K+", label: "Happy Students" },
              { value: "50K+", label: "Projects Done" },
              { value: "4.9", label: "Avg. Rating" },
            ].map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "group p-4 rounded-xl transition-all duration-300 cursor-default",
                  "hover:bg-white/60 dark:hover:bg-slate-800/60 hover:shadow-lg"
                )}
              >
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform origin-left">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating notification cards */}
        <FloatingNotification
          className="top-32 right-16"
          delay={0.8}
        />
        <FloatingBadge
          className="bottom-40 right-24"
          delay={1.2}
        />
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-4 py-12 bg-background">
        <div ref={formRef} className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25">
                <Sparkles className="size-6 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
                  AssignX
                </span>
                <Badge variant="secondary" className="text-xs">
                  Beta
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Sign in form */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-border/50 shadow-sm">
              <GoogleSignInButton />
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">
                New to AssignX?
              </span>
            </div>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <Link
              href="/onboarding"
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium",
                "border-2 border-primary/20 text-primary",
                "hover:bg-primary/5 hover:border-primary/40 transition-all duration-300",
                "group"
              )}
            >
              Create an account
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
