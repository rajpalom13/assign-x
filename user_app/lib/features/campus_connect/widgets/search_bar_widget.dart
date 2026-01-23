import 'package:flutter/material.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

/// Search bar widget for Campus Connect.
///
/// Features a white background with search icon on left and filter icon on right.
/// Height: ~52-56px, rounded corners (~14px), subtle shadow.
class SearchBarWidget extends StatefulWidget {
  final Function(String)? onChanged;
  final String? initialValue;
  final VoidCallback? onFilterTap;

  const SearchBarWidget({
    super.key,
    this.onChanged,
    this.initialValue,
    this.onFilterTap,
  });

  @override
  State<SearchBarWidget> createState() => _SearchBarWidgetState();
}

class _SearchBarWidgetState extends State<SearchBarWidget> {
  late final TextEditingController _controller;
  final _focusNode = FocusNode();
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue);
    _focusNode.addListener(() {
      setState(() => _isFocused = _focusNode.hasFocus);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Container(
        height: 54,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
          border: _isFocused
              ? Border.all(
                  color: AppColors.primary.withAlpha(100),
                  width: 1.5,
                )
              : null,
        ),
        child: Row(
          children: [
            // Search icon (left)
            const Icon(
              Icons.search,
              color: Color(0xFF9B9B9B),
              size: 22,
            ),
            const SizedBox(width: 12),

            // Text field
            Expanded(
              child: TextField(
                controller: _controller,
                focusNode: _focusNode,
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textPrimary,
                  fontSize: 15,
                ),
                decoration: InputDecoration(
                  hintText: 'Search campus posts...',
                  hintStyle: AppTextStyles.bodyMedium.copyWith(
                    color: const Color(0xFF9B9B9B),
                    fontSize: 15,
                  ),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                  isDense: true,
                ),
                onChanged: (value) {
                  widget.onChanged?.call(value);
                  setState(() {});
                },
              ),
            ),

            // Clear button when text is present
            if (_controller.text.isNotEmpty)
              GestureDetector(
                onTap: () {
                  _controller.clear();
                  widget.onChanged?.call('');
                  setState(() {});
                },
                child: Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF0F0F0),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.close,
                      color: Color(0xFF9B9B9B),
                      size: 14,
                    ),
                  ),
                ),
              ),

            // Filter icon (right)
            GestureDetector(
              onTap: widget.onFilterTap,
              child: const Icon(
                Icons.tune_rounded,
                color: Color(0xFF9B9B9B),
                size: 22,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
