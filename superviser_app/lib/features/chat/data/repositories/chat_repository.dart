import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/chat_room_model.dart';
import '../models/message_model.dart';

/// Repository for chat-related operations.
///
/// Handles messages, chat rooms, and real-time subscriptions.
class ChatRepository {
  ChatRepository(this._client);

  final SupabaseClient _client;

  /// Gets the current user ID.
  String? get _userId => _client.auth.currentUser?.id;

  /// Fetches all chat rooms for the current supervisor.
  Future<List<ChatRoomModel>> getChatRooms() async {
    try {
      final response = await _client.from('chat_rooms').select('''
        *,
        project:projects(id, title, project_number)
      ''').contains('participants', [_userId!]).order('last_message_at', ascending: false);

      return (response as List)
          .map((json) => ChatRoomModel.fromJson(json))
          .toList();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ChatRepository.getChatRooms error: $e');
      }
      rethrow;
    }
  }

  /// Fetches a single chat room by ID.
  Future<ChatRoomModel?> getChatRoom(String roomId) async {
    try {
      final response = await _client.from('chat_rooms').select('''
        *,
        project:projects(id, title, project_number)
      ''').eq('id', roomId).single();

      return ChatRoomModel.fromJson(response);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ChatRepository.getChatRoom error: $e');
      }
      rethrow;
    }
  }

  /// Fetches chat room by project ID.
  Future<ChatRoomModel?> getChatRoomByProject(String projectId) async {
    try {
      final response = await _client.from('chat_rooms').select('''
        *,
        project:projects(id, title, project_number)
      ''').eq('project_id', projectId).single();

      return ChatRoomModel.fromJson(response);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ChatRepository.getChatRoomByProject error: $e');
      }
      rethrow;
    }
  }

  /// Fetches messages for a chat room.
  Future<List<MessageModel>> getMessages(
    String roomId, {
    int limit = 50,
    DateTime? before,
  }) async {
    try {
      dynamic query = _client.from('chat_messages').select('''
        *,
        sender:profiles!sender_id(full_name, avatar_url, role)
      ''').eq('chat_room_id', roomId);

      if (before != null) {
        query = query.lt('created_at', before.toIso8601String());
      }

      final response =
          await query.order('created_at', ascending: false).limit(limit);

      return (response as List)
          .map((json) => MessageModel.fromJson(json))
          .toList()
          .reversed
          .toList();
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ChatRepository.getMessages error: $e');
      }
      rethrow;
    }
  }

  /// Sends a message to a chat room.
  Future<MessageModel?> sendMessage({
    required String roomId,
    required String content,
    MessageType type = MessageType.text,
    String? fileUrl,
    String? fileName,
    String? fileType,
    int? fileSize,
    String? replyToId,
  }) async {
    try {
      final response = await _client.from('chat_messages').insert({
        'chat_room_id': roomId,
        'sender_id': _userId,
        'content': content,
        'type': type.value,
        'file_url': fileUrl,
        'file_name': fileName,
        'file_type': fileType,
        'file_size': fileSize,
        'reply_to_id': replyToId,
        'created_at': DateTime.now().toIso8601String(),
      }).select('''
        *,
        sender:profiles!sender_id(full_name, avatar_url, role)
      ''').single();

      // Update chat room's last message
      await _client.from('chat_rooms').update({
        'last_message': content,
        'last_message_at': DateTime.now().toIso8601String(),
        'last_message_by': _userId,
      }).eq('id', roomId);

      return MessageModel.fromJson(response);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ChatRepository.sendMessage error: $e');
      }
      rethrow;
    }
  }

  /// Marks messages as read.
  Future<void> markAsRead(String roomId) async {
    try {
      await _client
          .from('chat_messages')
          .update({'is_read': true})
          .eq('chat_room_id', roomId)
          .neq('sender_id', _userId!);

      // Update unread count
      await _client.from('chat_rooms').update({
        'unread_count': 0,
      }).eq('id', roomId);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ChatRepository.markAsRead error: $e');
        return;
      }
      rethrow;
    }
  }

  /// Suspends a chat room.
  Future<bool> suspendChat(String roomId, {String? reason}) async {
    try {
      await _client.from('chat_rooms').update({
        'is_suspended': true,
        'suspended_by': _userId,
        'suspended_at': DateTime.now().toIso8601String(),
        'suspension_reason': reason,
      }).eq('id', roomId);

      // Send system message
      await sendMessage(
        roomId: roomId,
        content: 'Chat has been suspended by supervisor.',
        type: MessageType.system,
      );

      return true;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ChatRepository.suspendChat error: $e');
        return true;
      }
      rethrow;
    }
  }

  /// Unsuspends a chat room.
  Future<bool> unsuspendChat(String roomId) async {
    try {
      await _client.from('chat_rooms').update({
        'is_suspended': false,
        'suspended_by': null,
        'suspended_at': null,
        'suspension_reason': null,
      }).eq('id', roomId);

      // Send system message
      await sendMessage(
        roomId: roomId,
        content: 'Chat has been unsuspended.',
        type: MessageType.system,
      );

      return true;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('ChatRepository.unsuspendChat error: $e');
        return true;
      }
      rethrow;
    }
  }

  /// Deletes a message.
  Future<bool> deleteMessage(String messageId) async {
    try {
      await _client.from('chat_messages').update({
        'is_deleted': true,
        'content': null,
      }).eq('id', messageId);
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Watches messages for real-time updates.
  Stream<List<MessageModel>> watchMessages(String roomId) {
    return _client
        .from('chat_messages')
        .stream(primaryKey: ['id'])
        .eq('chat_room_id', roomId)
        .order('created_at')
        .map((data) => data.map((json) => MessageModel.fromJson(json)).toList());
  }

  /// Watches chat rooms for real-time updates.
  Stream<List<ChatRoomModel>> watchChatRooms() {
    return _client
        .from('chat_rooms')
        .stream(primaryKey: ['id'])
        .order('last_message_at', ascending: false)
        .map((data) => data
            .map((json) => ChatRoomModel.fromJson(json))
            .where((room) => room.participants?.contains(_userId) ?? false)
            .toList());
  }

}

/// Provider for the chat repository.
final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  return ChatRepository(Supabase.instance.client);
});
