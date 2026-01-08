import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/app_colors.dart';
import '../../../providers/profile_provider.dart';
import '../widgets/avatar_upload_dialog.dart';
import '../widgets/profile_hero.dart';
import '../widgets/settings_item.dart';
import '../widgets/stats_card.dart';

/// Main profile screen with hero section, stats, and settings.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileAsync = ref.watch(userProfileProvider);
    final walletAsync = ref.watch(walletProvider);
    final projectsAsync = ref.watch(completedProjectsCountProvider);
    final referralAsync = ref.watch(referralProvider);
    final appVersionAsync = ref.watch(appVersionProvider);
    final appVersion = appVersionAsync.valueOrNull ?? '1.0.0';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: profileAsync.when(
        data: (profile) => CustomScrollView(
          slivers: [
            // Hero section
            SliverToBoxAdapter(
              child: ProfileHero(
                profile: profile,
                onEditTap: () => context.push('/profile/edit'),
                onAvatarTap: () => _showAvatarOptions(context, ref),
              ),
            ),

            // Stats card (overlapping hero)
            SliverToBoxAdapter(
              child: Transform.translate(
                offset: const Offset(0, -30),
                child: walletAsync.when(
                  data: (wallet) => StatsCard(
                    walletBalance: wallet.balance,
                    projectsCompleted: projectsAsync.valueOrNull ?? 0,
                    onWalletTap: () => context.push('/wallet'),
                    onProjectsTap: () {
                      // Navigate to projects with history tab
                    },
                    onTopUpTap: () => _showTopUpSheet(context, ref),
                  ),
                  loading: () => StatsCard(
                    walletBalance: 0,
                    projectsCompleted: 0,
                  ),
                  error: (_, _) => StatsCard(
                    walletBalance: 0,
                    projectsCompleted: 0,
                  ),
                ),
              ),
            ),

            // Account section
            SliverToBoxAdapter(
              child: SettingsSection(
                title: 'ACCOUNT',
                children: [
                  SettingsItem(
                    icon: Icons.person_outline,
                    title: 'Personal Details',
                    subtitle: profile.email,
                    onTap: () => context.push('/profile/edit'),
                  ),
                  SettingsItem(
                    icon: Icons.school_outlined,
                    title: 'College & Course',
                    subtitle: profile.university ?? 'Not set',
                    onTap: () => context.push('/profile/edit'),
                  ),
                  SettingsItem(
                    icon: Icons.payment_outlined,
                    title: 'Payment Methods',
                    subtitle: 'Manage cards & UPI',
                    onTap: () => context.push('/profile/payment-methods'),
                    showDivider: false,
                  ),
                ],
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 20)),

            // Referral section
            SliverToBoxAdapter(
              child: referralAsync.when(
                data: (referral) => ReferralSection(
                  code: referral.code,
                  referrals: referral.totalReferrals,
                  earnings: referral.totalEarnings,
                  onCopy: () {
                    Clipboard.setData(ClipboardData(text: referral.code));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Code copied!')),
                    );
                  },
                  onShare: () {
                    Share.share(
                      'Use my referral code ${referral.code} to get 20% off your first project on AssignX!',
                      subject: 'Join AssignX',
                    );
                  },
                ),
                loading: () => const SizedBox.shrink(),
                error: (_, _) => const SizedBox.shrink(),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 20)),

            // Support section
            SliverToBoxAdapter(
              child: SettingsSection(
                title: 'SUPPORT',
                children: [
                  SettingsItem(
                    icon: Icons.help_outline,
                    title: 'Help & Support',
                    subtitle: 'FAQ, Contact us',
                    onTap: () => context.push('/profile/help'),
                  ),
                  SettingsItem(
                    icon: Icons.play_circle_outline,
                    title: 'How It Works',
                    subtitle: 'View tutorial',
                    onTap: () => context.push('/onboarding'),
                    showDivider: false,
                  ),
                ],
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 20)),

            // Legal section
            SliverToBoxAdapter(
              child: SettingsSection(
                title: 'LEGAL',
                children: [
                  SettingsItem(
                    icon: Icons.description_outlined,
                    title: 'Terms & Conditions',
                    onTap: () => _launchUrl('https://assignx.in/terms'),
                  ),
                  SettingsItem(
                    icon: Icons.privacy_tip_outlined,
                    title: 'Privacy Policy',
                    onTap: () => _launchUrl('https://assignx.in/privacy'),
                    showDivider: false,
                  ),
                ],
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 20)),

            // Logout
            SliverToBoxAdapter(
              child: SettingsSection(
                children: [
                  SettingsItem(
                    icon: Icons.logout,
                    title: 'Log Out',
                    isDestructive: true,
                    showDivider: false,
                    onTap: () => _showLogoutDialog(context, ref),
                  ),
                ],
              ),
            ),

            // Version footer
            SliverToBoxAdapter(
              child: AppVersionFooter(version: appVersion),
            ),

            // Bottom padding
            const SliverToBoxAdapter(
              child: SizedBox(height: 100),
            ),
          ],
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              Text('Failed to load profile'),
              TextButton(
                onPressed: () => ref.invalidate(userProfileProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showAvatarOptions(BuildContext context, WidgetRef ref) async {
    final result = await showAvatarOptionsSheet(context);
    if (result == true) {
      // Refresh profile data after avatar update
      ref.invalidate(userProfileProvider);
    }
  }

  void _showTopUpSheet(BuildContext context, WidgetRef ref) {
    final amounts = [100, 500, 1000, 2000, 5000];
    int? selectedAmount;

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(context).viewInsets.bottom + 20,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Add Money to Wallet',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: amounts.map((amount) {
                  final isSelected = selectedAmount == amount;
                  return GestureDetector(
                    onTap: () => setState(() => selectedAmount = amount),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 14,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                        ),
                      ),
                      child: Text(
                        '\u20B9$amount',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: selectedAmount != null
                      ? () {
                          Navigator.pop(context);
                          // Trigger Razorpay
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Opening payment...')),
                          );
                        }
                      : null,
                  child: const Text('Proceed to Pay'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Log Out'),
        content: const Text('Are you sure you want to log out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final repository = ref.read(profileRepositoryProvider);
              await repository.logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
            child: Text(
              'Log Out',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}
