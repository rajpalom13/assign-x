'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  CreditCard,
  Smartphone,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Save,
  X,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import type { Doer } from '@/types/database'

interface BankSettingsProps {
  /** Doer data with bank details */
  doer: Doer
  /** Callback when bank details are saved */
  onSave?: (details: BankDetails) => Promise<void>
  /** Loading state */
  isLoading?: boolean
  /** Additional class name */
  className?: string
}

interface BankDetails {
  bank_account_name: string
  bank_account_number: string
  bank_ifsc_code: string
  bank_name: string
  upi_id: string
}

/**
 * Bank Settings component
 * Displays and allows editing of bank details
 */
export function BankSettings({
  doer,
  onSave,
  isLoading,
  className,
}: BankSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showAccountNumber, setShowAccountNumber] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState<BankDetails>({
    bank_account_name: doer.bank_account_name || '',
    bank_account_number: doer.bank_account_number || '',
    bank_ifsc_code: doer.bank_ifsc_code || '',
    bank_name: doer.bank_name || '',
    upi_id: doer.upi_id || '',
  })

  /** Mask account number */
  const maskAccountNumber = (number: string) => {
    if (!number || number.length < 4) return number
    return '*'.repeat(number.length - 4) + number.slice(-4)
  }

  /** Handle input change */
  const handleChange = (field: keyof BankDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  /** Validate IFSC code */
  const validateIFSC = (code: string) => {
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    return ifscRegex.test(code.toUpperCase())
  }

  /** Fetch bank name from IFSC */
  const fetchBankName = async (ifsc: string) => {
    if (!validateIFSC(ifsc)) return
    // In production, would fetch from actual API
    // Simulating bank name lookup
    const bankNames: Record<string, string> = {
      SBIN: 'State Bank of India',
      HDFC: 'HDFC Bank',
      ICIC: 'ICICI Bank',
      KKBK: 'Kotak Mahindra Bank',
      UTIB: 'Axis Bank',
    }
    const prefix = ifsc.substring(0, 4)
    handleChange('bank_name', bankNames[prefix] || 'Unknown Bank')
  }

  /** Handle save */
  const handleSave = async () => {
    setError(null)

    // Validate
    if (!formData.bank_account_name.trim()) {
      setError('Account holder name is required')
      return
    }
    if (!formData.bank_account_number.trim()) {
      setError('Account number is required')
      return
    }
    if (!validateIFSC(formData.bank_ifsc_code)) {
      setError('Invalid IFSC code format')
      return
    }

    setIsSaving(true)
    try {
      if (onSave) {
        await onSave(formData)
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      setSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bank details')
    } finally {
      setIsSaving(false)
    }
  }

  /** Check if bank details are complete */
  const hasCompleteDetails = Boolean(
    doer.bank_account_name &&
      doer.bank_account_number &&
      doer.bank_ifsc_code
  )

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
                Bank details updated successfully!
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification status */}
      {!hasCompleteDetails && (
        <Alert variant="default" className="border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-600">Incomplete Bank Details</AlertTitle>
          <AlertDescription>
            Add your bank details to receive payouts. This is required for withdrawing earnings.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bank details card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Bank Account</CardTitle>
                  <CardDescription>Your primary payout account</CardDescription>
                </div>
              </div>
              {hasCompleteDetails && (
                <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                  <Shield className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasCompleteDetails ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Holder</p>
                    <p className="font-medium">{doer.bank_account_name}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-medium font-mono">
                      {showAccountNumber
                        ? doer.bank_account_number
                        : maskAccountNumber(doer.bank_account_number || '')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                  >
                    {showAccountNumber ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-muted/40">
                    <p className="text-sm text-muted-foreground">IFSC Code</p>
                    <p className="font-medium font-mono">{doer.bank_ifsc_code}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40">
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="font-medium">{doer.bank_name || 'N/A'}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="w-full gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Update Bank Details
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No bank account linked yet
                </p>
                <Button onClick={() => setIsEditing(true)} className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Add Bank Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* UPI card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>UPI ID</CardTitle>
                <CardDescription>Alternative payment method</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {doer.upi_id ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                <div>
                  <p className="text-sm text-muted-foreground">UPI ID</p>
                  <p className="font-medium">{doer.upi_id}</p>
                </div>
                <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-600 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </Badge>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  No UPI ID added (optional)
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {hasCompleteDetails ? 'Update Bank Details' : 'Add Bank Account'}
            </DialogTitle>
            <DialogDescription>
              Enter your bank account details for receiving payouts
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
              <Label htmlFor="bank_account_name">Account Holder Name</Label>
              <Input
                id="bank_account_name"
                value={formData.bank_account_name}
                onChange={(e) => handleChange('bank_account_name', e.target.value)}
                placeholder="As per bank records"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account_number">Account Number</Label>
              <Input
                id="bank_account_number"
                value={formData.bank_account_number}
                onChange={(e) => handleChange('bank_account_number', e.target.value)}
                placeholder="Enter account number"
                type="text"
                inputMode="numeric"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_ifsc_code">IFSC Code</Label>
                <Input
                  id="bank_ifsc_code"
                  value={formData.bank_ifsc_code}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase()
                    handleChange('bank_ifsc_code', value)
                    if (value.length === 11) {
                      fetchBankName(value)
                    }
                  }}
                  placeholder="e.g., SBIN0001234"
                  maxLength={11}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  placeholder="Auto-detected"
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upi_id">UPI ID (Optional)</Label>
              <Input
                id="upi_id"
                value={formData.upi_id}
                onChange={(e) => handleChange('upi_id', e.target.value)}
                placeholder="yourname@upi"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Details
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
