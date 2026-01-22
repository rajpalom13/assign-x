import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

/// Filter categories for Campus Connect.
enum CampusConnectCategory {
  community('Community', Icons.groups_rounded),
  opportunities('Opportunities', Icons.work_outline_rounded),
  products('Products', Icons.shopping_bag_outlined),
  housing('Housing', Icons.home_outlined);

  final String label;
  final IconData icon;

  const CampusConnectCategory(this.label, this.icon);
}

/// Horizontal filter tabs bar for Campus Connect categories.
///
/// Features glass-style filter pills with icons and labels
/// for filtering content by category.
class FilterTabsBar extends StatelessWidget {
  final CampusConnectCategory? selectedCategory;
  final Function(CampusConnectCategory?) onCategoryChanged;

  const FilterTabsBar({
    super.key,
    this.selectedCategory,
    required this.onCategoryChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          // All filter pill
          _FilterPill(
            label: 'All',
            icon: Icons.apps_rounded,
            isSelected: selectedCategory == null,
            onTap: () => onCategoryChanged(null),
          ),
          const SizedBox(width: 8),

          // Category pills
          ...CampusConnectCategory.values.map(
            (category) => Padding(
              padding: const EdgeInsets.only(right: 8),
              child: _FilterPill(
                label: category.label,
                icon: category.icon,
                isSelected: selectedCategory == category,
                onTap: () => onCategoryChanged(category),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Individual filter pill widget.
class _FilterPill extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterPill({
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary
              : Colors.white.withAlpha(179),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? AppColors.primary
                : AppColors.border.withAlpha(128),
            width: 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withAlpha(60),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withAlpha(8),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? Colors.white : AppColors.textSecondary,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: AppTextStyles.labelMedium.copyWith(
                color: isSelected ? Colors.white : AppColors.textPrimary,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
