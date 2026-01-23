import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../providers/home_provider.dart';
import '../../../providers/profile_provider.dart';

/// Custom app bar for home screen.
///
/// Shows app logo + name on left, wallet balance chip + notification bell on right.
/// Transparent background with no elevation per design spec.
class HomeAppBar extends ConsumerWidget {
  const HomeAppBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wallet = ref.watch(walletProvider);
    final unreadCount = ref.watch(unreadCountProvider);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        children: [
          // Left side: App logo + name
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Sparkle/stars icon
              Icon(
                Icons.auto_awesome,
                size: 24,
                color: const Color(0xFF2D2D2D),
              ),
              const SizedBox(width: 8),
              // App name
              Text(
                'AssignX',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF2D2D2D),
                  letterSpacing: -0.3,
                ),
              ),
            ],
          ),

          const Spacer(),

          // Right side: Wallet pill + Notification bell
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Wallet pill
              wallet.when(
                data: (w) => _WalletPill(
                  balance: w.formattedBalance,
                  onTap: () => context.push('/wallet'),
                ),
                loading: () => _WalletPill(
                  balance: '...',
                  onTap: () {},
                ),
                error: (_, _) => _WalletPill(
                  balance: '\u20B90',
                  onTap: () => context.push('/wallet'),
                ),
              ),

              const SizedBox(width: 12),

              // Notification bell
              _NotificationBell(
                count: unreadCount.valueOrNull ?? 0,
                onTap: () => context.push('/notifications'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _WalletPill extends StatelessWidget {
  final String balance;
  final VoidCallback onTap;

  const _WalletPill({
    required this.balance,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: const Color(0xFFF0F0F0), // Light gray background
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.account_balance_wallet_outlined,
              size: 18,
              color: const Color(0xFF2D2D2D),
            ),
            const SizedBox(width: 6),
            Text(
              balance,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF2D2D2D),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NotificationBell extends StatelessWidget {
  final int count;
  final VoidCallback onTap;

  const _NotificationBell({
    required this.count,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Simple outlined bell icon - no background container
          Icon(
            Icons.notifications_none_outlined,
            size: 26,
            color: const Color(0xFF2D2D2D),
          ),
          if (count > 0)
            Positioned(
              right: -4,
              top: -4,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.error,
                  shape: BoxShape.circle,
                ),
                constraints: const BoxConstraints(
                  minWidth: 16,
                  minHeight: 16,
                ),
                child: Text(
                  count > 9 ? '9+' : '$count',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
