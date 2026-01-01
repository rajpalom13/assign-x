import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/router/routes.dart';
import '../providers/chat_provider.dart';
import '../widgets/chat_room_tile.dart';

/// Screen displaying list of chat rooms.
///
/// Shows all active conversations grouped by project.
class ChatListScreen extends ConsumerWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(chatRoomsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
        actions: [
          if (state.totalUnread > 0)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${state.totalUnread} unread',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),
              ),
            ),
          IconButton(
            onPressed: () => ref.read(chatRoomsProvider.notifier).refresh(),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(chatRoomsProvider.notifier).refresh(),
        child: state.isLoading && state.chatRooms.isEmpty
            ? const Center(child: CircularProgressIndicator())
            : state.chatRooms.isEmpty
                ? const ChatListEmptyState()
                : _ChatRoomsList(
                    rooms: state.chatRooms,
                    onTap: (room) {
                      context.push('${RoutePaths.chat}/${room.projectId}');
                    },
                  ),
      ),
    );
  }
}

/// Chat rooms list widget.
class _ChatRoomsList extends StatelessWidget {
  const _ChatRoomsList({
    required this.rooms,
    required this.onTap,
  });

  final List rooms;
  final void Function(dynamic room) onTap;

  @override
  Widget build(BuildContext context) {
    // Group rooms by unread status
    final unreadRooms = rooms.where((r) => r.hasUnread).toList();
    final readRooms = rooms.where((r) => !r.hasUnread).toList();

    return ListView(
      children: [
        // Unread section
        if (unreadRooms.isNotEmpty) ...[
          _SectionHeader(
            title: 'Unread',
            count: unreadRooms.length,
            color: AppColors.primary,
          ),
          ...unreadRooms.map((room) => ChatRoomTile(
                room: room,
                onTap: () => onTap(room),
              )),
        ],
        // All chats section
        if (readRooms.isNotEmpty) ...[
          _SectionHeader(
            title: unreadRooms.isNotEmpty ? 'Other Chats' : 'All Chats',
            count: readRooms.length,
          ),
          ...readRooms.map((room) => ChatRoomTile(
                room: room,
                onTap: () => onTap(room),
              )),
        ],
        // Bottom padding
        const SizedBox(height: 100),
      ],
    );
  }
}

/// Section header.
class _SectionHeader extends StatelessWidget {
  const _SectionHeader({
    required this.title,
    required this.count,
    this.color,
  });

  final String title;
  final int count;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Row(
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: color ?? AppColors.textSecondaryLight,
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: (color ?? AppColors.textSecondaryLight)
                  .withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              count.toString(),
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: color ?? AppColors.textSecondaryLight,
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
