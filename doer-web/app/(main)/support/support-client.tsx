'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  HelpCircle,
  Mail,
  MessageSquare,
  FileText,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  BookOpen,
  CreditCard,
  Shield,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { getFAQs } from '@/services/support.service'
import { useAuth } from '@/hooks/useAuth'

type SupportClientProps = {
  userEmail: string
}

/** FAQ item type */
interface FAQItem {
  question: string
  answer: string
  category: string
}

/**
 * Support client component
 * Professional design with contact form and FAQ
 */
export function SupportClient({ userEmail }: SupportClientProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [faqs, setFaqs] = useState<FAQItem[]>([])

  /** Load FAQs from database */
  useEffect(() => {
    const loadFaqs = async () => {
      try {
        const data = await getFAQs()
        setFaqs(data.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
        })))
      } catch (error) {
        console.error('Error loading FAQs:', error)
      }
    }
    loadFaqs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          requester_id: user?.id,
          subject: subject.trim(),
          description: message.trim(),
          category: 'other',
          priority: 'medium',
          status: 'open',
        })

      if (error) throw error

      toast.success('Support ticket submitted successfully!')
      setSubject('')
      setMessage('')
    } catch (error) {
      toast.error('Failed to submit support ticket')
      console.error('Error submitting ticket:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  /** Get category icon */
  const getCategoryIcon = (category: FAQItem['category']) => {
    switch (category) {
      case 'tasks':
        return FileText
      case 'payment':
        return CreditCard
      case 'quality':
        return Shield
      default:
        return HelpCircle
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground">
            Get help with your tasks and platform features
          </p>
        </div>
        <Badge variant="secondary" className="w-fit gap-2 py-1.5 px-3">
          <Clock className="h-4 w-4 text-teal-500" />
          <span>Avg. response: 4 hours</span>
        </Badge>
      </div>

      {/* Quick Help Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: FileText,
            title: 'Accepting Tasks',
            description: 'Browse Open Pool and click Accept',
            color: 'teal',
          },
          {
            icon: CheckCircle2,
            title: 'Submit Work',
            description: 'Upload in project workspace',
            color: 'emerald',
          },
          {
            icon: CreditCard,
            title: 'Payments',
            description: 'Weekly payouts on Fridays',
            color: 'amber',
          },
          {
            icon: BookOpen,
            title: 'Resources',
            description: 'Guidelines and templates',
            color: 'purple',
          },
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5",
                item.color === 'teal' && "stat-gradient-teal",
                item.color === 'emerald' && "stat-gradient-emerald",
                item.color === 'amber' && "stat-gradient-amber",
                item.color === 'purple' && "stat-gradient-purple"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      item.color === 'teal' && "bg-teal-100 dark:bg-teal-900/30",
                      item.color === 'emerald' && "bg-emerald-100 dark:bg-emerald-900/30",
                      item.color === 'amber' && "bg-amber-100 dark:bg-amber-900/30",
                      item.color === 'purple' && "bg-purple-100 dark:bg-purple-900/30"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        item.color === 'teal' && "text-teal-600 dark:text-teal-400",
                        item.color === 'emerald' && "text-emerald-600 dark:text-emerald-400",
                        item.color === 'amber' && "text-amber-600 dark:text-amber-400",
                        item.color === 'purple' && "text-purple-600 dark:text-purple-400"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Support Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Submit a ticket and we'll respond within 24 hours
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    disabled
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 gradient-primary hover:opacity-90"
                  disabled={isSubmitting}
                >
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
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQs and Contact Info */}
        <div className="space-y-6">
          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Quick answers to common questions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {faqs.map((faq, index) => {
                  const Icon = getCategoryIcon(faq.category)
                  return (
                    <details
                      key={index}
                      className="group rounded-lg border p-3 transition-all hover:bg-muted/50"
                    >
                      <summary className="flex items-center gap-3 cursor-pointer list-none">
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-sm flex-1">{faq.question}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                      </summary>
                      <p className="text-sm text-muted-foreground mt-3 ml-7">
                        {faq.answer}
                      </p>
                    </details>
                  )
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="stat-gradient-teal">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Other ways to reach us</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Email Support</p>
                  <p className="font-medium text-sm">support@assignx.com</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Response Time</p>
                  <p className="font-medium text-sm">Within 24 hours</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50">
                  <p className="text-xs text-muted-foreground">Available</p>
                  <p className="font-medium text-sm">Mon-Fri, 9AM-6PM IST</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
