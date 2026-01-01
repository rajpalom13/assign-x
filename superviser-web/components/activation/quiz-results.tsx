/**
 * @fileoverview Quiz results display with pass/fail status and retry options.
 * @module components/activation/quiz-results
 */

"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { APP_NAME } from "@/lib/constants"

interface QuizResultsProps {
  score: number
  totalQuestions: number
  passed: boolean
  passingScore: number
  onRetry: () => void
  onContinue: () => void
}

export function QuizResults({
  score,
  totalQuestions,
  passed,
  passingScore,
  onRetry,
  onContinue,
}: QuizResultsProps) {
  const correctCount = Math.round((score / 100) * totalQuestions)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Result Icon */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
              passed ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {passed ? (
              <Award className="w-12 h-12 text-green-600" />
            ) : (
              <XCircle className="w-12 h-12 text-red-600" />
            )}
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">
            {passed ? "Congratulations!" : "Not Quite There"}
          </h1>
          <p className="text-muted-foreground">
            {passed
              ? "You've passed the assessment!"
              : "You need more practice to pass."}
          </p>
        </div>

        {/* Score Card */}
        <Card className="mb-6">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-5xl font-bold">{score}%</CardTitle>
            <CardDescription>Your Score</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress
                value={score}
                className={`h-3 ${passed ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
              />

              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{correctCount} correct</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>{totalQuestions - correctCount} incorrect</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Passing Score</span>
                  <span className="font-medium">{passingScore}%</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-muted-foreground">Your Score</span>
                  <span className={`font-medium ${passed ? "text-green-600" : "text-red-600"}`}>
                    {score}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Message */}
        <Card className={`mb-6 ${passed ? "bg-green-50 dark:bg-green-950/20" : "bg-amber-50 dark:bg-amber-950/20"}`}>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              {passed ? (
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <RotateCcw className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="text-sm">
                {passed ? (
                  <>
                    <p className="font-medium text-green-800 dark:text-green-200 mb-1">
                      You&apos;re Ready!
                    </p>
                    <p className="text-green-700 dark:text-green-300">
                      You&apos;ve demonstrated solid understanding of {APP_NAME} supervisor responsibilities.
                      Your dashboard is about to be unlocked!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                      Review the Training Materials
                    </p>
                    <p className="text-amber-700 dark:text-amber-300">
                      Take some time to review the training modules, especially the areas where you
                      made mistakes. You can retake the quiz when ready.
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {passed ? (
            <Button size="lg" className="w-full" onClick={onContinue}>
              Activate My Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <>
              <Button size="lg" className="w-full" onClick={onRetry}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={onContinue}>
                Review Training First
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
