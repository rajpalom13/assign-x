import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_text_styles.dart';

/// Help and support screen with FAQ, contact options, and ticket submission.
class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  final _issueController = TextEditingController();
  String? _selectedCategory;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _issueController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back),
        ),
        title: Text(
          'Help & Support',
          style: AppTextStyles.headingSmall,
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Quick contact options
            _QuickContactSection(
              onWhatsAppTap: _openWhatsApp,
              onEmailTap: _openEmail,
              onCallTap: _openPhone,
            ),
            const SizedBox(height: 24),

            // Raise a ticket
            _RaiseTicketSection(
              issueController: _issueController,
              selectedCategory: _selectedCategory,
              isSubmitting: _isSubmitting,
              onCategoryChanged: (value) => setState(() => _selectedCategory = value),
              onSubmit: _submitTicket,
            ),
            const SizedBox(height: 24),

            // FAQ Section
            _FAQSection(),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Future<void> _openWhatsApp() async {
    const phone = '919876543210'; // Replace with actual support number
    const message = 'Hi, I need help with AssignX app';
    final url = Uri.parse('https://wa.me/$phone?text=${Uri.encodeComponent(message)}');

    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open WhatsApp')),
        );
      }
    }
  }

  Future<void> _openEmail() async {
    final url = Uri.parse('mailto:support@assignx.com?subject=Support Request');

    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not open email app')),
        );
      }
    }
  }

  Future<void> _openPhone() async {
    final url = Uri.parse('tel:+919876543210');

    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  Future<void> _submitTicket() async {
    if (_selectedCategory == null || _issueController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    // Simulate API call
    await Future.delayed(const Duration(seconds: 2));

    if (mounted) {
      setState(() => _isSubmitting = false);
      _issueController.clear();
      setState(() => _selectedCategory = null);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Ticket submitted successfully! We\'ll get back to you soon.'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }
}

/// Quick contact section.
class _QuickContactSection extends StatelessWidget {
  final VoidCallback onWhatsAppTap;
  final VoidCallback onEmailTap;
  final VoidCallback onCallTap;

  const _QuickContactSection({
    required this.onWhatsAppTap,
    required this.onEmailTap,
    required this.onCallTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Quick Contact',
          style: AppTextStyles.labelLarge,
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _ContactOption(
                icon: Icons.message,
                label: 'WhatsApp',
                color: const Color(0xFF25D366),
                onTap: onWhatsAppTap,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ContactOption(
                icon: Icons.email_outlined,
                label: 'Email',
                color: AppColors.primary,
                onTap: onEmailTap,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ContactOption(
                icon: Icons.phone_outlined,
                label: 'Call',
                color: AppColors.success,
                onTap: onCallTap,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// Contact option button.
class _ContactOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ContactOption({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withAlpha(20),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withAlpha(50)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              label,
              style: AppTextStyles.labelSmall.copyWith(color: color),
            ),
          ],
        ),
      ),
    );
  }
}

/// Raise a ticket section.
class _RaiseTicketSection extends StatelessWidget {
  final TextEditingController issueController;
  final String? selectedCategory;
  final bool isSubmitting;
  final ValueChanged<String?> onCategoryChanged;
  final VoidCallback onSubmit;

  const _RaiseTicketSection({
    required this.issueController,
    required this.selectedCategory,
    required this.isSubmitting,
    required this.onCategoryChanged,
    required this.onSubmit,
  });

  static const _categories = [
    'Payment Issue',
    'Project Related',
    'Technical Problem',
    'Account Issue',
    'Refund Request',
    'Other',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.confirmation_number_outlined, color: AppColors.primary),
              const SizedBox(width: 12),
              Text(
                'Raise a Ticket',
                style: AppTextStyles.labelLarge,
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Category dropdown
          DropdownButtonFormField<String>(
            initialValue: selectedCategory,
            decoration: InputDecoration(
              labelText: 'Issue Category',
              prefixIcon: Icon(Icons.category_outlined, color: AppColors.textSecondary),
              filled: true,
              fillColor: AppColors.surfaceVariant,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
            items: _categories
                .map((cat) => DropdownMenuItem(value: cat, child: Text(cat)))
                .toList(),
            onChanged: onCategoryChanged,
          ),
          const SizedBox(height: 16),

          // Issue description
          TextFormField(
            controller: issueController,
            maxLines: 4,
            decoration: InputDecoration(
              labelText: 'Describe your issue',
              alignLabelWithHint: true,
              filled: true,
              fillColor: AppColors.surfaceVariant,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Submit button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: isSubmitting ? null : onSubmit,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: isSubmitting
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Text('Submit Ticket'),
            ),
          ),
        ],
      ),
    );
  }
}

/// FAQ Section.
class _FAQSection extends StatelessWidget {
  static const _faqs = [
    {
      'question': 'How does AssignX work?',
      'answer': 'AssignX connects you with expert professionals who can help with your projects. Simply submit your requirements, receive a quote, and track progress in real-time.',
    },
    {
      'question': 'How long does it take to get a quote?',
      'answer': 'You\'ll typically receive a quote within 2-4 hours during business hours. For urgent requests, we prioritize faster responses.',
    },
    {
      'question': 'Is my information secure?',
      'answer': 'Yes, all your data is encrypted and stored securely. We never share your personal information with third parties.',
    },
    {
      'question': 'What payment methods are accepted?',
      'answer': 'We accept UPI, credit/debit cards, net banking, and wallet payments through Razorpay.',
    },
    {
      'question': 'Can I request revisions?',
      'answer': 'Yes, you can request changes during the review period. Our experts will work with you until you\'re satisfied.',
    },
    {
      'question': 'How do I get a refund?',
      'answer': 'If you\'re not satisfied with the work, you can request a refund within 7 days of delivery. Please contact support for assistance.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Frequently Asked Questions',
          style: AppTextStyles.labelLarge,
        ),
        const SizedBox(height: 12),
        ...List.generate(_faqs.length, (index) {
          final faq = _faqs[index];
          return _FAQItem(
            question: faq['question']!,
            answer: faq['answer']!,
          );
        }),
      ],
    );
  }
}

/// FAQ Item with expandable answer.
class _FAQItem extends StatefulWidget {
  final String question;
  final String answer;

  const _FAQItem({
    required this.question,
    required this.answer,
  });

  @override
  State<_FAQItem> createState() => _FAQItemState();
}

class _FAQItemState extends State<_FAQItem> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          title: Text(
            widget.question,
            style: AppTextStyles.labelMedium,
          ),
          trailing: AnimatedRotation(
            duration: const Duration(milliseconds: 200),
            turns: _isExpanded ? 0.5 : 0,
            child: Icon(
              Icons.keyboard_arrow_down,
              color: AppColors.textSecondary,
            ),
          ),
          onExpansionChanged: (expanded) {
            setState(() => _isExpanded = expanded);
          },
          children: [
            Text(
              widget.answer,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
