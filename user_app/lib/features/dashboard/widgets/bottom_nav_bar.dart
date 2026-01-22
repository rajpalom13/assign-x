import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';

/// Custom bottom navigation bar with fixed positioning.
///
/// Features:
/// - Fixed 30-50px from bottom of screen
/// - Glass morphism effect
/// - Active state indicators
/// - Smooth animations
///
/// Example:
/// ```dart
/// BottomNavBar(
///   currentIndex: 0,
///   onTap: (index) => handleNavigation(index),
/// )
/// ```
class BottomNavBar extends StatelessWidget {
  /// Currently selected index.
  final int currentIndex;

  /// Callback when navigation item is tapped.
  final ValueChanged<int> onTap;

  /// Bottom offset from screen edge. Defaults to 40px.
  final double bottomOffset;

  /// Horizontal padding. Defaults to 20px.
  final double horizontalPadding;

  const BottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.bottomOffset = 40,
    this.horizontalPadding = 20,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: horizontalPadding,
      right: horizontalPadding,
      bottom: bottomOffset,
      child: Container(
        height: 64,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: AppColors.border.withValues(alpha: 0.3),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 48,
              offset: const Offset(0, 16),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Row(
            children: [
              _buildNavItem(
                icon: Icons.home_rounded,
                label: 'Home',
                index: 0,
              ),
              _buildNavItem(
                icon: Icons.folder_outlined,
                label: 'Projects',
                index: 1,
              ),
              _buildNavItem(
                icon: Icons.account_balance_wallet_outlined,
                label: 'Wallet',
                index: 2,
              ),
              _buildNavItem(
                icon: Icons.person_outline_rounded,
                label: 'Profile',
                index: 3,
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds a single navigation item.
  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required int index,
  }) {
    final isActive = currentIndex == index;

    return Expanded(
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => onTap(index),
          borderRadius: BorderRadius.circular(24),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOutCubic,
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Icon
                Icon(
                  icon,
                  size: 24,
                  color: isActive ? AppColors.primary : AppColors.textTertiary,
                ),
                const SizedBox(height: 4),
                // Label
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                    color:
                        isActive ? AppColors.primary : AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// Alternative bottom navigation bar with indicator dot style.
///
/// Features:
/// - Minimalist design with small dot indicator
/// - Icon-only layout with subtle labels
/// - Glass effect background
///
/// Example:
/// ```dart
/// BottomNavBarDotIndicator(
///   currentIndex: 0,
///   onTap: (index) => handleNavigation(index),
/// )
/// ```
class BottomNavBarDotIndicator extends StatelessWidget {
  /// Currently selected index.
  final int currentIndex;

  /// Callback when navigation item is tapped.
  final ValueChanged<int> onTap;

  /// Bottom offset from screen edge. Defaults to 40px.
  final double bottomOffset;

  /// Horizontal padding. Defaults to 20px.
  final double horizontalPadding;

  const BottomNavBarDotIndicator({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.bottomOffset = 40,
    this.horizontalPadding = 20,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: horizontalPadding,
      right: horizontalPadding,
      bottom: bottomOffset,
      child: Container(
        height: 60,
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.95),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(
            color: AppColors.border.withValues(alpha: 0.2),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 20,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(30),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildDotNavItem(
                icon: Icons.home_rounded,
                index: 0,
              ),
              _buildDotNavItem(
                icon: Icons.folder_outlined,
                index: 1,
              ),
              _buildDotNavItem(
                icon: Icons.account_balance_wallet_outlined,
                index: 2,
              ),
              _buildDotNavItem(
                icon: Icons.person_outline_rounded,
                index: 3,
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds a single navigation item with dot indicator.
  Widget _buildDotNavItem({
    required IconData icon,
    required int index,
  }) {
    final isActive = currentIndex == index;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onTap(index),
        borderRadius: BorderRadius.circular(30),
        child: Container(
          width: 56,
          height: 56,
          alignment: Alignment.center,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Icon
              Icon(
                icon,
                size: 26,
                color: isActive ? AppColors.primary : AppColors.textTertiary,
              ),
              const SizedBox(height: 4),
              // Dot indicator
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOutCubic,
                width: isActive ? 6 : 0,
                height: isActive ? 6 : 0,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
