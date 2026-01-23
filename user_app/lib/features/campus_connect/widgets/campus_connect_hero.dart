import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

/// Hero section for Campus Connect with rainbow gradient and centered chat icon.
///
/// Features a soft pastel rainbow gradient (Pink → Orange → Yellow → Green → Cyan → Blue)
/// with a white rounded square container containing a chat icon and decorative dots.
class CampusConnectHero extends StatelessWidget {
  const CampusConnectHero({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Gradient section with icon
        Container(
          height: 140,
          width: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: [
                Color(0x4DFFB6C1), // Pink ~30% opacity
                Color(0x4DFFCC80), // Orange ~30% opacity
                Color(0x4DFFF59D), // Yellow ~30% opacity
                Color(0x4DA5D6A7), // Green ~30% opacity
                Color(0x4D80DEEA), // Cyan ~30% opacity
                Color(0x4D90CAF9), // Blue ~30% opacity
              ],
              stops: [0.0, 0.2, 0.4, 0.6, 0.8, 1.0],
            ),
          ),
          child: SafeArea(
            bottom: false,
            child: Center(
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  // White rounded square container with chat icon
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(20),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.chat_bubble_outline_rounded,
                        size: 32,
                        color: Color(0xFF6B6B6B),
                      ),
                    ),
                  ),

                  // Blue dot (top right of icon container)
                  Positioned(
                    top: -4,
                    right: -8,
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Color(0xFF64B5F6),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),

                  // Yellow/orange dot (bottom left of icon container)
                  Positioned(
                    bottom: -4,
                    left: -8,
                    child: Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFFFFB74D),
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),

        // Title below gradient
        Padding(
          padding: const EdgeInsets.only(top: 16),
          child: Text(
            '"Campus Connect"',
            style: AppTextStyles.displaySmall.copyWith(
              fontSize: 26,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1A1A1A),
            ),
          ),
        ),
      ],
    );
  }
}

/// Header bar for Campus Connect with branding, wallet, and notifications.
class CampusConnectHeader extends StatelessWidget implements PreferredSizeWidget {
  final double walletBalance;
  final VoidCallback? onNotificationTap;
  final VoidCallback? onWalletTap;

  const CampusConnectHeader({
    super.key,
    this.walletBalance = 10100,
    this.onNotificationTap,
    this.onWalletTap,
  });

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        child: Row(
          children: [
            // Left side: AssignX | Campus Connect
            Row(
              children: [
                Text(
                  'AssignX',
                  style: AppTextStyles.headingSmall.copyWith(
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF3D3D3D),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Container(
                    width: 1,
                    height: 20,
                    color: AppColors.border,
                  ),
                ),
                Text(
                  'Campus Connect',
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF5D5D5D),
                  ),
                ),
              ],
            ),

            const Spacer(),

            // Right side: Wallet chip + Notification bell
            Row(
              children: [
                // Wallet balance chip
                GestureDetector(
                  onTap: onWalletTap,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.account_balance_wallet_outlined,
                          size: 16,
                          color: Color(0xFF6B6B6B),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '₹${_formatBalance(walletBalance)}',
                          style: AppTextStyles.labelMedium.copyWith(
                            fontWeight: FontWeight.w600,
                            color: const Color(0xFF3D3D3D),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),

                // Notification bell
                GestureDetector(
                  onTap: onNotificationTap,
                  child: const Icon(
                    Icons.notifications_none_rounded,
                    size: 24,
                    color: Color(0xFF6B6B6B),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatBalance(double balance) {
    // Format with commas for thousands (e.g., 10,100)
    final intBalance = balance.toInt();
    final formatted = intBalance.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
    return formatted;
  }
}
