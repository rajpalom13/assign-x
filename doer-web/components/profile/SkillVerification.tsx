'use client'

/**
 * Skill Verification component
 * Displays skills with verification status
 * @module components/profile/SkillVerification
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BadgeCheck,
  Clock,
  AlertCircle,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { mockSkills, proficiencyConfig } from './constants'
import type { SkillWithVerification } from '@/types/database'

/**
 * SkillVerification component props
 */
interface SkillVerificationProps {
  /** Skills with verification status */
  skills?: SkillWithVerification[]
  /** Callback when verification is requested */
  onRequestVerification?: (skillId: string) => Promise<void>
  /** Loading state */
  isLoading?: boolean
  /** Additional class name */
  className?: string
}

/** Animation variants */
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 },
  }),
}

/**
 * Skill Verification component
 * Displays skills with verification status
 */
export function SkillVerification({
  skills = mockSkills,
  onRequestVerification,
  isLoading,
  className,
}: SkillVerificationProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillWithVerification | null>(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [successSkillId, setSuccessSkillId] = useState<string | null>(null)

  /** Calculate verification stats */
  const stats = {
    total: skills.length,
    verified: skills.filter((s) => s.is_verified).length,
    pending: skills.filter((s) => !s.is_verified).length,
  }
  const verificationPercentage = (stats.verified / stats.total) * 100

  /** Handle verification request */
  const handleRequestVerification = async () => {
    if (!selectedSkill) return

    setIsRequesting(true)
    try {
      if (onRequestVerification) {
        await onRequestVerification(selectedSkill.id)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
      setSuccessSkillId(selectedSkill.id)
      setTimeout(() => {
        setSelectedSkill(null)
        setSuccessSkillId(null)
      }, 2000)
    } finally {
      setIsRequesting(false)
    }
  }

  /** Get verification status icon */
  const getStatusIcon = (skill: SkillWithVerification) => {
    if (skill.is_verified) return <BadgeCheck className="h-5 w-5 text-green-600" />
    if (successSkillId === skill.id) return <Clock className="h-5 w-5 text-yellow-600" />
    return <AlertCircle className="h-5 w-5 text-muted-foreground/50" />
  }

  /** Get status badge */
  const getStatusBadge = (skill: SkillWithVerification) => {
    if (skill.is_verified) {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      )
    }
    if (successSkillId === skill.id) {
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    }
    return <Badge variant="outline" className="bg-muted text-muted-foreground">Not Verified</Badge>
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Verification overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Skill Verification
          </CardTitle>
          <CardDescription>Verified skills get priority in project matching</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Verification Progress</span>
              <span className="font-medium">{stats.verified} of {stats.total} skills verified</span>
            </div>
            <Progress value={verificationPercentage} className="h-2" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-primary">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Skills</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-yellow-500/10">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Why verify skills?</AlertTitle>
        <AlertDescription>
          Verified skills help you get more projects. Verification involves a short assessment
          to confirm your proficiency level.
        </AlertDescription>
      </Alert>

      {/* Skills list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Skills</CardTitle>
          <CardDescription>Click on unverified skills to request verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence>
              {skills.map((skill, index) => {
                const proficiency = proficiencyConfig[skill.proficiency_level]

                return (
                  <motion.div
                    key={skill.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                  >
                    <button
                      type="button"
                      onClick={() => !skill.is_verified && setSelectedSkill(skill)}
                      disabled={skill.is_verified || isLoading}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-lg border transition-all',
                        skill.is_verified
                          ? 'bg-green-500/5 border-green-500/30 cursor-default'
                          : 'hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(skill)}
                        <div className="text-left">
                          <p className="font-medium">{skill.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn('text-xs', proficiency.bgColor, proficiency.color)}>
                              {proficiency.label}
                            </Badge>
                            {skill.category && (
                              <span className="text-xs text-muted-foreground">{skill.category}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(skill)}
                        {!skill.is_verified && successSkillId !== skill.id && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Verification request dialog */}
      <Dialog open={!!selectedSkill} onOpenChange={() => setSelectedSkill(null)}>
        <DialogContent className="sm:max-w-md">
          <AnimatePresence mode="wait">
            {successSkillId === selectedSkill?.id ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <DialogTitle className="text-xl mb-2">Request Submitted!</DialogTitle>
                <DialogDescription>
                  We'll review your skill and get back to you within 24 hours.
                </DialogDescription>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DialogHeader>
                  <DialogTitle>Request Skill Verification</DialogTitle>
                  <DialogDescription>Request verification for {selectedSkill?.name}</DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <BadgeCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedSkill?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {proficiencyConfig[selectedSkill?.proficiency_level || 'beginner'].label} level
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      After submitting, you'll receive a short assessment to verify your
                      proficiency. Successfully completing it will add a verification badge
                      to your skill.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">What happens next?</h4>
                    <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                      <li>We'll send you a verification assessment</li>
                      <li>Complete the assessment within 24 hours</li>
                      <li>Get your skill verified upon successful completion</li>
                    </ol>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedSkill(null)}>Cancel</Button>
                  <Button onClick={handleRequestVerification} disabled={isRequesting} className="gap-2">
                    {isRequesting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Request Verification
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  )
}
