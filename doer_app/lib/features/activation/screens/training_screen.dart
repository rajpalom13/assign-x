import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_spacing.dart';
import '../../../core/router/route_names.dart';
import '../../../data/models/training_model.dart';
import '../../../providers/activation_provider.dart';
import '../../../shared/widgets/app_button.dart';
import '../widgets/training_module_card.dart';

/// Training screen for completing training modules.
///
/// Displays a list of training modules that users must complete as part
/// of the activation process. Supports video, PDF, and article content types.
///
/// ## Navigation
/// - Entry: From [ActivationGateScreen] (Step 1)
/// - Back: Returns to [ActivationGateScreen]
/// - All Completed: Shows "Proceed to Quiz" button to [QuizScreen]
/// - Module Tap: Opens module viewer inline
///
/// ## Features
/// - Progress header showing completed/total modules
/// - Module list with [TrainingModuleList] widget
/// - Inline module viewer for different content types
/// - Mark as complete functionality
/// - Success message on completion
/// - Automatic navigation prompt when all complete
///
/// ## Content Types
/// - **Video**: Placeholder video player (uses chewie/video_player in production)
/// - **PDF**: Placeholder PDF viewer (uses flutter_pdfview in production)
/// - **Article**: Inline text content display
///
/// ## State Management
/// Uses [ActivationProvider] to track module completion progress.
///
/// See also:
/// - [ActivationProvider] for training progress tracking
/// - [TrainingModuleList] for the module list widget
/// - [TrainingModule] for module data model
/// - [QuizScreen] for the next activation step
class TrainingScreen extends ConsumerStatefulWidget {
  const TrainingScreen({super.key});

  @override
  ConsumerState<TrainingScreen> createState() => _TrainingScreenState();
}

/// State class for [TrainingScreen].
///
/// Manages module selection and viewing state.
class _TrainingScreenState extends ConsumerState<TrainingScreen> {
  /// Currently selected module for viewing.
  TrainingModule? _selectedModule;

  /// Whether the module viewer is active.
  bool _isViewing = false;

  /// Builds the training screen UI.
  ///
  /// Displays either the module list or the module viewer based on state.
  @override
  Widget build(BuildContext context) {
    final activationState = ref.watch(activationProvider);
    final modules = activationState.trainingModules;
    final progress = activationState.trainingProgress;
    final allCompleted = activationState.allTrainingCompleted;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => _isViewing
              ? setState(() {
                  _isViewing = false;
                  _selectedModule = null;
                })
              : context.go(RouteNames.activationGate),
        ),
        title: Text(
          _isViewing ? _selectedModule?.title ?? 'Module' : 'Training',
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ),
      body: _isViewing && _selectedModule != null
          ? _buildModuleViewer(_selectedModule!)
          : _buildModuleList(modules, progress, allCompleted),
    );
  }

  /// Builds the module list view with progress header.
  ///
  /// Shows:
  /// - Progress bar with completed count
  /// - List of training modules
  /// - "Proceed to Quiz" button when all complete
  Widget _buildModuleList(
    List<TrainingModule> modules,
    Map<String, TrainingProgress> progress,
    bool allCompleted,
  ) {
    return Column(
      children: [
        // Progress header
        Container(
          padding: AppSpacing.paddingLg,
          color: AppColors.surface,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Your Progress',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    '${_getCompletedCount(modules, progress)}/${modules.length} modules',
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              ClipRRect(
                borderRadius: AppSpacing.borderRadiusSm,
                child: LinearProgressIndicator(
                  value: modules.isEmpty
                      ? 0
                      : _getCompletedCount(modules, progress) / modules.length,
                  backgroundColor: AppColors.border,
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.success),
                  minHeight: 8,
                ),
              ),
            ],
          ),
        ),

        // Module list
        Expanded(
          child: SingleChildScrollView(
            padding: AppSpacing.paddingLg,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Training Modules',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                const Text(
                  'Complete all modules to proceed to the quiz',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),

                TrainingModuleList(
                  modules: modules,
                  progress: progress,
                  onModuleTap: (module) {
                    setState(() {
                      _selectedModule = module;
                      _isViewing = true;
                    });
                  },
                ),

                const SizedBox(height: AppSpacing.xxl),

                // Continue button
                if (allCompleted)
                  Column(
                    children: [
                      Container(
                        padding: AppSpacing.paddingMd,
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.1),
                          borderRadius: AppSpacing.borderRadiusMd,
                        ),
                        child: const Row(
                          children: [
                            Icon(
                              Icons.check_circle,
                              color: AppColors.success,
                              size: 24,
                            ),
                            SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Text(
                                'All training modules completed! You\'re ready for the quiz.',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: AppColors.success,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      AppButton(
                        text: 'Proceed to Quiz',
                        onPressed: () => context.go(RouteNames.quiz),
                        isFullWidth: true,
                        size: AppButtonSize.large,
                      ),
                    ],
                  ),

                const SizedBox(height: AppSpacing.lg),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Builds the module content viewer.
  ///
  /// Shows module content based on type with a bottom action bar
  /// for marking completion or showing completed status.
  Widget _buildModuleViewer(TrainingModule module) {
    final progress = ref.watch(activationProvider).trainingProgress;
    final isCompleted = progress[module.id]?.isCompleted ?? false;

    return Column(
      children: [
        // Content area
        Expanded(
          child: _buildModuleContent(module),
        ),

        // Bottom action bar
        Container(
          padding: AppSpacing.paddingLg,
          decoration: BoxDecoration(
            color: AppColors.surface,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: SafeArea(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isCompleted)
                  Container(
                    padding: AppSpacing.paddingMd,
                    margin: const EdgeInsets.only(bottom: AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.success.withValues(alpha: 0.1),
                      borderRadius: AppSpacing.borderRadiusMd,
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.check_circle,
                          color: AppColors.success,
                          size: 20,
                        ),
                        SizedBox(width: 8),
                        Text(
                          'Module Completed',
                          style: TextStyle(
                            color: AppColors.success,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  )
                else
                  AppButton(
                    text: 'Mark as Complete',
                    onPressed: () => _markAsComplete(module.id),
                    isFullWidth: true,
                    size: AppButtonSize.large,
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Routes to appropriate content builder based on module type.
  Widget _buildModuleContent(TrainingModule module) {
    switch (module.type) {
      case TrainingModuleType.video:
        return _buildVideoContent(module);
      case TrainingModuleType.pdf:
        return _buildPdfContent(module);
      case TrainingModuleType.article:
        return _buildArticleContent(module);
    }
  }

  /// Builds video content placeholder.
  ///
  /// TODO: Integrate with chewie/video_player for actual video playback.
  Widget _buildVideoContent(TrainingModule module) {
    // Placeholder for video player
    // In production, use chewie/video_player package
    return Column(
      children: [
        Expanded(
          child: Container(
            color: Colors.black,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.play_arrow,
                      size: 48,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),
                  const Text(
                    'Video Player',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Duration: ${module.durationMinutes} minutes',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        Container(
          padding: AppSpacing.paddingLg,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                module.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                module.description,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Builds PDF content placeholder.
  ///
  /// TODO: Integrate with flutter_pdfview for actual PDF rendering.
  Widget _buildPdfContent(TrainingModule module) {
    // Placeholder for PDF viewer
    // In production, use flutter_pdfview package
    return SingleChildScrollView(
      padding: AppSpacing.paddingLg,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            height: 400,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: AppSpacing.borderRadiusLg,
              border: Border.all(color: AppColors.border),
            ),
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.picture_as_pdf,
                  size: 64,
                  color: Colors.red,
                ),
                SizedBox(height: AppSpacing.lg),
                Text(
                  'PDF Viewer',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                SizedBox(height: AppSpacing.sm),
                Text(
                  'Document will be displayed here',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            module.title,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            module.description,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              const Icon(
                Icons.access_time,
                size: 16,
                color: AppColors.textTertiary,
              ),
              const SizedBox(width: 4),
              Text(
                'Estimated reading time: ${module.durationMinutes} minutes',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Builds article content with inline text display.
  Widget _buildArticleContent(TrainingModule module) {
    return SingleChildScrollView(
      padding: AppSpacing.paddingLg,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            module.title,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              const Icon(
                Icons.access_time,
                size: 14,
                color: AppColors.textTertiary,
              ),
              const SizedBox(width: 4),
              Text(
                '${module.durationMinutes} min read',
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textTertiary,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            module.description,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.textSecondary,
              height: 1.6,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          // Placeholder article content
          Container(
            padding: AppSpacing.paddingLg,
            decoration: const BoxDecoration(
              color: AppColors.surface,
              borderRadius: AppSpacing.borderRadiusMd,
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Article Content',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                SizedBox(height: AppSpacing.md),
                Text(
                  'This is where the full article content would be displayed. '
                  'The content would be loaded from the contentUrl and rendered here.\n\n'
                  'Key topics covered:\n'
                  '• Introduction to the platform\n'
                  '• Best practices\n'
                  '• Common mistakes to avoid\n'
                  '• Tips for success',
                  style: TextStyle(
                    fontSize: 15,
                    color: AppColors.textSecondary,
                    height: 1.6,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Marks a module as complete and returns to module list.
  ///
  /// Shows success/error feedback via SnackBar.
  Future<void> _markAsComplete(String moduleId) async {
    final success = await ref.read(activationProvider.notifier).completeTrainingModule(moduleId);

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Module marked as complete!'),
            backgroundColor: AppColors.success,
          ),
        );
        setState(() {
          _isViewing = false;
          _selectedModule = null;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to mark module as complete'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  /// Counts modules that have been marked as completed.
  int _getCompletedCount(
    List<TrainingModule> modules,
    Map<String, TrainingProgress> progress,
  ) {
    int count = 0;
    for (final module in modules) {
      if (progress[module.id]?.isCompleted ?? false) {
        count++;
      }
    }
    return count;
  }
}
