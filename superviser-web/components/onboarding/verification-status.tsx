/**
 * @fileoverview Verification status display for supervisor application progress.
 * @module components/onboarding/verification-status
 */

"use client"

import { motion } from "framer-motion"
import {
  Clock,
  CheckCircle2,
  FileSearch,
  GraduationCap,
  Shield,
  Loader2,
  RefreshCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { APP_NAME } from "@/lib/constants"

type VerificationStep = "cv" | "experience" | "background"
type StepStatus = "pending" | "in_progress" | "verified" | "rejected"

interface VerificationStatusProps {
  status: {
    applicationStatus: "pending" | "in_review" | "approved" | "rejected"
    cvVerification: StepStatus
    experienceValidation: StepStatus
    backgroundCheck: StepStatus
  }
  onRefresh?: () => void
  isRefreshing?: boolean
}

const stepConfig: Record<VerificationStep, { label: string; icon: typeof Clock; description: string }> = {
  cv: {
    label: "CV Verification",
    icon: FileSearch,
    description: "Reviewing your qualifications and experience",
  },
  experience: {
    label: "Experience Validation",
    icon: GraduationCap,
    description: "Validating years of professional experience",
  },
  background: {
    label: "Background Check",
    icon: Shield,
    description: "Verifying professional credentials",
  },
}

const statusColors: Record<StepStatus, { icon: string; text: string; bg: string }> = {
  pending: { icon: "text-yellow-500", text: "text-yellow-600", bg: "bg-yellow-100" },
  in_progress: { icon: "text-blue-500", text: "text-blue-600", bg: "bg-blue-100" },
  verified: { icon: "text-green-500", text: "text-green-600", bg: "bg-green-100" },
  rejected: { icon: "text-red-500", text: "text-red-600", bg: "bg-red-100" },
}

const statusLabels: Record<StepStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  verified: "Verified",
  rejected: "Needs Review",
}

function VerificationStepCard({
  step,
  status,
  index,
}: {
  step: VerificationStep
  status: StepStatus
  index: number
}) {
  const config = stepConfig[step]
  const colors = statusColors[status]
  const Icon = config.icon
  const isComplete = status === "verified"
  const isActive = status === "in_progress"

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`${isActive ? "ring-2 ring-primary" : ""}`}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${colors.bg}`}>
              {isActive ? (
                <Loader2 className={`w-5 h-5 ${colors.icon} animate-spin`} />
              ) : isComplete ? (
                <CheckCircle2 className={`w-5 h-5 ${colors.icon}`} />
              ) : (
                <Icon className={`w-5 h-5 ${colors.icon}`} />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">{config.label}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                  {statusLabels[status]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function VerificationStatus({
  status,
  onRefresh,
  isRefreshing = false,
}: VerificationStatusProps) {
  const steps: VerificationStep[] = ["cv", "experience", "background"]
  const stepStatuses = [status.cvVerification, status.experienceValidation, status.backgroundCheck]

  const completedSteps = stepStatuses.filter((s) => s === "verified").length
  const progress = (completedSteps / steps.length) * 100

  const getStatusMessage = () => {
    switch (status.applicationStatus) {
      case "pending":
        return "Your application has been received and is in the queue for review."
      case "in_review":
        return "Our team is actively reviewing your application."
      case "approved":
        return "Congratulations! Your application has been approved."
      case "rejected":
        return "Your application needs some updates. Please check the details below."
      default:
        return "Processing your application..."
    }
  }

  const getStatusIcon = () => {
    switch (status.applicationStatus) {
      case "pending":
        return <Clock className="w-12 h-12 text-yellow-500" />
      case "in_review":
        return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      case "approved":
        return <CheckCircle2 className="w-12 h-12 text-green-500" />
      case "rejected":
        return <Shield className="w-12 h-12 text-red-500" />
      default:
        return <Clock className="w-12 h-12 text-muted-foreground" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h1 className="text-2xl font-bold mb-2">Application Status</h1>
          <p className="text-muted-foreground">{getStatusMessage()}</p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Verification Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Verification Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <VerificationStepCard
              key={step}
              step={step}
              status={stepStatuses[index]}
              index={index}
            />
          ))}
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
              Refresh Status
            </Button>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground text-center">
                Typical review time is 24-48 hours. We&apos;ll notify you via email
                once your application has been processed. Welcome to {APP_NAME}!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
