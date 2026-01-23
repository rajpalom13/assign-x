import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../data/models/project_model.dart';
import '../../../providers/home_provider.dart';
import '../../../providers/profile_provider.dart';
import '../../../providers/project_provider.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/skeleton_loader.dart';
import '../../home/widgets/home_app_bar.dart';
import '../widgets/greeting_section.dart';
import '../widgets/needs_attention_card.dart';

/// Dashboard screen with modern UI design.
///
/// Features:
/// - Time-based personalized greeting
/// - 2x2 grid of action cards (New Project, Plagiarism Check, Generate Content, Insights)
/// - Needs Attention horizontal scrolling list
/// - Subtle gradient background (creamy, orangish, purplish)
/// - Fixed bottom navigation bar (30-50px from bottom)
/// - Smooth animations and glass morphism effects
///
/// Uses Riverpod for state management and responsive to wallet, projects, and profile data.
class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    // Watch providers for data
    final walletAsync = ref.watch(walletProvider);
    final projectsAsync = ref.watch(projectsProvider);
    final profileAsync = ref.watch(userProfileProvider);
    final profile = profileAsync.valueOrNull;

    // Determine loading state
    final isLoading = walletAsync.isLoading || projectsAsync.isLoading;

    // Check for errors (local variable, not state mutation in build)
    final hasError = walletAsync.hasError || projectsAsync.hasError;

    // Get projects that need attention (payment_pending, quoted, delivered)
    final needsAttentionProjects = projectsAsync.valueOrNull
            ?.where((p) =>
                p.status == ProjectStatus.paymentPending ||
                p.status == ProjectStatus.quoted ||
                p.status == ProjectStatus.delivered)
            .toList() ??
        [];

    return Scaffold(
      // Transparent to show SubtleGradientScaffold from MainShell
      backgroundColor: Colors.transparent,
      body: SafeArea(
        bottom: false, // Don't apply SafeArea to bottom (for fixed navbar)
        child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(walletProvider);
                ref.invalidate(projectsProvider);
                ref.invalidate(unreadCountProvider);
              },
              color: AppColors.primary,
              backgroundColor: Colors.white,
              child: hasError
                  ? _buildErrorState()
                  : CustomScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      slivers: [
                        // App Bar
                        const SliverToBoxAdapter(
                          child: HomeAppBar(),
                        ),
                        const SliverToBoxAdapter(
                          child: SizedBox(height: 24),
                        ),

                        // Greeting Section
                        SliverToBoxAdapter(
                          child: GreetingSection(
                            userName: profile?.fullName,
                            isLoading: isLoading,
                            animationDelay:
                                const Duration(milliseconds: 50),
                          ),
                        ),
                        const SliverToBoxAdapter(
                          child: SizedBox(height: 28),
                        ),

                        // Quick Actions Grid (2x2) - comes before Needs Attention
                        SliverToBoxAdapter(
                          child: isLoading
                              ? _buildActionGridSkeleton()
                              : _buildActionGrid(),
                        ),

                        // Needs Attention Section
                        if (needsAttentionProjects.isNotEmpty)
                          const SliverToBoxAdapter(
                            child: SizedBox(height: 28),
                          ),
                        if (needsAttentionProjects.isNotEmpty)
                          SliverToBoxAdapter(
                            child: NeedsAttentionSection(
                              projects: needsAttentionProjects,
                              onProjectTap: (project) =>
                                  context.push('/projects/${project.id}'),
                            ),
                          ),

                        // Bottom padding for fixed navbar
                        const SliverToBoxAdapter(
                          child: SizedBox(height: 120),
                        ),
                      ],
                    ),
            ),
      ),
    );
  }

  /// Builds the 2x2 action grid with cards per design spec.
  Widget _buildActionGrid() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // First row: New Project + Plagiarism Check
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  icon: Icons.add,
                  title: 'New Project',
                  subtitle: 'Start a new AI-driven initiative.',
                  onTap: () => context.push('/new-project'),
                  animationDelay: const Duration(milliseconds: 150),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: _buildActionCard(
                  icon: Icons.verified_user_outlined,
                  title: 'Plagiarism Check',
                  subtitle: 'Ensure content originality.',
                  onTap: () => context.push('/plagiarism-check'),
                  animationDelay: const Duration(milliseconds: 200),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Second row: Generate Content + Insights
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  icon: Icons.auto_fix_high,
                  title: 'Generate Content',
                  subtitle: 'Create high-quality text.',
                  onTap: () => context.push('/generate-content'),
                  animationDelay: const Duration(milliseconds: 250),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: _buildActionCard(
                  icon: Icons.bar_chart_rounded,
                  title: 'Insights',
                  subtitle: 'Analyze key metrics.',
                  onTap: () => context.push('/insights'),
                  animationDelay: const Duration(milliseconds: 300),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Builds a single action card matching design spec.
  Widget _buildActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Duration? animationDelay,
  }) {
    Widget card = Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      elevation: 0,
      child: Ink(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon
                Icon(
                  icon,
                  size: 26,
                  color: AppColors.textPrimary,
                ),
                const SizedBox(height: 16),
                // Title
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                // Subtitle
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w400,
                    color: AppColors.textTertiary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    if (animationDelay != null) {
      return TweenAnimationBuilder<double>(
        tween: Tween(begin: 0.0, end: 1.0),
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeOutCubic,
        builder: (context, value, child) {
          return Opacity(
            opacity: value,
            child: Transform.translate(
              offset: Offset(0, 20 * (1 - value)),
              child: child,
            ),
          );
        },
        child: card,
      );
    }

    return card;
  }

  /// Builds skeleton loader for action grid (2x2).
  Widget _buildActionGridSkeleton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // First row
          Row(
            children: [
              Expanded(
                child: CardSkeleton(
                  height: 120,
                  borderRadius: 18,
                  showImage: false,
                  textLines: 2,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: CardSkeleton(
                  height: 120,
                  borderRadius: 18,
                  showImage: false,
                  textLines: 2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Second row
          Row(
            children: [
              Expanded(
                child: CardSkeleton(
                  height: 120,
                  borderRadius: 18,
                  showImage: false,
                  textLines: 2,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: CardSkeleton(
                  height: 120,
                  borderRadius: 18,
                  showImage: false,
                  textLines: 2,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Builds error state with retry option.
  Widget _buildErrorState() {
    return Center(
      child: EmptyStateVariants.networkError(
        onRetry: () {
          ref.invalidate(walletProvider);
          ref.invalidate(projectsProvider);
          ref.invalidate(unreadCountProvider);
        },
      ),
    );
  }

}
