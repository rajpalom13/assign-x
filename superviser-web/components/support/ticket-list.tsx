/**
 * @fileoverview Support ticket listing with search and filtering.
 * @module components/support/ticket-list
 */

"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Plus,
  MessageSquare,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTickets, useTicketStats } from "@/hooks/use-support"
import { Skeleton } from "@/components/ui/skeleton"
import { SupportTicket as DatabaseSupportTicket } from "@/types/database"
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  TICKET_CATEGORY_CONFIG,
} from "./types"


interface TicketListProps {
  onTicketSelect?: (ticket: DatabaseSupportTicket) => void
  onCreateNew?: () => void
}

export function TicketList({ onTicketSelect, onCreateNew }: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")

  // Fetch real tickets from Supabase
  const { tickets, isLoading, error } = useTickets()
  const { stats: ticketStats, isLoading: isLoadingStats } = useTicketStats()

  const filteredTickets = useMemo(() => {
    let result = [...tickets]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (ticket) =>
          ticket.ticket_number.toLowerCase().includes(query) ||
          ticket.subject.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((ticket) => ticket.status === statusFilter)
    }

    return result.sort(
      (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
    )
  }, [tickets, searchQuery, statusFilter])

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open" || t.status === "reopened").length,
    inProgress: tickets.filter((t) => t.status === "in_progress" || t.status === "waiting_response").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
    unreadTotal: 0, // TODO: Add unread count when available
  }), [tickets])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    } else if (days === 1) {
      return "Yesterday"
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className={statusFilter === "all" ? "ring-2 ring-primary" : "cursor-pointer hover:bg-muted/50"}
          onClick={() => setStatusFilter("all")}
        >
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Tickets</p>
          </CardContent>
        </Card>
        <Card
          className={statusFilter === "open" ? "ring-2 ring-primary" : "cursor-pointer hover:bg-muted/50"}
          onClick={() => setStatusFilter("open")}
        >
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
            <p className="text-sm text-muted-foreground">Open</p>
          </CardContent>
        </Card>
        <Card
          className={statusFilter === "in_progress" ? "ring-2 ring-primary" : "cursor-pointer hover:bg-muted/50"}
          onClick={() => setStatusFilter("in_progress")}
        >
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card
          className={statusFilter === "resolved" ? "ring-2 ring-primary" : "cursor-pointer hover:bg-muted/50"}
          onClick={() => setStatusFilter("resolved")}
        >
          <CardContent className="pt-6">
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 md:flex-row md:items-center flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as TicketStatus | "all")}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_response">Waiting Response</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={onCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ticket List */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No tickets found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "You haven't created any support tickets yet"}
              </p>
              <Button className="mt-4" onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            {filteredTickets.map((ticket, index) => (
              <div
                key={ticket.id}
                className={cn(
                  "flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                  index !== filteredTickets.length - 1 && "border-b"
                )}
                onClick={() => onTicketSelect?.(ticket)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {ticket.ticket_number}
                    </span>
                    {ticket.status && TICKET_STATUS_CONFIG[ticket.status as TicketStatus] && (
                      <Badge className={cn("text-xs", TICKET_STATUS_CONFIG[ticket.status as TicketStatus].color)}>
                        {TICKET_STATUS_CONFIG[ticket.status as TicketStatus].label}
                      </Badge>
                    )}
                    {ticket.priority && TICKET_PRIORITY_CONFIG[ticket.priority as TicketPriority] && (
                      <Badge variant="outline" className={cn("text-xs", TICKET_PRIORITY_CONFIG[ticket.priority as TicketPriority].color)}>
                        {TICKET_PRIORITY_CONFIG[ticket.priority as TicketPriority].label}
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium truncate">{ticket.subject}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {ticket.category && TICKET_CATEGORY_CONFIG[ticket.category as TicketCategory] && (
                      <Badge variant="outline" className="text-xs">
                        {TICKET_CATEGORY_CONFIG[ticket.category as TicketCategory].label}
                      </Badge>
                    )}
                    {ticket.project_id && (
                      <span>Project: {ticket.project_id.slice(0, 8)}...</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {ticket.updated_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(ticket.updated_at)}</span>
                    </div>
                  )}
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
