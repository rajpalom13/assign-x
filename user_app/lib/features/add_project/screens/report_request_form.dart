import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../widgets/budget_display.dart';
import '../widgets/file_attachment.dart';
import '../widgets/success_popup.dart';

/// Report type options.
enum ReportType {
  plagiarism('Plagiarism Check', 'Detect copied content', Icons.content_copy, 99),
  aiDetection('AI Detection', 'Check for AI-generated content', Icons.smart_toy_outlined, 149),
  both('Both Reports', 'Complete analysis', Icons.analytics_outlined, 199);

  final String title;
  final String description;
  final IconData icon;
  final double price;

  const ReportType(this.title, this.description, this.icon, this.price);
}

/// Report format options.
enum ReportFormat {
  turnitin('Turnitin Style', 'Industry standard format'),
  detailed('Detailed Report', 'Comprehensive breakdown'),
  certificate('Certificate', 'Official verification certificate');

  final String title;
  final String description;

  const ReportFormat(this.title, this.description);
}

/// Report request form for plagiarism/AI detection.
class ReportRequestForm extends ConsumerStatefulWidget {
  const ReportRequestForm({super.key});

  @override
  ConsumerState<ReportRequestForm> createState() => _ReportRequestFormState();
}

class _ReportRequestFormState extends ConsumerState<ReportRequestForm> {
  final _formKey = GlobalKey<FormState>();
  bool _isSubmitting = false;

  // Form data
  ReportType? _reportType;
  final Set<ReportFormat> _formats = {ReportFormat.detailed};
  List<AttachmentFile> _attachments = [];
  bool _urgentDelivery = false;
  // Note: Email uses controller instead

  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;

    if (_reportType == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please select a report type'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

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
        title: 'Report Requested!',
        message: 'Your report request has been submitted. You\'ll receive the report within ${_urgentDelivery ? '2 hours' : '24 hours'}.',
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
        title: const Text('Plag/AI Report'),
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
                    Colors.orange.withAlpha(20),
                    Colors.orange.withAlpha(10),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.orange.withAlpha(30)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.orange.withAlpha(20),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(
                      Icons.document_scanner_outlined,
                      color: Colors.orange,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Plagiarism & AI Detection',
                          style: AppTextStyles.labelLarge.copyWith(
                            color: Colors.orange,
                          ),
                        ),
                        Text(
                          'Get comprehensive authenticity reports',
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

            // Report type selection
            Text('Select Report Type', style: AppTextStyles.labelMedium),
            const SizedBox(height: 12),
            ...ReportType.values.map((type) => _ReportTypeCard(
                  type: type,
                  isSelected: _reportType == type,
                  onTap: () => setState(() => _reportType = type),
                )),
            const SizedBox(height: 24),

            // Upload document
            FileAttachment(
              files: _attachments,
              onChanged: (files) => setState(() => _attachments = files),
              label: 'Upload Document',
              hint: 'Upload the document to analyze',
              maxFiles: 1,
              maxSizeMB: 50,
              allowedExtensions: ['doc', 'docx', 'pdf', 'txt'],
            ),
            const SizedBox(height: 24),

            // Report format
            Text('Report Format', style: AppTextStyles.labelMedium),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: ReportFormat.values.map((format) {
                final isSelected = _formats.contains(format);
                return GestureDetector(
                  onTap: () {
                    setState(() {
                      if (isSelected) {
                        _formats.remove(format);
                      } else {
                        _formats.add(format);
                      }
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isSelected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (isSelected)
                          const Icon(
                            Icons.check,
                            size: 16,
                            color: Colors.white,
                          ),
                        if (isSelected) const SizedBox(width: 4),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              format.title,
                              style: AppTextStyles.labelSmall.copyWith(
                                color: isSelected
                                    ? Colors.white
                                    : AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // Urgent delivery toggle
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.flash_on,
                    color: _urgentDelivery ? AppColors.warning : AppColors.textTertiary,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Urgent Delivery',
                          style: AppTextStyles.labelMedium,
                        ),
                        Text(
                          _urgentDelivery
                              ? 'Get report in 2 hours (+₹100)'
                              : 'Standard delivery (24 hours)',
                          style: AppTextStyles.caption.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Switch(
                    value: _urgentDelivery,
                    onChanged: (value) => setState(() => _urgentDelivery = value),
                    activeTrackColor: AppColors.primary.withAlpha(128),
                    activeThumbColor: AppColors.primary,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Email for delivery
            Text('Email for Report Delivery', style: AppTextStyles.labelMedium),
            const SizedBox(height: 8),
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                hintText: 'your@email.com',
                hintStyle: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textTertiary,
                ),
                prefixIcon: Icon(
                  Icons.email_outlined,
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
                if (value == null || value.isEmpty) {
                  return 'Please enter your email';
                }
                if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                  return 'Please enter a valid email';
                }
                return null;
              },
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
                      'Request Report',
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
    if (_reportType == null) return null;
    double total = _reportType!.price;
    if (_urgentDelivery) total += 100;
    // Add for certificate format
    if (_formats.contains(ReportFormat.certificate)) total += 50;
    return total;
  }
}

class _ReportTypeCard extends StatelessWidget {
  final ReportType type;
  final bool isSelected;
  final VoidCallback onTap;

  const _ReportTypeCard({
    required this.type,
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
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary.withAlpha(20)
                    : AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                type.icon,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    type.title,
                    style: AppTextStyles.labelLarge.copyWith(
                      color: isSelected ? AppColors.primary : AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    type.description,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  '₹${type.price.toInt()}',
                  style: AppTextStyles.headingSmall.copyWith(
                    color: isSelected ? AppColors.primary : AppColors.textPrimary,
                  ),
                ),
                if (isSelected)
                  Icon(
                    Icons.check_circle,
                    color: AppColors.primary,
                    size: 20,
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
