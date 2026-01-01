"use client";

/**
 * HowItWorks - Step-by-step process section
 * Features GSAP line drawing and step reveals
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Upload, Users, FileCheck, Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { easings } from "@/lib/gsap/animations";

// Register plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const steps = [
  {
    number: "01",
    title: "Submit Your Project",
    description:
      "Tell us about your project requirements. Upload any reference materials and set your deadline.",
    icon: Upload,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    number: "02",
    title: "Get Matched",
    description:
      "We match you with the perfect expert based on your subject, requirements, and budget.",
    icon: Users,
    color: "from-purple-500 to-purple-600",
  },
  {
    number: "03",
    title: "Review Progress",
    description:
      "Track your project in real-time. Communicate directly with your expert and request changes.",
    icon: FileCheck,
    color: "from-green-500 to-green-600",
  },
  {
    number: "04",
    title: "Download & Succeed",
    description:
      "Receive your completed work, reviewed for quality. Unlimited revisions until you're satisfied.",
    icon: Download,
    color: "from-orange-500 to-orange-600",
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: easings.smooth,
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Line drawing animation
      if (lineRef.current) {
        const lineLength = lineRef.current.getTotalLength();
        gsap.set(lineRef.current, {
          strokeDasharray: lineLength,
          strokeDashoffset: lineLength,
        });

        gsap.to(lineRef.current, {
          strokeDashoffset: 0,
          duration: 2,
          ease: "none",
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 60%",
            end: "bottom 40%",
            scrub: 1,
          },
        });
      }

      // Steps animation
      const stepCards = stepsRef.current?.querySelectorAll(".step-card");
      if (stepCards) {
        stepCards.forEach((card, index) => {
          gsap.fromTo(
            card,
            { opacity: 0, x: index % 2 === 0 ? -60 : 60 },
            {
              opacity: 1,
              x: 0,
              duration: 1,
              ease: easings.smooth,
              scrollTrigger: {
                trigger: card,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      className="py-24 md:py-32 lg:py-40 bg-slate-50 dark:bg-slate-900/50 overflow-hidden"
    >
      <div className="container px-6 md:px-8 lg:px-12">
        {/* Heading */}
        <div ref={headingRef} className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <span className="inline-block text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
            Simple Steps to{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Get Started
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Getting expert help is easy. Follow these four simple steps and
            let us handle the rest.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="relative max-w-5xl mx-auto">
          {/* Connecting line (desktop) */}
          <svg
            className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 h-full w-2 hidden md:block"
            viewBox="0 0 4 800"
            preserveAspectRatio="none"
          >
            <path
              ref={lineRef}
              d="M2 0 L2 800"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>

          {/* Step cards */}
          <div className="space-y-12 md:space-y-20">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.number}
                  className={cn(
                    "step-card relative flex flex-col md:flex-row items-center gap-8 md:gap-12",
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  )}
                >
                  {/* Content */}
                  <div
                    className={cn(
                      "flex-1",
                      isEven ? "md:text-right" : "md:text-left"
                    )}
                  >
                    <div
                      className={cn(
                        "inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4",
                        `bg-gradient-to-r ${step.color} text-white shadow-lg`
                      )}
                    >
                      Step {step.number}
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
                      {step.title}
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Icon circle */}
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center",
                        "bg-white dark:bg-slate-800 border-4 border-indigo-500",
                        "shadow-xl shadow-indigo-500/20"
                      )}
                    >
                      <Icon className="size-10 md:size-12 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>

                  {/* Spacer for alignment */}
                  <div className="flex-1 hidden md:block" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
