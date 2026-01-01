'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ROUTES } from '@/lib/constants'

/** Lazy load heavy TrainingModule component (contains video iframes) */
const TrainingModule = dynamic(
  () => import('@/components/activation/TrainingModule').then(mod => ({ default: mod.TrainingModule })),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    ),
    ssr: false
  }
)
import { createClient } from '@/lib/supabase/client'
import { activationService } from '@/services/activation.service'
import { useAuthToken } from '@/hooks/useAuthToken'
import type { TrainingModule as TrainingModuleType } from '@/types/database'

/**
 * Training page
 * Step 1 of the activation flow
 */
export default function TrainingPage() {
  const router = useRouter()
  const { hasToken, isReady } = useAuthToken({ redirectOnMissing: true })
  const [doerId, setDoerId] = useState<string | null>(null)
  const [modules, setModules] = useState<TrainingModuleType[]>([])
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * Fetch training modules on mount
   */
  useEffect(() => {
    if (!isReady || !hasToken) return

    const init = async () => {

      try {
        const supabase = createClient()

        // Fetch training modules from database
        const trainingModules = await activationService.getTrainingModules()
        setModules(trainingModules)

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          setIsLoading(false)
          return
        }

        // Get doer record
        const { data: doer } = await supabase
          .from('doers')
          .select('id, profile_id')
          .eq('profile_id', user.id)
          .single()

        if (doer) {
          setDoerId(doer.id)

          // Fetch training progress
          const { data: progress, error: progressError } = await supabase
            .from('training_progress')
            .select('module_id')
            .eq('profile_id', doer.profile_id)
            .eq('status', 'completed')

          if (progressError) {
            console.error('Error fetching training progress:', progressError)
          } else if (progress) {
            setCompletedModules(progress.map(p => p.module_id))
          }
        }
      } catch (err) {
        console.error('Error initializing training:', err)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [isReady, hasToken])

  /**
   * Handle training completion
   * Saves completion status to database
   */
  const handleComplete = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Get doer ID (use cached or fetch on-demand)
      let currentDoerId = doerId

      if (!currentDoerId) {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setError('You must be logged in to complete training')
          return
        }

        const { data: doer } = await supabase
          .from('doers')
          .select('id')
          .eq('profile_id', user.id)
          .single()

        if (!doer) {
          setError('Doer profile not found')
          return
        }

        currentDoerId = doer.id
      }

      // Ensure we have a valid doer ID
      if (!currentDoerId) {
        setError('Unable to determine doer profile')
        return
      }

      // Mark training as completed
      const success = await activationService.completeTraining(currentDoerId)

      if (!success) {
        throw new Error('Failed to complete training')
      }

      router.push(ROUTES.quiz)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('Training completion error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isReady || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!hasToken) {
    return null // Will redirect via useAuthToken
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Completing training...</p>
          </div>
        </div>
      )}
      <TrainingModule
        modules={modules}
        onComplete={handleComplete}
        completedModules={completedModules}
      />
    </>
  )
}
