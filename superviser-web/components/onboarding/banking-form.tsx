/**
 * @fileoverview Banking information form for payment setup during onboarding.
 * @module components/onboarding/banking-form
 */

"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Building2, CreditCard, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { bankingSchema, type BankingFormData } from "@/lib/validations/auth"
import { INDIAN_BANKS } from "@/lib/constants"

interface BankingFormProps {
  onSubmit: (data: BankingFormData) => Promise<void>
  onBack: () => void
  isLoading?: boolean
  defaultValues?: Partial<BankingFormData>
}

export function BankingForm({
  onSubmit,
  onBack,
  isLoading = false,
  defaultValues,
}: BankingFormProps) {
  const form = useForm<BankingFormData>({
    resolver: zodResolver(bankingSchema),
    defaultValues: {
      bankName: defaultValues?.bankName || "",
      accountNumber: defaultValues?.accountNumber || "",
      ifscCode: defaultValues?.ifscCode || "",
      upiId: defaultValues?.upiId || "",
    },
  })

  const handleSubmit = async (data: BankingFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg mb-6">
          <Building2 className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Your bank details are securely stored and used only for commission payouts.
          </p>
        </div>

        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDIAN_BANKS.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value}>
                      {bank.label}
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
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Account Number
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter your account number"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your savings or current account number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ifscCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IFSC Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., HDFC0001234"
                  disabled={isLoading}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>
                11-character code identifying your bank branch
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="upiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                UPI ID (Optional)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="yourname@upi"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                For faster payouts via UPI
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
