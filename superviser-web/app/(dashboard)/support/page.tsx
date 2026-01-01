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
            <Button variant="ghost" size="sm" onClick={handleBack}>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Support Center</h2>
        <p className="text-muted-foreground">
          Get help with your account, projects, or payments
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="tickets" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            My Tickets
          </TabsTrigger>
          <TabsTrigger value="faq" className="gap-2">
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
