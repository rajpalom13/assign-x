import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/marketplace_model.dart';
import '../../../providers/marketplace_provider.dart';
import '../widgets/banner_card.dart';
import '../widgets/item_card.dart';
import '../widgets/marketplace_filters.dart';
import '../widgets/text_card.dart';

/// Main marketplace/connect screen with Pinterest-style staggered grid.
class MarketplaceScreen extends ConsumerWidget {
  const MarketplaceScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final listingsAsync = ref.watch(marketplaceListingsProvider);
    final filters = ref.watch(marketplaceFilterProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(marketplaceListingsProvider);
          },
          child: CustomScrollView(
            slivers: [
              // App bar
              SliverAppBar(
                floating: true,
                backgroundColor: AppColors.background,
                elevation: 0,
                title: Text(
                  'Connect',
                  style: AppTextStyles.headingMedium,
                ),
                actions: [
                  IconButton(
                    onPressed: () {
                      // Navigate to create listing
                      context.push('/marketplace/create');
                    },
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.add,
                        color: Colors.white,
                        size: 20,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
              ),

              // Search bar
              const SliverToBoxAdapter(
                child: Column(
                  children: [
                    SizedBox(height: 8),
                    MarketplaceSearchBar(),
                    SizedBox(height: 16),
                  ],
                ),
              ),

              // Filters
              const SliverToBoxAdapter(
                child: MarketplaceFilters(),
              ),

              // Active filters display
              if (filters.hasFilters)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Text(
                          'Filtered results',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const Spacer(),
                        GestureDetector(
                          onTap: () {
                            ref
                                .read(marketplaceFilterProvider.notifier)
                                .clearFilters();
                          },
                          child: Text(
                            'Clear all',
                            style: AppTextStyles.labelSmall.copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              // Listings grid
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: listingsAsync.when(
                  data: (listings) {
                    if (listings.isEmpty) {
                      return SliverToBoxAdapter(
                        child: _EmptyState(
                          hasFilters: filters.hasFilters,
                          onClearFilters: () {
                            ref
                                .read(marketplaceFilterProvider.notifier)
                                .clearFilters();
                          },
                        ),
                      );
                    }

                    return _StaggeredGrid(listings: listings);
                  },
                  loading: () => const SliverToBoxAdapter(
                    child: _LoadingGrid(),
                  ),
                  error: (error, stack) => SliverToBoxAdapter(
                    child: _ErrorState(
                      error: error.toString(),
                      onRetry: () {
                        ref.invalidate(marketplaceListingsProvider);
                      },
                    ),
                  ),
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
    );
  }
}

/// Pinterest-style staggered grid of listings.
class _StaggeredGrid extends StatelessWidget {
  final List<MarketplaceListing> listings;

  const _StaggeredGrid({required this.listings});

  @override
  Widget build(BuildContext context) {
    return SliverMasonryGrid.count(
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childCount: listings.length,
      itemBuilder: (context, index) {
        final listing = listings[index];
        return _buildListingCard(context, listing);
      },
    );
  }

  Widget _buildListingCard(BuildContext context, MarketplaceListing listing) {
    // Determine card type based on listing type
    switch (listing.type) {
      case ListingType.product:
      case ListingType.housing:
        return ItemCard(
          listing: listing,
          onTap: () => _navigateToDetail(context, listing),
          onLike: () {
            // Toggle like
          },
        );

      case ListingType.communityPost:
      case ListingType.poll:
        return TextCard(
          listing: listing,
          onTap: () => _navigateToDetail(context, listing),
          onLike: () {
            // Toggle like
          },
          onComment: () => _navigateToDetail(context, listing),
        );

      case ListingType.event:
      case ListingType.opportunity:
        // Banner cards span full width - wrap in column
        return BannerCard(
          listing: listing,
          onTap: () => _navigateToDetail(context, listing),
          onApply: () {
            // Handle apply/register
          },
        );
    }
  }

  void _navigateToDetail(BuildContext context, MarketplaceListing listing) {
    context.push('/marketplace/${listing.id}');
  }
}

/// Loading skeleton grid.
class _LoadingGrid extends StatelessWidget {
  const _LoadingGrid();

  @override
  Widget build(BuildContext context) {
    return MasonryGridView.count(
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: 6,
      itemBuilder: (context, index) {
        return Container(
          height: index.isEven ? 200 : 250,
          decoration: BoxDecoration(
            color: AppColors.shimmerBase,
            borderRadius: BorderRadius.circular(12),
          ),
        );
      },
    );
  }
}

/// Empty state widget.
class _EmptyState extends StatelessWidget {
  final bool hasFilters;
  final VoidCallback onClearFilters;

  const _EmptyState({
    required this.hasFilters,
    required this.onClearFilters,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              hasFilters ? Icons.filter_list_off : Icons.inbox_outlined,
              size: 64,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 16),
            Text(
              hasFilters ? 'No results found' : 'No listings yet',
              style: AppTextStyles.headingSmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              hasFilters
                  ? 'Try adjusting your filters or search query'
                  : 'Be the first to post something!',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textTertiary,
              ),
              textAlign: TextAlign.center,
            ),
            if (hasFilters) ...[
              const SizedBox(height: 24),
              OutlinedButton(
                onPressed: onClearFilters,
                child: const Text('Clear Filters'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Error state widget.
class _ErrorState extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const _ErrorState({
    required this.error,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Something went wrong',
              style: AppTextStyles.headingSmall.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textTertiary,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: onRetry,
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Category header for separated sections.
class CategoryHeader extends StatelessWidget {
  final MarketplaceCategory category;
  final VoidCallback? onSeeAll;

  const CategoryHeader({
    super.key,
    required this.category,
    this.onSeeAll,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              category.icon,
              size: 18,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  category.label,
                  style: AppTextStyles.labelLarge,
                ),
                Text(
                  category.description,
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          if (onSeeAll != null)
            TextButton(
              onPressed: onSeeAll,
              child: Text(
                'See all',
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.primary,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
