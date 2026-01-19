import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../shared/widgets/glass_container.dart';
import '../../../shared/widgets/mesh_gradient_background.dart';

/// Provider for app theme mode.
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);

/// Provider for notification preferences.
final notificationPrefsProvider = FutureProvider<NotificationPrefs>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  return NotificationPrefs(
    pushEnabled: prefs.getBool('push_notifications') ?? true,
    emailEnabled: prefs.getBool('email_notifications') ?? true,
    projectUpdates: prefs.getBool('project_updates') ?? true,
    promotions: prefs.getBool('promotional_notifications') ?? false,
  );
});

/// Provider for search query in settings.
final settingsSearchProvider = StateProvider<String>((ref) => '');

/// Model for notification preferences.
class NotificationPrefs {
  final bool pushEnabled;
  final bool emailEnabled;
  final bool projectUpdates;
  final bool promotions;

  const NotificationPrefs({
    required this.pushEnabled,
    required this.emailEnabled,
    required this.projectUpdates,
    required this.promotions,
  });
}

/// Settings screen with app preferences using the new design system.
///
/// Features:
/// - Mesh gradient background for visual appeal
/// - GlassCard sections for grouping settings
/// - Search functionality to filter settings
/// - Improved spacing and visual hierarchy
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);
    final notifPrefsAsync = ref.watch(notificationPrefsProvider);
    final searchQuery = ref.watch(settingsSearchProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: MeshGradientBackground(
        position: MeshPosition.topRight,
        colors: [
          AppColors.meshPink,
          AppColors.meshPeach,
          AppColors.meshOrange,
        ],
        opacity: 0.35,
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              // App Bar
              SliverAppBar(
                title: Text(
                  'Settings',
                  style: AppTextStyles.headingMedium,
                ),
                backgroundColor: Colors.transparent,
                elevation: 0,
                floating: true,
                pinned: false,
              ),

              // Content
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    const SizedBox(height: AppSpacing.sm),

                    // Search Bar
                    _buildSearchBar(),
                    const SizedBox(height: AppSpacing.lg),

                    // Appearance Section
                    if (_shouldShowSection('appearance', searchQuery))
                      _buildAppearanceSection(themeMode),

                    // Notifications Section
                    if (_shouldShowSection('notifications', searchQuery))
                      notifPrefsAsync.when(
                        data: (prefs) => _buildNotificationsSection(prefs),
                        loading: () => const SizedBox.shrink(),
                        error: (_, _) => const SizedBox.shrink(),
                      ),

                    // Security Section
                    if (_shouldShowSection('security', searchQuery))
                      _buildSecuritySection(),

                    // Account Section
                    if (_shouldShowSection('account', searchQuery))
                      _buildAccountSection(),

                    // About Section
                    if (_shouldShowSection('about', searchQuery))
                      _buildAboutSection(),

                    // Legal Section
                    if (_shouldShowSection('legal', searchQuery))
                      _buildLegalSection(),

                    // Danger Zone Section
                    if (_shouldShowSection('danger', searchQuery))
                      _buildDangerZoneSection(),

                    const SizedBox(height: AppSpacing.xxxl),
                  ]),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Builds the search bar for filtering settings.
  Widget _buildSearchBar() {
    return GlassContainer(
      blur: 10,
      opacity: 0.7,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xxs,
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) {
          ref.read(settingsSearchProvider.notifier).state = value.toLowerCase();
        },
        decoration: InputDecoration(
          prefixIcon: Icon(
            Icons.search,
            color: AppColors.textSecondary,
            size: 20,
          ),
          hintText: 'Search settings',
          hintStyle: AppTextStyles.bodyMedium.copyWith(
            color: AppColors.textTertiary,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm,
            vertical: AppSpacing.md,
          ),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: Icon(
                    Icons.clear,
                    color: AppColors.textTertiary,
                    size: 18,
                  ),
                  onPressed: () {
                    _searchController.clear();
                    ref.read(settingsSearchProvider.notifier).state = '';
                  },
                )
              : null,
        ),
        style: AppTextStyles.bodyMedium,
      ),
    );
  }

  /// Checks if a section should be visible based on search query.
  bool _shouldShowSection(String sectionKey, String searchQuery) {
    if (searchQuery.isEmpty) return true;

    final sectionKeywords = {
      'appearance': ['appearance', 'theme', 'dark', 'light', 'mode', 'display'],
      'notifications': ['notification', 'push', 'email', 'alert', 'project', 'updates', 'promotional'],
      'security': ['security', 'password', 'biometric', 'fingerprint', 'face', 'session', 'two-factor', '2fa'],
      'account': ['account', 'profile', 'payment', 'edit', 'data', 'cache', 'storage', 'download'],
      'about': ['about', 'version', 'rate', 'share', 'app'],
      'legal': ['legal', 'terms', 'privacy', 'policy', 'license', 'open source'],
      'danger': ['danger', 'delete', 'logout', 'sign out', 'remove'],
    };

    final keywords = sectionKeywords[sectionKey] ?? [];
    return keywords.any((keyword) => keyword.contains(searchQuery));
  }

  /// Builds the Appearance settings section.
  Widget _buildAppearanceSection(ThemeMode themeMode) {
    return _SettingsSection(
      title: 'APPEARANCE',
      icon: Icons.palette_outlined,
      iconColor: AppColors.primary,
      children: [
        _SettingsItem(
          icon: Icons.brightness_6_outlined,
          iconColor: AppColors.accent,
          title: 'Theme',
          subtitle: _getThemeLabel(themeMode),
          trailing: Icon(
            Icons.chevron_right,
            color: AppColors.textTertiary,
          ),
          onTap: () => _showThemePicker(context, ref, themeMode),
        ),
      ],
    );
  }

  /// Builds the Notifications settings section.
  Widget _buildNotificationsSection(NotificationPrefs prefs) {
    return _SettingsSection(
      title: 'NOTIFICATIONS',
      icon: Icons.notifications_outlined,
      iconColor: AppColors.info,
      children: [
        _SettingsItem(
          icon: Icons.notifications_active_outlined,
          iconColor: AppColors.info,
          title: 'Push Notifications',
          subtitle: 'Receive notifications on your device',
          trailing: Switch(
            value: prefs.pushEnabled,
            onChanged: (value) => _updateNotifPref('push_notifications', value),
            activeThumbColor: AppColors.primary,
          ),
          onTap: () => _updateNotifPref('push_notifications', !prefs.pushEnabled),
        ),
        _buildDivider(),
        _SettingsItem(
          icon: Icons.email_outlined,
          iconColor: AppColors.accent,
          title: 'Email Notifications',
          subtitle: 'Receive updates via email',
          trailing: Switch(
            value: prefs.emailEnabled,
            onChanged: (value) => _updateNotifPref('email_notifications', value),
            activeThumbColor: AppColors.primary,
          ),
          onTap: () => _updateNotifPref('email_notifications', !prefs.emailEnabled),
        ),
        _buildDivider(),
        _SettingsItem(
          icon: Icons.update_outlined,
          iconColor: AppColors.success,
          title: 'Project Updates',
          subtitle: 'Status changes, deliveries, messages',
          trailing: Switch(
            value: prefs.projectUpdates,
            onChanged: (value) => _updateNotifPref('project_updates', value),
            activeThumbColor: AppColors.primary,
          ),
          onTap: () => _updateNotifPref('project_updates', !prefs.projectUpdates),
        ),
        _buildDivider(),
        _SettingsItem(
          icon: Icons.campaign_outlined,
          iconColor: AppColors.warning,
          title: 'Promotional',
          subtitle: 'Offers, discounts, and news',
          trailing: Switch(
            value: prefs.promotions,
            onChanged: (value) => _updateNotifPref('promotional_notifications', value),
            activeThumbColor: AppColors.primary,
          ),
          onTap: () => _updateNotifPref('promotional_notifications', !prefs.promotions),
        ),
      ],
    );
  }

  /// Builds the Security settings section.
  Widget _buildSecuritySection() {
    return _SettingsSection(
      title: 'SECURITY',
      icon: Icons.shield_outlined,
      iconColor: AppColors.success,
      children: [
        _SettingsItem(
          icon: Icons.lock_outline,
          iconColor: AppColors.primary,
          title: 'Change Password',
          subtitle: 'Update your account password',
          trailing: Icon(Icons.chevron_right, color: AppColors.textTertiary),
          onTap: () => _showChangePasswordDialog(context),
        ),
        _buildDivider(),
        _SettingsItem(
          icon: Icons.devices_outlined,
          iconColor: AppColors.accent,
          title: 'Active Sessions',
          subtitle: 'Manage logged in devices',
          trailing: Icon(Icons.chevron_right, color: AppColors.textTertiary),
          onTap: () => _showActiveSessionsSheet(context),
        ),
        _buildDivider(),
        _SettingsItem(
          icon: Icons.security_outlined,
          iconColor: AppColors.info,
          title: 'Two-Factor Authentication',
          subtitle: 'Not enabled',
          trailing: _buildComingSoonBadge(),
          onTap: () {},
        ),
      ],
    );
  }

  /// Builds the Account settings section.
  Widget _buildAccountSection() {
    return _SettingsSection(
      title: 'DATA & STORAGE',
      icon: Icons.folder_outlined,
      iconColor: AppColors.accent,
      children: [
        _SettingsItem(
          icon: Icons.cloud_download_outlined,
          iconColor: AppColors.info,
          title: 'Download My Data',
          subtitle: 'Get a copy of your data',
          trailing: Icon(Icons.chevron_right, color: AppColors.textTertiary),
          onTap: () => _handleDownloadData(context),
        ),
        _buildDivider(),
        _SettingsItem(
          icon: Icons.cleaning_services_outlined,
          iconColor: AppColors.warning,
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          trailing: Icon(Icons.chevron_right, color: AppColors.textTertiary),
          onTap: () => _handleClearCache(context),
        ),
      ],
    );
  }

  /// Builds the About section.
  Widget _buildAboutSection() {
    return _SettingsSection(
      title: 'ABOUT',
      icon: Icons.info_outline,
      iconColor: AppColors.info,
      children: [
        _SettingsItem(
          icon: Icons.info_outline,
          iconColor: AppColors.textSecondary,
          title: 'App Version',
          subtitle: 'AssignX',
          trailing: FutureBuilder<PackageInfo>(
            future: PackageInfo.fromPlatform(),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                return Text(
                  'v${snapshot.data!.version} (${snapshot.data!.buildNumber})',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
          onTap: () {},
        ),
        _buildDivider(),
        _SettingsItem(
          icon: Icons.star_outline,
          iconColor: AppColors.warning,
          title: 'Rate the App',
          subtitle: 'Help us improve with your feedback',
          trailing: Icon(Icons.chevron_right, color: AppColors.textTertiary),
          onTap: () => _handleRateApp(),
        ),
        _buildDivider(),
        _SettingsItem(
          icon: Icons.share_outlined,
          iconColor: AppColors.success,
          title: 'Share App',
          subtitle: 'Tell your friends about AssignX',
          trailing: Icon(Icons.chevron_right, color: AppColors.textTertiary),
          onTap: () => _handleShareApp(),
        ),
      ],
    );
  }

  /// Builds the Legal section.
  Widget _buildLegalSection() {
    return _SettingsSection(
      title: 'LEGAL',
      icon: Icons.gavel_outlined,
      iconColor: AppColors.textSecondary,
      children: [
        _SettingsItem(
          icon: Icons.description_outlined,
          iconColor: AppColors.textSecondary,
          title: 'Terms of Service',
          subtitle: null,
          trailing: Icon(Icons.open_in_new, color: AppColors.textTertiary, size: 18),
          onTap: () => _launchUrl('https://assignx.in/terms'),
        ),
        _buildDivider(),
        _SettingsItem(
          icon: Icons.privacy_tip_outlined,
          iconColor: AppColors.textSecondary,
          title: 'Privacy Policy',
          subtitle: null,
          trailing: Icon(Icons.open_in_new, color: AppColors.textTertiary, size: 18),
          onTap: () => _launchUrl('https://assignx.in/privacy'),
        ),
        _buildDivider(),
        _SettingsItem(
          icon: Icons.code_outlined,
          iconColor: AppColors.textSecondary,
          title: 'Open Source Licenses',
          subtitle: null,
          trailing: Icon(Icons.chevron_right, color: AppColors.textTertiary),
          onTap: () => showLicensePage(
            context: context,
            applicationName: 'AssignX',
            applicationVersion: '1.0.0',
          ),
        ),
      ],
    );
  }

  /// Builds the Danger Zone section with red styling.
  Widget _buildDangerZoneSection() {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          Padding(
            padding: const EdgeInsets.only(
              left: AppSpacing.xs,
              bottom: AppSpacing.sm,
            ),
            child: Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Icon(
                    Icons.warning_amber_outlined,
                    size: 14,
                    color: AppColors.error,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  'DANGER ZONE',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.error,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),

          // Danger Zone Card
          GlassCard(
            blur: 12,
            opacity: 0.6,
            borderColor: AppColors.error.withValues(alpha: 0.3),
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                _SettingsItem(
                  icon: Icons.delete_forever_outlined,
                  iconColor: AppColors.error,
                  title: 'Delete Account',
                  subtitle: 'Permanently delete your account and data',
                  trailing: Icon(Icons.chevron_right, color: AppColors.error),
                  onTap: () => _showDeleteAccountDialog(context),
                  isDanger: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Builds a "Coming Soon" badge.
  Widget _buildComingSoonBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.xs,
        vertical: AppSpacing.xxs,
      ),
      decoration: BoxDecoration(
        color: AppColors.warning.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppSpacing.radiusXs),
      ),
      child: Text(
        'Coming Soon',
        style: AppTextStyles.labelSmall.copyWith(
          color: AppColors.warning,
          fontWeight: FontWeight.w600,
          fontSize: 10,
        ),
      ),
    );
  }

  /// Builds a divider for settings items.
  Widget _buildDivider() {
    return Padding(
      padding: const EdgeInsets.only(left: 56),
      child: Divider(
        height: 1,
        color: AppColors.divider.withValues(alpha: 0.5),
      ),
    );
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  String _getThemeLabel(ThemeMode mode) {
    switch (mode) {
      case ThemeMode.system:
        return 'System default';
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
    }
  }

  void _showThemePicker(BuildContext context, WidgetRef ref, ThemeMode current) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppSpacing.radiusXl),
        ),
      ),
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: AppSpacing.md),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text('Choose Theme', style: AppTextStyles.headingSmall),
            const SizedBox(height: AppSpacing.md),
            _ThemeOption(
              icon: Icons.brightness_auto,
              label: 'System default',
              isSelected: current == ThemeMode.system,
              onTap: () {
                ref.read(themeModeProvider.notifier).state = ThemeMode.system;
                Navigator.pop(context);
              },
            ),
            _ThemeOption(
              icon: Icons.light_mode,
              label: 'Light',
              isSelected: current == ThemeMode.light,
              onTap: () {
                ref.read(themeModeProvider.notifier).state = ThemeMode.light;
                Navigator.pop(context);
              },
            ),
            _ThemeOption(
              icon: Icons.dark_mode,
              label: 'Dark',
              isSelected: current == ThemeMode.dark,
              onTap: () {
                ref.read(themeModeProvider.notifier).state = ThemeMode.dark;
                Navigator.pop(context);
              },
            ),
            const SizedBox(height: AppSpacing.lg),
          ],
        ),
      ),
    );
  }

  Future<void> _updateNotifPref(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
    ref.invalidate(notificationPrefsProvider);
  }

  void _showChangePasswordDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        ),
        title: const Text('Change Password'),
        content: const Text(
          'To change your password, we\'ll send a reset link to your email.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Password reset email sent')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.textOnPrimary,
            ),
            child: const Text('Send Link'),
          ),
        ],
      ),
    );
  }

  void _showActiveSessionsSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppSpacing.radiusXl),
        ),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.5,
        minChildSize: 0.3,
        maxChildSize: 0.8,
        expand: false,
        builder: (context, scrollController) => Column(
          children: [
            const SizedBox(height: AppSpacing.md),
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Active Sessions', style: AppTextStyles.headingSmall),
                  TextButton(
                    onPressed: () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('All other sessions logged out')),
                      );
                    },
                    child: Text(
                      'Log out all',
                      style: TextStyle(color: AppColors.error),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                controller: scrollController,
                children: [
                  _SessionTile(
                    device: 'This Device',
                    location: 'Current session',
                    isCurrent: true,
                  ),
                  _SessionTile(
                    device: 'Chrome on Windows',
                    location: 'Mumbai, India - 2 hours ago',
                    isCurrent: false,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleDownloadData(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        ),
        title: const Text('Download Your Data'),
        content: const Text(
          'We\'ll prepare a copy of your data and send it to your email. This may take up to 24 hours.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Data export request submitted')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.textOnPrimary,
            ),
            child: const Text('Request Data'),
          ),
        ],
      ),
    );
  }

  void _handleClearCache(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        ),
        title: const Text('Clear Cache'),
        content: const Text(
          'This will clear cached images and temporary data. You may need to download some content again.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.textOnPrimary,
            ),
            child: const Text('Clear'),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cache cleared')),
      );
    }
  }

  void _handleRateApp() async {
    final uri = Uri.parse('https://play.google.com/store/apps/details?id=com.assignx.app');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _handleShareApp() {
    // Share app link
    // Share.share('Check out AssignX for academic support! https://assignx.in');
  }

  void _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _showDeleteAccountDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.radiusLg),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(AppSpacing.xs),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Icon(Icons.warning, color: AppColors.error, size: 20),
            ),
            const SizedBox(width: AppSpacing.sm),
            const Text('Delete Account'),
          ],
        ),
        content: const Text(
          'This action is irreversible. All your data, projects, and history will be permanently deleted.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Account deletion request submitted')),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Delete Account'),
          ),
        ],
      ),
    );
  }
}

// ============================================================
// PRIVATE WIDGETS
// ============================================================

/// A section container for grouping related settings.
class _SettingsSection extends StatelessWidget {
  final String title;
  final IconData icon;
  final Color iconColor;
  final List<Widget> children;

  const _SettingsSection({
    required this.title,
    required this.icon,
    required this.iconColor,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Header
          Padding(
            padding: const EdgeInsets.only(
              left: AppSpacing.xs,
              bottom: AppSpacing.sm,
            ),
            child: Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Icon(icon, size: 14, color: iconColor),
                ),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  title,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.textSecondary,
                    letterSpacing: 1.2,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),

          // Settings Card
          GlassCard(
            blur: 12,
            opacity: 0.7,
            padding: EdgeInsets.zero,
            child: Column(children: children),
          ),
        ],
      ),
    );
  }
}

/// A single settings item with icon, title, subtitle, and trailing widget.
class _SettingsItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback onTap;
  final bool isDanger;

  const _SettingsItem({
    required this.icon,
    required this.iconColor,
    required this.title,
    this.subtitle,
    this.trailing,
    required this.onTap,
    this.isDanger = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppSpacing.radiusMd),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm,
        ),
        child: Row(
          children: [
            // Icon Container
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
              ),
              child: Icon(
                icon,
                color: iconColor,
                size: 20,
              ),
            ),
            const SizedBox(width: AppSpacing.md),

            // Title and Subtitle
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: isDanger ? AppColors.error : AppColors.textPrimary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: isDanger
                            ? AppColors.error.withValues(alpha: 0.7)
                            : AppColors.textSecondary,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // Trailing Widget
            if (trailing != null) trailing!,
          ],
        ),
      ),
    );
  }
}

/// Theme option tile for the theme picker bottom sheet.
class _ThemeOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ThemeOption({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.1)
              : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        ),
        child: Icon(
          icon,
          color: isSelected ? AppColors.primary : AppColors.textSecondary,
          size: 20,
        ),
      ),
      title: Text(
        label,
        style: AppTextStyles.bodyMedium.copyWith(
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          color: isSelected ? AppColors.primary : AppColors.textPrimary,
        ),
      ),
      trailing: isSelected
          ? Icon(Icons.check_circle, color: AppColors.primary)
          : null,
      onTap: onTap,
    );
  }
}

/// Session tile for the active sessions sheet.
class _SessionTile extends StatelessWidget {
  final String device;
  final String location;
  final bool isCurrent;

  const _SessionTile({
    required this.device,
    required this.location,
    required this.isCurrent,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: isCurrent
              ? AppColors.success.withValues(alpha: 0.1)
              : AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
        ),
        child: Icon(
          isCurrent ? Icons.phone_android : Icons.computer,
          color: isCurrent ? AppColors.success : AppColors.textSecondary,
          size: 20,
        ),
      ),
      title: Text(device, style: AppTextStyles.bodyMedium),
      subtitle: Text(
        location,
        style: AppTextStyles.bodySmall.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
      trailing: isCurrent
          ? Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.xs,
                vertical: AppSpacing.xxs,
              ),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppSpacing.radiusXs),
              ),
              child: Text(
                'Active',
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.success,
                  fontWeight: FontWeight.w600,
                  fontSize: 10,
                ),
              ),
            )
          : IconButton(
              icon: Icon(Icons.logout, color: AppColors.error, size: 20),
              onPressed: () {},
            ),
    );
  }
}
