import 'package:flutter/material.dart';

import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/marketplace_model.dart';

/// Category tag color reference
class CategoryColors {
  static const Color community = Color(0xFFE07B4C); // Orange/Coral
  static const Color help = Color(0xFF2196F3); // Blue
  static const Color event = Color(0xFF5C6BC0); // Indigo/Purple
  static const Color product = Color(0xFF4CAF50); // Green
  static const Color housing = Color(0xFFF5A623); // Amber
  static const Color opportunities = Color(0xFF009688); // Teal
}

/// Base card wrapper with consistent styling.
class _BasePostCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;

  const _BasePostCard({
    required this.child,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
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
        clipBehavior: Clip.antiAlias,
        child: child,
      ),
    );
  }
}

/// Discussion/Community post card (Type 1: Simple with icon area).
///
/// Features light gray background area with centered icon,
/// title, subtitle, and footer with avatar + category tag.
class DiscussionPostCard extends StatelessWidget {
  final MarketplaceListing listing;
  final VoidCallback? onTap;
  final VoidCallback? onLike;
  final VoidCallback? onComment;

  const DiscussionPostCard({
    super.key,
    required this.listing,
    this.onTap,
    this.onLike,
    this.onComment,
  });

  @override
  Widget build(BuildContext context) {
    return _BasePostCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon area (light gray background)
          Container(
            height: 100,
            width: double.infinity,
            color: const Color(0xFFF5F5F5),
            child: Center(
              child: Icon(
                _getIconForTitle(listing.title),
                size: 32,
                color: const Color(0xFFBDBDBD),
              ),
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  listing.title,
                  style: AppTextStyles.labelLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: const Color(0xFF1A1A1A),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (listing.description != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    listing.description!,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: const Color(0xFF6B6B6B),
                      fontSize: 13,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],

                const SizedBox(height: 12),

                // Footer row
                _PostFooter(
                  userName: listing.userName,
                  categoryLabel: 'Community',
                  categoryColor: CategoryColors.community,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForTitle(String title) {
    final lowerTitle = title.toLowerCase();
    if (lowerTitle.contains('food') || lowerTitle.contains('cafe')) {
      return Icons.restaurant_outlined;
    }
    if (lowerTitle.contains('book') || lowerTitle.contains('academic')) {
      return Icons.menu_book_outlined;
    }
    if (lowerTitle.contains('manage') || lowerTitle.contains('coding')) {
      return Icons.menu_book_outlined;
    }
    return Icons.chat_bubble_outline_rounded;
  }
}

/// Help post card (Type 2: With alert icon).
///
/// Features red/orange circular alert badge with exclamation mark,
/// no icon area background, title, description, and footer.
class HelpPostCard extends StatelessWidget {
  final MarketplaceListing listing;
  final VoidCallback? onTap;
  final VoidCallback? onAnswer;

  const HelpPostCard({
    super.key,
    required this.listing,
    this.onTap,
    this.onAnswer,
  });

  @override
  Widget build(BuildContext context) {
    return _BasePostCard(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stack for alert badge positioning
            Stack(
              clipBehavior: Clip.none,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Padding(
                      padding: const EdgeInsets.only(right: 32),
                      child: Text(
                        listing.title,
                        style: AppTextStyles.labelLarge.copyWith(
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                          color: const Color(0xFF1A1A1A),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (listing.description != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        listing.description!,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: const Color(0xFF6B6B6B),
                          fontSize: 13,
                          height: 1.4,
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),

                // Alert badge (top right)
                Positioned(
                  top: -4,
                  right: -4,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: const BoxDecoration(
                      color: Color(0xFFFF6B6B),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Text(
                        '!',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Footer row
            _PostFooter(
              userName: listing.userName,
              categoryLabel: 'Help',
              categoryColor: CategoryColors.help,
            ),
          ],
        ),
      ),
    );
  }
}

/// Event post card (Type 3: With icon area).
///
/// Features light gray background with cloud/event icon,
/// title, description (truncated), and footer.
class EventPostCard extends StatelessWidget {
  final MarketplaceListing listing;
  final VoidCallback? onTap;
  final VoidCallback? onRsvp;

  const EventPostCard({
    super.key,
    required this.listing,
    this.onTap,
    this.onRsvp,
  });

  @override
  Widget build(BuildContext context) {
    return _BasePostCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon area (light gray background)
          Container(
            height: 100,
            width: double.infinity,
            color: const Color(0xFFF5F5F5),
            child: Center(
              child: Icon(
                _getIconForEvent(listing.title),
                size: 32,
                color: const Color(0xFFBDBDBD),
              ),
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  listing.title,
                  style: AppTextStyles.labelLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: const Color(0xFF1A1A1A),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (listing.description != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    listing.description!,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: const Color(0xFF6B6B6B),
                      fontSize: 13,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],

                const SizedBox(height: 12),

                // Footer row
                _PostFooter(
                  userName: listing.userName,
                  categoryLabel: 'Event',
                  categoryColor: CategoryColors.event,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForEvent(String title) {
    final lowerTitle = title.toLowerCase();
    if (lowerTitle.contains('aws') || lowerTitle.contains('cloud')) {
      return Icons.cloud_outlined;
    }
    if (lowerTitle.contains('workshop')) {
      return Icons.build_outlined;
    }
    return Icons.event_outlined;
  }
}

/// Product listing card (Type 4: With icon area).
///
/// Features light gray background with product icon,
/// title, description (truncated), and footer.
class ProductPostCard extends StatelessWidget {
  final MarketplaceListing listing;
  final VoidCallback? onTap;
  final VoidCallback? onLike;

  const ProductPostCard({
    super.key,
    required this.listing,
    this.onTap,
    this.onLike,
  });

  @override
  Widget build(BuildContext context) {
    return _BasePostCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon area (light gray background)
          Container(
            height: 100,
            width: double.infinity,
            color: const Color(0xFFF5F5F5),
            child: Center(
              child: Icon(
                _getIconForProduct(listing.title),
                size: 32,
                color: const Color(0xFFBDBDBD),
              ),
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  listing.title,
                  style: AppTextStyles.labelLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: const Color(0xFF1A1A1A),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (listing.description != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    listing.description!,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: const Color(0xFF6B6B6B),
                      fontSize: 13,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],

                const SizedBox(height: 12),

                // Footer row
                _PostFooter(
                  userName: listing.userName,
                  categoryLabel: 'Product',
                  categoryColor: CategoryColors.product,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForProduct(String title) {
    final lowerTitle = title.toLowerCase();
    if (lowerTitle.contains('cycle') || lowerTitle.contains('bike')) {
      return Icons.pedal_bike_outlined;
    }
    if (lowerTitle.contains('laptop') || lowerTitle.contains('computer')) {
      return Icons.laptop_outlined;
    }
    if (lowerTitle.contains('phone') || lowerTitle.contains('mobile')) {
      return Icons.smartphone_outlined;
    }
    // Network/connection icon for general products
    return Icons.hub_outlined;
  }
}

/// Housing listing card (Type 5: Compact, no icon area).
///
/// Features content-only card layout (no icon section),
/// title, description, and footer.
class HousingPostCard extends StatelessWidget {
  final MarketplaceListing listing;
  final VoidCallback? onTap;
  final VoidCallback? onContact;

  const HousingPostCard({
    super.key,
    required this.listing,
    this.onTap,
    this.onContact,
  });

  @override
  Widget build(BuildContext context) {
    return _BasePostCard(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Text(
              listing.title,
              style: AppTextStyles.labelLarge.copyWith(
                fontWeight: FontWeight.w600,
                fontSize: 15,
                color: const Color(0xFF1A1A1A),
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            if (listing.description != null) ...[
              const SizedBox(height: 6),
              Text(
                listing.description!,
                style: AppTextStyles.bodySmall.copyWith(
                  color: const Color(0xFF6B6B6B),
                  fontSize: 13,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],

            const SizedBox(height: 12),

            // Footer row
            _PostFooter(
              userName: listing.userName,
              categoryLabel: 'Housing',
              categoryColor: CategoryColors.housing,
            ),
          ],
        ),
      ),
    );
  }
}

/// Opportunity post card.
///
/// Similar to Event card but with Opportunities category tag.
class OpportunityPostCard extends StatelessWidget {
  final MarketplaceListing listing;
  final VoidCallback? onTap;

  const OpportunityPostCard({
    super.key,
    required this.listing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return _BasePostCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon area (light gray background)
          Container(
            height: 100,
            width: double.infinity,
            color: const Color(0xFFF5F5F5),
            child: const Center(
              child: Icon(
                Icons.work_outline_rounded,
                size: 32,
                color: Color(0xFFBDBDBD),
              ),
            ),
          ),

          // Content
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Text(
                  listing.title,
                  style: AppTextStyles.labelLarge.copyWith(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: const Color(0xFF1A1A1A),
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                if (listing.description != null) ...[
                  const SizedBox(height: 6),
                  Text(
                    listing.description!,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: const Color(0xFF6B6B6B),
                      fontSize: 13,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],

                const SizedBox(height: 12),

                // Footer row
                _PostFooter(
                  userName: listing.userName,
                  categoryLabel: 'Opportunities',
                  categoryColor: CategoryColors.opportunities,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Post footer with avatar, username, and category tag.
class _PostFooter extends StatelessWidget {
  final String userName;
  final String categoryLabel;
  final Color categoryColor;

  const _PostFooter({
    required this.userName,
    required this.categoryLabel,
    required this.categoryColor,
  });

  @override
  Widget build(BuildContext context) {
    final isUnknown = userName.isEmpty || userName.toLowerCase() == 'unknown';

    return Row(
      children: [
        // Avatar
        CircleAvatar(
          radius: 12,
          backgroundColor: isUnknown
              ? const Color(0xFFE0E0E0)
              : const Color(0xFFE8E0D8),
          child: isUnknown
              ? const Icon(
                  Icons.person_outline,
                  size: 14,
                  color: Color(0xFF9B9B9B),
                )
              : Text(
                  userName[0].toUpperCase(),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF6B5D4D),
                  ),
                ),
        ),
        const SizedBox(width: 8),

        // Username
        Expanded(
          child: Text(
            isUnknown ? 'Unknown' : userName,
            style: AppTextStyles.caption.copyWith(
              color: const Color(0xFF6B6B6B),
              fontSize: 12,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),

        // Category tag
        Text(
          categoryLabel,
          style: AppTextStyles.labelSmall.copyWith(
            color: categoryColor,
            fontWeight: FontWeight.w500,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}
