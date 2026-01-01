'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Briefcase,
  Camera,
  Save,
  X,
  Loader2,
  Check,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { Profile, Doer, Skill, Qualification, ExperienceLevel } from '@/types/database'

interface EditProfileProps {
  /** User profile */
  profile: Profile
  /** Doer data */
  doer: Doer
  /** Available skills */
  skills?: Skill[]
  /** Selected skills */
  selectedSkills?: string[]
  /** Callback when save is clicked */
  onSave?: (data: ProfileFormData) => Promise<void>
  /** Callback when cancelled */
  onCancel?: () => void
  /** Loading state */
  isLoading?: boolean
  /** Additional class name */
  className?: string
}

interface ProfileFormData {
  full_name: string
  phone: string
  avatar_url: string | null
  qualification: Qualification | null
  university_name: string | null
  experience_level: ExperienceLevel | null
  bio: string | null
  skills: string[]
}

/** Qualification options */
const qualificationOptions: { value: Qualification; label: string }[] = [
  { value: 'high_school', label: 'High School' },
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'phd', label: 'PhD' },
]

/** Experience level options */
const experienceOptions: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to academic work' },
  { value: 'intermediate', label: 'Intermediate', description: '1-2 years experience' },
  { value: 'pro', label: 'Professional', description: '3+ years experience' },
]

/** Mock skills for demo */
const mockSkills: Skill[] = [
  { id: '1', name: 'Essay Writing', category: 'Writing', is_active: true },
  { id: '2', name: 'Research', category: 'Research', is_active: true },
  { id: '3', name: 'Data Analysis', category: 'Analytics', is_active: true },
  { id: '4', name: 'PowerPoint', category: 'Presentation', is_active: true },
  { id: '5', name: 'Academic Editing', category: 'Writing', is_active: true },
  { id: '6', name: 'Literature Review', category: 'Research', is_active: true },
  { id: '7', name: 'Case Studies', category: 'Writing', is_active: true },
  { id: '8', name: 'Statistics', category: 'Analytics', is_active: true },
]

/**
 * Edit Profile component
 * Form for updating user profile information
 */
export function EditProfile({
  profile,
  doer,
  skills = mockSkills,
  selectedSkills = ['1', '2', '3'],
  onSave,
  onCancel,
  isLoading,
  className,
}: EditProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: profile.full_name,
    phone: profile.phone || '',
    avatar_url: profile.avatar_url,
    qualification: doer.qualification,
    university_name: doer.university_name,
    experience_level: doer.experience_level,
    bio: doer.bio,
    skills: selectedSkills,
  })

  /** Handle input change */
  const handleChange = (field: keyof ProfileFormData, value: string | string[] | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(false)
  }

  /** Toggle skill selection */
  const toggleSkill = (skillId: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skillId)
        ? prev.skills.filter((id) => id !== skillId)
        : [...prev.skills, skillId],
    }))
  }

  /** Handle avatar upload */
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  /** Handle file selection */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In production, upload to Supabase storage
      const reader = new FileReader()
      reader.onloadend = () => {
        handleChange('avatar_url', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  /** Handle form submit */
  const handleSubmit = async () => {
    setIsSaving(true)
    setError(null)

    try {
      if (onSave) {
        await onSave(formData)
      } else {
        // Simulate save
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Success/Error alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Profile updated successfully!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatar_url || undefined} alt={formData.full_name} />
                <AvatarFallback className="text-2xl">
                  {formData.full_name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{formData.full_name}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleAvatarClick}
              >
                <Camera className="h-4 w-4 mr-2" />
                Change Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your basic profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Education & Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education & Experience
          </CardTitle>
          <CardDescription>
            Your academic background and experience level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="qualification">Qualification</Label>
              <Select
                value={formData.qualification || undefined}
                onValueChange={(v) => handleChange('qualification', v as Qualification)}
              >
                <SelectTrigger id="qualification">
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  {qualificationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="university"
                  placeholder="Your university"
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {experienceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange('experience_level', option.value)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all',
                    formData.experience_level === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <p className="font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Skills & Expertise
          </CardTitle>
          <CardDescription>
            Select the skills you have experience with
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge
                key={skill.id}
                variant={formData.skills.includes(skill.id) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all',
                  formData.skills.includes(skill.id)
                    ? 'bg-primary hover:bg-primary/80'
                    : 'hover:bg-muted'
                )}
                onClick={() => toggleSkill(skill.id)}
              >
                {skill.name}
                {formData.skills.includes(skill.id) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {formData.skills.length} skills selected
          </p>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 sticky bottom-0 bg-background py-4 border-t">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
