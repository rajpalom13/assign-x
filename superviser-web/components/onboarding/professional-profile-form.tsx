/**
 * @fileoverview Professional profile form for supervisor qualifications and expertise.
 * @module components/onboarding/professional-profile-form
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileUpload } from "@/components/shared/file-upload"
import { professionalProfileSchema, type ProfessionalProfileFormData } from "@/lib/validations/auth"
import { EXPERTISE_AREAS, QUALIFICATIONS } from "@/lib/constants"

interface ProfessionalProfileFormProps {
  onSubmit: (data: ProfessionalProfileFormData & { cvFile?: File }) => Promise<void>
  onBack: () => void
  isLoading?: boolean
  defaultValues?: Partial<ProfessionalProfileFormData>
}

export function ProfessionalProfileForm({
  onSubmit,
  onBack,
  isLoading = false,
  defaultValues,
}: ProfessionalProfileFormProps) {
  const form = useForm<ProfessionalProfileFormData>({
    resolver: zodResolver(professionalProfileSchema),
    defaultValues: {
      qualification: defaultValues?.qualification || "",
      yearsOfExperience: defaultValues?.yearsOfExperience || 0,
      expertiseAreas: defaultValues?.expertiseAreas || [],
      bio: defaultValues?.bio || "",
    },
  })

  const handleSubmit = async (data: ProfessionalProfileFormData) => {
    const cvFile = form.getValues("cvFile") as File | undefined
    await onSubmit({ ...data, cvFile })
  }

  const toggleExpertise = (area: string) => {
    const current = form.getValues("expertiseAreas")
    if (current.includes(area)) {
      form.setValue(
        "expertiseAreas",
        current.filter((a) => a !== area),
        { shouldValidate: true }
      )
    } else {
      form.setValue("expertiseAreas", [...current, area], { shouldValidate: true })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="qualification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Highest Qualification</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your highest qualification" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {QUALIFICATIONS.map((qual) => (
                    <SelectItem key={qual.value} value={qual.value}>
                      {qual.label}
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
          name="yearsOfExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years of Experience</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  placeholder="5"
                  disabled={isLoading}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Total years of professional experience in your field
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expertiseAreas"
          render={() => (
            <FormItem>
              <FormLabel>Areas of Expertise</FormLabel>
              <FormDescription className="mb-3">
                Select all areas where you can supervise work
              </FormDescription>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {EXPERTISE_AREAS.map((area) => {
                  const isSelected = form.watch("expertiseAreas").includes(area.value)
                  return (
                    <button
                      key={area.value}
                      type="button"
                      onClick={() => toggleExpertise(area.value)}
                      disabled={isLoading}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-input"
                      }`}
                    >
                      {area.label}
                    </button>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Bio (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of your professional background..."
                  className="resize-none"
                  rows={3}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {(field.value?.length || 0)}/500 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cvFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Upload CV/Resume</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value as File | null}
                  onChange={field.onChange}
                  disabled={isLoading}
                  placeholder="Upload your CV (PDF, DOC, DOCX)"
                />
              </FormControl>
              <FormDescription>
                Your CV will be reviewed to verify your qualifications
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1"
          >
            Back
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
