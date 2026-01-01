/**
 * Chat service for Supabase operations
 * Handles real-time messaging with supervisors
 */

import { createClient } from '@/lib/supabase/client'
import type {
  ChatRoom,
  ChatMessage,
  ChatParticipant,
  ChatRoomType,
  MessageType,
} from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Get or create a chat room for a project
 */
export async function getOrCreateProjectChatRoom(
  projectId: string
): Promise<ChatRoom> {
  const supabase = createClient()

  // First, try to get existing room
  const { data: existingRoom, error: fetchError } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('project_id', projectId)
    .eq('room_type', 'project_supervisor_doer')
    .single()

  if (existingRoom) {
    return existingRoom
  }

  // If not found, create a new room
  if (fetchError?.code === 'PGRST116') {
    const { data: newRoom, error: createError } = await supabase
      .from('chat_rooms')
      .insert({
        project_id: projectId,
        room_type: 'project_supervisor_doer' as ChatRoomType,
        name: null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating chat room:', createError)
      throw createError
    }

    return newRoom
  }

  if (fetchError) {
    console.error('Error fetching chat room:', fetchError)
    throw fetchError
  }

  throw new Error('Unexpected state in getOrCreateProjectChatRoom')
}

/**
 * Get messages for a chat room
 */
export async function getChatMessages(
  roomId: string,
  limit = 50,
  before?: string
): Promise<ChatMessage[]> {
  const supabase = createClient()

  let query = supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (before) {
    query = query.lt('created_at', before)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching chat messages:', error)
    throw error
  }

  // Return in chronological order
  return (data || []).reverse()
}

/**
 * Send a text message
 * @security Uses authenticated user's ID, not client-provided ID
 */
export async function sendMessage(
  roomId: string,
  content: string
): Promise<ChatMessage> {
  const supabase = createClient()

  // SECURITY: Get the authenticated user's ID from the session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required to send messages')
  }

  const senderId = user.id

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      chat_room_id: roomId,
      sender_id: senderId,
      message_type: 'text' as MessageType,
      content,
      is_edited: false,
      is_deleted: false,
      is_flagged: false,
      contains_contact_info: false,
      read_by: [senderId],
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    throw error
  }

  // Update room's last_message_at
  await supabase
    .from('chat_rooms')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', roomId)

  return data
}

/**
 * Send a file message
 * @security Uses authenticated user's ID, not client-provided ID
 */
export async function sendFileMessage(
  roomId: string,
  file: File
): Promise<ChatMessage> {
  const supabase = createClient()

  // SECURITY: Get the authenticated user's ID from the session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required to send files')
  }

  const senderId = user.id

  // Upload file to storage
  const fileExt = file.name.split('.').pop()
  const fileName = `chat/${roomId}/${Date.now()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('chat-files')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Error uploading chat file:', uploadError)
    throw uploadError
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('chat-files')
    .getPublicUrl(uploadData.path)

  // Determine message type based on file
  const isImage = file.type.startsWith('image/')
  const messageType: MessageType = isImage ? 'image' : 'file'

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      chat_room_id: roomId,
      sender_id: senderId,
      message_type: messageType,
      content: file.name,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_type: file.type,
      file_size_bytes: file.size,
      is_edited: false,
      is_deleted: false,
      is_flagged: false,
      contains_contact_info: false,
      read_by: [senderId],
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending file message:', error)
    throw error
  }

  // Update room's last_message_at
  await supabase
    .from('chat_rooms')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', roomId)

  return data
}

/**
 * Mark messages as read
 * @security Uses authenticated user's ID, not client-provided ID
 */
export async function markMessagesAsRead(
  roomId: string
): Promise<void> {
  const supabase = createClient()

  // SECURITY: Get the authenticated user's ID from the session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const userId = user.id

  // Get unread messages not sent by the user
  const { data: unreadMessages } = await supabase
    .from('chat_messages')
    .select('id, read_by')
    .eq('chat_room_id', roomId)
    .neq('sender_id', userId)

  if (unreadMessages && unreadMessages.length > 0) {
    // Update each message to add user to read_by array
    for (const msg of unreadMessages) {
      const readBy = msg.read_by || []
      if (!readBy.includes(userId)) {
        await supabase
          .from('chat_messages')
          .update({ read_by: [...readBy, userId] })
          .eq('id', msg.id)
      }
    }
  }

  // Update participant's last_seen_at
  await supabase
    .from('chat_participants')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('chat_room_id', roomId)
    .eq('profile_id', userId)
}

/**
 * Get unread message count for a room
 * @security Uses authenticated user's ID, not client-provided ID
 */
export async function getUnreadCount(
  roomId: string
): Promise<number> {
  const supabase = createClient()

  // SECURITY: Get the authenticated user's ID from the session
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return 0
  }

  const userId = user.id

  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, read_by')
    .eq('chat_room_id', roomId)
    .neq('sender_id', userId)

  if (error) {
    console.error('Error getting unread count:', error)
    return 0
  }

  // Count messages where userId is not in read_by array
  const unreadCount = (data || []).filter(msg => {
    const readBy = msg.read_by || []
    return !readBy.includes(userId)
  }).length

  return unreadCount
}

/**
 * Get chat participants for a room
 */
export async function getChatParticipants(
  roomId: string
): Promise<ChatParticipant[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('chat_participants')
    .select('*')
    .eq('chat_room_id', roomId)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching participants:', error)
    throw error
  }

  return data || []
}

/**
 * Subscribe to real-time messages
 */
export function subscribeToMessages(
  roomId: string,
  onMessage: (message: ChatMessage) => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${roomId}`,
      },
      (payload) => {
        onMessage(payload.new as ChatMessage)
      }
    )
    .subscribe()

  return channel
}

/**
 * Unsubscribe from real-time messages
 */
export async function unsubscribeFromMessages(
  channel: RealtimeChannel
): Promise<void> {
  const supabase = createClient()
  await supabase.removeChannel(channel)
}

/**
 * Join a user to a chat room as participant
 */
export async function joinChatRoom(
  roomId: string,
  userId: string,
  role: 'user' | 'supervisor' | 'doer' | 'admin'
): Promise<ChatParticipant> {
  const supabase = createClient()

  // Check if already a participant
  const { data: existing } = await supabase
    .from('chat_participants')
    .select('*')
    .eq('chat_room_id', roomId)
    .eq('profile_id', userId)
    .single()

  if (existing) {
    // Reactivate if was inactive
    if (!existing.is_active) {
      const { data: updated, error } = await supabase
        .from('chat_participants')
        .update({ is_active: true, has_left: false })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return updated
    }
    return existing
  }

  // Create new participant
  const { data, error } = await supabase
    .from('chat_participants')
    .insert({
      chat_room_id: roomId,
      profile_id: userId,
      role,
      is_active: true,
      is_muted: false,
      has_left: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error joining chat room:', error)
    throw error
  }

  return data
}
