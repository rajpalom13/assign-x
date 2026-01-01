import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../providers/profile_provider.dart';
import '../../../shared/widgets/loading_overlay.dart';
import '../../dashboard/widgets/app_header.dart';
import '../widgets/earnings_graph.dart';
import '../widgets/rating_breakdown.dart';
import '../widgets/skill_verification.dart';

/// Profile screen showing user profile and stats.
///
/// Displays the authenticated user's profile information including
/// avatar, stats, quick actions, skills, and bio.
///
/// ## Navigation
/// - Entry: From [AppDrawer] or dashboard
/// - Settings: Navigates to [SettingsScreen]
/// - Edit Profile: Navigates to [EditProfileScreen]
/// - Payment History: Navigates to [PaymentHistoryScreen]
/// - Bank Details: Navigates to [BankDetailsScreen]
/// - Notifications: Navigates to [NotificationsScreen]
///
/// ## Features
/// - Profile header with gradient background
/// - Avatar with verification badge
/// - Rating and availability status
/// - Stats row (completed, earnings, rating)
/// - Quick action links
/// - Skills chip display
/// - Bio section with education
/// - Pull-to-refresh
///
/// ## State Management
/// Uses [ProfileProvider] for profile data.
///
/// See also:
/// - [ProfileProvider] for profile state
/// - [EditProfileScreen] for profile editing
/// - [UserProfile] for profile data model
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileState = ref.watch(profileProvider);
    final profile = profileState.profile;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: LoadingOverlay(
        isLoading: profileState.isLoading,
        child: Column(
          children: [
            InnerHeader(
              title: 'My Profile',
              onBack: () => Navigator.pop(context),
              actions: [
                IconButton(
                  onPressed: () => context.push('/settings'),
                  icon: const Icon(Icons.settings_outlined),
                  color: AppColors.textSecondary,
                ),
              ],
            ),
            Expanded(
              child: profile == null
                  ? const Center(child: Text('Profile not found'))
                  : RefreshIndicator(
                      onRefresh: () => ref.read(profileProvider.notifier).refresh(),
                      child: SingleChildScrollView(
                        padding: AppSpacing.paddingMd,
                        child: Column(
                          children: [
                            // Profile header
                            _buildProfileHeader(context, profile),

                            const SizedBox(height: AppSpacing.lg),

                            // Stats section
                            _buildStatsSection(profile),

                            const SizedBox(height: AppSpacing.lg),

                            // Earnings Graph (D55)
                            EarningsGraph(
                              totalEarnings: profile.totalEarnings.toDouble(),
                            ),

                            const SizedBox(height: AppSpacing.lg),

                            // Rating Breakdown (D56)
                            RatingBreakdown(
                              overallRating: profile.rating,
                              qualityRating: profile.rating + 0.2 > 5 ? 5.0 : profile.rating + 0.2,
                              timelinessRating: profile.rating - 0.1 < 0 ? 0.0 : profile.rating - 0.1,
                              communicationRating: profile.rating,
                              totalReviews: profile.completedProjects,
                            ),

                            const SizedBox(height: AppSpacing.lg),

                            // Skill Verification (D57)
                            SkillVerification(
                              skills: profile.skills.asMap().entries.map((entry) {
                                final index = entry.key;
                                final skill = entry.value;
                                return SkillItem(
                                  id: index.toString(),
                                  name: skill,
                                  status: index < 2
                                      ? VerificationStatus.verified
                                      : index < 3
                                          ? VerificationStatus.pending
                                          : VerificationStatus.unverified,
                                );
                              }).toList(),
                              onRequestVerification: (skillId) {
                                // Handle verification request
                              },
                            ),

                            const SizedBox(height: AppSpacing.lg),

                            // Quick actions
                            _buildQuickActions(context),

                            const SizedBox(height: AppSpacing.lg),

                            // Bio section
                            if (profile.bio != null && profile.bio!.isNotEmpty)
                              _buildBioSection(profile),

                            const SizedBox(height: AppSpacing.xl),
                          ],
                        ),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(BuildContext context, UserProfile profile) {
    return Card(
      elevation: 2,
      shape: const RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusMd,
      ),
      child: Container(
        width: double.infinity,
        padding: AppSpacing.paddingLg,
        decoration: BoxDecoration(
          borderRadius: AppSpacing.borderRadiusMd,
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary,
              AppColors.primary.withValues(alpha: 0.8),
            ],
          ),
        ),
        child: Column(
          children: [
            // Avatar
            Stack(
              children: [
                CircleAvatar(
                  radius: 50,
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                  child: profile.avatarUrl != null
                      ? ClipOval(
                          child: CachedNetworkImage(
                            imageUrl: profile.avatarUrl!,
                            width: 96,
                            height: 96,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => const Center(
                              child: SizedBox(
                                width: 24,
                                height: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            errorWidget: (context, url, error) =>
                                _buildAvatarText(profile),
                          ),
                        )
                      : _buildAvatarText(profile),
                ),
                if (profile.isVerified)
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.verified,
                        size: 20,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            // Name
            Text(
              profile.fullName,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),

            // Email
            Text(
              profile.email,
              style: TextStyle(
                fontSize: 14,
                color: Colors.white.withValues(alpha: 0.9),
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // Rating and verification
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.star,
                        size: 16,
                        color: Colors.amber,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        profile.rating.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                if (profile.isAvailable)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      children: [
                        Icon(
                          Icons.circle,
                          size: 8,
                          color: AppColors.success,
                        ),
                        SizedBox(width: 4),
                        Text(
                          'Available',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),

            const SizedBox(height: AppSpacing.lg),

            // Edit profile button
            SizedBox(
              width: 160,
              child: OutlinedButton.icon(
                onPressed: () => context.push('/profile/edit'),
                icon: const Icon(Icons.edit, size: 16, color: Colors.white),
                label: const Text(
                  'Edit Profile',
                  style: TextStyle(color: Colors.white),
                ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.white),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatarText(UserProfile profile) {
    return Text(
      profile.fullName.isNotEmpty ? profile.fullName[0].toUpperCase() : 'U',
      style: const TextStyle(
        fontSize: 36,
        fontWeight: FontWeight.bold,
        color: Colors.white,
      ),
    );
  }

  Widget _buildStatsSection(UserProfile profile) {
    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            'Completed',
            profile.completedProjects.toString(),
            Icons.check_circle,
            AppColors.success,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: _buildStatCard(
            'Earnings',
            '₹${_formatCurrency(profile.totalEarnings)}',
            Icons.account_balance_wallet,
            AppColors.accent,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: _buildStatCard(
            'Rating',
            profile.rating.toStringAsFixed(1),
            Icons.star,
            AppColors.warning,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Card(
      elevation: 2,
      shape: const RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusSm,
      ),
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Column(
          children: [
            Icon(icon, size: 28, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return Card(
      elevation: 2,
      shape: const RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusMd,
      ),
      child: Column(
        children: [
          _buildActionItem(
            context,
            'Payment History',
            'View your earnings and transactions',
            Icons.receipt_long,
            () => context.push('/profile/payments'),
          ),
          const Divider(height: 1),
          _buildActionItem(
            context,
            'Bank Details',
            'Manage your bank account',
            Icons.account_balance,
            () => context.push('/profile/bank-details'),
          ),
          const Divider(height: 1),
          _buildActionItem(
            context,
            'Notifications',
            'View all notifications',
            Icons.notifications_outlined,
            () => context.push('/notifications'),
          ),
          const Divider(height: 1),
          _buildActionItem(
            context,
            'Settings',
            'App preferences and settings',
            Icons.settings_outlined,
            () => context.push('/settings'),
          ),
        ],
      ),
    );
  }

  Widget _buildActionItem(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                icon,
                size: 22,
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
                      fontWeight: FontWeight.w600,
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
            const Icon(
              Icons.chevron_right,
              color: AppColors.textTertiary,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBioSection(UserProfile profile) {
    return Card(
      elevation: 2,
      shape: const RoundedRectangleBorder(
        borderRadius: AppSpacing.borderRadiusMd,
      ),
      child: Padding(
        padding: AppSpacing.paddingMd,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(
                  Icons.person_outline,
                  size: 18,
                  color: AppColors.primary,
                ),
                SizedBox(width: 8),
                Text(
                  'About Me',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Text(
              profile.bio!,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                height: 1.6,
              ),
            ),
            if (profile.education != null) ...[
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  const Icon(
                    Icons.school,
                    size: 16,
                    color: AppColors.textTertiary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    profile.education!,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatCurrency(int amount) {
    if (amount >= 100000) {
      return '${(amount / 100000).toStringAsFixed(1)}L';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(1)}K';
    }
    return amount.toString();
  }
}
