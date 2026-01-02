/**
 * @fileoverview TimelineShowcase - Vertical scroll timeline with tracking line
 *
 * Replaces horizontal scroll with elegant vertical timeline.
 * Progress line tracks scroll position through steps.
 */

"use client";

import { useRef, useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookOpen } from "lucide-react";
import "@/app/landing.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface TimelineStep {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  stats?: { value: string; label: string }[];
}

const timelineSteps: TimelineStep[] = [
  {
    id: "submit",
    number: "01",
    title: "Submit Your Project",
    subtitle: "It starts with a simple request",
    description:
      "Upload your assignment details, set your deadline, and share any specific requirements. Our platform handles every academic subject.",
    color: "var(--landing-accent-primary)",
    stats: [
      { value: "2min", label: "Avg. submission" },
      { value: "100+", label: "Subjects covered" },
    ],
  },
  {
    id: "match",
    number: "02",
    title: "Get Matched Instantly",
    subtitle: "AI-powered expert matching",
    description:
      "Our intelligent system connects you with the perfect expert based on subject, complexity, and deadline. Quality guaranteed.",
    color: "var(--landing-accent-secondary)",
    stats: [
      { value: "15sec", label: "Match time" },
      { value: "500+", label: "Verified experts" },
    ],
  },
  {
    id: "collaborate",
    number: "03",
    title: "Collaborate & Review",
    subtitle: "Stay connected throughout",
    description:
      "Chat directly with your expert, request revisions, and track progress in real-time. Full transparency at every step.",
    color: "var(--landing-accent-tertiary)",
    stats: [
      { value: "24/7", label: "Support" },
      { value: "∞", label: "Revisions" },
    ],
  },
  {
    id: "deliver",
    number: "04",
    title: "Receive Excellence",
    subtitle: "Quality delivered on time",
    description:
      "Get your completed work before the deadline. Every delivery is plagiarism-checked and meets the highest academic standards.",
    color: "var(--landing-text-primary)",
    stats: [
      { value: "98%", label: "On-time delivery" },
      { value: "4.9", label: "Avg. rating" },
    ],
  },
];

interface HorizontalShowcaseProps {
  className?: string;
}

export function HorizontalShowcase({ className }: HorizontalShowcaseProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const progressLineRef = useRef<HTMLDivElement>(null);
  const progressDotRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const timeline = timelineRef.current;
    const progressLine = progressLineRef.current;
    const progressDot = progressDotRef.current;

    if (!section || !timeline || !progressLine || !progressDot) return;

    const ctx = gsap.context(() => {
      // Animate the progress line height based on scroll
      gsap.to(progressLine, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: timeline,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 1,
        },
      });

      // Move the progress dot along with scroll
      gsap.to(progressDot, {
        top: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: timeline,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 0.5,
        },
      });

      // Animate each step
      stepsRef.current.forEach((step, i) => {
        if (!step) return;

        const stepNumber = step.querySelector(".step-number");
        const stepContent = step.querySelector(".step-content");
        const stepIcon = step.querySelector(".step-icon");
        const stepStats = step.querySelectorAll(".step-stat");
        const stepConnector = step.querySelector(".step-connector");

        // Step number animation
        if (stepNumber) {
          gsap.fromTo(
            stepNumber,
            {
              scale: 0.5,
              opacity: 0,
              rotateY: -90,
            },
            {
              scale: 1,
              opacity: 1,
              rotateY: 0,
              duration: 0.8,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: step,
                start: "top 75%",
                end: "top 50%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Step connector pulse
        if (stepConnector) {
          gsap.fromTo(
            stepConnector,
            { scaleY: 0, opacity: 0 },
            {
              scaleY: 1,
              opacity: 1,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: step,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Content slide in
        if (stepContent) {
          gsap.fromTo(
            stepContent,
            {
              x: i % 2 === 0 ? -60 : 60,
              opacity: 0,
            },
            {
              x: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: step,
                start: "top 70%",
                end: "top 40%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Icon animation
        if (stepIcon) {
          gsap.fromTo(
            stepIcon,
            {
              scale: 0,
              rotate: -180,
            },
            {
              scale: 1,
              rotate: 0,
              duration: 0.6,
              ease: "back.out(2)",
              scrollTrigger: {
                trigger: step,
                start: "top 65%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Stats staggered animation
        if (stepStats.length) {
          gsap.fromTo(
            stepStats,
            {
              y: 30,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: step,
                start: "top 60%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      // Parallax background elements
      const bgElements = section.querySelectorAll(".bg-element");
      bgElements.forEach((el, i) => {
        gsap.to(el, {
          y: -100 * (1 + i * 0.3),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <section className={cn("py-20 bg-[var(--landing-bg-primary)]", className)}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl font-bold text-[var(--landing-text-primary)] text-center mb-12 landing-heading">
            How It Works
          </h2>
          <div className="space-y-8">
            {timelineSteps.map((step) => (
              <div key={step.id} className="p-6 bg-[var(--landing-bg-elevated)] border border-[var(--landing-border)] rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold" style={{ color: step.color }}>
                    {step.number}
                  </span>
                  <h3 className="text-xl font-semibold text-[var(--landing-text-primary)]">{step.title}</h3>
                </div>
                <p className="text-[var(--landing-text-secondary)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={cn("relative bg-[var(--landing-bg-primary)] overflow-hidden", className)}
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="bg-element absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full opacity-10 blur-[120px]"
          style={{ background: "var(--landing-accent-primary)" }}
        />
        <div
          className="bg-element absolute top-[40%] right-[10%] w-[350px] h-[350px] rounded-full opacity-8 blur-[100px]"
          style={{ background: "var(--landing-accent-secondary)" }}
        />
        <div
          className="bg-element absolute top-[70%] left-[15%] w-[300px] h-[300px] rounded-full opacity-8 blur-[100px]"
          style={{ background: "var(--landing-accent-tertiary)" }}
        />
      </div>

      <div className="relative z-10 py-24 sm:py-32">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-20">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium tracking-wider uppercase mb-6 bg-[var(--landing-accent-primary)]/10 text-[var(--landing-accent-primary)] border border-[var(--landing-accent-primary)]/20">
            The Process
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--landing-text-primary)] mb-6 landing-heading">
            From Stress to
            <span
              className="block mt-2"
              style={{
                background: "linear-gradient(135deg, var(--landing-accent-primary), var(--landing-accent-secondary), var(--landing-accent-tertiary))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Success
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-[var(--landing-text-secondary)] max-w-2xl mx-auto">
            Four simple steps to transform your academic journey. Watch the progress as you scroll.
          </p>
        </div>

        {/* Timeline */}
        <div
          ref={timelineRef}
          className="relative max-w-6xl mx-auto px-4 sm:px-6"
        >
          {/* Center Line Track */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 hidden md:block">
            {/* Background track */}
            <div className="absolute inset-0 bg-[var(--landing-border)] rounded-full" />

            {/* Progress line */}
            <div
              ref={progressLineRef}
              className="absolute top-0 left-0 w-full rounded-full origin-top"
              style={{
                height: "0%",
                background: "linear-gradient(180deg, var(--landing-accent-primary), var(--landing-accent-secondary), var(--landing-accent-tertiary))",
              }}
            />

            {/* Progress dot */}
            <div
              ref={progressDotRef}
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ top: "0%" }}
            >
              <div className="relative">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, var(--landing-accent-primary), var(--landing-accent-tertiary))",
                    boxShadow: "0 0 20px var(--landing-accent-primary), 0 0 40px var(--landing-accent-primary)",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-50"
                  style={{ background: "var(--landing-accent-primary)" }}
                />
              </div>
            </div>
          </div>

          {/* Mobile line (left side) */}
          <div className="absolute left-4 top-0 bottom-0 w-px md:hidden">
            <div className="absolute inset-0 bg-[var(--landing-border)] rounded-full" />
            <div
              className="progress-line-mobile absolute top-0 left-0 w-full rounded-full origin-top"
              style={{
                height: "0%",
                background: "linear-gradient(180deg, var(--landing-accent-primary), var(--landing-accent-secondary), var(--landing-accent-tertiary))",
              }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-24 sm:space-y-32">
            {timelineSteps.map((step, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={step.id}
                  ref={(el) => {
                    stepsRef.current[index] = el;
                  }}
                  className={cn(
                    "relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center",
                    "pl-12 md:pl-0"
                  )}
                >
                  {/* Content - alternates sides on desktop */}
                  <div
                    className={cn(
                      "step-content",
                      isEven ? "md:text-right md:order-1" : "md:order-3"
                    )}
                  >
                    <div
                      className={cn(
                        "inline-block",
                        isEven ? "md:text-right" : "md:text-left"
                      )}
                    >
                      <span
                        className="text-sm font-medium uppercase tracking-wider mb-2 block"
                        style={{ color: step.color, opacity: 0.7 }}
                      >
                        {step.subtitle}
                      </span>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] mb-4 landing-heading">
                        {step.title}
                      </h3>
                      <p className="text-[var(--landing-text-secondary)] text-base sm:text-lg leading-relaxed max-w-md">
                        {step.description}
                      </p>

                      {/* Stats */}
                      {step.stats && (
                        <div
                          className={cn(
                            "flex gap-6 mt-6",
                            isEven ? "md:justify-end" : "md:justify-start"
                          )}
                        >
                          {step.stats.map((stat, i) => (
                            <div key={i} className="step-stat">
                              <div
                                className="text-2xl sm:text-3xl font-bold"
                                style={{ color: step.color }}
                              >
                                {stat.value}
                              </div>
                              <div className="text-xs sm:text-sm text-[var(--landing-text-muted)] uppercase tracking-wider">
                                {stat.label}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center Node */}
                  <div className="md:order-2 flex justify-center">
                    <div className="flex flex-col items-center">
                      {/* Step number */}
                      {index < timelineSteps.length - 1 ? (
                        <div
                          className="step-number w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center"
                          style={{
                            background: `${step.color}15`,
                            border: `2px solid ${step.color}40`,
                            boxShadow: `0 0 40px ${step.color}15`,
                          }}
                        >
                          <span
                            className="text-2xl sm:text-3xl font-black"
                            style={{ color: step.color }}
                          >
                            {step.number}
                          </span>
                        </div>
                      ) : (
                        <div className="step-number">
                          <span
                            className="text-5xl sm:text-6xl font-black"
                            style={{ color: step.color }}
                          >
                            {step.number}
                          </span>
                        </div>
                      )}

                      {/* Connector line to next step */}
                      {index < timelineSteps.length - 1 && (
                        <div
                          className="step-connector w-px h-20 sm:h-28 origin-top mt-4"
                          style={{ background: `${step.color}30` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Empty space for grid alignment */}
                  <div className={isEven ? "hidden md:block md:order-3" : "hidden md:block md:order-1"} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center mt-24 sm:mt-32">
          <div className="p-8 sm:p-12 rounded-3xl bg-[var(--landing-bg-elevated)] border border-[var(--landing-border)] shadow-lg">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] mb-4 landing-heading">
              Ready to Start Your Journey?
            </h3>
            <p className="text-[var(--landing-text-secondary)] mb-8 max-w-xl mx-auto">
              Join thousands of students who have transformed their academic experience.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/signup"
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl overflow-hidden font-semibold"
                style={{
                  background: "linear-gradient(135deg, var(--landing-accent-primary), var(--landing-accent-secondary))",
                }}
              >
                <span className="relative text-white">Get Started Free</span>
                <svg
                  className="relative w-5 h-5 text-white transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#services"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] border border-[var(--landing-border)] hover:border-[var(--landing-accent-primary)] transition-colors font-medium"
              >
                <BookOpen className="w-5 h-5" />
                View Services
              </a>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
