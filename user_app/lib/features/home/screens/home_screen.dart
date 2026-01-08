import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_colors.dart';
import '../../../providers/home_provider.dart';
import '../../../providers/profile_provider.dart';
import '../../../shared/animations/common_animations.dart';
import '../../../shared/decorations/app_gradients.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/skeleton_loader.dart';
import '../widgets/campus_pulse_section.dart';
import '../widgets/home_app_bar.dart';
import '../widgets/promo_banner_carousel.dart';
import '../widgets/services_grid.dart';

/// Home screen with dashboard content.
///
/// Uses the new UI polish system with:
/// - AnimatedMeshBackground for dynamic background
/// - SkeletonLoader for loading states
/// - EmptyStateVariants for error states
/// - Staggered animations for content entrance
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _hasError = false;

  @override
  Widget build(BuildContext context) {
    // Watch providers for loading states
    final bannersAsync = ref.watch(bannersProvider);
    final walletAsync = ref.watch(walletProvider);

    // Determine if we're in a loading state
    final isLoading = bannersAsync.isLoading || walletAsync.isLoading;

    // Check for errors
    _hasError = bannersAsync.hasError || walletAsync.hasError;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: AnimatedMeshBackground(
        backgroundColor: AppColors.background,
        colors: [
          AppColors.primary.withAlpha(30),
          AppColors.accent.withAlpha(25),
          AppColors.primaryLight.withAlpha(20),
          AppColors.gradientEnd.withAlpha(15),
        ],
        blur: 120,
        duration: const Duration(seconds: 15),
        child: SafeArea(
          child: RefreshIndicator(
            onRefresh: () async {
              // Refresh providers
              ref.invalidate(bannersProvider);
              ref.invalidate(walletProvider);
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
                      SliverToBoxAdapter(
                        child: const HomeAppBar().fadeInSlideDown(
                          duration: const Duration(milliseconds: 400),
                        ),
                      ),

                      const SliverToBoxAdapter(
                        child: SizedBox(height: 16),
                      ),

                      // Promotional Banners
                      SliverToBoxAdapter(
                        child: isLoading
                            ? _buildBannerSkeleton()
                            : const PromoBannerCarousel().fadeInSlideUp(
                                delay: const Duration(milliseconds: 100),
                                duration: const Duration(milliseconds: 400),
                              ),
                      ),

                      const SliverToBoxAdapter(
                        child: SizedBox(height: 24),
                      ),

                      // Services Grid
                      SliverToBoxAdapter(
                        child: isLoading
                            ? _buildServicesGridSkeleton()
                            : const ServicesGrid().fadeInSlideUp(
                                delay: const Duration(milliseconds: 200),
                                duration: const Duration(milliseconds: 400),
                              ),
                      ),

                      const SliverToBoxAdapter(
                        child: SizedBox(height: 24),
                      ),

                      // Campus Pulse
                      SliverToBoxAdapter(
                        child: isLoading
                            ? _buildCampusPulseSkeleton()
                            : const CampusPulseSection().fadeInSlideUp(
                                delay: const Duration(milliseconds: 300),
                                duration: const Duration(milliseconds: 400),
                              ),
                      ),

                      // Bottom padding
                      const SliverToBoxAdapter(
                        child: SizedBox(height: 100),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  /// Error state with retry option.
  Widget _buildErrorState() {
    return Center(
      child: EmptyStateVariants.networkError(
        onRetry: () {
          ref.invalidate(bannersProvider);
          ref.invalidate(walletProvider);
          ref.invalidate(unreadCountProvider);
          setState(() => _hasError = false);
        },
      ),
    );
  }

  /// Banner carousel skeleton loader.
  Widget _buildBannerSkeleton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        height: 160,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A54442B),
              blurRadius: 6,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: const SkeletonLoader(
          height: 160,
          borderRadius: 16,
        ),
      ),
    );
  }

  /// Services grid skeleton loader.
  Widget _buildServicesGridSkeleton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section title skeleton
          const SkeletonLoader(
            width: 80,
            height: 20,
            borderRadius: 4,
          ),
          const SizedBox(height: 12),
          // Grid skeleton
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.1,
            ),
            itemCount: 4,
            itemBuilder: (context, index) => CardSkeleton(
              height: 130,
              borderRadius: 16,
              showImage: false,
              textLines: 2,
              padding: const EdgeInsets.all(16),
            ),
          ),
        ],
      ),
    );
  }

  /// Campus pulse skeleton loader.
  Widget _buildCampusPulseSkeleton() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section title skeleton
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              SkeletonLoader(
                width: 120,
                height: 20,
                borderRadius: 4,
              ),
              SkeletonLoader(
                width: 60,
                height: 16,
                borderRadius: 4,
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Horizontal list skeleton
          SizedBox(
            height: 100,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: 3,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) => const CardSkeleton(
                width: 200,
                height: 100,
                showImage: false,
                textLines: 2,
                padding: EdgeInsets.all(12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Loading overlay widget for transitions.
class HomeLoadingOverlay extends StatelessWidget {
  const HomeLoadingOverlay({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background.withAlpha(200),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Custom loading animation
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x1454442B),
                    blurRadius: 20,
                    offset: Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Animated logo or icon
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      gradient: AppGradients.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      Icons.home_rounded,
                      color: Colors.white,
                      size: 32,
                    ),
                  ).pulse(
                    duration: const Duration(milliseconds: 1200),
                    scale: 1.05,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Loading...',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
