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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      <div className="mx-auto w-full max-w-[1400px] space-y-8 px-6 py-12 lg:px-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10 rounded-3xl blur-3xl" />
          <div className="relative space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                Support
              </span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-[#1C1C1C]">
              How can we help you?
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl pt-2">
              Get assistance with your account, manage support tickets, or browse our FAQ
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl opacity-5 blur-2xl" />
          <div className="relative bg-white rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-900/5 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tabs Header with Gradient Background */}
              <div className="relative bg-gradient-to-br from-gray-50 via-orange-50/40 to-gray-50 border-b border-gray-200/80 px-8 pt-8 pb-6">
                <TabsList className="inline-flex h-auto p-1 rounded-2xl bg-white border-2 border-gray-200/80 shadow-sm backdrop-blur-sm">
                  <TabsTrigger
                    value="tickets"
                    className="relative gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold text-gray-600 transition-all data-[state=active]:text-white hover:bg-gray-50/80 min-w-[180px] data-[state=active]:shadow-lg outline-none border-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-600"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>My Tickets</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="faq"
                    className="relative gap-2.5 rounded-xl px-8 py-3.5 text-base font-semibold text-gray-600 transition-all data-[state=active]:text-white hover:bg-gray-50/80 min-w-[180px] data-[state=active]:shadow-lg outline-none border-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-orange-600"
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>FAQ</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Content Area */}
              <div className="p-8">
                <TabsContent value="tickets" className="mt-0">
                  {renderTicketContent()}
                </TabsContent>

                <TabsContent value="faq" className="mt-0">
                  <FAQAccordion />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
