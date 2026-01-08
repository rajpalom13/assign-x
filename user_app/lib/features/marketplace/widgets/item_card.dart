import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_shadows.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/marketplace_model.dart';
import '../../../shared/animations/common_animations.dart';
import '../../../shared/widgets/skeleton_loader.dart';

/// Pinterest-style item card for marketplace listings.
///
/// Uses the new UI polish system with:
/// - AppShadows for elevation
/// - TapScaleContainer for press animations
/// - SkeletonLoader for loading placeholders
/// - AppColors for consistent theming
class ItemCard extends StatefulWidget {
  final MarketplaceListing listing;
  final VoidCallback? onTap;
  final VoidCallback? onLike;

  const ItemCard({
    super.key,
    required this.listing,
    this.onTap,
    this.onLike,
  });

  @override
  State<ItemCard> createState() => _ItemCardState();
}

class _ItemCardState extends State<ItemCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return TapScaleContainer(
      onTap: widget.onTap,
      pressedScale: 0.97,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOutCubic,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            boxShadow: _isHovered ? AppShadows.cardHover : AppShadows.md,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image section
              if (widget.listing.hasImages)
                ClipRRect(
                  borderRadius:
                      const BorderRadius.vertical(top: Radius.circular(12)),
                  child: Stack(
                    children: [
                      // Product image with skeleton loading
                      CachedNetworkImage(
                        imageUrl: widget.listing.primaryImage!,
                        fit: BoxFit.cover,
                        width: double.infinity,
                        placeholder: (context, url) => const SkeletonLoader(
                          height: 120,
                          borderRadius: 0,
                        ),
                        errorWidget: (context, url, error) => Container(
                          height: 120,
                          color: AppColors.surfaceVariant,
                          child: Icon(
                            Icons.image_not_supported_outlined,
                            color: AppColors.textTertiary,
                          ),
                        ),
                      ),

                      // Price tag with glass effect
                      if (widget.listing.price != null)
                        Positioned(
                          left: 8,
                          bottom: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.textPrimary.withAlpha(200),
                              borderRadius: BorderRadius.circular(6),
                              boxShadow: AppShadows.sm,
                            ),
                            child: Text(
                              widget.listing.priceString,
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.textOnPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),

                      // Animated like button
                      Positioned(
                        right: 8,
                        top: 8,
                        child: _LikeButton(
                          isLiked: widget.listing.isLiked,
                          onTap: widget.onLike,
                        ),
                      ),

                      // Negotiable badge
                      if (widget.listing.isNegotiable)
                        Positioned(
                          right: 8,
                          bottom: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.success,
                              borderRadius: BorderRadius.circular(4),
                              boxShadow: AppShadows.xs,
                            ),
                            child: Text(
                              'Negotiable',
                              style: AppTextStyles.caption.copyWith(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

              // Content section
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      widget.listing.title,
                      style: AppTextStyles.labelMedium.copyWith(
                        height: 1.2,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),

                    // Location and distance
                    if (widget.listing.location != null || widget.listing.distanceKm != null)
                      Row(
                        children: [
                          Icon(
                            Icons.location_on_outlined,
                            size: 12,
                            color: AppColors.textTertiary,
                          ),
                          const SizedBox(width: 2),
                          Expanded(
                            child: Text(
                              widget.listing.distanceString ?? widget.listing.location ?? '',
                              style: AppTextStyles.caption.copyWith(
                                color: AppColors.textTertiary,
                                fontSize: 11,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    const SizedBox(height: 4),

                    // Time and likes
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          widget.listing.timeAgo,
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.textTertiary,
                            fontSize: 10,
                          ),
                        ),
                        if (widget.listing.likeCount > 0)
                          Row(
                            children: [
                              Icon(
                                Icons.favorite,
                                size: 10,
                                color: AppColors.accent,
                              ),
                              const SizedBox(width: 2),
                              Text(
                                '${widget.listing.likeCount}',
                                style: AppTextStyles.caption.copyWith(
                                  color: AppColors.textTertiary,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Animated like button with press feedback.
class _LikeButton extends StatefulWidget {
  final bool isLiked;
  final VoidCallback? onTap;

  const _LikeButton({
    required this.isLiked,
    this.onTap,
  });

  @override
  State<_LikeButton> createState() => _LikeButtonState();
}

class _LikeButtonState extends State<_LikeButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 150),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.3).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(_LikeButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isLiked && !oldWidget.isLiked) {
      _controller.forward().then((_) => _controller.reverse());
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        widget.onTap?.call();
        if (!widget.isLiked) {
          _controller.forward().then((_) => _controller.reverse());
        }
      },
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.white.withAlpha(230),
                shape: BoxShape.circle,
                boxShadow: AppShadows.sm,
              ),
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: Icon(
                  widget.isLiked ? Icons.favorite : Icons.favorite_border,
                  key: ValueKey(widget.isLiked),
                  size: 16,
                  color: widget.isLiked ? AppColors.error : AppColors.textSecondary,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Compact version for smaller grids with tap animation.
class CompactItemCard extends StatefulWidget {
  final MarketplaceListing listing;
  final VoidCallback? onTap;

  const CompactItemCard({
    super.key,
    required this.listing,
    this.onTap,
  });

  @override
  State<CompactItemCard> createState() => _CompactItemCardState();
}

class _CompactItemCardState extends State<CompactItemCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return TapScaleContainer(
      onTap: widget.onTap,
      pressedScale: 0.98,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: _isHovered ? AppColors.primary.withAlpha(50) : AppColors.border,
            ),
            boxShadow: _isHovered ? AppShadows.sm : AppShadows.xs,
          ),
          child: Row(
            children: [
              // Image with skeleton loader
              if (widget.listing.hasImages)
                ClipRRect(
                  borderRadius:
                      const BorderRadius.horizontal(left: Radius.circular(8)),
                  child: CachedNetworkImage(
                    imageUrl: widget.listing.primaryImage!,
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => const SkeletonLoader(
                      width: 80,
                      height: 80,
                      borderRadius: 0,
                    ),
                    errorWidget: (context, url, error) => Container(
                      width: 80,
                      height: 80,
                      color: AppColors.surfaceVariant,
                      child: Icon(
                        Icons.image_not_supported_outlined,
                        color: AppColors.textTertiary,
                        size: 24,
                      ),
                    ),
                  ),
                ),

              // Content
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        widget.listing.title,
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.listing.priceString,
                        style: AppTextStyles.labelMedium.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Skeleton loader for marketplace item cards.
class ItemCardSkeleton extends StatelessWidget {
  const ItemCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: AppShadows.sm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image skeleton
          const SkeletonLoader(
            height: 120,
            borderRadius: 12,
          ),
          // Content skeleton
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                SkeletonLoader(height: 14, width: 120),
                SizedBox(height: 6),
                SkeletonLoader(height: 12, width: 80),
                SizedBox(height: 4),
                SkeletonLoader(height: 10, width: 60),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
