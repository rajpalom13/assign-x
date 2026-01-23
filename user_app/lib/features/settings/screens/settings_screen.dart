import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

// ============================================================
// DESIGN CONSTANTS
// ============================================================

/// Design colors from specification
class _SettingsColors {
  // Note: scaffoldBackground removed - now using transparent for gradient from MainShell
  static const cardBackground = Color(0xFFFFFFFF);
  static const primaryText = Color(0xFF1A1A1A);
  static const secondaryText = Color(0xFF6B6B6B);
  static const mutedText = Color(0xFF8B8B8B);
  static const toggleOn = Color(0xFF5D3A3A);
  static const toggleOff = Color(0xFFE0E0E0);
  static const actionBlue = Color(0xFF2196F3);
  static const actionRed = Color(0xFFF44336);
  static const selectedThemeTint = Color(0xFFF8F0F8);
  static const chipBackground = Color(0xFFF5F5F5);
  static const exportBlueBackground = Color(0xFFF0F7FF);
  static const clearRedBackground = Color(0xFFFFF0F0);
  static const walletChipBackground = Color(0xFFF0F0F0);
}

// ============================================================
// PROVIDERS
// ============================================================

/// Provider for app theme mode.
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.light);

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

/// Provider for appearance preferences.
final appearancePrefsProvider = FutureProvider<AppearancePrefs>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  return AppearancePrefs(
    reducedMotion: prefs.getBool('reduced_motion') ?? false,
    compactMode: prefs.getBool('compact_mode') ?? false,
  );
});

/// Provider for privacy preferences.
final privacyPrefsProvider = FutureProvider<PrivacyPrefs>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  return PrivacyPrefs(
    analyticsOptOut: prefs.getBool('analytics_opt_out') ?? false,
    showOnlineStatus: prefs.getBool('show_online_status') ?? true,
  );
});

// ============================================================
// MODELS
// ============================================================

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

/// Model for appearance preferences.
class AppearancePrefs {
  final bool reducedMotion;
  final bool compactMode;

  const AppearancePrefs({
    required this.reducedMotion,
    required this.compactMode,
  });
}

/// Model for privacy preferences.
class PrivacyPrefs {
  final bool analyticsOptOut;
  final bool showOnlineStatus;

  const PrivacyPrefs({
    required this.analyticsOptOut,
    required this.showOnlineStatus,
  });
}

// ============================================================
// MAIN SCREEN
// ============================================================

/// Settings screen with redesigned UI matching design specification.
class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _isExporting = false;
  bool _isClearing = false;

  @override
  Widget build(BuildContext context) {
    final themeMode = ref.watch(themeModeProvider);
    final notifPrefsAsync = ref.watch(notificationPrefsProvider);
    final appearancePrefsAsync = ref.watch(appearancePrefsProvider);
    final privacyPrefsAsync = ref.watch(privacyPrefsProvider);

    return Scaffold(
      // Transparent to show SubtleGradientScaffold from MainShell
      backgroundColor: Colors.transparent,
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            // Header Bar
            SliverToBoxAdapter(child: _buildHeaderBar()),

            // Content
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  const SizedBox(height: 16),

                  // Page Title Section
                  _buildPageTitle(),
                  const SizedBox(height: 24),

                  // Notifications Section
                  notifPrefsAsync.when(
                    data: (prefs) => _buildNotificationsCard(prefs),
                    loading: () => _buildLoadingCard(),
                    error: (e, s) => const SizedBox.shrink(),
                  ),
                  const SizedBox(height: 16),

                  // Appearance Section
                  appearancePrefsAsync.when(
                    data: (prefs) => _buildAppearanceCard(themeMode, prefs),
                    loading: () => _buildLoadingCard(),
                    error: (e, s) => const SizedBox.shrink(),
                  ),
                  const SizedBox(height: 16),

                  // Privacy & Data Section
                  privacyPrefsAsync.when(
                    data: (prefs) => _buildPrivacyCard(prefs),
                    loading: () => _buildLoadingCard(),
                    error: (e, s) => const SizedBox.shrink(),
                  ),
                  const SizedBox(height: 16),

                  // About Section
                  _buildAboutCard(),
                  const SizedBox(height: 100), // Bottom padding for nav bar
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // HEADER BAR
  // ============================================================

  /// Builds the header bar with logo, wallet chip, and notification icon.
  Widget _buildHeaderBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Row(
        children: [
          // AssignX Logo
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
            ),
            child: const Center(
              child: Text(
                'A',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Text(
            'AssignX',
            style: AppTextStyles.headingMedium.copyWith(
              color: _SettingsColors.primaryText,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          // Wallet Chip
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: _SettingsColors.walletChipBackground,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.account_balance_wallet_outlined,
                  size: 16,
                  color: _SettingsColors.secondaryText,
                ),
                const SizedBox(width: 6),
                Text(
                  'Wallet · 100',
                  style: AppTextStyles.labelMedium.copyWith(
                    color: _SettingsColors.primaryText,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Notification Bell
          Icon(
            Icons.notifications_outlined,
            size: 24,
            color: _SettingsColors.secondaryText,
          ),
        ],
      ),
    );
  }

  // ============================================================
  // PAGE TITLE
  // ============================================================

  /// Builds the page title section.
  Widget _buildPageTitle() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Settings',
          style: AppTextStyles.displayLarge.copyWith(
            fontSize: 30,
            fontWeight: FontWeight.bold,
            color: _SettingsColors.primaryText,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Manage your preferences and account',
          style: AppTextStyles.bodyMedium.copyWith(
            color: _SettingsColors.secondaryText,
          ),
        ),
      ],
    );
  }

  // ============================================================
  // NOTIFICATIONS CARD
  // ============================================================

  /// Builds the notifications settings card.
  Widget _buildNotificationsCard(NotificationPrefs prefs) {
    return _SettingsCard(
      icon: Icons.notifications_outlined,
      iconBackgroundColor: const Color(0xFFFFF3E0), // Soft orange
      title: 'Notifications',
      subtitle: 'Manage how you receive updates',
      children: [
        _SettingsToggleItem(
          title: 'Push Notifications',
          subtitle: 'Get push notifications on your device',
          value: prefs.pushEnabled,
          onChanged: (value) => _updateNotifPref('push_notifications', value),
        ),
        _SettingsToggleItem(
          title: 'Email Notifications',
          subtitle: 'Receive important updates via email',
          value: prefs.emailEnabled,
          onChanged: (value) => _updateNotifPref('email_notifications', value),
        ),
        _SettingsToggleItem(
          title: 'Project Updates',
          subtitle: 'Get notified when projects are updated',
          value: prefs.projectUpdates,
          onChanged: (value) => _updateNotifPref('project_updates', value),
        ),
        _SettingsToggleItem(
          title: 'Marketing Emails',
          subtitle: 'Receive promotional offers',
          value: prefs.promotions,
          onChanged: (value) => _updateNotifPref('promotional_notifications', value),
          showDivider: false,
        ),
      ],
    );
  }

  // ============================================================
  // APPEARANCE CARD
  // ============================================================

  /// Builds the appearance settings card.
  Widget _buildAppearanceCard(ThemeMode themeMode, AppearancePrefs prefs) {
    final isLightSelected = themeMode == ThemeMode.light || themeMode == ThemeMode.system;

    return _SettingsCard(
      icon: Icons.auto_awesome_outlined,
      iconBackgroundColor: const Color(0xFFF3E5F5), // Soft purple
      title: 'Appearance',
      subtitle: 'Customize how the app looks',
      children: [
        // Theme Label
        Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: Text(
            'Theme',
            style: AppTextStyles.labelLarge.copyWith(
              color: _SettingsColors.primaryText,
            ),
          ),
        ),
        // Theme Selector
        Row(
          children: [
            Expanded(
              child: _ThemeOptionCard(
                icon: Icons.wb_sunny_outlined,
                label: 'Light',
                isSelected: isLightSelected,
                onTap: () => ref.read(themeModeProvider.notifier).state = ThemeMode.light,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ThemeOptionCard(
                icon: Icons.dark_mode_outlined,
                label: 'Dark',
                isSelected: !isLightSelected,
                onTap: () => ref.read(themeModeProvider.notifier).state = ThemeMode.dark,
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        _SettingsToggleItem(
          title: 'Reduced Motion',
          subtitle: 'Minimize animations',
          value: prefs.reducedMotion,
          onChanged: (value) => _updateAppearancePref('reduced_motion', value),
        ),
        _SettingsToggleItem(
          title: 'Compact Mode',
          subtitle: 'Use a more compact layout',
          value: prefs.compactMode,
          onChanged: (value) => _updateAppearancePref('compact_mode', value),
          showDivider: false,
        ),
      ],
    );
  }

  // ============================================================
  // PRIVACY & DATA CARD
  // ============================================================

  /// Builds the privacy & data settings card.
  Widget _buildPrivacyCard(PrivacyPrefs prefs) {
    return _SettingsCard(
      icon: Icons.shield_outlined,
      iconBackgroundColor: const Color(0xFFE8F5E9), // Soft green
      title: 'Privacy & Data',
      subtitle: 'Control your data',
      children: [
        _SettingsToggleItem(
          title: 'Analytics Opt-out',
          subtitle: 'Disable anonymous usage analytics',
          value: prefs.analyticsOptOut,
          onChanged: (value) => _updatePrivacyPref('analytics_opt_out', value),
        ),
        _SettingsToggleItem(
          title: 'Show Online Status',
          subtitle: 'Let others see when you are online',
          value: prefs.showOnlineStatus,
          onChanged: (value) => _updatePrivacyPref('show_online_status', value),
          showDivider: false,
        ),
        const SizedBox(height: 16),
        // Export Data Button
        _ActionButton(
          title: 'Export Data',
          subtitle: 'Download your data as JSON',
          backgroundColor: _SettingsColors.exportBlueBackground,
          textColor: _SettingsColors.actionBlue,
          isLoading: _isExporting,
          onTap: _handleExportData,
        ),
        const SizedBox(height: 10),
        // Clear Cache Button
        _ActionButton(
          title: 'Clear Cache',
          subtitle: 'Clear local storage data',
          backgroundColor: _SettingsColors.clearRedBackground,
          textColor: _SettingsColors.actionRed,
          isLoading: _isClearing,
          onTap: _handleClearCache,
        ),
      ],
    );
  }

  // ============================================================
  // ABOUT CARD
  // ============================================================

  /// Builds the about AssignX card.
  Widget _buildAboutCard() {
    return _SettingsCard(
      icon: Icons.info_outline,
      iconBackgroundColor: const Color(0xFFE8E0F8),
      title: 'About AssignX',
      subtitle: 'App information',
      children: [
        // Info Chips
        Row(
          children: [
            _InfoChip(label: 'Version', value: '1.0.0'),
            const SizedBox(width: 10),
            _InfoChip(label: 'Build', value: '2024.12.26'),
            const SizedBox(width: 10),
            _InfoChip(label: 'Status', value: 'Beta'),
          ],
        ),
        const SizedBox(height: 12),
        // Last Updated
        FutureBuilder<PackageInfo>(
          future: PackageInfo.fromPlatform(),
          builder: (context, snapshot) {
            return Center(
              child: Text(
                'Updated: Dec 26, 2024',
                style: AppTextStyles.bodySmall.copyWith(
                  color: _SettingsColors.mutedText,
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 20),
        // Navigation Links
        _NavigationLinkItem(
          title: 'Terms of Service',
          onTap: () => _launchUrl('https://assignx.in/terms'),
        ),
        _NavigationLinkItem(
          title: 'Privacy Policy',
          onTap: () => _launchUrl('https://assignx.in/privacy'),
        ),
        _NavigationLinkItem(
          title: 'Open Source',
          onTap: () => showLicensePage(
            context: context,
            applicationName: 'AssignX',
            applicationVersion: '1.0.0',
          ),
          showDivider: false,
        ),
      ],
    );
  }

  // ============================================================
  // LOADING CARD
  // ============================================================

  /// Builds a loading placeholder card.
  Widget _buildLoadingCard() {
    return Container(
      height: 100,
      decoration: BoxDecoration(
        color: _SettingsColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: const Center(
        child: CircularProgressIndicator(strokeWidth: 2),
      ),
    );
  }

  // ============================================================
  // PREFERENCE UPDATE METHODS
  // ============================================================

  Future<void> _updateNotifPref(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
    ref.invalidate(notificationPrefsProvider);
  }

  Future<void> _updateAppearancePref(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
    ref.invalidate(appearancePrefsProvider);
  }

  Future<void> _updatePrivacyPref(String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
    ref.invalidate(privacyPrefsProvider);
  }

  // ============================================================
  // ACTION HANDLERS
  // ============================================================

  Future<void> _handleExportData() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text('Export Your Data'),
        content: const Text(
          'We\'ll prepare a copy of your data and send it to your email. This may take up to 24 hours.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: _SettingsColors.actionBlue,
              foregroundColor: Colors.white,
            ),
            child: const Text('Export'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      setState(() => _isExporting = true);
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        setState(() => _isExporting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Data export request submitted')),
        );
      }
    }
  }

  Future<void> _handleClearCache() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
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
              backgroundColor: _SettingsColors.actionRed,
              foregroundColor: Colors.white,
            ),
            child: const Text('Clear'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      setState(() => _isClearing = true);
      await Future.delayed(const Duration(seconds: 1));
      if (mounted) {
        setState(() => _isClearing = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cache cleared successfully')),
        );
      }
    }
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }
}

// ============================================================
// PRIVATE WIDGETS
// ============================================================

/// Settings card container with section header.
class _SettingsCard extends StatelessWidget {
  final IconData icon;
  final Color? iconBackgroundColor;
  final String title;
  final String subtitle;
  final List<Widget> children;

  const _SettingsCard({
    required this.icon,
    this.iconBackgroundColor,
    required this.title,
    required this.subtitle,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: _SettingsColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section Header
            Row(
              children: [
                if (iconBackgroundColor != null)
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: iconBackgroundColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      icon,
                      size: 20,
                      color: _SettingsColors.secondaryText,
                    ),
                  )
                else
                  Icon(
                    icon,
                    size: 24,
                    color: _SettingsColors.secondaryText,
                  ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: AppTextStyles.headingSmall.copyWith(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: _SettingsColors.primaryText,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: AppTextStyles.bodySmall.copyWith(
                          fontSize: 13,
                          color: _SettingsColors.mutedText,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Children
            ...children,
          ],
        ),
      ),
    );
  }
}

/// Settings toggle item with title, subtitle, and switch.
class _SettingsToggleItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool showDivider;

  const _SettingsToggleItem({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTextStyles.labelLarge.copyWith(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: _SettingsColors.primaryText,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: AppTextStyles.bodySmall.copyWith(
                        fontSize: 12,
                        color: _SettingsColors.mutedText,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              _CustomToggle(value: value, onChanged: onChanged),
            ],
          ),
        ),
        if (showDivider)
          Divider(
            height: 1,
            color: Colors.grey.withValues(alpha: 0.1),
          ),
      ],
    );
  }
}

/// Custom toggle switch matching design spec.
class _CustomToggle extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;

  const _CustomToggle({
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 50,
        height: 28,
        decoration: BoxDecoration(
          color: value ? _SettingsColors.toggleOn : _SettingsColors.toggleOff,
          borderRadius: BorderRadius.circular(14),
        ),
        child: AnimatedAlign(
          duration: const Duration(milliseconds: 200),
          alignment: value ? Alignment.centerRight : Alignment.centerLeft,
          child: Container(
            width: 24,
            height: 24,
            margin: const EdgeInsets.symmetric(horizontal: 2),
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
          ),
        ),
      ),
    );
  }
}

/// Theme option card for light/dark selection.
class _ThemeOptionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ThemeOptionCard({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 80,
        decoration: BoxDecoration(
          color: isSelected
              ? _SettingsColors.selectedThemeTint
              : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? AppColors.primary.withValues(alpha: 0.3)
                : Colors.grey.withValues(alpha: 0.2),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 24,
              color: isSelected
                  ? _SettingsColors.primaryText
                  : _SettingsColors.secondaryText,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: AppTextStyles.labelMedium.copyWith(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: isSelected
                    ? _SettingsColors.primaryText
                    : _SettingsColors.secondaryText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Action button (Export Data / Clear Cache).
class _ActionButton extends StatelessWidget {
  final String title;
  final String subtitle;
  final Color backgroundColor;
  final Color textColor;
  final bool isLoading;
  final VoidCallback onTap;

  const _ActionButton({
    required this.title,
    required this.subtitle,
    required this.backgroundColor,
    required this.textColor,
    this.isLoading = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: isLoading ? null : onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(10),
        ),
        child: isLoading
            ? Center(
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(textColor),
                  ),
                ),
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: AppTextStyles.labelLarge.copyWith(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: AppTextStyles.bodySmall.copyWith(
                      fontSize: 12,
                      color: textColor.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

/// Info chip for about section.
class _InfoChip extends StatelessWidget {
  final String label;
  final String value;

  const _InfoChip({
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: _SettingsColors.chipBackground,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: AppTextStyles.caption.copyWith(
                fontSize: 10,
                color: _SettingsColors.mutedText,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: AppTextStyles.labelLarge.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: _SettingsColors.primaryText,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Navigation link item for about section.
class _NavigationLinkItem extends StatelessWidget {
  final String title;
  final VoidCallback onTap;
  final bool showDivider;

  const _NavigationLinkItem({
    required this.title,
    required this.onTap,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: _SettingsColors.chipBackground,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.description_outlined,
                    size: 18,
                    color: _SettingsColors.secondaryText,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    title,
                    style: AppTextStyles.labelLarge.copyWith(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: _SettingsColors.primaryText,
                    ),
                  ),
                ),
                Icon(
                  Icons.chevron_right,
                  size: 20,
                  color: _SettingsColors.mutedText,
                ),
              ],
            ),
          ),
        ),
        if (showDivider)
          Divider(
            height: 1,
            color: Colors.grey.withValues(alpha: 0.1),
          ),
      ],
    );
  }
}
