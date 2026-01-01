import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../widgets/budget_display.dart';
import '../widgets/deadline_picker.dart';
import '../widgets/file_attachment.dart';
import '../widgets/focus_area_chips.dart';
import '../widgets/success_popup.dart';
import '../widgets/word_count_input.dart';

/// Document type for proofreading.
enum DocumentType {
  essay('Essay', Icons.article_outlined),
  thesis('Thesis/Dissertation', Icons.school_outlined),
  report('Report', Icons.summarize_outlined),
  proposal('Proposal', Icons.description_outlined),
  article('Article', Icons.newspaper),
  resume('Resume/CV', Icons.person_outline),
  letter('Cover Letter', Icons.mail_outline),
  other('Other', Icons.folder_outlined);

  final String displayName;
  final IconData icon;

  const DocumentType(this.displayName, this.icon);
}

/// Proofreading service form.
class ProofreadingForm extends ConsumerStatefulWidget {
  const ProofreadingForm({super.key});

  @override
  ConsumerState<ProofreadingForm> createState() => _ProofreadingFormState();
}

class _ProofreadingFormState extends ConsumerState<ProofreadingForm> {
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  // Form data
  DocumentType? _documentType;
  int? _wordCount;
  DateTime? _deadline;
  Set<FocusArea> _focusAreas = {};
  List<AttachmentFile> _attachments = [];
  // Note: Special instructions uses controller instead

  final _instructionsController = TextEditingController();

  @override
  void dispose() {
    _instructionsController.dispose();
    super.dispose();
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;

    if (_attachments.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please upload at least one document'),
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
        message: 'Your proofreading request has been submitted. Our experts will review it shortly.',
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
        title: const Text('Proofreading'),
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
                    Colors.blue.withAlpha(20),
                    Colors.blue.withAlpha(10),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.withAlpha(30)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.blue.withAlpha(20),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.spellcheck,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Professional Proofreading',
                          style: AppTextStyles.labelLarge.copyWith(
                            color: Colors.blue,
                          ),
                        ),
                        Text(
                          'Get your document polished by experts',
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

            // Document type
            Text('Document Type', style: AppTextStyles.labelMedium),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: DocumentType.values.map((type) {
                final isSelected = _documentType == type;
                return GestureDetector(
                  onTap: () => setState(() => _documentType = type),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          type.icon,
                          size: 16,
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          type.displayName,
                          style: AppTextStyles.labelSmall.copyWith(
                            color: isSelected ? Colors.white : AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // Upload document
            FileAttachment(
              files: _attachments,
              onChanged: (files) => setState(() => _attachments = files),
              label: 'Upload Document',
              hint: 'Upload the document you want proofread',
              maxFiles: 3,
              maxSizeMB: 20,
              allowedExtensions: ['doc', 'docx', 'pdf', 'txt', 'rtf'],
              errorText: _attachments.isEmpty ? 'Document is required' : null,
            ),
            const SizedBox(height: 24),

            // Word count
            WordCountInput(
              value: _wordCount,
              onChanged: (value) => setState(() => _wordCount = value),
            ),
            const SizedBox(height: 24),

            // Focus areas
            FocusAreaChips(
              selectedAreas: _focusAreas,
              onChanged: (areas) => setState(() => _focusAreas = areas),
            ),
            const SizedBox(height: 24),

            // Deadline
            DeadlinePicker(
              value: _deadline,
              onChanged: (value) => setState(() => _deadline = value),
            ),
            const SizedBox(height: 24),

            // Special instructions
            Text('Special Instructions', style: AppTextStyles.labelMedium),
            const SizedBox(height: 4),
            Text(
              'Any specific guidelines or preferences (optional)',
              style: AppTextStyles.caption.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _instructionsController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'e.g., Focus on academic tone, British English spelling...',
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

            // Price estimate
            BudgetDisplay(
              basePrice: _calculatePrice(),
              urgencyTier: _getUrgencyTier(),
              wordCount: _wordCount,
            ),
            const SizedBox(height: 24),

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

  double? _calculatePrice() {
    if (_wordCount == null) return null;
    // Base rate: ₹0.2 per word for proofreading
    double base = _wordCount! * 0.2;
    // Add for focus areas
    base += _focusAreas.length * 50;
    return base;
  }

  UrgencyTier _getUrgencyTier() {
    if (_deadline == null) return UrgencyTier.standard;
    final daysUntil = _deadline!.difference(DateTime.now()).inDays;
    if (daysUntil < 1) return UrgencyTier.urgent;
    if (daysUntil <= 3) return UrgencyTier.express;
    if (daysUntil <= 7) return UrgencyTier.standard;
    return UrgencyTier.relaxed;
  }
}
