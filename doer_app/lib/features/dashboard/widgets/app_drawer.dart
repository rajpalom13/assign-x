/// Application navigation drawer widget.
///
/// This file provides the main navigation drawer used throughout the app
/// with user info, availability toggle, and navigation menu items.
///
/// ## Features
/// - User profile header with avatar and stats
/// - Availability toggle for work status
/// - Navigation menu with sections
/// - Logout functionality with confirmation
/// - About dialog with version info
///
/// ## Example
/// ```dart
/// Scaffold(
///   drawer: const AppDrawer(),
///   body: DashboardContent(),
/// )
/// ```
///
/// See also:
/// - [AppHeader] for the header component
/// - [AvailabilityToggle] for the availability control
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/services/app_info_service.dart';
import '../../../data/models/project_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/dashboard_provider.dart';
import 'app_header.dart';
import 'availability_toggle.dart';

/// Main navigation drawer with user info and menu items.
///
/// Provides app-wide navigation through a slide-out drawer containing:
/// - User profile information
/// - Work availability toggle
/// - Navigation links to app sections
/// - Logout with confirmation
///
/// ## Usage
/// ```dart
/// Scaffold(
///   drawer: const AppDrawer(),
///   body: DashboardContent(),
/// )
/// ```
///
/// ## Sections
/// - Dashboard, My Projects, Statistics, Reviews
/// - Profile, Bank Details, Notifications, Settings
/// - Help & Support, About
///
/// See also:
/// - [AvailabilityToggle] for the work status control
/// - [_DrawerMenuItem] for menu item styling
class AppDrawer extends ConsumerWidget {
  /// Creates the app navigation drawer.
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final stats = ref.watch(doerStatsProvider);
    final appInfo = ref.watch(appInfoSyncProvider);

    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            // User info header
            _buildUserHeader(context, user, stats),

            const Divider(height: 1),

            // Availability toggle
            const Padding(
              padding: AppSpacing.paddingMd,
              child: AvailabilityToggle(),
            ),

            const Divider(height: 1),

            // Menu items
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _DrawerMenuItem(
                    icon: Icons.dashboard_outlined,
                    label: 'Dashboard',
                    onTap: () {
                      Navigator.pop(context);
                      context.go('/dashboard');
                    },
                  ),
                  _DrawerMenuItem(
                    icon: Icons.assignment_outlined,
                    label: 'My Projects',
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/dashboard/projects');
                    },
                  ),
                  _DrawerMenuItem(
                    icon: Icons.bar_chart_outlined,
                    label: 'Statistics',
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/dashboard/statistics');
                    },
                  ),
                  _DrawerMenuItem(
                    icon: Icons.star_outline,
                    label: 'Reviews',
                    badge: stats.rating.toStringAsFixed(1),
                    badgeColor: AppColors.warning,
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/dashboard/reviews');
                    },
                  ),

                  const Divider(height: AppSpacing.lg),

                  _DrawerMenuItem(
                    icon: Icons.person_outline,
                    label: 'Profile',
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/profile');
                    },
                  ),
                  _DrawerMenuItem(
                    icon: Icons.account_balance_outlined,
                    label: 'Bank Details',
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/bank-details');
                    },
                  ),
                  _DrawerMenuItem(
                    icon: Icons.notifications_outlined,
                    label: 'Notifications',
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/notifications');
                    },
                  ),
                  _DrawerMenuItem(
                    icon: Icons.settings_outlined,
                    label: 'Settings',
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/settings');
                    },
                  ),

                  const Divider(height: AppSpacing.lg),

                  _DrawerMenuItem(
                    icon: Icons.help_outline,
                    label: 'Help & Support',
                    onTap: () {
                      Navigator.pop(context);
                      context.push('/support');
                    },
                  ),
                  _DrawerMenuItem(
                    icon: Icons.info_outline,
                    label: 'About',
                    onTap: () {
                      Navigator.pop(context);
                      _showAboutDialog(context, appInfo.displayVersion);
                    },
                  ),
                ],
              ),
            ),

            // Logout button
            const Divider(height: 1),
            _buildLogoutButton(context, ref),
          ],
        ),
      ),
    );
  }

  /// Builds the user profile header section.
  Widget _buildUserHeader(
    BuildContext context,
    dynamic user,
    DoerStats stats,
  ) {
    final displayName = user?.userMetadata?['full_name'] ?? 'Doer';
    final email = user?.email ?? '';

    return Container(
      padding: AppSpacing.paddingLg,
      child: Column(
        children: [
          const Row(
            children: [
              // Logo
              AppLogo(size: 24, showText: false),
              SizedBox(width: AppSpacing.sm),
              Text(
                'DOER',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                  letterSpacing: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            children: [
              // Avatar
              CircleAvatar(
                radius: 30,
                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                child: Text(
                  displayName.isNotEmpty ? displayName[0].toUpperCase() : 'D',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      displayName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      email,
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(
                          Icons.star,
                          size: 14,
                          color: AppColors.warning,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${stats.rating.toStringAsFixed(1)} Rating',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          width: 4,
                          height: 4,
                          decoration: const BoxDecoration(
                            color: AppColors.textTertiary,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${stats.completedProjects} Projects',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Builds the logout button with error styling.
  Widget _buildLogoutButton(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: AppSpacing.paddingMd,
      child: InkWell(
        onTap: () => _showLogoutDialog(context, ref),
        borderRadius: AppSpacing.borderRadiusMd,
        child: Container(
          padding: AppSpacing.paddingMd,
          decoration: BoxDecoration(
            color: AppColors.error.withValues(alpha: 0.1),
            borderRadius: AppSpacing.borderRadiusMd,
          ),
          child: const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.logout,
                color: AppColors.error,
                size: 20,
              ),
              SizedBox(width: 8),
              Text(
                'Logout',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.error,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Shows a confirmation dialog before logging out.
  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Close drawer
              ref.read(authProvider.notifier).signOut();
              context.go('/login');
            },
            style: TextButton.styleFrom(
              foregroundColor: AppColors.error,
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  /// Shows the about dialog with app version information.
  void _showAboutDialog(BuildContext context, String version) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            AppLogo(size: 24, showText: false),
            SizedBox(width: 8),
            Text('DOER'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(version),
            const SizedBox(height: 8),
            const Text(
              'DOER is a platform connecting talented individuals with academic projects.',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}

/// A styled menu item for the navigation drawer.
///
/// Displays an icon, label, and optional badge in a list tile format.
/// Supports custom badge colors for different item types.
class _DrawerMenuItem extends StatelessWidget {
  /// Creates a drawer menu item.
  const _DrawerMenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.badge,
    this.badgeColor,
  });

  /// The icon displayed on the left.
  final IconData icon;

  /// The text label for the menu item.
  final String label;

  /// Callback invoked when the item is tapped.
  final VoidCallback onTap;

  /// Optional badge text displayed on the right.
  final String? badge;

  /// Color for the badge background and text.
  final Color? badgeColor;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(
        icon,
        color: AppColors.textSecondary,
        size: 22,
      ),
      title: Text(
        label,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
      ),
      trailing: badge != null
          ? Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 8,
                vertical: 2,
              ),
              decoration: BoxDecoration(
                color: (badgeColor ?? AppColors.primary).withValues(alpha: 0.1),
                borderRadius: AppSpacing.borderRadiusSm,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (badgeColor == AppColors.warning)
                    const Icon(
                      Icons.star,
                      size: 12,
                      color: AppColors.warning,
                    ),
                  if (badgeColor == AppColors.warning)
                    const SizedBox(width: 2),
                  Text(
                    badge!,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: badgeColor ?? AppColors.primary,
                    ),
                  ),
                ],
              ),
            )
          : null,
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: 2,
      ),
    );
  }
}
