import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/marketplace_model.dart';
import '../../../providers/marketplace_provider.dart';

/// Screen to create new marketplace listings.
class CreateListingScreen extends ConsumerStatefulWidget {
  const CreateListingScreen({super.key});

  @override
  ConsumerState<CreateListingScreen> createState() =>
      _CreateListingScreenState();
}

class _CreateListingScreenState extends ConsumerState<CreateListingScreen> {
  final _formKey = GlobalKey<FormState>();
  MarketplaceCategory _selectedCategory = MarketplaceCategory.hardGoods;
  ListingType _selectedType = ListingType.product;
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _locationController = TextEditingController();
  bool _isNegotiable = false;
  bool _isSubmitting = false;
  final List<String> _selectedImages = [];

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(
          'Create Listing',
          style: AppTextStyles.headingSmall,
        ),
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.close),
        ),
        actions: [
          TextButton(
            onPressed: _isSubmitting ? null : _handleSubmit,
            child: _isSubmitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(
                    'Post',
                    style: AppTextStyles.labelLarge.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Category selection
              Text(
                'Category',
                style: AppTextStyles.labelMedium,
              ),
              const SizedBox(height: 12),
              _CategorySelector(
                selectedCategory: _selectedCategory,
                onChanged: (category) {
                  setState(() {
                    _selectedCategory = category;
                    _selectedType = _getDefaultType(category);
                  });
                },
              ),
              const SizedBox(height: 24),

              // Type selection (based on category)
              Text(
                'Type',
                style: AppTextStyles.labelMedium,
              ),
              const SizedBox(height: 12),
              _TypeSelector(
                category: _selectedCategory,
                selectedType: _selectedType,
                onChanged: (type) {
                  setState(() => _selectedType = type);
                },
              ),
              const SizedBox(height: 24),

              // Images
              Text(
                'Photos',
                style: AppTextStyles.labelMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Add up to 5 photos',
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 12),
              _ImagePicker(
                images: _selectedImages,
                onAddImage: _pickImage,
                onRemoveImage: (index) {
                  setState(() => _selectedImages.removeAt(index));
                },
              ),
              const SizedBox(height: 24),

              // Title
              Text(
                'Title',
                style: AppTextStyles.labelMedium,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _titleController,
                decoration: InputDecoration(
                  hintText: _getTitleHint(),
                  filled: true,
                  fillColor: AppColors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter a title';
                  }
                  if (value.length < 5) {
                    return 'Title must be at least 5 characters';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Description
              Text(
                'Description',
                style: AppTextStyles.labelMedium,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Describe your listing...',
                  filled: true,
                  fillColor: AppColors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Price (for products/housing)
              if (_showPriceField()) ...[
                Text(
                  'Price',
                  style: AppTextStyles.labelMedium,
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _priceController,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          hintText: '0',
                          prefixText: '\u20B9 ',
                          filled: true,
                          fillColor: AppColors.surface,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: AppColors.border),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: AppColors.border),
                          ),
                        ),
                        validator: (value) {
                          if (value != null && value.isNotEmpty) {
                            if (double.tryParse(value) == null) {
                              return 'Enter a valid price';
                            }
                          }
                          return null;
                        },
                      ),
                    ),
                    const SizedBox(width: 16),
                    Row(
                      children: [
                        Checkbox(
                          value: _isNegotiable,
                          onChanged: (value) {
                            setState(() => _isNegotiable = value ?? false);
                          },
                          activeColor: AppColors.primary,
                        ),
                        Text(
                          'Negotiable',
                          style: AppTextStyles.bodySmall,
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 20),
              ],

              // Location
              Text(
                'Location',
                style: AppTextStyles.labelMedium,
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _locationController,
                decoration: InputDecoration(
                  hintText: 'e.g., North Campus, Delhi',
                  prefixIcon: Icon(
                    Icons.location_on_outlined,
                    color: AppColors.textSecondary,
                  ),
                  filled: true,
                  fillColor: AppColors.surface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: AppColors.border),
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Guidelines
              _GuidelinesCard(),
              const SizedBox(height: 32),

              // Submit button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Post Listing',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  ListingType _getDefaultType(MarketplaceCategory category) {
    switch (category) {
      case MarketplaceCategory.hardGoods:
        return ListingType.product;
      case MarketplaceCategory.housing:
        return ListingType.housing;
      case MarketplaceCategory.opportunities:
        return ListingType.opportunity;
      case MarketplaceCategory.community:
        return ListingType.communityPost;
    }
  }

  String _getTitleHint() {
    switch (_selectedCategory) {
      case MarketplaceCategory.hardGoods:
        return 'e.g., Engineering Drawing Kit';
      case MarketplaceCategory.housing:
        return 'e.g., Looking for Flatmate in Koramangala';
      case MarketplaceCategory.opportunities:
        return 'e.g., Summer Internship - Software Dev';
      case MarketplaceCategory.community:
        return 'e.g., Best canteen on campus?';
    }
  }

  bool _showPriceField() {
    return _selectedType == ListingType.product ||
        _selectedType == ListingType.housing;
  }

  Future<void> _pickImage() async {
    if (_selectedImages.length >= 5) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Maximum 5 images allowed')),
      );
      return;
    }

    final picker = ImagePicker();
    final image = await picker.pickImage(source: ImageSource.gallery);

    if (image != null) {
      setState(() {
        // For now, just add a placeholder URL
        // In production, this would upload to storage
        _selectedImages.add('https://picsum.photos/400/400?random=${_selectedImages.length}');
      });
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final repository = ref.read(marketplaceRepositoryProvider);

      await repository.createListing(
        category: _selectedCategory,
        type: _selectedType,
        title: _titleController.text.trim(),
        description: _descriptionController.text.trim().isNotEmpty
            ? _descriptionController.text.trim()
            : null,
        price: _priceController.text.isNotEmpty
            ? double.parse(_priceController.text)
            : null,
        isNegotiable: _isNegotiable,
        images: _selectedImages,
        location: _locationController.text.trim().isNotEmpty
            ? _locationController.text.trim()
            : null,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Listing posted successfully!'),
            backgroundColor: Colors.green,
          ),
        );
        ref.invalidate(marketplaceListingsProvider);
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to post: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }
}

/// Category selector chips.
class _CategorySelector extends StatelessWidget {
  final MarketplaceCategory selectedCategory;
  final ValueChanged<MarketplaceCategory> onChanged;

  const _CategorySelector({
    required this.selectedCategory,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: MarketplaceCategory.values.map((category) {
        final isSelected = category == selectedCategory;

        return GestureDetector(
          onTap: () => onChanged(category),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primary : AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected ? AppColors.primary : AppColors.border,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  category.icon,
                  size: 18,
                  color: isSelected ? Colors.white : AppColors.textSecondary,
                ),
                const SizedBox(width: 8),
                Text(
                  category.label,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}

/// Type selector based on category.
class _TypeSelector extends StatelessWidget {
  final MarketplaceCategory category;
  final ListingType selectedType;
  final ValueChanged<ListingType> onChanged;

  const _TypeSelector({
    required this.category,
    required this.selectedType,
    required this.onChanged,
  });

  List<ListingType> _getTypesForCategory() {
    switch (category) {
      case MarketplaceCategory.hardGoods:
        return [ListingType.product];
      case MarketplaceCategory.housing:
        return [ListingType.housing];
      case MarketplaceCategory.opportunities:
        return [ListingType.opportunity, ListingType.event];
      case MarketplaceCategory.community:
        return [ListingType.communityPost, ListingType.poll];
    }
  }

  String _getTypeLabel(ListingType type) {
    switch (type) {
      case ListingType.product:
        return 'Product';
      case ListingType.housing:
        return 'Housing';
      case ListingType.event:
        return 'Event';
      case ListingType.opportunity:
        return 'Opportunity';
      case ListingType.communityPost:
        return 'Discussion';
      case ListingType.poll:
        return 'Poll';
    }
  }

  IconData _getTypeIcon(ListingType type) {
    switch (type) {
      case ListingType.product:
        return Icons.shopping_bag_outlined;
      case ListingType.housing:
        return Icons.home_outlined;
      case ListingType.event:
        return Icons.event_outlined;
      case ListingType.opportunity:
        return Icons.work_outline;
      case ListingType.communityPost:
        return Icons.chat_bubble_outline;
      case ListingType.poll:
        return Icons.poll_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final types = _getTypesForCategory();

    if (types.length == 1) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.primaryLight,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _getTypeIcon(types.first),
              size: 18,
              color: AppColors.primary,
            ),
            const SizedBox(width: 8),
            Text(
              _getTypeLabel(types.first),
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      );
    }

    return Row(
      children: types.map((type) {
        final isSelected = type == selectedType;

        return Padding(
          padding: const EdgeInsets.only(right: 12),
          child: GestureDetector(
            onTap: () => onChanged(type),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.border,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    _getTypeIcon(type),
                    size: 18,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _getTypeLabel(type),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

/// Image picker grid.
class _ImagePicker extends StatelessWidget {
  final List<String> images;
  final VoidCallback onAddImage;
  final ValueChanged<int> onRemoveImage;

  const _ImagePicker({
    required this.images,
    required this.onAddImage,
    required this.onRemoveImage,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 100,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: [
          // Add image button
          if (images.length < 5)
            GestureDetector(
              onTap: onAddImage,
              child: Container(
                width: 100,
                height: 100,
                margin: const EdgeInsets.only(right: 12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.border,
                    style: BorderStyle.solid,
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.add_a_photo_outlined,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Add Photo',
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Image previews
          ...images.asMap().entries.map((entry) {
            final index = entry.key;
            final url = entry.value;

            return Stack(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  margin: const EdgeInsets.only(right: 12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    image: DecorationImage(
                      image: NetworkImage(url),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                Positioned(
                  top: 4,
                  right: 16,
                  child: GestureDetector(
                    onTap: () => onRemoveImage(index),
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.close,
                        size: 14,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ],
            );
          }),
        ],
      ),
    );
  }
}

/// Guidelines card.
class _GuidelinesCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.infoLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                size: 20,
                color: AppColors.info,
              ),
              const SizedBox(width: 8),
              Text(
                'Posting Guidelines',
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.info,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _GuidelineItem('Be honest and accurate in your descriptions'),
          _GuidelineItem('Use clear photos that show the actual item'),
          _GuidelineItem('Set fair and reasonable prices'),
          _GuidelineItem('Respond promptly to interested buyers'),
        ],
      ),
    );
  }
}

/// Individual guideline item.
class _GuidelineItem extends StatelessWidget {
  final String text;

  const _GuidelineItem(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.check_circle_outline,
            size: 16,
            color: AppColors.info,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.info,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
