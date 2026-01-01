import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../data/models/project_model.dart';
import '../widgets/budget_display.dart';
import '../widgets/file_attachment.dart';
import '../widgets/subject_dropdown.dart';
import '../widgets/success_popup.dart';

/// Expertise level required.
enum ExpertiseLevel {
  basic('Basic Review', 'General feedback and suggestions', 299),
  intermediate('Detailed Analysis', 'In-depth review with recommendations', 499),
  expert('Expert Consultation', 'Comprehensive expert evaluation', 799);

  final String title;
  final String description;
  final double price;

  const ExpertiseLevel(this.title, this.description, this.price);
}

/// Feedback type options.
enum FeedbackType {
  written('Written Feedback', Icons.description_outlined),
  videoCall('Video Call (30 min)', Icons.video_call_outlined),
  both('Written + Video Call', Icons.forum_outlined);

  final String title;
  final IconData icon;

  const FeedbackType(this.title, this.icon);
}

/// Expert opinion request form.
class ExpertOpinionForm extends ConsumerStatefulWidget {
  const ExpertOpinionForm({super.key});

  @override
  ConsumerState<ExpertOpinionForm> createState() => _ExpertOpinionFormState();
}

class _ExpertOpinionFormState extends ConsumerState<ExpertOpinionForm> {
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  // Form data
  ProjectSubject? _subject;
  ExpertiseLevel? _expertiseLevel;
  FeedbackType _feedbackType = FeedbackType.written;
  List<AttachmentFile> _attachments = [];

  final _questionController = TextEditingController();
  final _contextController = TextEditingController();

  @override
  void dispose() {
    _questionController.dispose();
    _contextController.dispose();
    super.dispose();
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;

    if (_expertiseLevel == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please select an expertise level'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    _formKey.currentState!.save();
    setState(() => _isSubmitting = true);

    try {
      // Simulate API call
      await Future.delayed(const Duration(seconds: 2));

      final projectId = DateTime.now().millisecondsSinceEpoch.toString();

      if (!mounted) return;

      await SuccessPopup.show(
        context,
        title: 'Request Submitted!',
        message: 'Your expert consultation request has been submitted. An expert will be assigned within 24 hours.',
        projectId: projectId,
        onViewProject: () {
          context.go('/projects/$projectId');
        },
      );

      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Ask Expert'),
        backgroundColor: AppColors.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => context.pop(),
        ),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: AppSpacing.screenPadding,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.purple.withAlpha(20),
                    Colors.purple.withAlpha(10),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.purple.withAlpha(30)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.purple.withAlpha(20),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.psychology_outlined,
                      color: Colors.purple,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Expert Consultation',
                          style: AppTextStyles.labelLarge.copyWith(
                            color: Colors.purple,
                          ),
                        ),
                        Text(
                          'Get personalized guidance from subject experts',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Subject
            SubjectDropdown(
              value: _subject,
              onChanged: (value) => setState(() => _subject = value),
            ),
            const SizedBox(height: 24),

            // Your question
            Text('Your Question', style: AppTextStyles.labelMedium),
            const SizedBox(height: 8),
            TextFormField(
              controller: _questionController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'What would you like expert guidance on?',
                hintStyle: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textTertiary,
                ),
                filled: true,
                fillColor: AppColors.surfaceVariant,
                border: OutlineInputBorder(
                  borderRadius: AppSpacing.borderRadiusMd,
                  borderSide: BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: AppSpacing.borderRadiusMd,
                  borderSide: BorderSide(color: AppColors.border),
                ),
              ),
              validator: (value) {
                if (value == null || value.length < 10) {
                  return 'Please describe your question (min 10 characters)';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),

            // Context/background
            Text('Context & Background', style: AppTextStyles.labelMedium),
            const SizedBox(height: 4),
            Text(
              'Help the expert understand your situation better',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _contextController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'e.g., I\'m working on my thesis about... My current approach is...',
                hintStyle: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textTertiary,
                ),
                filled: true,
                fillColor: AppColors.surfaceVariant,
                border: OutlineInputBorder(
                  borderRadius: AppSpacing.borderRadiusMd,
                  borderSide: BorderSide(color: AppColors.border),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: AppSpacing.borderRadiusMd,
                  borderSide: BorderSide(color: AppColors.border),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Attachments
            FileAttachment(
              files: _attachments,
              onChanged: (files) => setState(() => _attachments = files),
              label: 'Reference Documents',
              hint: 'Upload relevant documents for the expert to review (optional)',
              maxFiles: 3,
              maxSizeMB: 20,
            ),
            const SizedBox(height: 24),

            // Expertise level
            Text('Expertise Level', style: AppTextStyles.labelMedium),
            const SizedBox(height: 12),
            ...ExpertiseLevel.values.map((level) => _ExpertiseLevelCard(
                  level: level,
                  isSelected: _expertiseLevel == level,
                  onTap: () => setState(() => _expertiseLevel = level),
                )),
            const SizedBox(height: 24),

            // Feedback type
            Text('Preferred Feedback', style: AppTextStyles.labelMedium),
            const SizedBox(height: 12),
            Row(
              children: FeedbackType.values.map((type) {
                final isSelected = _feedbackType == type;
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _feedbackType = type),
                    child: Container(
                      margin: EdgeInsets.only(
                        right: type != FeedbackType.both ? 8 : 0,
                      ),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primary.withAlpha(10)
                            : AppColors.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            type.icon,
                            color: isSelected
                                ? AppColors.primary
                                : AppColors.textSecondary,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            type.title,
                            style: AppTextStyles.caption.copyWith(
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.textPrimary,
                              fontWeight:
                                  isSelected ? FontWeight.w600 : FontWeight.normal,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // Price summary
            BudgetCard(
              price: _calculateTotalPrice(),
              subtitle: 'Total Price',
            ),
            const SizedBox(height: 16),

            // Submit button
            ElevatedButton(
              onPressed: _isSubmitting ? null : _submitRequest,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'Submit Request',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  double? _calculateTotalPrice() {
    if (_expertiseLevel == null) return null;
    double total = _expertiseLevel!.price;

    // Add for feedback type
    switch (_feedbackType) {
      case FeedbackType.written:
        break;
      case FeedbackType.videoCall:
        total += 200;
        break;
      case FeedbackType.both:
        total += 300;
        break;
    }

    return total;
  }
}

class _ExpertiseLevelCard extends StatelessWidget {
  final ExpertiseLevel level;
  final bool isSelected;
  final VoidCallback onTap;

  const _ExpertiseLevelCard({
    required this.level,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withAlpha(10) : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 20,
              height: 20,
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: isSelected ? AppColors.primary : AppColors.textTertiary,
                  width: 2,
                ),
              ),
              child: isSelected
                  ? Center(
                      child: Container(
                        width: 10,
                        height: 10,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.primary,
                        ),
                      ),
                    )
                  : null,
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    level.title,
                    style: AppTextStyles.labelMedium.copyWith(
                      color: isSelected ? AppColors.primary : AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    level.description,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Text(
              '₹${level.price.toInt()}',
              style: AppTextStyles.headingSmall.copyWith(
                color: isSelected ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
