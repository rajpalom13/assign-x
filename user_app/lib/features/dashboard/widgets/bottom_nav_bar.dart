import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';

/// Custom bottom navigation bar with floating pill design.
///
/// Features:
/// - Floating pill-shaped bar (not docked to edge)
/// - Light cream/off-white background with subtle shadow
/// - 6 navigation items: Home, Projects, Community, Orders, Profile, Settings
/// - Active state: filled icon, Inactive: outlined gray icon
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

  /// Profile avatar URL (optional).
  final String? profileImageUrl;

  /// Bottom offset from screen edge. Defaults to 20px.
  final double bottomOffset;

  /// Horizontal padding. Defaults to 24px.
  final double horizontalPadding;

  const BottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
    this.profileImageUrl,
    this.bottomOffset = 20,
    this.horizontalPadding = 24,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: horizontalPadding,
      right: horizontalPadding,
      bottom: bottomOffset,
      child: Container(
        height: 60,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          // Light cream/off-white background
          color: const Color(0xFFFAF8F5),
          borderRadius: BorderRadius.circular(30), // Stadium shape
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 32,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(
              activeIcon: Icons.home_rounded,
              inactiveIcon: Icons.home_outlined,
              index: 0,
            ),
            _buildNavItem(
              activeIcon: Icons.folder_rounded,
              inactiveIcon: Icons.folder_outlined,
              index: 1,
            ),
            _buildNavItem(
              activeIcon: Icons.people_rounded,
              inactiveIcon: Icons.people_outline_rounded,
              index: 2,
            ),
            _buildNavItem(
              activeIcon: Icons.work_rounded,
              inactiveIcon: Icons.work_outline_rounded,
              index: 3,
            ),
            _buildProfileItem(index: 4),
            _buildNavItem(
              activeIcon: Icons.settings_rounded,
              inactiveIcon: Icons.settings_outlined,
              index: 5,
            ),
          ],
        ),
      ),
    );
  }

  /// Builds a single navigation item with icon only.
  Widget _buildNavItem({
    required IconData activeIcon,
    required IconData inactiveIcon,
    required int index,
  }) {
    final isActive = currentIndex == index;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onTap(index),
        borderRadius: BorderRadius.circular(30),
        child: Container(
          width: 48,
          height: 48,
          alignment: Alignment.center,
          child: Icon(
            isActive ? activeIcon : inactiveIcon,
            size: 26,
            color: isActive
                ? const Color(0xFF2D2D2D) // Dark/filled for active
                : const Color(0xFF8B8B8B), // Gray for inactive
          ),
        ),
      ),
    );
  }

  /// Builds the profile avatar item.
  Widget _buildProfileItem({required int index}) {
    final isActive = currentIndex == index;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onTap(index),
        borderRadius: BorderRadius.circular(30),
        child: Container(
          width: 48,
          height: 48,
          alignment: Alignment.center,
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: isActive
                    ? const Color(0xFF2D2D2D)
                    : const Color(0xFFE0E0E0),
                width: isActive ? 2 : 1.5,
              ),
              image: profileImageUrl != null
                  ? DecorationImage(
                      image: NetworkImage(profileImageUrl!),
                      fit: BoxFit.cover,
                    )
                  : null,
              color: profileImageUrl == null
                  ? const Color(0xFFE8E8E8)
                  : null,
            ),
            child: profileImageUrl == null
                ? Icon(
                    Icons.person,
                    size: 18,
                    color: const Color(0xFF8B8B8B),
                  )
                : null,
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
