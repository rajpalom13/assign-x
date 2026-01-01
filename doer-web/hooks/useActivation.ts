'use client'

import { useState, useEffect, useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DoerActivation, TrainingProgress, QuizAttempt } from '@/types/database'

/** Activation state interface */
interface ActivationState {
  /** Current activation status */
  activation: DoerActivation | null
  /** Training progress for each module */
  trainingProgress: TrainingProgress[]
  /** Quiz attempts history */
  quizAttempts: QuizAttempt[]
  /** Loading state */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Actions */
  setActivation: (activation: DoerActivation | null) => void
  setTrainingProgress: (progress: TrainingProgress[]) => void
  addTrainingProgress: (progress: TrainingProgress) => void
  setQuizAttempts: (attempts: QuizAttempt[]) => void
  addQuizAttempt: (attempt: QuizAttempt) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

/** Initial activation state */
const initialActivation: DoerActivation = {
  id: '',
  doer_id: '',
  training_completed: false,
  training_completed_at: null,
  quiz_passed: false,
  quiz_passed_at: null,
  quiz_attempt_id: null,
  total_quiz_attempts: 0,
  bank_details_added: false,
  bank_details_added_at: null,
  is_fully_activated: false,
  activated_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

/**
 * Activation store using Zustand with persistence
 */
export const useActivationStore = create<ActivationState>()(
  persist(
    (set) => ({
      activation: null,
      trainingProgress: [],
      quizAttempts: [],
      isLoading: false,
      error: null,

      setActivation: (activation) => set({ activation }),

      setTrainingProgress: (progress) => set({ trainingProgress: progress }),

      addTrainingProgress: (progress) =>
        set((state) => ({
          trainingProgress: [
            ...state.trainingProgress.filter((p) => p.module_id !== progress.module_id),
            progress,
          ],
        })),

      setQuizAttempts: (attempts) => set({ quizAttempts: attempts }),

      addQuizAttempt: (attempt) =>
        set((state) => ({
          quizAttempts: [...state.quizAttempts, attempt],
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () =>
        set({
          activation: null,
          trainingProgress: [],
          quizAttempts: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'activation-storage',
      partialize: (state) => ({
        activation: state.activation,
        trainingProgress: state.trainingProgress,
        quizAttempts: state.quizAttempts,
      }),
    }
  )
)

/**
 * Hook for managing activation flow
 * Provides methods to update activation status and track progress
 */
export function useActivation() {
  const store = useActivationStore()
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  /** Get current step based on activation status */
  const getCurrentStep = useCallback(() => {
    if (!store.activation) return 1
    if (!store.activation.training_completed) return 1
    if (!store.activation.quiz_passed) return 2
    if (!store.activation.bank_details_added) return 3
    return 3
  }, [store.activation])

  /** Check if a specific step is completed */
  const isStepCompleted = useCallback(
    (step: number) => {
      if (!store.activation) return false
      switch (step) {
        case 1:
          return store.activation.training_completed
        case 2:
          return store.activation.quiz_passed
        case 3:
          return store.activation.bank_details_added
        default:
          return false
      }
    },
    [store.activation]
  )

  /** Check if a specific step is unlocked */
  const isStepUnlocked = useCallback(
    (step: number) => {
      if (step === 1) return true
      if (!store.activation) return false
      switch (step) {
        case 2:
          return store.activation.training_completed
        case 3:
          return store.activation.quiz_passed
        default:
          return false
      }
    },
    [store.activation]
  )

  /** Get completed training modules */
  const getCompletedModules = useCallback(() => {
    return store.trainingProgress
      .filter((p) => p.is_completed)
      .map((p) => p.module_id)
  }, [store.trainingProgress])

  /** Get number of quiz attempts */
  const getQuizAttempts = useCallback(() => {
    return store.quizAttempts.length
  }, [store.quizAttempts])

  /** Complete a training module */
  const completeTrainingModule = useCallback(
    async (moduleId: string) => {
      const progress: TrainingProgress = {
        id: `progress-${moduleId}`,
        profile_id: store.activation?.doer_id || '',
        module_id: moduleId,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        progress_percentage: 100,
        is_completed: true,
      }

      store.addTrainingProgress(progress)
    },
    [store]
  )

  /** Mark training as completed */
  const completeTraining = useCallback(async () => {
    if (!store.activation) return

    const updatedActivation: DoerActivation = {
      ...store.activation,
      training_completed: true,
      training_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    store.setActivation(updatedActivation)
  }, [store])

  /** Submit quiz attempt */
  const submitQuizAttempt = useCallback(
    async (score: number, totalQuestions: number, answers: Record<string, number>) => {
      if (!store.activation) return

      const isPassed = (score / totalQuestions) * 100 >= 80
      const attemptNumber = store.quizAttempts.length + 1

      const attempt: QuizAttempt = {
        id: `attempt-${Date.now()}`,
        profile_id: store.activation.doer_id,
        target_role: 'doer',
        attempt_number: attemptNumber,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        score_percentage: (score / totalQuestions) * 100,
        correct_answers: score,
        total_questions: totalQuestions,
        passing_score: 80,
        is_passed: isPassed,
        answers,
      }

      store.addQuizAttempt(attempt)

      if (isPassed) {
        const updatedActivation: DoerActivation = {
          ...store.activation,
          quiz_passed: true,
          quiz_passed_at: new Date().toISOString(),
          quiz_attempt_id: attempt.id,
          total_quiz_attempts: attemptNumber,
          updated_at: new Date().toISOString(),
        }

        store.setActivation(updatedActivation)
      }

      return isPassed
    },
    [store]
  )

  /** Submit bank details */
  const submitBankDetails = useCallback(
    async (bankDetails: {
      accountHolderName: string
      accountNumber: string
      ifscCode: string
      upiId?: string
    }) => {
      if (!store.activation) return

      const updatedActivation: DoerActivation = {
        ...store.activation,
        bank_details_added: true,
        bank_details_added_at: new Date().toISOString(),
        is_fully_activated: true,
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      store.setActivation(updatedActivation)

      // TODO: Also update doer record with bank details
    },
    [store]
  )

  /** Get overall activation progress percentage */
  const getProgressPercentage = useCallback(() => {
    let completed = 0
    if (store.activation?.training_completed) completed++
    if (store.activation?.quiz_passed) completed++
    if (store.activation?.bank_details_added) completed++
    return (completed / 3) * 100
  }, [store.activation])

  /** Check if fully activated */
  const isFullyActivated = useCallback(() => {
    return store.activation?.is_fully_activated ?? false
  }, [store.activation])

  // Initialize activation if not present
  useEffect(() => {
    if (mounted && !store.activation) {
      store.setActivation({
        ...initialActivation,
        id: `activation-${Date.now()}`,
        doer_id: `doer-${Date.now()}`, // TODO: Get actual doer ID
      })
    }
  }, [mounted, store])

  return {
    // State
    activation: store.activation,
    trainingProgress: store.trainingProgress,
    quizAttempts: store.quizAttempts,
    isLoading: store.isLoading,
    error: store.error,
    mounted,

    // Computed
    currentStep: getCurrentStep(),
    progressPercentage: getProgressPercentage(),
    isFullyActivated: isFullyActivated(),
    completedModules: getCompletedModules(),
    quizAttemptCount: getQuizAttempts(),

    // Methods
    isStepCompleted,
    isStepUnlocked,
    completeTrainingModule,
    completeTraining,
    submitQuizAttempt,
    submitBankDetails,
    reset: store.reset,
  }
}
