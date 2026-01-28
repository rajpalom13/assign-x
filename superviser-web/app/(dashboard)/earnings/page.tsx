/**
 * @fileoverview Professional earnings page with summary, payment ledger, commission tracking, and analytics.
 * @module app/(dashboard)/earnings/page
 */

"use client"

import { useState } from "react"
import { Wallet, Receipt, TrendingUp, PieChart, Download, Calendar } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  EarningsSummary,
  PaymentLedger,
  CommissionTracking,
  EarningsGraph,
} from "@/components/earnings"

export default function EarningsPage() {
  const [activeTab, setActiveTab] = useState("summary")

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>
              <p className="text-sm text-muted-foreground">
                Track your income and manage withdrawals
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">This Month</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid p-1 rounded-xl bg-muted/50">
          <TabsTrigger
            value="summary"
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Summary</span>
          </TabsTrigger>
          <TabsTrigger
            value="ledger"
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Ledger</span>
          </TabsTrigger>
          <TabsTrigger
            value="commission"
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Commission</span>
          </TabsTrigger>
          <TabsTrigger
            value="graph"
            className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6 animate-fade-in-up">
          <EarningsSummary />
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6 animate-fade-in-up">
          <PaymentLedger />
        </TabsContent>

        <TabsContent value="commission" className="space-y-6 animate-fade-in-up">
          <CommissionTracking />
        </TabsContent>

        <TabsContent value="graph" className="space-y-6 animate-fade-in-up">
          <EarningsGraph />
        </TabsContent>
      </Tabs>
    </div>
  )
}
