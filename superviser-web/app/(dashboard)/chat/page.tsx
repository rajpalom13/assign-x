/**
 * @fileoverview Chat list page showing all conversation rooms with filtering by type and unread status.
 * Uses real Supabase data via useChatRooms hook.
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
  Filter,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { CHAT_ROOM_TYPE_CONFIG } from "@/components/chat"
import { useChatRooms, useUnreadMessages } from "@/hooks"
import type { ChatRoomType } from "@/types/database"

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

export default function ChatPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  const { rooms, isLoading, error, refetch } = useChatRooms()
  const { unreadByRoom } = useUnreadMessages()

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
      const matchesType =
        filterType === "all" ||
        (filterType === "unread" && unreadCount > 0) ||
        room.room_type === filterType

      return matchesSearch && matchesType
    })
  }, [rooms, searchQuery, filterType, unreadByRoom])

  const totalUnread = useMemo(() => {
    return Object.values(unreadByRoom).reduce((sum, count) => sum + count, 0)
  }, [unreadByRoom])

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground">
            {totalUnread > 0
              ? `You have ${totalUnread} unread message${totalUnread > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chats</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="project_user_supervisor">Client Chats</SelectItem>
            <SelectItem value="project_supervisor_doer">Expert Chats</SelectItem>
            <SelectItem value="project_all">Group Chats</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chat List */}
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-2">
          {filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No conversations found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your filters"
                  : "Start a conversation from a project"}
              </p>
            </div>
          ) : (
            filteredRooms.map((room) => {
              const roomType = room.room_type as ChatRoomType
              const Icon = getRoomIcon(roomType)
              const config = CHAT_ROOM_TYPE_CONFIG[roomType]
              const participant = getParticipantInfo(room)
              const unreadCount = unreadByRoom[room.id] || 0
              const projectNumber = room.projects?.project_number || "Unknown"
              const projectTitle = room.projects?.title || "Untitled Project"

              return (
                <Link key={room.id} href={`/chat/${room.project_id}`}>
                  <Card
                    className={cn(
                      "transition-all hover:shadow-md hover:border-primary/20 cursor-pointer",
                      unreadCount > 0 && "border-primary/30 bg-primary/5"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>
                              {participant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                            <Icon className="h-3 w-3" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {projectNumber}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {config?.label || "Chat"}
                            </Badge>
                            {room.is_suspended && (
                              <Badge
                                variant="destructive"
                                className="text-[10px] px-1.5 py-0"
                              >
                                <ShieldAlert className="h-3 w-3 mr-1" />
                                Suspended
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-sm truncate">
                            {participant.name}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {projectTitle}
                          </p>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-col items-end gap-2">
                          {room.last_message_at && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(room.last_message_at), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
