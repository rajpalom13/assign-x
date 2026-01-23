import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_staggered_grid_view/flutter_staggered_grid_view.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/marketplace_model.dart';
import '../../../providers/marketplace_provider.dart';
import '../widgets/campus_connect_hero.dart';
import '../widgets/filter_tabs_bar.dart';
import '../widgets/post_card.dart';
import '../widgets/search_bar_widget.dart';

/// Campus Connect screen with staggered feed of community content.
///
/// Features a header bar, gradient hero section with chat icon, search functionality,
/// filter tabs, listings count, and a Pinterest-style staggered grid of various post types.
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
      // Transparent to show SubtleGradientScaffold from MainShell
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(marketplaceListingsProvider);
            },
            child: CustomScrollView(
              slivers: [
                // Header bar
                SliverToBoxAdapter(
                  child: CampusConnectHeader(
                    walletBalance: 10100,
                    onNotificationTap: () {
                      // Handle notification tap
                    },
                    onWalletTap: () {
                      // Handle wallet tap
                    },
                  ),
                ),

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
                    onFilterTap: () {
                      // Show filter bottom sheet
                      _showFilterSheet(context);
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

                // Listings count
                SliverToBoxAdapter(
                  child: listingsAsync.when(
                    data: (listings) {
                      final filteredCount = _filterListings(listings).length;
                      return _ListingsCount(count: filteredCount);
                    },
                    loading: () => const _ListingsCount(count: 0),
                    error: (error, stackTrace) => const SizedBox.shrink(),
                  ),
                ),

                // Staggered posts grid
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
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

          // Floating Action Button
          Positioned(
            bottom: 100,
            right: 20,
            child: _FloatingActionButton(
              onTap: () {
                // Handle FAB tap - create new post
                context.push('/marketplace/create');
              },
            ),
          ),
        ],
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

  void _showFilterSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Filter Posts',
              style: AppTextStyles.headingSmall.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: CampusConnectCategory.values.map((category) {
                final isSelected = _selectedCategory == category;
                return Material(
                  color: isSelected
                      ? AppColors.textPrimary
                      : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  child: InkWell(
                    onTap: () {
                      setState(() {
                        _selectedCategory =
                            isSelected ? null : category;
                      });
                      Navigator.pop(context);
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.textPrimary
                              : AppColors.border,
                        ),
                      ),
                      child: Text(
                        category.label,
                        style: TextStyle(
                          color: isSelected
                              ? Colors.white
                              : AppColors.textPrimary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

/// Listings count display.
class _ListingsCount extends StatelessWidget {
  final int count;

  const _ListingsCount({required this.count});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 4, bottom: 16),
      child: Center(
        child: Text(
          'Showing $count listings',
          style: AppTextStyles.bodySmall.copyWith(
            color: const Color(0xFF8B8B8B),
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

/// Floating action button.
class _FloatingActionButton extends StatelessWidget {
  final VoidCallback onTap;

  const _FloatingActionButton({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.darkBrown,
      shape: const CircleBorder(),
      elevation: 6,
      shadowColor: Colors.black.withAlpha(40),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: Container(
          width: 56,
          height: 56,
          alignment: Alignment.center,
          child: const Icon(
            Icons.add,
            color: Colors.white,
            size: 28,
          ),
        ),
      ),
    );
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
  Widget _buildPostCard(
      BuildContext context, MarketplaceListing listing, int index) {
    switch (listing.type) {
      case ListingType.communityPost:
      case ListingType.poll:
        // Show help posts for some community posts based on certain criteria
        if (_shouldShowAsHelpPost(listing, index)) {
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

      case ListingType.opportunity:
        return OpportunityPostCard(
          listing: listing,
          onTap: () => _navigateToDetail(context, listing),
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

  /// Determine if a community post should be shown as a help post.
  bool _shouldShowAsHelpPost(MarketplaceListing listing, int index) {
    final title = listing.title.toLowerCase();
    // Show as help post if title contains help-related keywords
    return title.contains('struggling') ||
        title.contains('help') ||
        title.contains('difficult') ||
        title.contains('problem') ||
        title.contains('issue') ||
        (index % 5 == 1 && listing.commentCount < 3);
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
        // Varying heights for masonry effect
        final height = index.isEven ? 160.0 : 200.0;
        return Container(
          height: height,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(10),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Icon area skeleton
              Container(
                height: index.isEven ? 80 : 100,
                decoration: const BoxDecoration(
                  color: Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(16),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 14,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8E8E8),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 12,
                      width: 80,
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8E8E8),
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ],
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
    return Container(
      padding: const EdgeInsets.all(32),
      margin: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: Color(0xFFF5F5F5),
              shape: BoxShape.circle,
            ),
            child: Icon(
              hasFilters ? Icons.filter_list_off : Icons.inbox_outlined,
              size: 48,
              color: const Color(0xFF9B9B9B),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            hasFilters ? 'No posts found' : 'No posts yet',
            style: AppTextStyles.headingSmall.copyWith(
              color: const Color(0xFF6B6B6B),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            hasFilters
                ? 'Try adjusting your filters or search'
                : 'Be the first to post!',
            style: AppTextStyles.bodyMedium.copyWith(
              color: const Color(0xFF9B9B9B),
            ),
            textAlign: TextAlign.center,
          ),
          if (hasFilters) ...[
            const SizedBox(height: 24),
            Material(
              color: AppColors.darkBrown,
              borderRadius: BorderRadius.circular(12),
              child: InkWell(
                onTap: onClearFilters,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
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
    return Container(
      padding: const EdgeInsets.all(32),
      margin: const EdgeInsets.symmetric(vertical: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
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
              color: const Color(0xFF6B6B6B),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            error,
            style: AppTextStyles.bodySmall.copyWith(
              color: const Color(0xFF9B9B9B),
            ),
            textAlign: TextAlign.center,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 24),
          Material(
            color: AppColors.darkBrown,
            borderRadius: BorderRadius.circular(12),
            child: InkWell(
              onTap: onRetry,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
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
          ),
        ],
      ),
    );
  }
}
