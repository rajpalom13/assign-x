/**
 * @fileoverview Support ticket creation form with category selection.
 * @module components/support/ticket-form
 */

"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Wrench,
  CreditCard,
  Briefcase,
  User,
  HelpCircle,
  Upload,
  X,
  Loader2,
} from "lucide-react"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { TicketCategory, TicketPriority, TICKET_CATEGORY_CONFIG, TICKET_PRIORITY_CONFIG } from "./types"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Wrench,
  CreditCard,
  Briefcase,
  User,
  HelpCircle,
}

const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.enum(["technical", "payment", "project", "account", "other"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  project_number: z.string().optional(),
  description: z.string().min(20, "Please provide more details (at least 20 characters)"),
})

type TicketFormData = z.infer<typeof ticketSchema>

interface TicketFormProps {
  onSubmit?: (data: TicketFormData) => Promise<void>
  onCancel?: () => void
}

export function TicketForm({ onSubmit, onCancel }: TicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      category: "other",
      priority: "medium",
      project_number: "",
      description: "",
    },
  })

  const handleSubmit = async (data: TicketFormData) => {
    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(data)
      } else {
        // Mock submission
        await new Promise((resolve) => setTimeout(resolve, 1500))
        toast.success("Ticket created successfully!")
        form.reset()
        setAttachments([])
      }
    } catch (error) {
      toast.error("Failed to create ticket. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const maxSize = 5 * 1024 * 1024 // 5MB
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Max size is 5MB.`)
        return false
      }
      return true
    })
    setAttachments((prev) => [...prev, ...validFiles].slice(0, 5))
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Support Ticket</CardTitle>
        <CardDescription>
          Describe your issue and our support team will get back to you within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {(Object.entries(TICKET_CATEGORY_CONFIG) as [TicketCategory, { label: string; icon: string }][]).map(
                      ([key, config]) => {
                        const IconComponent = ICONS[config.icon] || HelpCircle
                        return (
                          <Button
                            key={key}
                            type="button"
                            variant={field.value === key ? "default" : "outline"}
                            className={cn(
                              "h-auto py-3 flex flex-col gap-1",
                              field.value === key && "ring-2 ring-primary"
                            )}
                            onClick={() => field.onChange(key)}
                          >
                            <IconComponent className="h-5 w-5" />
                            <span className="text-xs">{config.label}</span>
                          </Button>
                        )
                      }
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief summary of your issue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(TICKET_PRIORITY_CONFIG) as [TicketPriority, { label: string; color: string }][]).map(
                          ([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cn("text-xs", config.color)}>
                                  {config.label}
                                </Badge>
                              </div>
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project Number (Optional) */}
              <FormField
                control={form.control}
                name="project_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Project (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., AX-00123" {...field} />
                    </FormControl>
                    <FormDescription>
                      If this is about a specific project
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you've already tried."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachments */}
            <div className="space-y-2">
              <FormLabel>Attachments (Optional)</FormLabel>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <Badge key={index} variant="secondary" className="gap-1 py-1">
                    {file.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeAttachment(index)}
                    />
                  </Badge>
                ))}
                {attachments.length < 5 && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                    />
                    <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted">
                      <Upload className="h-3 w-3" />
                      Add file
                    </Badge>
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Max 5 files, 5MB each. Accepted: Images, PDF, DOC, TXT
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
