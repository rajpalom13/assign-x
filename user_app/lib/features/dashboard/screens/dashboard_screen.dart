import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../data/models/project_model.dart';
import '../../../providers/home_provider.dart';
import '../../../providers/profile_provider.dart';
import '../../../providers/project_provider.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/mesh_gradient_background.dart';
import '../../../shared/widgets/skeleton_loader.dart';
import '../../home/widgets/home_app_bar.dart';
import '../widgets/bottom_nav_bar.dart';
import '../widgets/dashboard_action_card.dart';
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
  bool _hasError = false;
  int _currentNavIndex = 0;

  @override
  Widget build(BuildContext context) {
    // Watch providers for data
    final walletAsync = ref.watch(walletProvider);
    final projectsAsync = ref.watch(projectsProvider);
    final profileAsync = ref.watch(userProfileProvider);
    final profile = profileAsync.valueOrNull;

    // Determine loading state
    final isLoading = walletAsync.isLoading || projectsAsync.isLoading;

    // Check for errors
    _hasError = walletAsync.hasError || projectsAsync.hasError;

    // Get projects that need attention (payment_pending, quoted, delivered)
    final needsAttentionProjects = projectsAsync.valueOrNull
            ?.where((p) =>
                p.status == ProjectStatus.paymentPending ||
                p.status == ProjectStatus.quoted ||
                p.status == ProjectStatus.delivered)
            .toList() ??
        [];

    // Get active projects count
    final activeProjectsCount = projectsAsync.valueOrNull
            ?.where((p) =>
                p.status == ProjectStatus.inProgress ||
                p.status == ProjectStatus.assigned ||
                p.status == ProjectStatus.paid)
            .length ??
        0;

    // Get wallet balance
    final walletBalance = walletAsync.valueOrNull?.balance ?? 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Gradient background with creamy, orangish, purplish colors
          MeshGradientBackground(
            position: MeshPosition.bottomRight,
            colors: const [
              Color(0xFFFBE8E8), // Soft pink (creamy)
              Color(0xFFFCEDE8), // Soft peach (orangish)
              Color(0xFFF0E8F8), // Soft purple
            ],
            opacity: 0.5,
            child: SafeArea(
              bottom: false, // Don't apply SafeArea to bottom (for fixed navbar)
              child: RefreshIndicator(
                onRefresh: () async {
                  ref.invalidate(walletProvider);
                  ref.invalidate(projectsProvider);
                  ref.invalidate(unreadCountProvider);
                  setState(() => _hasError = false);
                },
                color: AppColors.primary,
                backgroundColor: AppColors.surface,
                child: _hasError
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
                            child: SizedBox(height: 24),
                          ),

                          // Needs Attention Section
                          if (needsAttentionProjects.isNotEmpty)
                            SliverToBoxAdapter(
                              child: NeedsAttentionSection(
                                projects: needsAttentionProjects,
                                onProjectTap: (project) =>
                                    context.push('/projects/${project.id}'),
                              ),
                            ),
                          if (needsAttentionProjects.isNotEmpty)
                            const SliverToBoxAdapter(
                              child: SizedBox(height: 24),
                            ),

                          // Quick Actions Grid (2x2)
                          SliverToBoxAdapter(
                            child: isLoading
                                ? _buildActionGridSkeleton()
                                : _buildActionGrid(
                                    activeProjectsCount: activeProjectsCount,
                                    walletBalance: walletBalance,
                                  ),
                          ),

                          // Bottom padding for fixed navbar
                          const SliverToBoxAdapter(
                            child: SizedBox(height: 140),
                          ),
                        ],
                      ),
              ),
            ),
          ),

          // Fixed Bottom Navigation Bar
          BottomNavBar(
            currentIndex: _currentNavIndex,
            onTap: _handleNavigation,
          ),
        ],
      ),
    );
  }

  /// Builds the 2x2 action grid with cards.
  Widget _buildActionGrid({
    required int activeProjectsCount,
    required double walletBalance,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Quick Actions',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),

          // First row: New Project (large gradient) + Plagiarism Check
          Row(
            children: [
              Expanded(
                flex: 3,
                child: DashboardActionCardVariants.primary(
                  icon: Icons.add_circle_outline_rounded,
                  title: 'New Project',
                  subtitle: 'Create assignment',
                  onTap: () => context.push('/new-project'),
                  animationDelay: const Duration(milliseconds: 150),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: DashboardActionCard(
                  icon: Icons.plagiarism_outlined,
                  title: 'Plagiarism',
                  subtitle: 'Check work',
                  onTap: () => context.push('/plagiarism-check'),
                  animationDelay: const Duration(milliseconds: 200),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Second row: Generate Content + Active Projects Stats
          Row(
            children: [
              Expanded(
                child: DashboardActionCard(
                  icon: Icons.auto_awesome_outlined,
                  title: 'Generate',
                  subtitle: 'AI Content',
                  onTap: () => context.push('/generate-content'),
                  animationDelay: const Duration(milliseconds: 250),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DashboardActionCardVariants.stats(
                  icon: Icons.folder_open_rounded,
                  value: activeProjectsCount.toString(),
                  label: 'Active Projects',
                  iconColor: AppColors.info,
                  onTap: () {
                    ref.read(selectedProjectTabProvider.notifier).state = 1;
                    context.push('/my-projects');
                  },
                  animationDelay: const Duration(milliseconds: 300),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Third row: Insights + Wallet Balance
          Row(
            children: [
              Expanded(
                child: DashboardActionCard(
                  icon: Icons.insights_outlined,
                  title: 'Insights',
                  subtitle: 'Analytics',
                  onTap: () => context.push('/insights'),
                  animationDelay: const Duration(milliseconds: 350),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: DashboardActionCardVariants.stats(
                  icon: Icons.account_balance_wallet_rounded,
                  value: '\u20B9${walletBalance.toStringAsFixed(0)}',
                  label: 'Wallet Balance',
                  iconColor: AppColors.success,
                  onTap: () => context.push('/wallet'),
                  animationDelay: const Duration(milliseconds: 400),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Builds skeleton loader for action grid.
  Widget _buildActionGridSkeleton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SkeletonLoader(width: 100, height: 16, borderRadius: 4),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                flex: 3,
                child: CardSkeleton(
                  height: 140,
                  borderRadius: 16,
                  showImage: false,
                  textLines: 2,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: CardSkeleton(
                  height: 140,
                  borderRadius: 16,
                  showImage: false,
                  textLines: 2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: CardSkeleton(
                  height: 140,
                  borderRadius: 16,
                  showImage: false,
                  textLines: 2,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CardSkeleton(
                  height: 140,
                  borderRadius: 16,
                  showImage: false,
                  textLines: 2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: CardSkeleton(
                  height: 140,
                  borderRadius: 16,
                  showImage: false,
                  textLines: 2,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CardSkeleton(
                  height: 140,
                  borderRadius: 16,
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
          setState(() => _hasError = false);
        },
      ),
    );
  }

  /// Handles bottom navigation tap.
  void _handleNavigation(int index) {
    setState(() => _currentNavIndex = index);

    switch (index) {
      case 0:
        // Home - already here
        break;
      case 1:
        context.push('/my-projects');
        break;
      case 2:
        context.push('/wallet');
        break;
      case 3:
        context.push('/profile');
        break;
    }
  }
}
