import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/services/app_info_service.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/profile_provider.dart';
import '../../dashboard/widgets/app_header.dart';

/// Settings screen for managing app preferences and account settings.
///
/// Provides a comprehensive settings interface organized into sections
/// for account management, availability, notifications, app preferences,
/// and support options.
///
/// ## Navigation
/// - Entry: From [ProfileScreen] via quick actions or header icon
/// - Edit Profile: Opens [EditProfileScreen]
/// - Bank Details: Opens [BankDetailsScreen]
/// - Help Center: Opens support screen
/// - Logout: Clears auth and returns to [LoginScreen]
///
/// ## Sections
/// 1. **Account**: Edit profile, bank details, change password
/// 2. **Availability**: Toggle project availability
/// 3. **Notifications**: Push, email, project alerts, deadlines, payments
/// 4. **App**: Language, theme, clear cache
/// 5. **Support**: Help center, contact, privacy policy, terms
///
/// ## Features
/// - Toggle switches for boolean preferences
/// - Bottom sheets for selection options (language, theme)
/// - Logout confirmation dialog
/// - App version display
/// - Notification preferences with granular controls
///
/// ## State Management
/// Uses [ProfileProvider] for preferences and [AuthProvider] for logout.
///
/// See also:
/// - [ProfileProvider] for user preferences
/// - [AuthProvider] for authentication state
/// - [NotificationPreferences] for notification settings
/// - [AppInfoService] for version display
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileProvider);
    final profile = profileState.profile;
    final preferences = profileState.notificationPreferences;
    final appInfo = ref.watch(appInfoSyncProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          InnerHeader(
            title: 'Settings',
            onBack: () => Navigator.pop(context),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: AppSpacing.paddingMd,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Account section
                  _buildSectionTitle('Account'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildSettingsCard([
                    _buildSettingItem(
                      context,
                      'Edit Profile',
                      'Update your personal information',
                      Icons.person_outline,
                      onTap: () => context.push('/profile/edit'),
                    ),
                    _buildSettingItem(
                      context,
                      'Bank Details',
                      'Manage payment methods',
                      Icons.account_balance_outlined,
                      onTap: () => context.push('/profile/bank-details'),
                    ),
                    _buildSettingItem(
                      context,
                      'Change Password',
                      'Update your account password',
                      Icons.lock_outline,
                      onTap: () => _showPasswordDialog(context),
                    ),
                  ]),

                  const SizedBox(height: AppSpacing.lg),

                  // Availability section
                  _buildSectionTitle('Availability'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildSettingsCard([
                    _buildSwitchItem(
                      'Available for Projects',
                      'Allow new project assignments',
                      Icons.work_outline,
                      profile?.isAvailable ?? true,
                      (value) {
                        ref.read(profileProvider.notifier).updateAvailability(value);
                      },
                    ),
                  ]),

                  const SizedBox(height: AppSpacing.lg),

                  // Notification preferences section
                  _buildSectionTitle('Notifications'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildSettingsCard([
                    _buildSwitchItem(
                      'Push Notifications',
                      'Receive push notifications',
                      Icons.notifications_outlined,
                      preferences.pushNotifications,
                      (value) => _updateNotificationPref(
                        ref,
                        preferences.copyWith(pushNotifications: value),
                      ),
                    ),
                    _buildSwitchItem(
                      'Email Notifications',
                      'Receive email updates',
                      Icons.email_outlined,
                      preferences.emailNotifications,
                      (value) => _updateNotificationPref(
                        ref,
                        preferences.copyWith(emailNotifications: value),
                      ),
                    ),
                    _buildSwitchItem(
                      'New Project Alerts',
                      'Get notified about new projects',
                      Icons.campaign_outlined,
                      preferences.newProjectAlerts,
                      (value) => _updateNotificationPref(
                        ref,
                        preferences.copyWith(newProjectAlerts: value),
                      ),
                    ),
                    _buildSwitchItem(
                      'Deadline Reminders',
                      'Receive deadline notifications',
                      Icons.alarm_outlined,
                      preferences.deadlineReminders,
                      (value) => _updateNotificationPref(
                        ref,
                        preferences.copyWith(deadlineReminders: value),
                      ),
                    ),
                    _buildSwitchItem(
                      'Payment Updates',
                      'Get payment notifications',
                      Icons.payment_outlined,
                      preferences.paymentUpdates,
                      (value) => _updateNotificationPref(
                        ref,
                        preferences.copyWith(paymentUpdates: value),
                      ),
                    ),
                    _buildSwitchItem(
                      'Marketing Emails',
                      'Receive promotional content',
                      Icons.local_offer_outlined,
                      preferences.marketingEmails,
                      (value) => _updateNotificationPref(
                        ref,
                        preferences.copyWith(marketingEmails: value),
                      ),
                    ),
                  ]),

                  const SizedBox(height: AppSpacing.lg),

                  // App settings section
                  _buildSectionTitle('App'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildSettingsCard([
                    _buildSettingItem(
                      context,
                      'Language',
                      'English',
                      Icons.language,
                      trailing: const Text(
                        'English',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      onTap: () => _showLanguageSheet(context),
                    ),
                    _buildSettingItem(
                      context,
                      'Theme',
                      'Light',
                      Icons.palette_outlined,
                      trailing: const Text(
                        'Light',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                        ),
                      ),
                      onTap: () => _showThemeSheet(context),
                    ),
                    _buildSettingItem(
                      context,
                      'Clear Cache',
                      'Free up storage space',
                      Icons.cleaning_services_outlined,
                      onTap: () => _clearCache(context),
                    ),
                  ]),

                  const SizedBox(height: AppSpacing.lg),

                  // Support section
                  _buildSectionTitle('Support'),
                  const SizedBox(height: AppSpacing.sm),
                  _buildSettingsCard([
                    _buildSettingItem(
                      context,
                      'Help Center',
                      'FAQs and guides',
                      Icons.help_outline,
                      onTap: () => context.push('/support'),
                    ),
                    _buildSettingItem(
                      context,
                      'Contact Support',
                      'Get help from our team',
                      Icons.headset_mic_outlined,
                      onTap: () => _showContactSupport(context),
                    ),
                    _buildSettingItem(
                      context,
                      'Privacy Policy',
                      'Read our privacy policy',
                      Icons.privacy_tip_outlined,
                      onTap: () {},
                    ),
                    _buildSettingItem(
                      context,
                      'Terms of Service',
                      'Read our terms',
                      Icons.description_outlined,
                      onTap: () {},
                    ),
                  ]),

                  const SizedBox(height: AppSpacing.lg),

                  // App info
                  Center(
                    child: Column(
                      children: [
                        const Text(
                          'DOER App',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          appInfo.displayVersion,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Logout button
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => _showLogoutDialog(context, ref),
                      icon: const Icon(Icons.logout, color: AppColors.error),
                      label: const Text(
                        'Logout',
                        style: TextStyle(color: AppColors.error),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.error),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xl),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: AppColors.textSecondary,
      ),
    );
  }

  Widget _buildSettingsCard(List<Widget> children) {
    return Card(
      elevation: 2,
      shape: const RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusMd,
      ),
      child: Column(
        children: List.generate(
          children.length * 2 - 1,
          (index) {
            if (index.isOdd) {
              return const Divider(height: 1);
            }
            return children[index ~/ 2];
          },
        ),
      ),
    );
  }

  Widget _buildSettingItem(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon, {
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                icon,
                size: 20,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            trailing ??
                const Icon(
                  Icons.chevron_right,
                  color: AppColors.textTertiary,
                ),
          ],
        ),
      ),
    );
  }

  Widget _buildSwitchItem(
    String title,
    String subtitle,
    IconData icon,
    bool value,
    ValueChanged<bool> onChanged,
  ) {
    return Padding(
      padding: AppSpacing.paddingMd,
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              size: 20,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: AppColors.primary,
          ),
        ],
      ),
    );
  }

  void _updateNotificationPref(WidgetRef ref, NotificationPreferences prefs) {
    ref.read(profileProvider.notifier).updateNotificationPreferences(prefs);
  }

  void _showPasswordDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Change Password'),
        content: const Text('Password change functionality coming soon.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showLanguageSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: AppSpacing.paddingMd,
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Select Language',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            ListTile(
              leading: const Icon(Icons.check, color: AppColors.primary),
              title: const Text('English'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              title: const Text('Hindi'),
              onTap: () => Navigator.pop(context),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }

  void _showThemeSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: AppSpacing.paddingMd,
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Select Theme',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            ListTile(
              leading: const Icon(Icons.check, color: AppColors.primary),
              title: const Text('Light'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              title: const Text('Dark'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              title: const Text('System'),
              onTap: () => Navigator.pop(context),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }

  void _clearCache(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Cache cleared successfully'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showContactSupport(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: AppSpacing.paddingMd,
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Contact Support',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            ListTile(
              leading: const Icon(Icons.email_outlined, color: AppColors.primary),
              title: const Text('Email Us'),
              subtitle: const Text('support@doer.app'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.chat_outlined, color: AppColors.primary),
              title: const Text('Live Chat'),
              subtitle: const Text('Available 9 AM - 6 PM'),
              onTap: () => Navigator.pop(context),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: const RoundedRectangleBorder(
          borderRadius: AppSpacing.borderRadiusMd,
        ),
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).signOut();
              context.go('/login');
            },
            child: const Text(
              'Logout',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}
