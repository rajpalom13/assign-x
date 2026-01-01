/**
 * @fileoverview Support ticket detail view with conversation thread.
 * @module components/support/ticket-detail
 */

"use client"

import { useState, useRef, useEffect } from "react"
import {
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  CheckCircle2,
  RefreshCw,
  User,
  Headphones,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useTicket } from "@/hooks/use-support"
import { Skeleton } from "@/components/ui/skeleton"
import { SupportTicket } from "@/types/database"
import {
  TicketMessage,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TICKET_STATUS_CONFIG,
  TICKET_PRIORITY_CONFIG,
  TICKET_CATEGORY_CONFIG,
} from "./types"


interface TicketDetailProps {
  ticket: SupportTicket
  onBack: () => void
  onStatusChange?: (ticketId: string, status: string) => void
}

export function TicketDetail({ ticket, onBack, onStatusChange }: TicketDetailProps) {
  // Fetch real messages from Supabase
  const {
    messages,
    isLoading: isLoadingMessages,
    sendMessage,
    updateStatus,
  } = useTicket(ticket.id)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      // Send using real hook
      await sendMessage(newMessage)

      setNewMessage("")
      toast.success("Message sent")
    } catch (error) {
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleReopen = () => {
    onStatusChange?.(ticket.id, "reopened")
    toast.success("Ticket reopened")
  }

  const handleClose = () => {
    onStatusChange?.(ticket.id, "closed")
    toast.success("Ticket closed")
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const canReply = ticket.status !== "closed" && ticket.status !== "resolved"

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <Card className="rounded-b-none">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-mono text-muted-foreground">
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
              <CardTitle className="text-lg">{ticket.subject}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {ticket.category && TICKET_CATEGORY_CONFIG[ticket.category as TicketCategory] && (
                  <Badge variant="outline">
                    {TICKET_CATEGORY_CONFIG[ticket.category as TicketCategory].label}
                  </Badge>
                )}
                {ticket.project_id && (
                  <span>Project ID: {ticket.project_id.slice(0, 8)}...</span>
                )}
                {ticket.created_at && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Created {formatDateTime(ticket.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(ticket.status === "resolved" || ticket.status === "closed") && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reopen
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reopen Ticket?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reopen the ticket for further discussion.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReopen}>Reopen</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {canReply && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark as Resolved?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will close the ticket. You can reopen it later if needed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClose}>Resolve</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 rounded-none border-t-0 overflow-hidden">
        <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
          <div className="space-y-4">
            {/* Initial Description */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">You</span>
                  <span className="text-xs text-muted-foreground">
                    {ticket.created_at ? formatDateTime(ticket.created_at) : ""}
                  </span>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg rounded-tl-none">
                  <p className="text-sm">{ticket.description}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.sender_type === "user" && "flex-row-reverse"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className={cn(
                      message.sender_type === "support"
                        ? "bg-green-100 text-green-600"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {message.sender_type === "support" ? (
                      <Headphones className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("flex-1 max-w-[80%]", message.sender_type === "user" && "text-right")}>
                  <div className={cn("flex items-center gap-2 mb-1", message.sender_type === "user" && "justify-end")}>
                    <span className="font-medium text-sm">{message.sender_type === "support" ? "Support" : "You"}</span>
                    <span className="text-xs text-muted-foreground">
                      {message.created_at ? formatDateTime(message.created_at) : ""}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-lg text-sm",
                      message.sender_type === "support"
                        ? "bg-green-50 dark:bg-green-950/30 rounded-tl-none"
                        : "bg-primary/5 rounded-tr-none"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Reply Input */}
      <Card className="rounded-t-none border-t-0">
        <CardContent className="pt-4">
          {canReply ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[80px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      handleSendMessage()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Press Ctrl+Enter to send
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  disabled
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  className="shrink-0"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p>This ticket has been resolved.</p>
              <p className="text-xs mt-1">
                Need more help? Click &quot;Reopen&quot; to continue the conversation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
