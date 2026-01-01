/**
 * @fileoverview Earnings page with summary, payment ledger, commission tracking, and analytics graphs.
 * @module app/(dashboard)/earnings/page
 */

"use client"

import { useState } from "react"
import { Wallet, Receipt, TrendingUp, PieChart } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  EarningsSummary,
  PaymentLedger,
  CommissionTracking,
  EarningsGraph,
} from "@/components/earnings"

export default function EarningsPage() {
  const [activeTab, setActiveTab] = useState("summary")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Earnings</h2>
        <p className="text-muted-foreground">
          Track your earnings, commissions, and payment history
        </p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="summary" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Ledger</span>
          </TabsTrigger>
          <TabsTrigger value="commission" className="gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Commission</span>
          </TabsTrigger>
          <TabsTrigger value="graph" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <EarningsSummary />
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6">
          <PaymentLedger />
        </TabsContent>

        <TabsContent value="commission" className="space-y-6">
          <CommissionTracking />
        </TabsContent>

        <TabsContent value="graph" className="space-y-6">
          <EarningsGraph />
        </TabsContent>
      </Tabs>
    </div>
  )
}
