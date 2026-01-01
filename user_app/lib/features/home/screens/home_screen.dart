import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_colors.dart';
import '../../../providers/home_provider.dart';
import '../../../providers/profile_provider.dart';
import '../widgets/campus_pulse_section.dart';
import '../widgets/home_app_bar.dart';
import '../widgets/promo_banner_carousel.dart';
import '../widgets/services_grid.dart';

/// Home screen with dashboard content.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            // Refresh providers
            ref.invalidate(bannersProvider);
            ref.invalidate(walletProvider);
            ref.invalidate(unreadCountProvider);
          },
          child: CustomScrollView(
            slivers: [
              // App Bar
              const SliverToBoxAdapter(
                child: HomeAppBar(),
              ),

              const SliverToBoxAdapter(
                child: SizedBox(height: 16),
              ),

              // Promotional Banners
              const SliverToBoxAdapter(
                child: PromoBannerCarousel(),
              ),

              const SliverToBoxAdapter(
                child: SizedBox(height: 24),
              ),

              // Services Grid
              const SliverToBoxAdapter(
                child: ServicesGrid(),
              ),

              const SliverToBoxAdapter(
                child: SizedBox(height: 24),
              ),

              // Campus Pulse
              const SliverToBoxAdapter(
                child: CampusPulseSection(),
              ),

              // Bottom padding
              const SliverToBoxAdapter(
                child: SizedBox(height: 100),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
