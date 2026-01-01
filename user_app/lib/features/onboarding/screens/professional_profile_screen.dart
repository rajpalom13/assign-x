import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/constants/app_text_styles.dart';
import '../../../core/router/route_names.dart';
import '../../../core/utils/validators.dart';
import '../../../data/models/user_model.dart';
import '../../../providers/auth_provider.dart';
import '../../../shared/widgets/app_button.dart';
import '../../../shared/widgets/app_dropdown.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/loading_overlay.dart';

/// Professional profile completion screen.
///
/// Multi-step form to collect professional/business information.
class ProfessionalProfileScreen extends ConsumerStatefulWidget {
  const ProfessionalProfileScreen({super.key});

  @override
  ConsumerState<ProfessionalProfileScreen> createState() =>
      _ProfessionalProfileScreenState();
}

class _ProfessionalProfileScreenState
    extends ConsumerState<ProfessionalProfileScreen> {
  bool _isLoading = false;

  // Form controllers
  final _nameController = TextEditingController();
  ProfessionalType? _selectedProfessionalType;
  String? _selectedIndustryId;
  final _jobTitleController = TextEditingController();
  final _companyController = TextEditingController();
  final _linkedinController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authNotifier = ref.read(authStateProvider.notifier);
      final authState = ref.read(authStateProvider);
      final user = authState.valueOrNull?.user;

      // Get the selected professional type if already set
      if (authNotifier.selectedProfessionalType != null) {
        setState(() {
          _selectedProfessionalType = authNotifier.selectedProfessionalType;
        });
      }

      // Auto-fill name from Google account
      if (user != null) {
        final fullName = user.userMetadata?['full_name'] as String? ??
            user.userMetadata?['name'] as String? ??
            '';
        if (fullName.isNotEmpty) {
          _nameController.text = fullName;
        }
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _jobTitleController.dispose();
    _companyController.dispose();
    _linkedinController.dispose();
    super.dispose();
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
      ),
    );
  }

  Future<void> _submitForm() async {
    // Validate
    if (_nameController.text.trim().isEmpty) {
      _showError('Please enter your full name');
      return;
    }

    if (_selectedProfessionalType == null) {
      _showError('Please select your professional type');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final authNotifier = ref.read(authStateProvider.notifier);

      // Update profile with basic info - using UserType.professional
      await authNotifier.updateProfile(
        fullName: _nameController.text.trim(),
        userType: UserType.professional,
        onboardingStep: OnboardingStep.complete,
        onboardingCompleted: true,
      );

      // Save professional-specific data to professionals table
      await authNotifier.saveProfessionalData(
        professionalType: _selectedProfessionalType!,
        industryId: _selectedIndustryId,
        jobTitle: _jobTitleController.text.trim().isNotEmpty
            ? _jobTitleController.text.trim()
            : null,
        companyName: _companyController.text.trim().isNotEmpty
            ? _companyController.text.trim()
            : null,
        linkedinUrl: _linkedinController.text.trim().isNotEmpty
            ? _linkedinController.text.trim()
            : null,
      );

      if (mounted) {
        context.go(RouteNames.signupSuccess);
      }
    } catch (e) {
      _showError('Failed to save profile. Please try again.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final industries = ref.watch(industriesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Complete Profile'),
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        message: 'Saving profile...',
        child: SingleChildScrollView(
          padding: AppSpacing.screenPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Professional Details',
                style: AppTextStyles.headingMedium,
              ),
              const SizedBox(height: 8),
              Text(
                'Tell us a bit about yourself',
                style: AppTextStyles.bodyMedium.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),

              const SizedBox(height: 32),

              // Full Name
              AppTextField(
                controller: _nameController,
                label: 'Full Name',
                hint: 'Enter your full name',
                prefixIcon: Icons.person_outline,
                textCapitalization: TextCapitalization.words,
                validator: Validators.name,
              ),

              const SizedBox(height: 20),

              // Professional Type (required)
              AppDropdown<ProfessionalType>(
                label: 'Professional Type',
                hint: 'Select your professional type',
                value: _selectedProfessionalType,
                items: ProfessionalType.values,
                itemLabel: (item) => item.displayName,
                onChanged: (value) {
                  setState(() => _selectedProfessionalType = value);
                },
              ),

              const SizedBox(height: 20),

              // Industry
              industries.when(
                data: (items) => AppDropdown<Map<String, dynamic>>(
                  label: 'Industry (Optional)',
                  hint: 'Select your industry',
                  value: items.where((i) => i['id'] == _selectedIndustryId).firstOrNull,
                  items: items,
                  itemLabel: (item) => item['name'] as String,
                  searchable: true,
                  onChanged: (value) {
                    setState(() => _selectedIndustryId = value?['id'] as String?);
                  },
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (_, _) => const Text('Failed to load industries'),
              ),

              const SizedBox(height: 20),

              // Job Title (optional)
              AppTextField(
                controller: _jobTitleController,
                label: _selectedProfessionalType == ProfessionalType.business
                    ? 'Your Role (Optional)'
                    : 'Job Title (Optional)',
                hint: _selectedProfessionalType == ProfessionalType.business
                    ? 'e.g., Founder, CEO'
                    : 'e.g., Software Engineer',
                prefixIcon: Icons.work_outline,
                textCapitalization: TextCapitalization.words,
              ),

              const SizedBox(height: 20),

              // Company (optional)
              AppTextField(
                controller: _companyController,
                label: _selectedProfessionalType == ProfessionalType.business
                    ? 'Business Name (Optional)'
                    : 'Company (Optional)',
                hint: _selectedProfessionalType == ProfessionalType.business
                    ? 'Enter your business name'
                    : 'Enter your company name',
                prefixIcon: Icons.business_outlined,
                textCapitalization: TextCapitalization.words,
              ),

              const SizedBox(height: 20),

              // LinkedIn URL (optional)
              AppTextField(
                controller: _linkedinController,
                label: 'LinkedIn Profile (Optional)',
                hint: 'https://linkedin.com/in/yourprofile',
                prefixIcon: Icons.link,
                keyboardType: TextInputType.url,
              ),

              const SizedBox(height: 40),

              // Submit button
              AppButton(
                label: 'Complete',
                onPressed: _submitForm,
                icon: Icons.check,
              ),

              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
