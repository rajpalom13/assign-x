'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Globe, Wallet, Headphones, BookOpen, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OnboardingSlide {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  bgGradient: string
  iconBg: string
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Countless Opportunities',
    description: 'Discover countless opportunities in your field of expertise. Connect with projects that match your skills.',
    icon: <Globe className="h-16 w-16" />,
    bgGradient: 'from-teal-500/20 via-teal-400/10 to-emerald-500/20',
    iconBg: 'from-teal-400 to-teal-600',
  },
  {
    id: 2,
    title: 'Small Tasks, Big Rewards',
    description: 'Complete small tasks and earn big rewards consistently. Your skills have real value here.',
    icon: <Wallet className="h-16 w-16" />,
    bgGradient: 'from-emerald-500/20 via-emerald-400/10 to-green-500/20',
    iconBg: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 3,
    title: 'Supervisor Support (24x7)',
    description: 'Get round-the-clock support from dedicated supervisors. We are here to help you succeed.',
    icon: <Headphones className="h-16 w-16" />,
    bgGradient: 'from-amber-500/20 via-amber-400/10 to-orange-500/20',
    iconBg: 'from-amber-400 to-amber-600',
  },
  {
    id: 4,
    title: 'Practical Learning',
    description: 'Practical learning with part-time earning opportunities. Grow your skills while you earn.',
    icon: <BookOpen className="h-16 w-16" />,
    bgGradient: 'from-purple-500/20 via-purple-400/10 to-violet-500/20',
    iconBg: 'from-purple-400 to-purple-600',
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
 * Professional design with teal/emerald theme
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
    <div className="relative flex min-h-screen flex-col bg-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br transition-colors duration-500",
          currentSlideData.bgGradient
        )} />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-20 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <span className="text-base font-bold text-white">AX</span>
          </div>
          <span className="font-semibold text-lg">AssignX</span>
        </div>

        {/* Skip Button */}
        <Button
          variant="ghost"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Skip
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Slide Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
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
            className="flex flex-col items-center text-center max-w-md"
          >
            {/* Icon with gradient background */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className={cn(
                'mb-8 flex h-40 w-40 items-center justify-center rounded-3xl bg-gradient-to-br shadow-2xl',
                currentSlideData.iconBg
              )}
            >
              <div className="text-white">
                {currentSlideData.icon}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4 text-2xl sm:text-3xl font-bold text-foreground"
            >
              {currentSlideData.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground leading-relaxed"
            >
              {currentSlideData.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 px-6 pb-12">
        {/* Dot Indicators */}
        <div className="mb-8 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                index === currentSlide
                  ? 'w-10 bg-gradient-to-r from-teal-500 to-emerald-500'
                  : 'w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={nextSlide}
          size="lg"
          className="w-full gap-2 gradient-primary hover:opacity-90 h-14 text-base font-semibold shadow-lg shadow-teal-500/20"
        >
          {isLastSlide ? (
            <>
              Get Started
              <ArrowRight className="h-5 w-5" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </Button>

        {/* Slide counter */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {currentSlide + 1} of {slides.length}
        </p>
      </div>
    </div>
  )
}
