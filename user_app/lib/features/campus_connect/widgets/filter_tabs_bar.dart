import 'package:flutter/material.dart';

import '../../../core/constants/app_text_styles.dart';

/// Filter categories for Campus Connect.
enum CampusConnectCategory {
  community('Community'),
  opportunities('Opportunities'),
  products('Products'),
  housing('Housing');

  final String label;

  const CampusConnectCategory(this.label);
}

/// Horizontal filter tabs bar for Campus Connect categories.
///
/// Features text-only pill chips that scroll horizontally.
/// Selected: Dark fill (#2D2D2D), white text
/// Unselected: White/transparent background, dark border, dark text
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
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Row(
        children: CampusConnectCategory.values.map(
          (category) => Padding(
            padding: const EdgeInsets.only(right: 10),
            child: _FilterPill(
              label: category.label,
              isSelected: selectedCategory == category,
              onTap: () => onCategoryChanged(
                selectedCategory == category ? null : category,
              ),
            ),
          ),
        ).toList(),
      ),
    );
  }
}

/// Individual filter pill widget.
class _FilterPill extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterPill({
    required this.label,
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
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2D2D2D) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: isSelected
              ? null
              : Border.all(
                  color: const Color(0xFFE0E0E0),
                  width: 1,
                ),
        ),
        child: Text(
          label,
          style: AppTextStyles.labelMedium.copyWith(
            color: isSelected ? Colors.white : const Color(0xFF1A1A1A),
            fontWeight: FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}
