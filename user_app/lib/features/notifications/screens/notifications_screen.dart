import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/config/supabase_config.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/notification_model.dart';

/// Provider for notifications list
final notificationsProvider = FutureProvider<List<AppNotification>>((ref) async {
  final userId = SupabaseConfig.currentUser?.id;
  if (userId == null) return [];

  final response = await SupabaseConfig.client
      .from('notifications')
      .select()
      .eq('profile_id', userId)
      .order('created_at', ascending: false)
      .limit(50);

  return (response as List)
      .map((json) => AppNotification.fromJson(json))
      .toList();
});

/// Provider for unread count
final unreadNotificationsCountProvider = FutureProvider<int>((ref) async {
  final userId = SupabaseConfig.currentUser?.id;
  if (userId == null) return 0;

  final response = await SupabaseConfig.client
      .from('notifications')
      .select('id')
      .eq('profile_id', userId)
      .eq('is_read', false);

  return (response as List).length;
});

/// Notifications screen showing all user notifications.
class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: () => _markAllAsRead(ref),
            child: Text(
              'Mark all read',
              style: TextStyle(color: AppColors.primary),
            ),
          ),
        ],
      ),
      body: notificationsAsync.when(
        data: (notifications) {
          if (notifications.isEmpty) {
            return _EmptyNotifications();
          }

          // Group notifications by date
          final grouped = _groupByDate(notifications);

          return RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(notificationsProvider);
              ref.invalidate(unreadNotificationsCountProvider);
            },
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: grouped.length,
              itemBuilder: (context, index) {
                final entry = grouped.entries.elementAt(index);
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      child: Text(
                        entry.key,
                        style: AppTextStyles.labelMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                    ...entry.value.map(
                      (notification) => _NotificationTile(
                        notification: notification,
                        onTap: () => _handleNotificationTap(context, ref, notification),
                      ),
                    ),
                  ],
                );
              },
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              Text('Failed to load notifications'),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => ref.invalidate(notificationsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Map<String, List<AppNotification>> _groupByDate(List<AppNotification> notifications) {
    final Map<String, List<AppNotification>> grouped = {};
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));

    for (final notification in notifications) {
      final date = DateTime(
        notification.createdAt.year,
        notification.createdAt.month,
        notification.createdAt.day,
      );

      String key;
      if (date == today) {
        key = 'Today';
      } else if (date == yesterday) {
        key = 'Yesterday';
      } else if (date.isAfter(today.subtract(const Duration(days: 7)))) {
        key = 'This Week';
      } else {
        key = DateFormat('MMMM yyyy').format(date);
      }

      grouped.putIfAbsent(key, () => []).add(notification);
    }

    return grouped;
  }

  Future<void> _markAllAsRead(WidgetRef ref) async {
    final userId = SupabaseConfig.currentUser?.id;
    if (userId == null) return;

    await SupabaseConfig.client
        .from('notifications')
        .update({
          'is_read': true,
          'read_at': DateTime.now().toIso8601String(),
        })
        .eq('profile_id', userId)
        .eq('is_read', false);

    ref.invalidate(notificationsProvider);
    ref.invalidate(unreadNotificationsCountProvider);
  }

  Future<void> _handleNotificationTap(
    BuildContext context,
    WidgetRef ref,
    AppNotification notification,
  ) async {
    // Mark as read
    if (!notification.isRead) {
      await SupabaseConfig.client
          .from('notifications')
          .update({
            'is_read': true,
            'read_at': DateTime.now().toIso8601String(),
          })
          .eq('id', notification.id);

      ref.invalidate(notificationsProvider);
      ref.invalidate(unreadNotificationsCountProvider);
    }

    // Navigate based on notification type and action URL
    if (!context.mounted) return;

    if (notification.actionUrl != null) {
      context.push(notification.actionUrl!);
      return;
    }

    // Navigate based on reference type
    switch (notification.referenceType) {
      case 'project':
        if (notification.referenceId != null) {
          context.push('/projects/${notification.referenceId}');
        }
        break;
      case 'chat':
        if (notification.referenceId != null) {
          context.push('/projects/${notification.referenceId}/chat');
        }
        break;
      case 'wallet':
        context.push('/wallet');
        break;
      default:
        // Show notification detail or do nothing
        break;
    }
  }
}

class _EmptyNotifications extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.notifications_off_outlined,
              size: 40,
              color: AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'No notifications yet',
            style: AppTextStyles.bodyLarge.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'You\'ll see updates about your projects here',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textTertiary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final AppNotification notification;
  final VoidCallback onTap;

  const _NotificationTile({
    required this.notification,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        color: notification.isRead
            ? Colors.transparent
            : AppColors.primary.withAlpha(10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: _getIconColor().withAlpha(25),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _getIcon(),
                size: 20,
                color: _getIconColor(),
              ),
            ),
            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    notification.title,
                    style: AppTextStyles.labelLarge.copyWith(
                      fontWeight: notification.isRead
                          ? FontWeight.normal
                          : FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification.body,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(notification.createdAt),
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),

            // Unread indicator
            if (!notification.isRead)
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }

  IconData _getIcon() {
    switch (notification.notificationType) {
      case NotificationType.projectSubmitted:
        return Icons.send;
      case NotificationType.quoteReady:
        return Icons.request_quote;
      case NotificationType.paymentReceived:
        return Icons.payment;
      case NotificationType.projectAssigned:
        return Icons.person_add;
      case NotificationType.taskAvailable:
        return Icons.task;
      case NotificationType.taskAssigned:
        return Icons.assignment_ind;
      case NotificationType.workSubmitted:
        return Icons.cloud_upload;
      case NotificationType.qcApproved:
        return Icons.verified;
      case NotificationType.qcRejected:
        return Icons.cancel;
      case NotificationType.revisionRequested:
        return Icons.refresh;
      case NotificationType.projectDelivered:
        return Icons.local_shipping;
      case NotificationType.projectCompleted:
        return Icons.check_circle;
      case NotificationType.newMessage:
        return Icons.chat_bubble_outline;
      case NotificationType.payoutProcessed:
        return Icons.account_balance_wallet;
      case NotificationType.systemAlert:
        return Icons.info_outline;
      case NotificationType.promotional:
        return Icons.campaign;
    }
  }

  Color _getIconColor() {
    switch (notification.notificationType) {
      case NotificationType.quoteReady:
      case NotificationType.projectSubmitted:
        return AppColors.info;
      case NotificationType.paymentReceived:
      case NotificationType.payoutProcessed:
      case NotificationType.projectCompleted:
      case NotificationType.qcApproved:
        return AppColors.success;
      case NotificationType.projectDelivered:
      case NotificationType.workSubmitted:
        return AppColors.primary;
      case NotificationType.revisionRequested:
      case NotificationType.qcRejected:
        return AppColors.warning;
      case NotificationType.newMessage:
        return AppColors.primary;
      case NotificationType.systemAlert:
        return AppColors.textSecondary;
      case NotificationType.promotional:
        return Colors.purple;
      default:
        return AppColors.primary;
    }
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final diff = now.difference(time);

    if (diff.inMinutes < 1) {
      return 'Just now';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else {
      return DateFormat('MMM d, h:mm a').format(time);
    }
  }
}
