import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

/// Provider for app theme mode
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);

/// Provider for notification preferences
final notificationPrefsProvider = FutureProvider<NotificationPrefs>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  return NotificationPrefs(
    pushEnabled: prefs.getBool('push_notifications') ?? true,
    emailEnabled: prefs.getBool('email_notifications') ?? true,
    projectUpdates: prefs.getBool('project_updates') ?? true,
    promotions: prefs.getBool('promotional_notifications') ?? false,
  );
});

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

/// Settings screen with app preferences.
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final notifPrefsAsync = ref.watch(notificationPrefsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: ListView(
        children: [
          const SizedBox(height: 16),

          // Appearance Section
          _SectionHeader(title: 'APPEARANCE'),
          _SettingsTile(
            icon: Icons.palette_outlined,
            title: 'Theme',
            subtitle: _getThemeLabel(themeMode),
            onTap: () => _showThemePicker(context, ref, themeMode),
          ),

          const SizedBox(height: 24),

          // Notifications Section
          _SectionHeader(title: 'NOTIFICATIONS'),
          notifPrefsAsync.when(
            data: (prefs) => Column(
              children: [
                _SettingsSwitch(
                  icon: Icons.notifications_outlined,
                  title: 'Push Notifications',
                  subtitle: 'Receive notifications on your device',
                  value: prefs.pushEnabled,
                  onChanged: (value) => _updateNotifPref(ref, 'push_notifications', value),
                ),
                _SettingsSwitch(
                  icon: Icons.email_outlined,
                  title: 'Email Notifications',
                  subtitle: 'Receive updates via email',
                  value: prefs.emailEnabled,
                  onChanged: (value) => _updateNotifPref(ref, 'email_notifications', value),
                ),
                _SettingsSwitch(
                  icon: Icons.update,
                  title: 'Project Updates',
                  subtitle: 'Status changes, deliveries, messages',
                  value: prefs.projectUpdates,
                  onChanged: (value) => _updateNotifPref(ref, 'project_updates', value),
                ),
                _SettingsSwitch(
                  icon: Icons.campaign_outlined,
                  title: 'Promotional',
                  subtitle: 'Offers, discounts, and news',
                  value: prefs.promotions,
                  onChanged: (value) => _updateNotifPref(ref, 'promotional_notifications', value),
                ),
              ],
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, _) => const SizedBox.shrink(),
          ),

          const SizedBox(height: 24),

          // Security Section
          _SectionHeader(title: 'SECURITY'),
          _SettingsTile(
            icon: Icons.lock_outline,
            title: 'Change Password',
            subtitle: 'Update your account password',
            onTap: () => _showChangePasswordDialog(context),
          ),
          _SettingsTile(
            icon: Icons.devices_outlined,
            title: 'Active Sessions',
            subtitle: 'Manage logged in devices',
            onTap: () => _showActiveSessionsSheet(context),
          ),
          _SettingsTile(
            icon: Icons.security,
            title: 'Two-Factor Authentication',
            subtitle: 'Not enabled',
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.warning.withAlpha(25),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'Coming Soon',
                style: TextStyle(
                  fontSize: 10,
                  color: AppColors.warning,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            onTap: () {},
          ),

          const SizedBox(height: 24),

          // Data & Storage Section
          _SectionHeader(title: 'DATA & STORAGE'),
          _SettingsTile(
            icon: Icons.cloud_download_outlined,
            title: 'Download My Data',
            subtitle: 'Get a copy of your data',
            onTap: () => _handleDownloadData(context),
          ),
          _SettingsTile(
            icon: Icons.cleaning_services_outlined,
            title: 'Clear Cache',
            subtitle: 'Free up storage space',
            onTap: () => _handleClearCache(context),
          ),

          const SizedBox(height: 24),

          // About Section
          _SectionHeader(title: 'ABOUT'),
          _SettingsTile(
            icon: Icons.info_outline,
            title: 'App Version',
            subtitle: 'Loading...',
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
          _SettingsTile(
            icon: Icons.star_outline,
            title: 'Rate the App',
            subtitle: 'Help us improve with your feedback',
            onTap: () => _handleRateApp(),
          ),
          _SettingsTile(
            icon: Icons.share_outlined,
            title: 'Share App',
            subtitle: 'Tell your friends about AssignX',
            onTap: () => _handleShareApp(),
          ),

          const SizedBox(height: 24),

          // Legal Section
          _SectionHeader(title: 'LEGAL'),
          _SettingsTile(
            icon: Icons.description_outlined,
            title: 'Terms of Service',
            onTap: () => _launchUrl('https://assignx.in/terms'),
          ),
          _SettingsTile(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy Policy',
            onTap: () => _launchUrl('https://assignx.in/privacy'),
          ),
          _SettingsTile(
            icon: Icons.gavel_outlined,
            title: 'Open Source Licenses',
            onTap: () => showLicensePage(
              context: context,
              applicationName: 'AssignX',
              applicationVersion: '1.0.0',
            ),
          ),

          const SizedBox(height: 40),

          // Delete Account
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton.icon(
              onPressed: () => _showDeleteAccountDialog(context),
              icon: Icon(Icons.delete_forever, color: AppColors.error),
              label: Text(
                'Delete Account',
                style: TextStyle(color: AppColors.error),
              ),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: AppColors.error),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

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
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 16),
            Text('Choose Theme', style: AppTextStyles.headingSmall),
            const SizedBox(height: 16),
            RadioListTile<ThemeMode>(
              title: const Text('System default'),
              value: ThemeMode.system,
              groupValue: current,
              onChanged: (value) {
                ref.read(themeModeProvider.notifier).state = value!;
                Navigator.pop(context);
              },
            ),
            RadioListTile<ThemeMode>(
              title: const Text('Light'),
              value: ThemeMode.light,
              groupValue: current,
              onChanged: (value) {
                ref.read(themeModeProvider.notifier).state = value!;
                Navigator.pop(context);
              },
            ),
            RadioListTile<ThemeMode>(
              title: const Text('Dark'),
              value: ThemeMode.dark,
              groupValue: current,
              onChanged: (value) {
                ref.read(themeModeProvider.notifier).state = value!;
                Navigator.pop(context);
              },
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Future<void> _updateNotifPref(WidgetRef ref, String key, bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(key, value);
    ref.invalidate(notificationPrefsProvider);
  }

  void _showChangePasswordDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
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
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.5,
        minChildSize: 0.3,
        maxChildSize: 0.8,
        expand: false,
        builder: (context, scrollController) => Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
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
                    location: 'Mumbai, India • 2 hours ago',
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
    // Open app store for rating
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
        title: Row(
          children: [
            Icon(Icons.warning, color: AppColors.error),
            const SizedBox(width: 8),
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
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Delete Account'),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Text(
        title,
        style: AppTextStyles.labelSmall.copyWith(
          color: AppColors.textSecondary,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? trailing;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppColors.textSecondary, size: 20),
      ),
      title: Text(title, style: AppTextStyles.bodyMedium),
      subtitle: subtitle != null
          ? Text(
              subtitle!,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textSecondary,
              ),
            )
          : null,
      trailing: trailing ?? Icon(Icons.chevron_right, color: AppColors.textTertiary),
      onTap: onTap,
    );
  }
}

class _SettingsSwitch extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _SettingsSwitch({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      secondary: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppColors.textSecondary, size: 20),
      ),
      title: Text(title, style: AppTextStyles.bodyMedium),
      subtitle: Text(
        subtitle,
        style: AppTextStyles.bodySmall.copyWith(
          color: AppColors.textSecondary,
        ),
      ),
      value: value,
      onChanged: onChanged,
      activeColor: AppColors.primary,
    );
  }
}

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
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(
          isCurrent ? Icons.phone_android : Icons.computer,
          color: AppColors.textSecondary,
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
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.success.withAlpha(25),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'Active',
                style: TextStyle(
                  fontSize: 10,
                  color: AppColors.success,
                  fontWeight: FontWeight.w600,
                ),
              ),
            )
          : IconButton(
              icon: Icon(Icons.logout, color: AppColors.error),
              onPressed: () {},
            ),
    );
  }
}
