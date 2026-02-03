/**
 * @fileoverview Support center page with ticket management, FAQ, and help resources.
 * @module app/(dashboard)/support/page
 */

"use client"

import { useState } from "react"
import { MessageSquare, HelpCircle, ArrowLeft } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  TicketForm,
  TicketList,
  TicketDetail,
  FAQAccordion,
} from "@/components/support"
import { SupportTicket } from "@/types/database"

type SupportView = "list" | "create" | "detail"

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("tickets")
  const [currentView, setCurrentView] = useState<SupportView>("list")
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)

  const handleTicketSelect = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setCurrentView("detail")
  }

  const handleBack = () => {
    setCurrentView("list")
    setSelectedTicket(null)
  }

  const renderTicketContent = () => {
    switch (currentView) {
      case "create":
        return (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-600 hover:text-[#1C1C1C]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tickets
            </Button>
            <TicketForm
              onSubmit={async () => {
                handleBack()
              }}
              onCancel={handleBack}
            />
          </div>
        )
      case "detail":
        return selectedTicket ? (
          <TicketDetail
            ticket={selectedTicket}
            onBack={handleBack}
            onStatusChange={() => {
              // Status change handled by ticket detail component
            }}
          />
        ) : null
      default:
        return (
          <TicketList
            onTicketSelect={handleTicketSelect}
            onCreateNew={() => setCurrentView("create")}
          />
        )
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-6 px-6 py-8 lg:px-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Account</p>
        <h2 className="text-3xl font-semibold tracking-tight text-[#1C1C1C]">Support Center</h2>
        <p className="text-sm text-gray-500">
          Get help with your account, projects, or payments
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid p-1 rounded-2xl border border-gray-200 bg-white shadow-sm">
          <TabsTrigger
            value="tickets"
            className="gap-2 rounded-xl text-gray-600 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm"
          >
            <MessageSquare className="h-4 w-4" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger
            value="faq"
            className="gap-2 rounded-xl text-gray-600 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-sm"
          >
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          {renderTicketContent()}
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <FAQAccordion />
        </TabsContent>
      </Tabs>
    </div>
  )
}
