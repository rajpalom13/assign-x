/**
 * @fileoverview Animated onboarding slideshow for new supervisor orientation.
 * @module components/onboarding/onboarding-slides
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, CheckCircle2, BookOpen, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/constants"

interface OnboardingSlidesProps {
  onComplete: () => void
}

const slides = [
  {
    id: 1,
    icon: CheckCircle2,
    title: "Can you supervise with the knowledge you have?",
    description: "As a supervisor at AdminX, you'll leverage your expertise to ensure quality delivery. Your knowledge is the foundation of trust between clients and experts.",
    features: [
      "Review and validate expert work",
      "Set fair and accurate pricing",
      "Maintain quality standards",
    ],
  },
  {
    id: 2,
    icon: BookOpen,
    title: "Do you want to increase the knowledge in your field?",
    description: "Working with AdminX means continuous learning. You'll be exposed to diverse projects that expand your expertise and keep you at the cutting edge of your field.",
    features: [
      "Access to advanced training modules",
      "Work on diverse, challenging projects",
      "Connect with industry experts",
    ],
  },
  {
    id: 3,
    icon: TrendingUp,
    title: `${APP_NAME} is for you!`,
    description: "Join our network of elite supervisors and start earning while doing what you love. Quality. Integrity. Supervision.",
    features: [
      "Flexible working hours",
      "Competitive commission rates",
      "Professional growth opportunities",
    ],
  },
]

export function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const slide = slides[currentSlide]
  const Icon = slide.icon

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : index < currentSlide
                  ? "w-2 bg-primary/60"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8 flex justify-center"
            >
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon className="w-12 h-12 text-primary" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
            >
              {slide.description}
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-3 max-w-md mx-auto mb-12"
            >
              {slide.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-left bg-card rounded-lg px-4 py-3 shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentSlide + 1} of {slides.length}
          </span>

          <Button onClick={nextSlide} className="gap-2">
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            {currentSlide < slides.length - 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
