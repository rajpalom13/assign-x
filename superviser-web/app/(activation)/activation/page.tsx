/**
 * @fileoverview Supervisor activation page with training modules, quiz assessment, and account activation flow.
 * @module app/(activation)/activation/page
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { ActivationLock } from "@/components/activation/activation-lock"
import { TrainingViewer } from "@/components/activation/training-viewer"
import { SupervisorQuiz } from "@/components/activation/supervisor-quiz"
import { QuizResults } from "@/components/activation/quiz-results"
import { WelcomeScreen } from "@/components/activation/welcome-screen"
import { Skeleton } from "@/components/ui/skeleton"

type ActivationStep = "lock" | "training" | "quiz" | "results" | "welcome"

interface QuizResult {
  score: number
  totalQuestions: number
  passed: boolean
}

interface ActivationStatus {
  training_completed: boolean
  quiz_passed: boolean
  quiz_score: number | null
  is_activated: boolean
}

const PASSING_SCORE = 70

export default function ActivationPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<ActivationStep>("lock")
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState("Supervisor")
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [activationStatus, setActivationStatus] = useState<ActivationStatus>({
    training_completed: false,
    quiz_passed: false,
    quiz_score: null,
    is_activated: false,
  })

  useEffect(() => {
    const loadActivationStatus = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      setUserId(user.id)
      setUserName(user.user_metadata?.full_name || "Supervisor")

      try {
        // Check activation status
        const { data } = await supabase
          .from("supervisor_activation")
          .select("training_completed, quiz_passed, quiz_score, is_activated")
          .eq("supervisor_id", user.id)
          .single()

        const status = data as ActivationStatus | null

        if (status) {
          setActivationStatus(status)

          if (status.is_activated) {
            router.push("/dashboard")
            return
          }

          // Determine current step based on status
          if (status.quiz_passed) {
            setCurrentStep("welcome")
          } else if (status.training_completed) {
            setCurrentStep("lock")
          }
        }
      } catch {
        // No activation record yet, stay on lock screen
      }

      setIsLoading(false)
    }

    loadActivationStatus()
  }, [router])

  const handleStartTraining = () => {
    if (activationStatus.training_completed && !activationStatus.quiz_passed) {
      setCurrentStep("quiz")
    } else if (activationStatus.quiz_passed) {
      handleActivate()
    } else {
      setCurrentStep("training")
    }
  }

  const handleModuleComplete = async (moduleId: string) => {
    // Track module completion (could be stored in database)
    console.log("Module completed:", moduleId)
  }

  const handleTrainingComplete = async () => {
    if (!userId) return

    try {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("supervisor_activation")
        .upsert({
          supervisor_id: userId,
          training_completed: true,
          training_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      setActivationStatus((prev) => ({ ...prev, training_completed: true }))
      toast.success("Training completed!")
      setCurrentStep("quiz")
    } catch (error) {
      console.error("Error updating training status:", error)
      // Continue anyway for demo
      setActivationStatus((prev) => ({ ...prev, training_completed: true }))
      setCurrentStep("quiz")
    }
  }

  const handleQuizComplete = async (result: QuizResult) => {
    if (!userId) return

    setQuizResult(result)

    try {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("supervisor_activation")
        .upsert({
          supervisor_id: userId,
          training_completed: true,
          quiz_passed: result.passed,
          quiz_passed_at: result.passed ? new Date().toISOString() : null,
          quiz_score: result.score,
          updated_at: new Date().toISOString(),
        })

      if (result.passed) {
        setActivationStatus((prev) => ({
          ...prev,
          quiz_passed: true,
          quiz_score: result.score,
        }))
      }
    } catch (error) {
      console.error("Error updating quiz status:", error)
    }

    setCurrentStep("results")
  }

  const handleRetryQuiz = () => {
    setQuizResult(null)
    setCurrentStep("quiz")
  }

  const handleContinueFromResults = () => {
    if (quizResult?.passed) {
      handleActivate()
    } else {
      setCurrentStep("training")
    }
  }

  const handleActivate = async () => {
    if (!userId) return

    try {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("supervisor_activation")
        .upsert({
          supervisor_id: userId,
          is_activated: true,
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      setActivationStatus((prev) => ({ ...prev, is_activated: true }))
      setCurrentStep("welcome")
    } catch (error) {
      console.error("Error activating:", error)
      // Continue anyway for demo
      setCurrentStep("welcome")
    }
  }

  const handleEnterDashboard = async () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  switch (currentStep) {
    case "lock":
      return (
        <ActivationLock
          trainingCompleted={activationStatus.training_completed}
          quizPassed={activationStatus.quiz_passed}
          onStartTraining={handleStartTraining}
        />
      )

    case "training":
      return (
        <TrainingViewer
          modules={[]}
          onModuleComplete={handleModuleComplete}
          onAllComplete={handleTrainingComplete}
        />
      )

    case "quiz":
      return (
        <SupervisorQuiz
          onComplete={handleQuizComplete}
          passingScore={PASSING_SCORE}
        />
      )

    case "results":
      return quizResult ? (
        <QuizResults
          score={quizResult.score}
          totalQuestions={quizResult.totalQuestions}
          passed={quizResult.passed}
          passingScore={PASSING_SCORE}
          onRetry={handleRetryQuiz}
          onContinue={handleContinueFromResults}
        />
      ) : null

    case "welcome":
      return (
        <WelcomeScreen
          userName={userName}
          onEnterDashboard={handleEnterDashboard}
        />
      )

    default:
      return null
  }
}
