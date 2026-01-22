import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/marketplace_model.dart';
import '../../../providers/marketplace_provider.dart';
import '../../../shared/widgets/glass_container.dart';
import '../widgets/campus_connect_hero.dart';
import '../widgets/filter_tabs_bar.dart';
import '../widgets/post_card.dart';
import '../widgets/search_bar_widget.dart';

/// Campus Connect screen with staggered feed of community content.
///
/// Features a gradient hero section with chat icon, search functionality,
/// filter tabs, and a Pinterest-style staggered grid of various post types.
class CampusConnectScreen extends ConsumerStatefulWidget {
  const CampusConnectScreen({super.key});

  @override
  ConsumerState<CampusConnectScreen> createState() =>
      _CampusConnectScreenState();
}

class _CampusConnectScreenState extends ConsumerState<CampusConnectScreen> {
  CampusConnectCategory? _selectedCategory;
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final listingsAsync = ref.watch(marketplaceListingsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(marketplaceListingsProvider);
        },
        child: CustomScrollView(
          slivers: [
            // Gradient hero section with chat icon
            const SliverToBoxAdapter(
              child: CampusConnectHero(),
            ),

            // Search bar
            SliverToBoxAdapter(
              child: SearchBarWidget(
                initialValue: _searchQuery,
                onChanged: (value) {
                  setState(() {
                    _searchQuery = value;
                  });
                },
              ),
            ),

            // Filter tabs
            SliverToBoxAdapter(
              child: FilterTabsBar(
                selectedCategory: _selectedCategory,
                onCategoryChanged: (category) {
                  setState(() {
                    _selectedCategory = category;
                  });
                },
              ),
            ),

            // Staggered posts grid
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: listingsAsync.when(
                data: (listings) {
                  // Filter listings based on selected category and search
                  final filteredListings = _filterListings(listings);

                  if (filteredListings.isEmpty) {
                    return SliverToBoxAdapter(
                      child: _EmptyState(
                        hasFilters: _selectedCategory != null ||
                            _searchQuery.isNotEmpty,
                        onClearFilters: () {
                          setState(() {
                            _selectedCategory = null;
                            _searchQuery = '';
                          });
                        },
                      ),
                    );
                  }

                  return _StaggeredPostsGrid(listings: filteredListings);
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

            // Bottom padding for navigation
            const SliverToBoxAdapter(
              child: SizedBox(height: 120),
            ),
          ],
        ),
      ),
    );
  }

  /// Filter listings based on category and search query.
  List<MarketplaceListing> _filterListings(List<MarketplaceListing> listings) {
    var filtered = listings;

    // Filter by category
    if (_selectedCategory != null) {
      filtered = filtered.where((listing) {
        switch (_selectedCategory!) {
          case CampusConnectCategory.community:
            return listing.type == ListingType.communityPost ||
                listing.type == ListingType.poll;
          case CampusConnectCategory.opportunities:
            return listing.type == ListingType.event ||
                listing.type == ListingType.opportunity;
          case CampusConnectCategory.products:
            return listing.type == ListingType.product;
          case CampusConnectCategory.housing:
            return listing.type == ListingType.housing;
        }
      }).toList();
    }

    // Filter by search query
    if (_searchQuery.isNotEmpty) {
      filtered = filtered.where((listing) {
        return listing.title
                .toLowerCase()
                .contains(_searchQuery.toLowerCase()) ||
            (listing.description
                    ?.toLowerCase()
                    .contains(_searchQuery.toLowerCase()) ??
                false);
      }).toList();
    }

    return filtered;
  }
}

/// Staggered grid of post cards.
class _StaggeredPostsGrid extends StatelessWidget {
  final List<MarketplaceListing> listings;

  const _StaggeredPostsGrid({required this.listings});

  @override
  Widget build(BuildContext context) {
    return SliverMasonryGrid.count(
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childCount: listings.length,
      itemBuilder: (context, index) {
        final listing = listings[index];
        return _buildPostCard(context, listing, index);
      },
    );
  }

  /// Build appropriate post card based on listing type.
  Widget _buildPostCard(BuildContext context, MarketplaceListing listing, int index) {
    switch (listing.type) {
      case ListingType.communityPost:
      case ListingType.poll:
        // Randomly show help posts vs discussion posts for variety
        if (index.isEven && listing.commentCount < 3) {
          return HelpPostCard(
            listing: listing,
            onTap: () => _navigateToDetail(context, listing),
            onAnswer: () => _navigateToDetail(context, listing),
          );
        }
        return DiscussionPostCard(
          listing: listing,
          onTap: () => _navigateToDetail(context, listing),
          onLike: () {
            // Toggle like
          },
          onComment: () => _navigateToDetail(context, listing),
        );

      case ListingType.event:
      case ListingType.opportunity:
        return EventPostCard(
          listing: listing,
          onTap: () => _navigateToDetail(context, listing),
          onRsvp: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('RSVP confirmed!'),
                backgroundColor: AppColors.success,
              ),
            );
          },
        );

      case ListingType.product:
        return ProductPostCard(
          listing: listing,
          onTap: () => _navigateToDetail(context, listing),
          onLike: () {
            // Toggle like
          },
        );

      case ListingType.housing:
        return HousingPostCard(
          listing: listing,
          onTap: () => _navigateToDetail(context, listing),
          onContact: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Opening chat...'),
              ),
            );
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
        return GlassCard(
          blur: 8,
          opacity: 0.6,
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Skeleton content
              Container(
                height: 12,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              const SizedBox(height: 8),
              Container(
                height: 12,
                width: 100,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              const SizedBox(height: 12),
              Container(
                height: 8,
                width: 60,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ],
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
    return GlassCard(
      blur: 15,
      opacity: 0.7,
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              shape: BoxShape.circle,
            ),
            child: Icon(
              hasFilters ? Icons.filter_list_off : Icons.inbox_outlined,
              size: 48,
              color: AppColors.textTertiary,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            hasFilters ? 'No posts found' : 'No posts yet',
            style: AppTextStyles.headingSmall.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            hasFilters
                ? 'Try adjusting your filters or search'
                : 'Be the first to post!',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textTertiary,
            ),
            textAlign: TextAlign.center,
          ),
          if (hasFilters) ...[
            const SizedBox(height: 24),
            GestureDetector(
              onTap: onClearFilters,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withAlpha(60),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.filter_alt_off,
                      color: Colors.white,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Clear Filters',
                      style: AppTextStyles.labelMedium.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
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
    return GlassCard(
      blur: 15,
      opacity: 0.7,
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.errorLight,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.error_outline_rounded,
              size: 48,
              color: AppColors.error,
            ),
          ),
          const SizedBox(height: 20),
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
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: onRetry,
            child: Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 24,
                vertical: 12,
              ),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withAlpha(60),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.refresh_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Try Again',
                    style: AppTextStyles.labelMedium.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
