'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileSetupForm } from '@/components/onboarding/ProfileSetupForm'
import { ROUTES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { Qualification, ExperienceLevel } from '@/types/common.types'

/**
 * Profile setup page
 * Collects user qualification, skills, and experience after registration
 * Creates the doer record with user-provided values
 */
export default function ProfileSetupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  /**
   * Handle profile setup completion
   * Creates doer record and saves qualification, skills, and subjects
   */
  const handleComplete = async (data: {
    qualification: string
    universityName?: string
    skills: string[]
    subjects: string[]
    experienceLevel: string
  }) => {
    console.log('[ProfileSetup] handleComplete called with:', data)
    setError(null)
    const supabase = createClient()

    try {
      // Get the current user
      console.log('[ProfileSetup] Getting current user...')
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        throw new Error('You must be logged in to complete profile setup')
      }
      console.log('[ProfileSetup] User ID:', authUser.id)

      // Check if doer record already exists
      console.log('[ProfileSetup] Checking for existing doer...')
      let { data: doerRecord } = await supabase
        .from('doers')
        .select('id')
        .eq('profile_id', authUser.id)
        .single()

      console.log('[ProfileSetup] Existing doer:', doerRecord)

      if (!doerRecord) {
        // CREATE new doer record with the form data
        console.log('[ProfileSetup] Creating new doer record...')
        const { data: newDoer, error: createError } = await supabase
          .from('doers')
          .insert({
            profile_id: authUser.id,
            qualification: data.qualification as Qualification,
            experience_level: data.experienceLevel as ExperienceLevel,
            university_name: data.universityName || null,
            is_available: false,
            max_concurrent_projects: 3,
            is_activated: false,
            total_earnings: 0,
            total_projects_completed: 0,
            average_rating: 0,
            total_reviews: 0,
            success_rate: 0,
            on_time_delivery_rate: 0,
            bank_verified: false,
            is_flagged: false,
          })
          .select('id')
          .single()

        console.log('[ProfileSetup] Create result:', { newDoer, createError })

        if (createError) {
          throw new Error(`Failed to create doer profile: ${createError.message}`)
        }

        doerRecord = newDoer

        // Create activation record for new doer
        console.log('[ProfileSetup] Creating activation record...')
        const { error: activationError } = await supabase
          .from('doer_activation')
          .insert({
            doer_id: doerRecord.id,
            training_completed: false,
            quiz_passed: false,
            total_quiz_attempts: 0,
            bank_details_added: false,
            is_fully_activated: false,
          })

        if (activationError) {
          console.error('[ProfileSetup] Failed to create activation record:', activationError)
        }
      } else {
        // UPDATE existing doer record
        console.log('[ProfileSetup] Updating existing doer...')
        const { error: updateError } = await supabase
          .from('doers')
          .update({
            qualification: data.qualification,
            experience_level: data.experienceLevel,
            university_name: data.universityName || null,
          })
          .eq('id', doerRecord.id)

        if (updateError) {
          throw new Error(`Failed to update profile: ${updateError.message}`)
        }
      }

      // Insert skills (if any selected)
      console.log('[ProfileSetup] Inserting skills:', data.skills.length)
      if (data.skills.length > 0) {
        await supabase
          .from('doer_skills')
          .delete()
          .eq('doer_id', doerRecord.id)

        const skillInserts = data.skills.map(skillId => ({
          doer_id: doerRecord.id,
          skill_id: skillId,
          proficiency_level: 'intermediate',
        }))

        const { error: skillsError } = await supabase
          .from('doer_skills')
          .insert(skillInserts)

        if (skillsError) {
          console.error('[ProfileSetup] Skills insert error:', skillsError)
        } else {
          console.log('[ProfileSetup] Skills inserted successfully')
        }
      }

      // Insert subjects (if any selected)
      console.log('[ProfileSetup] Inserting subjects:', data.subjects.length)
      if (data.subjects.length > 0) {
        await supabase
          .from('doer_subjects')
          .delete()
          .eq('doer_id', doerRecord.id)

        const subjectInserts = data.subjects.map((subjectId, index) => ({
          doer_id: doerRecord.id,
          subject_id: subjectId,
          is_primary: index === 0,
        }))

        const { error: subjectsError } = await supabase
          .from('doer_subjects')
          .insert(subjectInserts)

        if (subjectsError) {
          console.error('[ProfileSetup] Subjects insert error:', subjectsError)
        } else {
          console.log('[ProfileSetup] Subjects inserted successfully')
        }
      }

      // Navigate to training
      console.log('[ProfileSetup] All done, navigating to training...')
      router.push(ROUTES.training)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      console.error('[ProfileSetup] Error:', err)
    }
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <ProfileSetupForm
        onComplete={handleComplete}
        userName={user?.full_name || 'User'}
      />
    </>
  )
}
