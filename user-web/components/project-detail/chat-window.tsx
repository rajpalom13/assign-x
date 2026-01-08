"use client"

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react"
import { X, Send, Paperclip, Loader2, ChevronUp, User, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useChat } from "@/hooks/useChat"
import { validateChatContent, getValidationErrorMessage } from "@/lib/validations/chat-content"
import { flagUserForViolation, type FlagReason } from "@/lib/actions/user-flagging"
import type { MessageWithSender } from "@/services"

/**
 * Props for ChatWindow component
 */
interface ChatWindowProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  userId: string
  supervisorName?: string
  projectNumber?: string
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (diffDays === 1) {
    return `Yesterday ${date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Single chat message bubble
 */
function MessageBubble({
  message,
  isCurrentUser,
}: {
  message: MessageWithSender
  isCurrentUser: boolean
}) {
  const senderName = message.sender?.full_name || message.sender?.email || "Unknown"
  const senderInitial = senderName.charAt(0).toUpperCase()

  return (
    <div
      className={cn(
        "flex gap-2",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={message.sender?.avatar_url || undefined} />
        <AvatarFallback
          className={cn(
            "text-xs",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {isCurrentUser ? <User className="h-4 w-4" /> : senderInitial}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex max-w-[75%] flex-col",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {!isCurrentUser && (
          <span className="mb-1 text-xs text-muted-foreground">
            {senderName}
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2",
            isCurrentUser
              ? "rounded-tr-sm bg-primary text-primary-foreground"
              : "rounded-tl-sm bg-muted"
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          {message.file_url && (
            <a
              href={message.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-2 flex items-center gap-1 text-xs underline",
                isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"
              )}
            >
              <Paperclip className="h-3 w-3" />
              View attachment
            </a>
          )}
        </div>
        <span className="mt-1 text-[10px] text-muted-foreground">
          {message.created_at && formatTime(message.created_at)}
          {message.is_read && isCurrentUser && (
            <span className="ml-1">✓</span>
          )}
        </span>
      </div>
    </div>
  )
}

/**
 * Date separator between messages
 */
function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{date}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}

/**
 * Chat window overlay/sheet with real-time messaging
 */
export function ChatWindow({
  isOpen,
  onClose,
  projectId,
  userId,
  supervisorName,
  projectNumber,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("")
  const [showViolationAlert, setShowViolationAlert] = useState(false)
  const [violationMessage, setViolationMessage] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    messages,
    isLoading,
    isSending,
    hasMore,
    sendMessage,
    sendMessageWithAttachment,
    loadMore,
  } = useChat(isOpen ? projectId : null, isOpen ? userId : null)

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      // Small delay to allow render
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 100)
    }
  }, [messages])

  /**
   * Focus input when opened
   */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen])

  /**
   * Handle content violation - flag user and close chat
   */
  const handleViolation = useCallback(
    async (reason: FlagReason, message: string) => {
      // Flag user in database
      if (userId) {
        await flagUserForViolation(userId, reason)
      }

      // Show violation alert
      setViolationMessage(message)
      setShowViolationAlert(true)
      setInputValue("")
    },
    [userId]
  )

  /**
   * Close chat after violation acknowledged
   */
  const handleViolationClose = useCallback(() => {
    setShowViolationAlert(false)
    setViolationMessage("")
    onClose()
  }, [onClose])

  /**
   * Handle send message with content validation
   */
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isSending) return

    // Validate content before sending
    const validation = validateChatContent(inputValue)
    if (!validation.isValid) {
      const reasonMap: Record<string, FlagReason> = {
        phone: "phone_sharing",
        email: "email_sharing",
        link: "link_sharing",
        address: "address_sharing",
      }
      const flagReason = reasonMap[validation.reason || ""] || "link_sharing"
      await handleViolation(flagReason, getValidationErrorMessage(validation))
      return
    }

    const success = await sendMessage(inputValue)
    if (success) {
      setInputValue("")
    }
  }, [inputValue, isSending, sendMessage, handleViolation])

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  /**
   * Handle file upload
   */
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    await sendMessageWithAttachment("", file)
    e.target.value = ""
  }

  /**
   * Group messages by date
   */
  const groupedMessages = messages.reduce<{ date: string; messages: MessageWithSender[] }[]>(
    (groups, message) => {
      const dateStr = message.created_at
        ? new Date(message.created_at).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Unknown Date"

      const existingGroup = groups.find((g) => g.date === dateStr)
      if (existingGroup) {
        existingGroup.messages.push(message)
      } else {
        groups.push({ date: dateStr, messages: [message] })
      }

      return groups
    },
    []
  )

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-left text-base">
                Chat with {supervisorName || "Supervisor"}
              </SheetTitle>
              {projectNumber && (
                <p className="text-xs text-muted-foreground">{projectNumber}</p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close chat</span>
            </Button>
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {/* Load more button */}
          {hasMore && !isLoading && messages.length > 0 && (
            <div className="mb-4 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMore}
                className="gap-1"
              >
                <ChevronUp className="h-4 w-4" />
                Load earlier messages
              </Button>
            </div>
          )}

          {/* Loading state */}
          {isLoading && messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-sm text-muted-foreground">
                No messages yet. Start a conversation!
              </p>
            </div>
          )}

          {/* Messages grouped by date */}
          {groupedMessages.map((group) => (
            <div key={group.date}>
              <DateSeparator date={group.date} />
              <div className="space-y-4">
                {group.messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isCurrentUser={message.sender_id === userId}
                  />
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />

            {/* Attachment button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
            >
              <Paperclip className="h-4 w-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            {/* Text input */}
            <Input
              ref={inputRef}
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="flex-1"
            />

            {/* Send button */}
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </SheetContent>

      {/* Policy Violation Alert */}
      <AlertDialog open={showViolationAlert} onOpenChange={setShowViolationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Policy Violation Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {violationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={handleViolationClose} variant="destructive">
              I Understand
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}
