/**
 * @fileoverview Professional registration page for new supervisor applications.
 * @module app/(auth)/register/page
 */

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RegisterForm } from "@/components/auth/register-form"
import { APP_NAME } from "@/lib/constants"
import { Shield, ArrowLeft, CheckCircle2, Clock, Sparkles } from "lucide-react"

const benefits = [
  { icon: "💰", text: "Competitive commission rates" },
  { icon: "🎯", text: "Flexible working hours" },
  { icon: "📚", text: "Professional development resources" },
  { icon: "🛡️", text: "QC tools & support" },
]

export default function RegisterPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Mobile Logo (shown only on mobile) */}
      <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-2xl font-bold text-white">AX</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Supervisor Portal
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-xl shadow-black/5">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="flex justify-center">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Now Accepting Applications
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Become a Supervisor
          </CardTitle>
          <CardDescription className="text-base">
            Join our network and start earning with {APP_NAME}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-6">
          <RegisterForm />

          {/* Benefits */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 space-y-3">
            <p className="text-sm font-medium text-center">Why join us?</p>
            <div className="grid grid-cols-2 gap-2">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <span>{benefit.icon}</span>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="pt-6 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1 group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Sign in
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-foreground transition-colors">
              Help
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* Application Process */}
      <div className="flex items-center justify-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          <span>Quick Application</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Clock className="h-3.5 w-3.5 text-blue-500" />
          <span>24-48hr Review</span>
        </div>
      </div>
    </div>
  )
}
