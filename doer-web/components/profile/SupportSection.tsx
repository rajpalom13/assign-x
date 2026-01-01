'use client'

/**
 * Support Section component
 * Provides multiple support options and FAQ
 * @module components/profile/SupportSection
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  FileText,
  ExternalLink,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { supportOptions, ticketCategories, mockFAQs } from './constants'
import type { SupportTicket, FAQ } from '@/types/database'

/**
 * Ticket form data structure
 */
interface TicketFormData {
  subject: string
  description: string
  category: 'technical' | 'payment' | 'project' | 'account' | 'other'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

/**
 * SupportSection component props
 */
interface SupportSectionProps {
  /** Existing support tickets */
  tickets?: SupportTicket[]
  /** FAQs */
  faqs?: FAQ[]
  /** WhatsApp number */
  whatsappNumber?: string
  /** Support email */
  supportEmail?: string
  /** Callback when ticket is created */
  onCreateTicket?: (ticket: TicketFormData) => Promise<void>
  /** Additional class name */
  className?: string
}

/**
 * Support Section component
 * Provides multiple support options and FAQ
 */
export function SupportSection({
  tickets = [],
  faqs = mockFAQs,
  whatsappNumber = '+919876543210',
  supportEmail = 'support@talentconnect.com',
  onCreateTicket,
  className,
}: SupportSectionProps) {
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ticketForm, setTicketForm] = useState<TicketFormData>({
    subject: '',
    description: '',
    category: 'other',
  })

  /** Handle WhatsApp click */
  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`, '_blank')
  }

  /** Handle email click */
  const handleEmailClick = () => {
    window.location.href = `mailto:${supportEmail}`
  }

  /** Handle support option click */
  const handleOptionClick = (optionId: string) => {
    if (optionId === 'whatsapp') handleWhatsAppClick()
    else if (optionId === 'email') handleEmailClick()
    else setShowTicketDialog(true)
  }

  /** Handle ticket submit */
  const handleSubmitTicket = async () => {
    if (!ticketForm.subject.trim()) {
      setError('Subject is required')
      return
    }
    if (!ticketForm.description.trim()) {
      setError('Description is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (onCreateTicket) {
        await onCreateTicket(ticketForm)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      setSuccess(true)
      setShowTicketDialog(false)
      setTicketForm({ subject: '', description: '', category: 'other' })
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Success alert */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert className="border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Support ticket created successfully! We'll respond within 24 hours.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Contact Support
          </CardTitle>
          <CardDescription>Get help with any issues or questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {supportOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  className="p-4 rounded-lg border text-left hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', option.bgColor)}>
                    <Icon className={cn('h-5 w-5', option.color)} />
                  </div>
                  <p className="font-medium group-hover:text-primary transition-colors">{option.title}</p>
                  <p className="text-sm text-muted-foreground mb-3">{option.description}</p>
                  <span className="text-sm text-primary flex items-center gap-1">
                    {option.action}
                    {option.id === 'ticket' ? (
                      <ChevronRight className="h-3 w-3" />
                    ) : (
                      <ExternalLink className="h-3 w-3" />
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active tickets */}
      {tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Tickets</CardTitle>
            <CardDescription>Track your support requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      ticket.status === 'open'
                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                        : ticket.status === 'in_progress'
                        ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30'
                        : 'bg-green-500/10 text-green-600 border-green-500/30'
                    )}
                  >
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Create ticket dialog */}
      <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue and we'll get back to you within 24 hours
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={ticketForm.category}
                onValueChange={(v) => setTicketForm((prev) => ({ ...prev, category: v as TicketFormData['category'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {ticketCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief summary of your issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Provide detailed information about your issue..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitTicket} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
