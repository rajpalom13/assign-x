'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Globe, Wallet, Headphones, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OnboardingSlide {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  bgGradient: string
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Countless Opportunities',
    description: 'Discover countless opportunities in your field of expertise. Connect with projects that match your skills.',
    icon: <Globe className="h-24 w-24" />,
    bgGradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 2,
    title: 'Small Tasks, Big Rewards',
    description: 'Complete small tasks and earn big rewards consistently. Your skills have real value here.',
    icon: <Wallet className="h-24 w-24" />,
    bgGradient: 'from-green-500/20 to-emerald-500/20',
  },
  {
    id: 3,
    title: 'Supervisor Support (24x7)',
    description: 'Get round-the-clock support from dedicated supervisors. We are here to help you succeed.',
    icon: <Headphones className="h-24 w-24" />,
    bgGradient: 'from-purple-500/20 to-violet-500/20',
  },
  {
    id: 4,
    title: 'Practical Learning',
    description: 'Practical learning with part-time earning opportunities. Grow your skills while you earn.',
    icon: <BookOpen className="h-24 w-24" />,
    bgGradient: 'from-orange-500/20 to-amber-500/20',
  },
]

interface OnboardingCarouselProps {
  /** Callback when user completes onboarding */
  onComplete: () => void
  /** Callback when user skips onboarding */
  onSkip?: () => void
}

/**
 * Onboarding carousel component with 4 slides
 * Features swipe gestures, skip button, and dot indicators
 */
export function OnboardingCarousel({ onComplete, onSkip }: OnboardingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  const isLastSlide = currentSlide === slides.length - 1

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }, [currentSlide])

  const nextSlide = useCallback(() => {
    if (isLastSlide) {
      onComplete()
    } else {
      setDirection(1)
      setCurrentSlide((prev) => prev + 1)
    }
  }, [isLastSlide, onComplete])

  const handleSkip = useCallback(() => {
    onSkip?.() ?? onComplete()
  }, [onSkip, onComplete])

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      {/* Skip Button */}
      <div className="absolute right-4 top-4 z-10">
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
      </div>

      {/* Slide Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon with gradient background */}
            <div
              className={cn(
                'mb-8 flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br',
                currentSlideData.bgGradient
              )}
            >
              <div className="text-primary">
                {currentSlideData.icon}
              </div>
            </div>

            {/* Title */}
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              {currentSlideData.title}
            </h2>

            {/* Description */}
            <p className="max-w-sm text-muted-foreground">
              {currentSlideData.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="px-6 pb-12">
        {/* Dot Indicators */}
        <div className="mb-8 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={nextSlide}
          size="lg"
          className="w-full gap-2"
        >
          {isLastSlide ? 'Get Started' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
