'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2, GraduationCap, Building2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Logo } from '@/components/shared/Logo'
import { cn } from '@/lib/utils'
import { QUALIFICATION_OPTIONS, EXPERIENCE_LEVELS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

/** Profile setup form schema */
const profileSetupSchema = z.object({
  qualification: z.string().min(1, 'Please select your qualification'),
  universityName: z.string().optional(),
  skills: z.array(z.string()).min(1, 'Please select at least one skill'),
  subjects: z.array(z.string()).min(1, 'Please select at least one subject'),
  experienceLevel: z.string().min(1, 'Please select your experience level'),
})

type ProfileSetupFormData = z.infer<typeof profileSetupSchema>

/** Skill type from database */
interface Skill {
  id: string
  name: string
}

/** Subject type from database */
interface Subject {
  id: string
  name: string
}

interface ProfileSetupFormProps {
  /** Callback when profile setup is complete */
  onComplete: (data: ProfileSetupFormData) => Promise<void>
  /** Current user name for greeting */
  userName?: string
}

/** Step titles and descriptions */
const STEPS = [
  {
    title: 'Education',
    description: 'Tell us about your educational background',
    icon: GraduationCap,
  },
  {
    title: 'Skills & Interests',
    description: 'Select your areas of expertise',
    icon: Building2,
  },
  {
    title: 'Experience',
    description: 'How experienced are you?',
    icon: Sparkles,
  },
]

/**
 * Profile setup form component with multi-step wizard
 * Collects qualification, skills, subjects, and experience level
 */
export function ProfileSetupForm({ onComplete, userName }: ProfileSetupFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skills, setSkills] = useState<Skill[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [fetchError, setFetchError] = useState<string | null>(null)

  /**
   * Fetch skills and subjects from the database
   */
  useEffect(() => {
    const fetchData = async () => {
      console.log('[ProfileSetup] Starting to fetch skills and subjects...')
      setIsLoadingData(true)
      setFetchError(null)

      try {
        const supabase = createClient()

        // Fetch skills and subjects in parallel
        const [skillsResult, subjectsResult] = await Promise.all([
          supabase
            .from('skills')
            .select('id, name')
            .eq('is_active', true)
            .order('name'),
          supabase
            .from('subjects')
            .select('id, name')
            .eq('is_active', true)
            .is('parent_id', null)
            .order('name'),
        ])

        console.log('[ProfileSetup] Skills result:', skillsResult)
        console.log('[ProfileSetup] Subjects result:', subjectsResult)

        if (skillsResult.error) {
          console.error('[ProfileSetup] Skills error:', skillsResult.error)
          setFetchError(`Failed to load skills: ${skillsResult.error.message}`)
        } else {
          setSkills(skillsResult.data || [])
        }

        if (subjectsResult.error) {
          console.error('[ProfileSetup] Subjects error:', subjectsResult.error)
          setFetchError(`Failed to load subjects: ${subjectsResult.error.message}`)
        } else {
          setSubjects(subjectsResult.data || [])
        }
      } catch (error) {
        console.error('[ProfileSetup] Error fetching data:', error)
        setFetchError('Failed to load data. Please refresh the page.')
      } finally {
        setIsLoadingData(false)
        console.log('[ProfileSetup] Fetch complete')
      }
    }

    fetchData()
  }, [])

  const form = useForm<ProfileSetupFormData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      qualification: '',
      universityName: '',
      skills: [],
      subjects: [],
      experienceLevel: '',
    },
    mode: 'onChange',
  })

  const totalSteps = STEPS.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  // Watch form values for reactive validation
  const qualification = form.watch('qualification')
  const selectedSkills = form.watch('skills')
  const selectedSubjects = form.watch('subjects')
  const experienceLevel = form.watch('experienceLevel')

  /** Toggle skill selection */
  const toggleSkill = (skillId: string) => {
    const currentSkills = form.getValues('skills')
    if (currentSkills.includes(skillId)) {
      form.setValue(
        'skills',
        currentSkills.filter((s) => s !== skillId),
        { shouldValidate: true }
      )
    } else {
      form.setValue('skills', [...currentSkills, skillId], { shouldValidate: true })
    }
  }

  /** Toggle subject selection */
  const toggleSubject = (subjectId: string) => {
    const currentSubjects = form.getValues('subjects')
    if (currentSubjects.includes(subjectId)) {
      form.setValue(
        'subjects',
        currentSubjects.filter((s) => s !== subjectId),
        { shouldValidate: true }
      )
    } else {
      form.setValue('subjects', [...currentSubjects, subjectId], { shouldValidate: true })
    }
  }

  /** Check if current step is valid (uses watched values for reactivity) */
  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 0:
        return !!qualification
      case 1:
        return selectedSkills.length > 0 && selectedSubjects.length > 0
      case 2:
        return !!experienceLevel
      default:
        return false
    }
  }

  /** Go to next step */
  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  /** Go to previous step */
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  /** Handle form submission */
  const onSubmit = async (data: ProfileSetupFormData) => {
    setIsSubmitting(true)
    try {
      await onComplete(data)
    } catch (error) {
      console.error('Profile setup failed:', error)
      setIsSubmitting(false)
    }
    // Note: Don't setIsSubmitting(false) on success - page will navigate away
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="px-6 pt-8">
        <div className="mb-6 flex items-center justify-center">
          <Logo size="md" />
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <Progress value={progress} className="h-2" />
        </div>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </p>

        {/* Greeting */}
        {userName && currentStep === 0 && (
          <h1 className="mb-2 text-center text-2xl font-bold text-foreground">
            Welcome, {userName}!
          </h1>
        )}

        {/* Step Title */}
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            {STEPS[currentStep].title}
          </h2>
          <p className="text-muted-foreground">
            {STEPS[currentStep].description}
          </p>
        </div>
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-6">
            <AnimatePresence mode="wait" custom={currentStep}>
              <motion.div
                key={currentStep}
                custom={currentStep}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {/* Step 1: Education */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="qualification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Highest Qualification</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your qualification" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {QUALIFICATION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="universityName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University/Institution (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your university name"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This helps us match you with relevant projects
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Skills & Subjects */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    {fetchError && (
                      <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {fetchError}
                      </div>
                    )}
                    {isLoadingData ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading skills & subjects...</span>
                      </div>
                    ) : (
                      <>
                        {/* Skills Selection */}
                        <FormField
                          control={form.control}
                          name="skills"
                          render={() => (
                            <FormItem>
                              <FormLabel>Your Skills</FormLabel>
                              <FormDescription>
                                Select all skills that apply to you
                              </FormDescription>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {skills.map((skill) => {
                                  const isSelected = selectedSkills.includes(skill.id)
                                  return (
                                    <Badge
                                      key={skill.id}
                                      variant={isSelected ? 'default' : 'outline'}
                                      className={cn(
                                        'cursor-pointer px-3 py-1.5 text-sm transition-all',
                                        isSelected && 'bg-primary'
                                      )}
                                      onClick={() => toggleSkill(skill.id)}
                                    >
                                      {skill.name}
                                    </Badge>
                                  )
                                })}
                                {skills.length === 0 && (
                                  <p className="text-sm text-muted-foreground">No skills available</p>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Subjects Selection */}
                        <FormField
                          control={form.control}
                          name="subjects"
                          render={() => (
                            <FormItem>
                              <FormLabel>Areas of Interest</FormLabel>
                              <FormDescription>
                                Select subjects you are comfortable with
                              </FormDescription>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {subjects.map((subject) => {
                                  const isSelected = selectedSubjects.includes(subject.id)
                                  return (
                                    <Badge
                                      key={subject.id}
                                      variant={isSelected ? 'default' : 'outline'}
                                      className={cn(
                                        'cursor-pointer px-3 py-1.5 text-sm transition-all',
                                        isSelected && 'bg-primary'
                                      )}
                                      onClick={() => toggleSubject(subject.id)}
                                    >
                                      {subject.name}
                                    </Badge>
                                  )
                                })}
                                {subjects.length === 0 && (
                                  <p className="text-sm text-muted-foreground">No subjects available</p>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Step 3: Experience Level */}
                {currentStep === 2 && (
                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level</FormLabel>
                        <FormDescription>
                          How would you rate your overall experience?
                        </FormDescription>
                        <div className="mt-4 grid gap-4">
                          {EXPERIENCE_LEVELS.map((level) => (
                            <div
                              key={level.value}
                              onClick={() => field.onChange(level.value)}
                              className={cn(
                                'flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all hover:border-primary',
                                field.value === level.value &&
                                  'border-primary bg-primary/5'
                              )}
                            >
                              <div>
                                <p className="font-medium text-foreground">
                                  {level.label}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {level.description}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  'h-5 w-5 rounded-full border-2',
                                  field.value === level.value
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground/30'
                                )}
                              >
                                {field.value === level.value && (
                                  <div className="flex h-full items-center justify-center">
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <div className="border-t bg-background px-6 py-4">
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              {currentStep < totalSteps - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={cn('flex-1', currentStep === 0 && 'w-full')}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing Setup...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
