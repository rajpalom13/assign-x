'use client'

/**
 * Request Payout component
 * Allows users to request withdrawal of earnings
 * @module components/profile/RequestPayout
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  Building2,
  Smartphone,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { mockWallet } from './constants'
import type { Wallet as WalletType, Doer } from '@/types/database'

/**
 * RequestPayout component props
 */
interface RequestPayoutProps {
  /** Wallet data */
  wallet?: WalletType
  /** Doer data with bank details */
  doer: Doer
  /** Minimum payout amount */
  minPayout?: number
  /** Processing fee percentage */
  processingFee?: number
  /** Callback when payout is requested */
  onRequestPayout?: (amount: number, method: 'bank_transfer' | 'upi') => Promise<void>
  /** Additional class name */
  className?: string
}

/**
 * Request Payout component
 * Allows users to request withdrawal of earnings
 */
export function RequestPayout({
  wallet = mockWallet,
  doer,
  minPayout = 500,
  processingFee = 0,
  onRequestPayout,
  className,
}: RequestPayoutProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'upi'>('bank_transfer')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const availableBalance = wallet.balance - wallet.locked_amount
  const payoutAmount = parseFloat(amount) || 0
  const fee = payoutAmount * (processingFee / 100)
  const netAmount = payoutAmount - fee
  const hasBankDetails = Boolean(doer.bank_account_name && doer.bank_account_number && doer.bank_ifsc_code)
  const hasUPI = Boolean(doer.upi_id)
  const quickAmounts = [1000, 2000, 5000, 10000].filter((amt) => amt <= availableBalance)
  const stepLabels = ['Amount', 'Method', 'Confirm']

  /** Validate amount */
  const validateAmount = () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount')
      return false
    }
    if (amt < minPayout) {
      setError(`Minimum payout amount is ₹${minPayout}`)
      return false
    }
    if (amt > availableBalance) {
      setError('Amount exceeds available balance')
      return false
    }
    return true
  }

  /** Handle next step */
  const handleNext = () => {
    if (step === 1) {
      if (!validateAmount()) return
      setError(null)
      setStep(2)
    } else if (step === 2) {
      if (!hasBankDetails && paymentMethod === 'bank_transfer') {
        setError('Please add bank details first')
        return
      }
      if (!hasUPI && paymentMethod === 'upi') {
        setError('Please add UPI ID first')
        return
      }
      setStep(3)
    }
  }

  /** Handle payout request */
  const handleConfirm = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      if (onRequestPayout) {
        await onRequestPayout(payoutAmount, paymentMethod)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payout request')
    } finally {
      setIsProcessing(false)
    }
  }

  /** Reset dialog */
  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setStep(1)
      setAmount('')
      setPaymentMethod('bank_transfer')
      setError(null)
      setSuccess(false)
    }, 200)
  }

  return (
    <div className={className}>
      <Card className="border-emerald-200/60 bg-emerald-50/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Available Balance
          </CardTitle>
          <CardDescription>Amount available for withdrawal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-primary">₹{availableBalance.toLocaleString()}</p>
            {wallet.locked_amount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                ₹{wallet.locked_amount.toLocaleString()} locked (pending clearance)
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm p-3 rounded-xl bg-white/80 border border-emerald-100">
            <span className="text-muted-foreground">Minimum payout</span>
            <span className="font-medium">₹{minPayout}</span>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2" disabled={availableBalance < minPayout || !hasBankDetails}>
                <Wallet className="h-4 w-4" />
                Request Payout
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              {/* Progress indicator */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {stepLabels.map((label, index) => {
                  const stepIndex = index + 1
                  const isActive = step >= stepIndex
                  return (
                    <div key={label} className="space-y-2">
                      <div className={cn('h-2 rounded-full transition-colors', isActive ? 'bg-primary' : 'bg-muted')} />
                      <p className={cn('text-xs text-center', isActive ? 'text-foreground' : 'text-muted-foreground')}>
                        {label}
                      </p>
                    </div>
                  )
                })}
              </div>

              <AnimatePresence mode="wait">
                {success ? (
                  <SuccessState netAmount={netAmount} paymentMethod={paymentMethod} onClose={handleClose} />
                ) : (
                  <>
                    {step === 1 && (
                      <AmountStep
                        amount={amount}
                        setAmount={setAmount}
                        error={error}
                        setError={setError}
                        quickAmounts={quickAmounts}
                        availableBalance={availableBalance}
                        minPayout={minPayout}
                        onNext={handleNext}
                        onClose={handleClose}
                      />
                    )}
                    {step === 2 && (
                      <PaymentMethodStep
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        payoutAmount={payoutAmount}
                        doer={doer}
                        hasBankDetails={hasBankDetails}
                        hasUPI={hasUPI}
                        error={error}
                        setError={setError}
                        onBack={() => setStep(1)}
                        onNext={handleNext}
                      />
                    )}
                    {step === 3 && (
                      <ConfirmStep
                        payoutAmount={payoutAmount}
                        fee={fee}
                        netAmount={netAmount}
                        paymentMethod={paymentMethod}
                        doer={doer}
                        error={error}
                        isProcessing={isProcessing}
                        onBack={() => setStep(2)}
                        onConfirm={handleConfirm}
                      />
                    )}
                  </>
                )}
              </AnimatePresence>
            </DialogContent>
          </Dialog>

          {!hasBankDetails && (
            <Alert variant="default" className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-600">Add bank details to request payouts</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/** Success state component */
function SuccessState({ netAmount, paymentMethod, onClose }: { netAmount: number; paymentMethod: string; onClose: () => void }) {
  return (
    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
      </div>
      <DialogTitle className="text-xl mb-2">Payout Request Submitted!</DialogTitle>
      <DialogDescription>
        ₹{netAmount.toLocaleString()} will be credited to your {paymentMethod === 'bank_transfer' ? 'bank account' : 'UPI'} within 2-3 business days.
      </DialogDescription>
      <Button onClick={onClose} className="mt-6">Done</Button>
    </motion.div>
  )
}

/** Amount step component */
function AmountStep({
  amount, setAmount, error, setError, quickAmounts, availableBalance, minPayout, onNext, onClose
}: {
  amount: string; setAmount: (v: string) => void; error: string | null; setError: (v: string | null) => void
  quickAmounts: number[]; availableBalance: number; minPayout: number; onNext: () => void; onClose: () => void
}) {
  return (
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <DialogHeader>
        <DialogTitle>Enter Amount</DialogTitle>
        <DialogDescription>How much would you like to withdraw?</DialogDescription>
      </DialogHeader>

      <div className="py-6 space-y-4">
        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₹)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
            <Input id="amount" type="number" value={amount} onChange={(e) => { setAmount(e.target.value); setError(null) }} placeholder="0" className="pl-8 text-2xl font-bold h-14" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickAmounts.map((amt) => (
            <Button key={amt} variant="outline" size="sm" onClick={() => setAmount(amt.toString())} className={cn(amount === amt.toString() && 'border-primary bg-primary/5')}>
              ₹{amt.toLocaleString()}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setAmount(availableBalance.toString())} className={cn(amount === availableBalance.toString() && 'border-primary bg-primary/5')}>
            Max (₹{availableBalance.toLocaleString()})
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">Available: ₹{availableBalance.toLocaleString()} • Min: ₹{minPayout}</p>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={onNext} className="gap-2">Continue<ArrowRight className="h-4 w-4" /></Button>
      </DialogFooter>
    </motion.div>
  )
}

/** Payment method step component */
function PaymentMethodStep({
  paymentMethod, setPaymentMethod, payoutAmount, doer, hasBankDetails, hasUPI, error, setError, onBack, onNext
}: {
  paymentMethod: 'bank_transfer' | 'upi'; setPaymentMethod: (v: 'bank_transfer' | 'upi') => void; payoutAmount: number
  doer: Doer; hasBankDetails: boolean; hasUPI: boolean; error: string | null; setError: (v: string | null) => void
  onBack: () => void; onNext: () => void
}) {
  return (
    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <DialogHeader>
        <DialogTitle>Select Payment Method</DialogTitle>
        <DialogDescription>Where should we send ₹{payoutAmount.toLocaleString()}?</DialogDescription>
      </DialogHeader>

      <div className="py-6 space-y-4">
        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        <RadioGroup value={paymentMethod} onValueChange={(v) => { setPaymentMethod(v as typeof paymentMethod); setError(null) }} className="space-y-3">
          <Label htmlFor="bank" className={cn('flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all', paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'hover:border-primary/50', !hasBankDetails && 'opacity-50 cursor-not-allowed')}>
            <RadioGroupItem value="bank_transfer" id="bank" disabled={!hasBankDetails} />
            <Building2 className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium">Bank Transfer</p>
              <p className="text-sm text-muted-foreground">{hasBankDetails ? `${doer.bank_name} - ****${doer.bank_account_number?.slice(-4)}` : 'No bank account added'}</p>
            </div>
            {hasBankDetails && <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Verified</Badge>}
          </Label>

          <Label htmlFor="upi" className={cn('flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all', paymentMethod === 'upi' ? 'border-primary bg-primary/5' : 'hover:border-primary/50', !hasUPI && 'opacity-50 cursor-not-allowed')}>
            <RadioGroupItem value="upi" id="upi" disabled={!hasUPI} />
            <Smartphone className="h-5 w-5 text-purple-600" />
            <div className="flex-1">
              <p className="font-medium">UPI</p>
              <p className="text-sm text-muted-foreground">{hasUPI ? doer.upi_id : 'No UPI ID added'}</p>
            </div>
            {hasUPI && <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Active</Badge>}
          </Label>
        </RadioGroup>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext} className="gap-2">Continue<ArrowRight className="h-4 w-4" /></Button>
      </DialogFooter>
    </motion.div>
  )
}

/** Confirm step component */
function ConfirmStep({
  payoutAmount, fee, netAmount, paymentMethod, doer, error, isProcessing, onBack, onConfirm
}: {
  payoutAmount: number; fee: number; netAmount: number; paymentMethod: 'bank_transfer' | 'upi'; doer: Doer
  error: string | null; isProcessing: boolean; onBack: () => void; onConfirm: () => void
}) {
  return (
    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <DialogHeader>
        <DialogTitle>Confirm Payout</DialogTitle>
        <DialogDescription>Review your payout request details</DialogDescription>
      </DialogHeader>

      <div className="py-6 space-y-4">
        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payout Amount</span>
            <span className="font-medium">₹{payoutAmount.toLocaleString()}</span>
          </div>
          {fee > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Processing Fee</span>
              <span className="font-medium text-red-600">-₹{fee.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t pt-3 flex items-center justify-between">
            <span className="font-medium">You'll Receive</span>
            <span className="text-xl font-bold text-primary">₹{netAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border">
          {paymentMethod === 'bank_transfer' ? (
            <>
              <Building2 className="h-5 w-5 text-blue-600" />
              <div><p className="font-medium">{doer.bank_name}</p><p className="text-sm text-muted-foreground">****{doer.bank_account_number?.slice(-4)}</p></div>
            </>
          ) : (
            <>
              <Smartphone className="h-5 w-5 text-purple-600" />
              <div><p className="font-medium">UPI</p><p className="text-sm text-muted-foreground">{doer.upi_id}</p></div>
            </>
          )}
        </div>

        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>Processing Time</AlertTitle>
          <AlertDescription>Payouts are typically processed within 2-3 business days.</AlertDescription>
        </Alert>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onConfirm} disabled={isProcessing} className="gap-2">
          {isProcessing ? (<><Loader2 className="h-4 w-4 animate-spin" />Processing...</>) : (<><CheckCircle2 className="h-4 w-4" />Confirm Payout</>)}
        </Button>
      </DialogFooter>
    </motion.div>
  )
}
