/**
 * @fileoverview Application submission review and confirmation component.
 * @module components/onboarding/application-submit
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, FileText, Building2, User, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { APP_NAME } from "@/lib/constants"

interface ApplicationSubmitProps {
  profileData: {
    qualification: string
    yearsOfExperience: number
    expertiseAreas: string[]
    cvFileName?: string
  }
  bankingData: {
    bankName: string
    accountNumber: string
    ifscCode: string
    upiId?: string
  }
  onSubmit: () => Promise<void>
  onBack: () => void
  isLoading?: boolean
}

export function ApplicationSubmit({
  profileData,
  bankingData,
  onSubmit,
  onBack,
  isLoading = false,
}: ApplicationSubmitProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  const maskAccountNumber = (num: string) => {
    if (num.length <= 4) return num
    return "XXXX" + num.slice(-4)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold mb-2">Review Your Application</h2>
        <p className="text-muted-foreground">
          Please review your information before submitting
        </p>
      </motion.div>

      {/* Professional Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Professional Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Qualification</span>
              <span className="text-sm font-medium">{profileData.qualification}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Experience</span>
              <span className="text-sm font-medium">{profileData.yearsOfExperience} years</span>
            </div>
            <Separator />
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground text-sm">Expertise Areas</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                {profileData.expertiseAreas.slice(0, 3).map((area) => (
                  <span
                    key={area}
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                  >
                    {area}
                  </span>
                ))}
                {profileData.expertiseAreas.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{profileData.expertiseAreas.length - 3} more
                  </span>
                )}
              </div>
            </div>
            {profileData.cvFileName && (
              <>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">CV/Resume</span>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-green-600">Uploaded</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Banking Details Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Banking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Bank</span>
              <span className="text-sm font-medium">{bankingData.bankName}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Account Number</span>
              <span className="text-sm font-medium font-mono">
                {maskAccountNumber(bankingData.accountNumber)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">IFSC Code</span>
              <span className="text-sm font-medium font-mono">{bankingData.ifscCode}</span>
            </div>
            {bankingData.upiId && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">UPI ID</span>
                  <span className="text-sm font-medium">{bankingData.upiId}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Terms and Conditions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">By submitting this application, you agree to:</p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>{APP_NAME} Terms of Service and Privacy Policy</li>
                  <li>Verification of your credentials and experience</li>
                  <li>Platform guidelines for quality supervision</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3 pt-4"
      >
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading || isSubmitting}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Application
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
