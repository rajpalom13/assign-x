"use client";

/**
 * CTASection - Call-to-action section with animated background
 * Features GSAP floating elements and magnetic button
 */

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { createMagneticEffect, easings } from "@/lib/gsap/animations";

// Register plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function CTASection() {
  const containerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const floatingRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Content reveal
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: easings.smooth,
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Floating elements animation
      floatingRefs.current.forEach((el, index) => {
        if (!el) return;

        const randomX = (Math.random() - 0.5) * 100;
        const randomY = (Math.random() - 0.5) * 100;
        const duration = 4 + Math.random() * 4;

        gsap.to(el, {
          x: randomX,
          y: randomY,
          rotation: Math.random() * 360,
          duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    }, containerRef);

    // Magnetic effect on button
    const cleanup = buttonRef.current
      ? createMagneticEffect(buttonRef.current, 0.3)
      : undefined;

    return () => {
      ctx.revert();
      cleanup?.();
    };
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !floatingRefs.current.includes(el)) {
      floatingRefs.current.push(el);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative py-24 md:py-32 lg:py-40 overflow-hidden bg-slate-50 dark:bg-slate-900/50"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            ref={addToRefs}
            className={cn(
              "absolute w-3 h-3 md:w-4 md:h-4 rounded-full",
              i % 2 === 0 ? "bg-indigo-500/20" : "bg-purple-500/20"
            )}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
          />
        ))}
      </div>

      <div className="container px-6 md:px-8 lg:px-12 relative">
        <div
          ref={contentRef}
          className="max-w-4xl mx-auto text-center p-8 md:p-12 lg:p-16 rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-indigo-500/10"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
            <Sparkles className="size-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Limited Time: 20% Off First Project
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
            Ready to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Transform
            </span>
            <br />
            Your Academic Journey?
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of successful students. Get expert help with your
            projects, papers, and assignments today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              ref={buttonRef}
              href="/signup"
              className={cn(
                "group relative inline-flex items-center gap-2 px-8 py-4 rounded-full",
                "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg",
                "shadow-lg shadow-indigo-500/30",
                "hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5",
                "transition-all duration-300"
              )}
            >
              Start Your Free Trial
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="#features"
              className={cn(
                "inline-flex items-center gap-2 px-8 py-4 rounded-full",
                "border-2 border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50",
                "font-semibold text-lg text-slate-700 dark:text-slate-200",
                "hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
                "transition-all duration-300"
              )}
            >
              Learn More
            </Link>
          </div>

          {/* Trust badge */}
          <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            ✓ No credit card required • ✓ Free consultation • ✓ Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
