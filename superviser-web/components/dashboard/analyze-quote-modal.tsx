/**
 * @fileoverview Modal for analyzing and creating quotes for project requests.
 * @module components/dashboard/analyze-quote-modal
 */

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import {
  Calculator,
  FileText,
  Clock,
  User,
  Download,
  Loader2,
  CheckCircle2,
  Info,
  IndianRupee,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { ProjectRequest } from "./request-card"

const quoteFormSchema = z.object({
  userQuote: z.number().min(100, "Minimum quote is ₹100").max(100000, "Maximum quote is ₹1,00,000"),
  doerPayout: z.number().min(50, "Minimum payout is ₹50"),
  notes: z.string().optional(),
})

type QuoteFormData = z.infer<typeof quoteFormSchema>

interface AnalyzeQuoteModalProps {
  request: ProjectRequest | null
  isOpen: boolean
  onClose: () => void
  onQuoteSubmit: (requestId: string, data: QuoteFormData) => void
}

interface PricingGuide {
  base_price_per_word: number
  base_price_per_page: number
  urgency_24h_multiplier: number
  urgency_48h_multiplier: number
  urgency_72h_multiplier: number
  complexity_medium_multiplier: number
  complexity_hard_multiplier: number
  supervisor_percentage: number
  platform_percentage: number
}

const DEFAULT_PRICING: PricingGuide = {
  base_price_per_word: 0.5,
  base_price_per_page: 150,
  urgency_24h_multiplier: 1.5,
  urgency_48h_multiplier: 1.3,
  urgency_72h_multiplier: 1.15,
  complexity_medium_multiplier: 1.2,
  complexity_hard_multiplier: 1.5,
  supervisor_percentage: 15,
  platform_percentage: 20,
}

export function AnalyzeQuoteModal({
  request,
  isOpen,
  onClose,
  onQuoteSubmit,
}: AnalyzeQuoteModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestedQuote, setSuggestedQuote] = useState(0)
  const pricing = DEFAULT_PRICING

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      userQuote: 0,
      doerPayout: 0,
      notes: "",
    },
  })

  useEffect(() => {
    if (request && isOpen) {
      calculateSuggestedQuote()
    }
  }, [request, isOpen])

  const calculateSuggestedQuote = () => {
    if (!request) return

    let basePrice = 0
    if (request.word_count) {
      basePrice = request.word_count * pricing.base_price_per_word
    } else if (request.page_count) {
      basePrice = request.page_count * pricing.base_price_per_page
    } else {
      basePrice = 500 // Default minimum
    }

    // Apply urgency multiplier
    const deadline = new Date(request.deadline)
    const hoursUntilDeadline = Math.max(
      0,
      (deadline.getTime() - Date.now()) / (1000 * 60 * 60)
    )

    let urgencyMultiplier = 1
    if (hoursUntilDeadline <= 24) {
      urgencyMultiplier = pricing.urgency_24h_multiplier
    } else if (hoursUntilDeadline <= 48) {
      urgencyMultiplier = pricing.urgency_48h_multiplier
    } else if (hoursUntilDeadline <= 72) {
      urgencyMultiplier = pricing.urgency_72h_multiplier
    }

    const suggested = Math.ceil(basePrice * urgencyMultiplier)
    const doerPayout = Math.ceil(
      suggested * (1 - (pricing.supervisor_percentage + pricing.platform_percentage) / 100)
    )

    setSuggestedQuote(suggested)
    form.setValue("userQuote", suggested)
    form.setValue("doerPayout", doerPayout)
  }

  const handleQuoteChange = (value: number) => {
    form.setValue("userQuote", value)
    // Calculate doer payout based on percentage splits
    const doerPayout = Math.ceil(
      value * (1 - (pricing.supervisor_percentage + pricing.platform_percentage) / 100)
    )
    form.setValue("doerPayout", doerPayout)
  }

  const onSubmit = async (data: QuoteFormData) => {
    if (!request) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("project_quotes").insert({
        project_id: request.id,
        user_quote: data.userQuote,
        doer_payout: data.doerPayout,
        supervisor_notes: data.notes || null,
        created_at: new Date().toISOString(),
      })

      // Update project status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("projects")
        .update({
          status: "quoted",
          quoted_amount: data.userQuote,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.id)

      toast.success("Quote submitted successfully")
      onQuoteSubmit(request.id, data)
      onClose()
    } catch (error) {
      console.error("Error submitting quote:", error)
      toast.error("Failed to submit quote")
    } finally {
      setIsSubmitting(false)
    }
  }

  const supervisorEarning = form.watch("userQuote")
    ? Math.ceil((form.watch("userQuote") * pricing.supervisor_percentage) / 100)
    : 0

  if (!request) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Analyze & Set Quote
          </DialogTitle>
          <DialogDescription>
            Review the project requirements and set the client quote
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Project Info Section */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2 font-mono">
                      {request.project_number}
                    </Badge>
                    <h3 className="font-semibold text-lg">{request.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {request.subject}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Files
                  </Button>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Client:</span>
                    <span className="font-medium">{request.user_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium">
                      {format(new Date(request.deadline), "PPp")}
                    </span>
                  </div>
                  {request.word_count && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Words:</span>
                      <span className="font-medium">
                        {request.word_count.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {request.page_count && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Pages:</span>
                      <span className="font-medium">{request.page_count}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Quote */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Suggested Quote</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ₹{suggestedQuote.toLocaleString("en-IN")}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on word count, deadline, and pricing guidelines
                </p>
              </CardContent>
            </Card>

            {/* Quote Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userQuote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Quote (₹)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Enter quote amount"
                              className="pl-9"
                              {...field}
                              onChange={(e) =>
                                handleQuoteChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Amount client will pay
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doerPayout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doer Payout (₹)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Enter payout amount"
                              className="pl-9"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Amount doer will receive
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Earnings Breakdown */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium mb-3">Earnings Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client Quote</span>
                        <span className="font-medium">
                          ₹{form.watch("userQuote")?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Doer Payout ({100 - pricing.supervisor_percentage - pricing.platform_percentage}%)
                        </span>
                        <span className="font-medium">
                          -₹{form.watch("doerPayout")?.toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Platform Fee ({pricing.platform_percentage}%)
                        </span>
                        <span className="font-medium">
                          -₹
                          {Math.ceil(
                            (form.watch("userQuote") * pricing.platform_percentage) / 100
                          ).toLocaleString("en-IN") || 0}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Your Commission ({pricing.supervisor_percentage}%)</span>
                        <span>₹{supervisorEarning.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any notes about pricing decisions..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Submit Quote
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
