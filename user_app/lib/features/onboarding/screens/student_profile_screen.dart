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
import '../widgets/step_progress_bar.dart';

/// Student profile completion screen.
///
/// Multi-step form to collect student-specific information.
class StudentProfileScreen extends ConsumerStatefulWidget {
  const StudentProfileScreen({super.key});

  @override
  ConsumerState<StudentProfileScreen> createState() =>
      _StudentProfileScreenState();
}

class _StudentProfileScreenState extends ConsumerState<StudentProfileScreen> {
  final _pageController = PageController();

  int _currentStep = 1;
  bool _isLoading = false;

  // Form controllers
  final _nameController = TextEditingController();
  String? _selectedUniversityId;
  String? _selectedCourseId;
  int? _selectedSemester;
  int? _selectedYearOfStudy;
  final _studentIdController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Auto-fill name from Google account
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authState = ref.read(authStateProvider);
      final user = authState.valueOrNull?.user;
      if (user != null) {
        // Try to get name from user metadata (from Google)
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
    _pageController.dispose();
    _nameController.dispose();
    _studentIdController.dispose();
    super.dispose();
  }

  void _nextStep() {
    if (_currentStep == 1) {
      // Validate step 1
      if (_nameController.text.trim().isEmpty) {
        _showError('Please enter your full name');
        return;
      }
    }

    if (_currentStep < 2) {
      setState(() => _currentStep++);
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _submitForm();
    }
  }

  void _previousStep() {
    if (_currentStep > 1) {
      setState(() => _currentStep--);
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      context.pop();
    }
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
    setState(() => _isLoading = true);

    try {
      final authNotifier = ref.read(authStateProvider.notifier);

      // Update profile with basic info - using UserType.student
      await authNotifier.updateProfile(
        fullName: _nameController.text.trim(),
        userType: UserType.student,
        onboardingStep: OnboardingStep.complete,
        onboardingCompleted: true,
      );

      // Save student-specific data to students table
      await authNotifier.saveStudentData(
        universityId: _selectedUniversityId,
        courseId: _selectedCourseId,
        semester: _selectedSemester,
        yearOfStudy: _selectedYearOfStudy,
        studentIdNumber: _studentIdController.text.trim().isNotEmpty
            ? _studentIdController.text.trim()
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
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: _previousStep,
        ),
        title: const Text('Complete Profile'),
      ),
      body: LoadingOverlay(
        isLoading: _isLoading,
        message: 'Saving profile...',
        child: Column(
          children: [
            // Progress bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: StepProgressBar(
                currentStep: _currentStep,
                totalSteps: 2,
                labels: const ['Basic Info', 'Education'],
              ),
            ),

            const SizedBox(height: 24),

            // Form pages
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _buildStep1(),
                  _buildStep2(),
                ],
              ),
            ),

            // Continue button
            Padding(
              padding: AppSpacing.screenPadding,
              child: AppButton(
                label: _currentStep == 2 ? 'Complete' : 'Continue',
                onPressed: _nextStep,
                icon: _currentStep == 2 ? Icons.check : Icons.arrow_forward,
              ),
            ),

            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildStep1() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Basic Information',
            style: AppTextStyles.headingMedium,
          ),
          const SizedBox(height: 8),
          Text(
            "Let's start with your basic details",
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
        ],
      ),
    );
  }

  Widget _buildStep2() {
    final universities = ref.watch(universitiesProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Education Details',
            style: AppTextStyles.headingMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Tell us about your academic background',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),

          const SizedBox(height: 32),

          // University
          universities.when(
            data: (unis) => AppDropdown<Map<String, dynamic>>(
              label: 'University',
              hint: 'Select your university',
              value: unis.where((u) => u['id'] == _selectedUniversityId).firstOrNull,
              items: unis,
              itemLabel: (item) => item['name'] as String,
              searchable: true,
              onChanged: (value) {
                setState(() {
                  _selectedUniversityId = value?['id'] as String?;
                  _selectedCourseId = null; // Reset course
                });
              },
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, _) => const Text('Failed to load universities'),
          ),

          const SizedBox(height: 20),

          // Course (only show if university selected)
          if (_selectedUniversityId != null)
            ref.watch(coursesProvider(_selectedUniversityId!)).when(
                  data: (courses) => AppDropdown<Map<String, dynamic>>(
                    label: 'Course',
                    hint: 'Select your course',
                    value: courses
                        .where((c) => c['id'] == _selectedCourseId)
                        .firstOrNull,
                    items: courses,
                    itemLabel: (item) => item['name'] as String,
                    searchable: true,
                    onChanged: (value) {
                      setState(() {
                        _selectedCourseId = value?['id'] as String?;
                      });
                    },
                  ),
                  loading: () =>
                      const Center(child: CircularProgressIndicator()),
                  error: (_, _) => const Text('Failed to load courses'),
                ),

          const SizedBox(height: 20),

          // Year of Study
          AppDropdown<int>(
            label: 'Year of Study',
            hint: 'Select your current year',
            value: _selectedYearOfStudy,
            items: List.generate(5, (i) => i + 1),
            itemLabel: (item) => 'Year $item',
            onChanged: (value) {
              setState(() => _selectedYearOfStudy = value);
            },
          ),

          const SizedBox(height: 20),

          // Semester
          AppDropdown<int>(
            label: 'Semester (Optional)',
            hint: 'Select your current semester',
            value: _selectedSemester,
            items: List.generate(8, (i) => i + 1),
            itemLabel: (item) => 'Semester $item',
            onChanged: (value) {
              setState(() => _selectedSemester = value);
            },
          ),

          const SizedBox(height: 20),

          // Student ID (optional)
          AppTextField(
            controller: _studentIdController,
            label: 'Student ID (Optional)',
            hint: 'Enter your student ID number',
            prefixIcon: Icons.badge_outlined,
          ),

          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
