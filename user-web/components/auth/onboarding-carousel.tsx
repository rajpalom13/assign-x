"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lightbulb, Layers, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingSlide } from "./onboarding-slide";
import { cn } from "@/lib/utils";

const slides = [
  {
    id: 1,
    icon: Lightbulb,
    title: "Expert Project Support",
    description:
      "Get professional help with your academic projects, career documents, and business needs. Our experts deliver quality work on time.",
  },
  {
    id: 2,
    icon: Layers,
    title: "Versatile Services",
    description:
      "From dissertations to resumes, plagiarism checks to expert consultations. We offer a comprehensive range of services tailored to your needs.",
  },
  {
    id: 3,
    icon: Shield,
    title: "Quality Guaranteed",
    description:
      "Every project undergoes rigorous quality checks. Your work is secure, confidential, and delivered with AI & plagiarism reports.",
  },
];

/**
 * Onboarding carousel with 3 slides
 * Includes Skip, Next, and Get Started navigation
 */
export function OnboardingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      router.push("/onboarding?step=role");
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    router.push("/onboarding?step=role");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col px-4">
      {/* Skip button */}
      <div className="flex justify-end py-4">
        <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      {/* Slides container */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative w-full max-w-lg">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all",
                index === currentSlide ? "pointer-events-auto" : "pointer-events-none"
              )}
            >
              <OnboardingSlide
                icon={slide.icon}
                title={slide.title}
                description={slide.description}
                isActive={index === currentSlide}
              />
            </div>
          ))}
          {/* Static placeholder for layout */}
          <div className="invisible">
            <OnboardingSlide
              icon={slides[0].icon}
              title={slides[0].title}
              description={slides[0].description}
              isActive={false}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col items-center gap-6 py-8">
        {/* Dot indicators */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        {/* Action button */}
        <Button size="lg" onClick={handleNext} className="w-full max-w-xs">
          {isLastSlide ? (
            "Get Started"
          ) : (
            <>
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
