/**
 * @fileoverview Activation lock screen showing training and quiz completion requirements.
 * @module components/activation/activation-lock
 */

"use client"

import { motion } from "framer-motion"
import { Lock, Unlock, BookOpen, FileCheck, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { APP_NAME } from "@/lib/constants"

interface ActivationLockProps {
  trainingCompleted: boolean
  quizPassed: boolean
  onStartTraining: () => void
}

const steps = [
  {
    id: "training",
    title: "Complete Training",
    description: "Learn about quality control, pricing, and communication",
    icon: BookOpen,
  },
  {
    id: "quiz",
    title: "Pass Assessment",
    description: "Demonstrate your understanding with a short quiz",
    icon: FileCheck,
  },
  {
    id: "activate",
    title: "Get Activated",
    description: "Unlock your dashboard and start supervising",
    icon: Award,
  },
]

export function ActivationLock({
  trainingCompleted,
  quizPassed,
  onStartTraining,
}: ActivationLockProps) {
  const getStepStatus = (stepId: string) => {
    switch (stepId) {
      case "training":
        return trainingCompleted ? "completed" : "current"
      case "quiz":
        if (quizPassed) return "completed"
        return trainingCompleted ? "current" : "locked"
      case "activate":
        return quizPassed ? "current" : "locked"
      default:
        return "locked"
    }
  }

  const getProgress = () => {
    if (quizPassed) return 100
    if (trainingCompleted) return 66
    return 33
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4"
          >
            <Lock className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Locked</h1>
          <p className="text-xl text-muted-foreground">Unlock Your Admin Rights</p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Activation Progress</span>
              <span className="font-medium">{getProgress()}%</span>
            </div>
            <Progress value={getProgress()} className="h-2" />
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id)
            const Icon = step.icon
            const isCompleted = status === "completed"
            const isCurrent = status === "current"
            const isLocked = status === "locked"

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${isCurrent ? "ring-2 ring-primary" : ""} ${isLocked ? "opacity-50" : ""}`}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-green-100 text-green-600"
                            : isCurrent
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <Unlock className="w-6 h-6" />
                        ) : isLocked ? (
                          <Lock className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                      {isCompleted && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                          Completed
                        </span>
                      )}
                      {isCurrent && !isCompleted && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          In Progress
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          {!trainingCompleted ? (
            <Button size="lg" onClick={onStartTraining} className="px-8">
              <BookOpen className="mr-2 h-5 w-5" />
              Start Training
            </Button>
          ) : !quizPassed ? (
            <Button size="lg" onClick={onStartTraining} className="px-8">
              <FileCheck className="mr-2 h-5 w-5" />
              Take Assessment
            </Button>
          ) : (
            <Button size="lg" onClick={onStartTraining} className="px-8">
              <Award className="mr-2 h-5 w-5" />
              Activate Dashboard
            </Button>
          )}
        </motion.div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Complete the training and assessment to unlock your {APP_NAME} dashboard.
          <br />
          This ensures quality supervision for all projects.
        </motion.p>
      </motion.div>
    </div>
  )
}
