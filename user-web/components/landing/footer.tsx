"use client";

/**
 * Footer - Animated footer with massive brand text reveal
 * Features GSAP scroll-triggered animations matching saas template
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ASSIGNX_EASE } from "@/lib/animations/constants";
import "@/app/landing.css";

// Register plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const footerLinks = {
  services: [
    { label: "Academic Reports", href: "/services/reports" },
    { label: "Proofreading", href: "/services/proofreading" },
    { label: "1-on-1 Tutoring", href: "/services/tutoring" },
    { label: "Consultation", href: "/services/consultation" },
    { label: "Career Support", href: "/services/career" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing", href: "/pricing" },
    { label: "Reviews", href: "/reviews" },
    { label: "Careers", href: "/careers" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  const containerRef = useRef<HTMLElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Massive brand text reveal animation
      if (brandTextRef.current) {
        gsap.fromTo(
          brandTextRef.current,
          {
            opacity: 0,
            y: 100,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: ASSIGNX_EASE as unknown as string,
            scrollTrigger: {
              trigger: brandTextRef.current,
              start: "top 90%",
              end: "top 50%",
              scrub: 1,
            },
          }
        );
      }

      // Content reveal animation
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: ASSIGNX_EASE as unknown as string,
          scrollTrigger: {
            trigger: contentRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Stagger link columns
      const columns = contentRef.current?.querySelectorAll(".footer-column");
      if (columns) {
        gsap.fromTo(
          columns,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: ASSIGNX_EASE as unknown as string,
            scrollTrigger: {
              trigger: contentRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <footer ref={containerRef} className="bg-[var(--landing-bg-dark)] pt-20 md:pt-32 lg:pt-40 pb-8 overflow-hidden">
      {/* Massive Brand Text */}
      <div
        ref={brandTextRef}
        className="container px-6 md:px-8 lg:px-12 mb-16 md:mb-24"
      >
        <div className="text-center">
          <h2 className="landing-font-display text-[15vw] md:text-[12vw] lg:text-[10vw] font-bold leading-none tracking-tighter landing-text-gradient">
            AssignX
          </h2>
          <p className="text-white/40 text-lg md:text-xl mt-4">
            Your Academic Success Partner
          </p>
        </div>
      </div>

      <div className="container px-6 md:px-8 lg:px-12">
        <div ref={contentRef}>
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-16 md:mb-20">
            {/* Brand column */}
            <div className="footer-column lg:col-span-2">
              {/* Logo */}
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--landing-accent-primary)] to-[var(--landing-accent-purple)] flex items-center justify-center">
                  <Sparkles className="size-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white landing-font-display">
                  AssignX
                </span>
              </Link>

              <p className="text-white/60 mb-6 max-w-sm leading-relaxed">
                Empowering students and professionals with expert academic
                support. Quality work, delivered on time.
              </p>

              {/* Newsletter */}
              <form onSubmit={handleNewsletterSubmit} className="mb-6">
                <p className="text-sm font-medium text-white/80 mb-3">
                  Subscribe to our newsletter
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl",
                      "bg-white/[0.05] border border-white/[0.1]",
                      "text-white placeholder:text-white/40",
                      "focus:outline-none focus:border-[var(--landing-accent-primary)]",
                      "transition-colors"
                    )}
                    required
                  />
                  <button
                    type="submit"
                    className={cn(
                      "px-4 py-3 rounded-xl",
                      "bg-gradient-to-r from-[var(--landing-accent-primary)] to-[var(--landing-accent-purple)]",
                      "text-white",
                      "hover:opacity-90 transition-opacity"
                    )}
                  >
                    <ArrowRight className="size-5" />
                  </button>
                </div>
              </form>

              {/* Contact info */}
              <div className="space-y-2 text-sm text-white/50">
                <div className="flex items-center gap-2">
                  <Mail className="size-4" />
                  <span>support@assignx.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="footer-column">
              <h3 className="font-bold text-white mb-4">Services</h3>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-[var(--landing-accent-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="footer-column">
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-[var(--landing-accent-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="footer-column">
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-[var(--landing-accent-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.1] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} AssignX. All rights reserved.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      "bg-white/[0.05] border border-white/[0.1]",
                      "text-white/60",
                      "hover:bg-[var(--landing-accent-primary)] hover:text-white hover:border-[var(--landing-accent-primary)]",
                      "transition-all duration-300"
                    )}
                    aria-label={social.label}
                  >
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
