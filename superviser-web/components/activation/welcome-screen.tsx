/**
 * @fileoverview Welcome screen shown after successful supervisor activation.
 * @module components/activation/welcome-screen
 */

"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { CheckCircle2, Sparkles, LayoutDashboard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/constants"
import confetti from "canvas-confetti"

interface WelcomeScreenProps {
  userName: string
  onEnterDashboard?: () => void
}

export function WelcomeScreen({ userName, onEnterDashboard }: WelcomeScreenProps) {
  const router = useRouter()
  const [isEntering, setIsEntering] = useState(false)

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: ReturnType<typeof setInterval> = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#1E3A5F", "#64748B", "#22C55E", "#3B82F6"],
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#1E3A5F", "#64748B", "#22C55E", "#3B82F6"],
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const handleEnterDashboard = () => {
    setIsEntering(true)
    if (onEnterDashboard) {
      onEnterDashboard()
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2 }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-primary">Dashboard Unlocked</span>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>

          <h1 className="text-4xl font-bold mb-4">
            Welcome, {userName.split(" ")[0]}!
          </h1>

          <p className="text-xl text-muted-foreground mb-2">
            Your {APP_NAME} dashboard is ready.
          </p>

          <p className="text-muted-foreground mb-8">
            You&apos;ve completed all training and passed the assessment.
            <br />
            You&apos;re now an official {APP_NAME} Supervisor!
          </p>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="p-4 bg-card rounded-lg border">
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-xs text-muted-foreground">Active Projects</p>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <p className="text-3xl font-bold text-green-600">15%</p>
            <p className="text-xs text-muted-foreground">Commission Rate</p>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <p className="text-3xl font-bold text-yellow-600">New</p>
            <p className="text-xs text-muted-foreground">Status</p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            size="lg"
            onClick={handleEnterDashboard}
            disabled={isEntering}
            className="px-8"
          >
            {isEntering ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entering Dashboard...
              </>
            ) : (
              <>
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Enter Dashboard
              </>
            )}
          </Button>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          Quality. Integrity. Supervision.
        </motion.p>
      </motion.div>
    </div>
  )
}
