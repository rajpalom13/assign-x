/**
 * @fileoverview Chat list page showing all conversation rooms with modern UI design.
 * Uses real Supabase data via useChatRooms hook with redesigned interface.
 * @module app/(dashboard)/chat/page
 */

"use client"

import { useState, useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import {
  Search,
  MessageSquare,
  Users,
  User,
  UserCog,
  ShieldAlert,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCheck,
  Plus,
  MessageCircle,
  Inbox,
  Bell,
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { CHAT_ROOM_TYPE_CONFIG } from "@/components/chat"
import { AnimatedTabs } from "@/components/ui/animated-tabs"
import { useChatRooms, useUnreadMessages } from "@/hooks"
import type { ChatRoomType } from "@/types/database"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
    },
  },
}

function getRoomIcon(type: ChatRoomType) {
  switch (type) {
    case "project_user_supervisor":
      return User
    case "project_supervisor_doer":
      return UserCog
    case "project_all":
      return Users
    default:
      return Users
  }
}

function getParticipantInfo(room: { chat_participants?: Array<{ profiles?: { full_name?: string; avatar_url?: string | null } | null; participant_role?: string }> | null; room_type?: ChatRoomType }) {
  if (!room.chat_participants || room.chat_participants.length === 0) {
    return { name: "Unknown", avatar: undefined }
  }

  // For group chats, show "Group Chat"
  if (room.room_type === "project_all") {
    return { name: "Group Chat", avatar: undefined }
  }

  // Find the other participant (not supervisor)
  const otherParticipant = room.chat_participants.find(
    (p) => p.participant_role !== "supervisor"
  )

  if (otherParticipant?.profiles) {
    return {
      name: otherParticipant.profiles.full_name || "Unknown",
      avatar: otherParticipant.profiles.avatar_url || undefined,
    }
  }

  return { name: "Unknown", avatar: undefined }
}

// Get last message preview
function getLastMessagePreview(room: ChatRoomWithParticipants): string {
  // If the room data has a last_message_content field or similar, use it
  // Otherwise return a placeholder based on room type
  const config = CHAT_ROOM_TYPE_CONFIG[room.room_type as ChatRoomType]
  return config?.description || "No messages yet"
}

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  const { rooms, isLoading, error, refetch } = useChatRooms()
  const { unreadByRoom, totalUnread, markAllAsRead } = useUnreadMessages()

  // Calculate stats
  const stats = useMemo(() => {
    const totalConversations = rooms.length
    const unreadMessages = Object.values(unreadByRoom).reduce((sum, count) => sum + count, 0)
    const clientChats = rooms.filter(r => r.room_type === "project_user_supervisor").length
    const expertChats = rooms.filter(r => r.room_type === "project_supervisor_doer").length
    const groupChats = rooms.filter(r => r.room_type === "project_all").length

    return {
      totalConversations,
      unreadMessages,
      clientChats,
      expertChats,
      groupChats,
    }
  }, [rooms, unreadByRoom])

  // Filter rooms based on search and active tab
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const participant = getParticipantInfo(room)
      const projectNumber = room.projects?.project_number || ""
      const projectTitle = room.projects?.title || ""

      const matchesSearch =
        searchQuery === "" ||
        projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        projectNumber.toLowerCase().includes(searchQuery.toLowerCase())

      const unreadCount = unreadByRoom[room.id] || 0
      
      let matchesTab = true
      switch (activeTab) {
        case "unread":
          matchesTab = unreadCount > 0
          break
        case "project_user_supervisor":
          matchesTab = room.room_type === "project_user_supervisor"
          break
        case "project_supervisor_doer":
          matchesTab = room.room_type === "project_supervisor_doer"
          break
        case "project_all":
          matchesTab = room.room_type === "project_all"
          break
        default:
          matchesTab = true
      }

      return matchesSearch && matchesTab
    })
  }, [rooms, searchQuery, activeTab, unreadByRoom])

  // Tabs configuration
  const tabs = [
    { id: "all", label: "All Messages" },
    { id: "unread", label: "Unread", count: stats.unreadMessages, badgeColor: "bg-[var(--color-sage)]/10 text-[var(--color-sage)]" },
    { id: "project_user_supervisor", label: "Client Chats", count: stats.clientChats },
    { id: "project_supervisor_doer", label: "Expert Chats", count: stats.expertChats },
    { id: "project_all", label: "Group Chats", count: stats.groupChats },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h3 className="text-lg font-medium">Failed to load conversations</h3>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-sage)]/10 via-[var(--color-sage)]/5 to-transparent px-6 py-8">
        {/* Decorative blur circles */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[var(--color-sage)]/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--color-sage)]/5 blur-3xl" />
        <div className="absolute top-10 right-1/4 h-32 w-32 rounded-full bg-[var(--color-terracotta)]/5 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Messages</h2>
                {stats.unreadMessages > 0 && (
                  <Badge className="bg-[var(--color-sage)] text-white px-2.5 py-0.5">
                    {stats.unreadMessages} unread
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {stats.unreadMessages > 0
                  ? `You have ${stats.unreadMessages} unread message${stats.unreadMessages > 1 ? "s" : ""}`
                  : "All caught up! Stay connected with your clients and experts."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {stats.unreadMessages > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => markAllAsRead()}
                  className="gap-2"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark All Read
                </Button>
              )}
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => refetch()}
                className="shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-[var(--color-sage)]/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--color-sage)]/10 flex items-center justify-center">
                  <Inbox className="h-4 w-4 text-[var(--color-sage)]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold leading-tight">{stats.totalConversations}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-[var(--color-sage)]/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--color-terracotta)]/10 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-[var(--color-terracotta)]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unread</p>
                  <p className="text-lg font-semibold leading-tight">{stats.unreadMessages}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-[var(--color-sage)]/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Client Chats</p>
                  <p className="text-lg font-semibold leading-tight">{stats.clientChats}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-[var(--color-sage)]/10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <UserCog className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expert Chats</p>
                  <p className="text-lg font-semibold leading-tight">{stats.expertChats}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white rounded-t-2xl -mt-4 relative z-20 flex flex-col">
        {/* Animated Tabs */}
        <AnimatedTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          layoutId="chatTabsIndicator"
        />

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, project number, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-muted/50 border-0 focus:bg-white focus:ring-2 focus:ring-[var(--color-sage)]/20 rounded-xl"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <AnimatePresence mode="wait">
            {filteredRooms.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center py-16 text-center px-4"
              >
                <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {searchQuery || activeTab !== "all" ? "No conversations found" : "No messages yet"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {searchQuery || activeTab !== "all"
                    ? "Try adjusting your search or filters"
                    : "Start a conversation from a project to connect with clients and experts"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-gray-50"
              >
                {filteredRooms.map((room) => {
                  const roomType = room.room_type as ChatRoomType
                  const Icon = getRoomIcon(roomType)
                  const config = CHAT_ROOM_TYPE_CONFIG[roomType]
                  const participant = getParticipantInfo(room)
                  const unreadCount = unreadByRoom[room.id] || 0
                  const projectNumber = room.projects?.project_number || "Unknown"
                  const projectTitle = room.projects?.title || "Untitled Project"
                  const isSelected = selectedRoomId === room.id
                  const hasUnread = unreadCount > 0
                  const lastMessagePreview = getLastMessagePreview(room)

                  return (
                    <motion.div
                      key={room.id}
                      variants={itemVariants}
                      layout
                    >
                      <Link 
                        href={`/chat/${room.project_id}`}
                        onClick={() => setSelectedRoomId(room.id)}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-4 px-4 py-4 cursor-pointer transition-all duration-200",
                            "hover:bg-muted/50",
                            isSelected && "bg-[var(--color-sage)]/5 border-l-2 border-[var(--color-sage)]",
                            !isSelected && "border-l-2 border-transparent",
                            hasUnread && !isSelected && "bg-[var(--color-sage)]/[0.02]"
                          )}
                        >
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <Avatar className={cn(
                              "h-12 w-12 transition-all duration-200",
                              hasUnread && "ring-2 ring-[var(--color-sage)]/20"
                            )}>
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className={cn(
                                "text-sm font-medium",
                                hasUnread ? "bg-[var(--color-sage)]/10 text-[var(--color-sage)]" : "bg-muted"
                              )}>
                                {participant.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {/* Room type indicator */}
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                              <Icon className="h-3 w-3 text-muted-foreground" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={cn(
                                "font-medium text-sm truncate",
                                hasUnread ? "text-foreground" : "text-foreground"
                              )}>
                                {participant.name}
                              </span>
                              {room.is_suspended && (
                                <Badge
                                  variant="destructive"
                                  className="text-[10px] px-1.5 py-0 shrink-0"
                                >
                                  <ShieldAlert className="h-2.5 w-2.5 mr-0.5" />
                                  Suspended
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium text-[var(--color-sage)] bg-[var(--color-sage)]/10 px-1.5 py-0.5 rounded">
                                {projectNumber}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {projectTitle}
                              </span>
                            </div>
                            <p className={cn(
                              "text-sm truncate",
                              hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
                            )}>
                              {lastMessagePreview}
                            </p>
                          </div>

                          {/* Meta - Time and Unread Badge */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {room.last_message_at && (
                              <span className={cn(
                                "text-xs",
                                hasUnread ? "text-[var(--color-sage)] font-medium" : "text-muted-foreground"
                              )}>
                                {formatDistanceToNow(new Date(room.last_message_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            )}
                            {unreadCount > 0 && (
                              <Badge className="h-5 min-w-[1.25rem] px-1.5 flex items-center justify-center bg-[var(--color-sage)] text-white text-xs font-semibold rounded-full">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  )
}
