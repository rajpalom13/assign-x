import '../../providers/resources_provider.dart';

/// Mock data for resources hub and AI content checking features.
///
/// Provides sample data for the resources section including training modules
/// and AI content detection simulation. This class supports development of
/// the learning and quality assurance features of the DOER platform.
///
/// ## Data Categories
///
/// The resources mock data includes:
/// - **Training Modules**: Educational content for skill development
/// - **AI Check Results**: Simulated AI content detection analysis
///
/// ## Usage
///
/// ```dart
/// import 'package:doer_app/data/mock/mock_data.dart';
///
/// // Get available training modules
/// final modules = MockResourcesData.getTrainingModules();
/// final requiredModules = modules.where((m) => m.isRequired);
///
/// // Simulate AI content check
/// final content = 'Your essay content here...';
/// final result = MockResourcesData.getAICheckResult(content);
/// print('AI Score: ${result.aiScore}%');
/// ```
///
/// ## Training Module Categories
///
/// The mock training modules cover:
/// - **Onboarding**: Platform introduction (required)
/// - **Writing Skills**: Academic writing, citations, advanced techniques
/// - **Ethics**: Plagiarism awareness, AI tool usage
/// - **Research**: Research methodologies
/// - **Productivity**: Time management strategies
///
/// ## AI Check Simulation
///
/// The AI check feature simulates content analysis by:
/// - Analyzing text patterns and word characteristics
/// - Detecting common AI-generated phrases
/// - Generating probability scores and highlights
/// - Providing actionable verdicts
///
/// ## Note
///
/// This data should only be used in development and testing environments.
/// For production, use the ResourcesRepository (planned) with actual API calls.
///
/// See also:
/// - [TrainingModule] for training content structure
/// - [AICheckResult] for AI detection result structure
/// - [AIHighlight] for highlighted content sections
class MockResourcesData {
  /// Private constructor to prevent instantiation.
  ///
  /// This class only contains static methods and should not be instantiated.
  MockResourcesData._();

  /// Generates a list of training modules for the resources hub.
  ///
  /// Returns a list of [TrainingModule] objects representing educational
  /// content available to doers for skill development and platform training.
  ///
  /// The mock data includes 8 training modules:
  ///
  /// | Module | Category | Duration | Required | Status |
  /// |--------|----------|----------|----------|--------|
  /// | Getting Started | Onboarding | 15 min | Yes | Completed |
  /// | Academic Writing Standards | Writing Skills | 30 min | Yes | Completed |
  /// | Understanding Plagiarism | Ethics | 20 min | Yes | 50% progress |
  /// | Citation Styles Deep Dive | Writing Skills | 45 min | No | Not started |
  /// | Research Methodologies | Research | 40 min | No | Not started |
  /// | Time Management | Productivity | 25 min | No | Not started |
  /// | Advanced Writing Techniques | Writing Skills | 35 min | No | Not started |
  /// | Working with AI Tools | Ethics | 30 min | No | Not started |
  ///
  /// Returns a [List<TrainingModule>] containing 8 mock training modules.
  ///
  /// Example:
  /// ```dart
  /// final modules = MockResourcesData.getTrainingModules();
  ///
  /// // Get completion progress
  /// final completed = modules.where((m) => m.isCompleted).length;
  /// final total = modules.length;
  /// print('Progress: $completed/$total modules completed');
  ///
  /// // Filter required modules
  /// final required = modules.where((m) => m.isRequired);
  /// ```
  static List<TrainingModule> getTrainingModules() {
    return [
      const TrainingModule(
        id: '1',
        title: 'Getting Started with DOER',
        description:
            'Learn the basics of using the DOER platform and accepting your first project.',
        category: 'Onboarding',
        durationMinutes: 15,
        isCompleted: true,
        progress: 1.0,
        orderIndex: 1,
        isRequired: true,
      ),
      const TrainingModule(
        id: '2',
        title: 'Academic Writing Standards',
        description:
            'Master academic writing conventions, proper citations, and formatting guidelines.',
        category: 'Writing Skills',
        durationMinutes: 30,
        isCompleted: true,
        progress: 1.0,
        orderIndex: 2,
        isRequired: true,
      ),
      const TrainingModule(
        id: '3',
        title: 'Understanding Plagiarism',
        description:
            'Learn what constitutes plagiarism and how to avoid it in your work.',
        category: 'Ethics',
        durationMinutes: 20,
        isCompleted: false,
        progress: 0.5,
        orderIndex: 3,
        isRequired: true,
      ),
      const TrainingModule(
        id: '4',
        title: 'Citation Styles Deep Dive',
        description:
            'Comprehensive guide to APA, MLA, Harvard, and other citation formats.',
        category: 'Writing Skills',
        durationMinutes: 45,
        orderIndex: 4,
      ),
      const TrainingModule(
        id: '5',
        title: 'Research Methodologies',
        description:
            'Understanding different research methods and when to apply them.',
        category: 'Research',
        durationMinutes: 40,
        orderIndex: 5,
      ),
      const TrainingModule(
        id: '6',
        title: 'Time Management for Writers',
        description:
            'Effective strategies for managing deadlines and maintaining quality.',
        category: 'Productivity',
        durationMinutes: 25,
        orderIndex: 6,
      ),
      const TrainingModule(
        id: '7',
        title: 'Advanced Writing Techniques',
        description:
            'Take your writing to the next level with advanced techniques and tips.',
        category: 'Writing Skills',
        durationMinutes: 35,
        orderIndex: 7,
      ),
      const TrainingModule(
        id: '8',
        title: 'Working with AI Tools',
        description:
            'Learn how to use AI assistants ethically and effectively in your work.',
        category: 'Ethics',
        durationMinutes: 30,
        orderIndex: 8,
      ),
    ];
  }

  /// Generates a simulated AI content detection result.
  ///
  /// Analyzes the provided [content] and returns an [AICheckResult] with
  /// mock scores and highlights. This simulation is deterministic and based
  /// on text characteristics rather than actual AI detection.
  ///
  /// ## Scoring Algorithm
  ///
  /// The mock algorithm considers:
  /// - **Base Score**: 25% AI probability
  /// - **Word Length**: +15% if average word length > 6 characters
  /// - **Repetition**: -10% if excessive word repetition detected
  /// - **Content Length**: +10% if content exceeds 500 characters
  /// - **Formal Phrases**: +5% each for "Therefore", "However", "Furthermore"
  /// - **Conclusion Phrase**: +10% for "In conclusion"
  ///
  /// Final score is clamped between 5% and 95%.
  ///
  /// ## Verdicts
  ///
  /// Based on the AI score:
  /// - **> 70%**: "Primarily AI-generated. Consider rewriting."
  /// - **50-70%**: "Some AI-like patterns. Review highlighted sections."
  /// - **30-50%**: "Mostly human-written with some AI assistance."
  /// - **< 30%**: "Primarily human-written. Good job!"
  ///
  /// ## Parameters
  ///
  /// - [content]: The text content to analyze for AI patterns.
  ///
  /// ## Returns
  ///
  /// An [AICheckResult] object containing:
  /// - AI and human probability scores
  /// - List of highlighted suspicious sections
  /// - Overall verdict message
  /// - Timestamp of the check
  ///
  /// ## Example
  ///
  /// ```dart
  /// final content = '''
  /// Therefore, it is important to consider multiple perspectives.
  /// Furthermore, the evidence suggests that climate change is real.
  /// In conclusion, we must take action now.
  /// ''';
  ///
  /// final result = MockResourcesData.getAICheckResult(content);
  ///
  /// print('AI Score: ${result.aiScore.toStringAsFixed(1)}%');
  /// print('Human Score: ${result.humanScore.toStringAsFixed(1)}%');
  /// print('Verdict: ${result.verdict}');
  ///
  /// for (final highlight in result.highlights) {
  ///   print('Flagged: ${highlight.reason}');
  /// }
  /// ```
  static AICheckResult getAICheckResult(String content) {
    // Mock scoring based on content characteristics
    final wordCount = content.split(' ').length;
    final hasRepetition = content.contains(RegExp(r'(\b\w+\b).*\1.*\1.*\1'));
    final avgWordLength = content.isEmpty ? 0 : content.length / wordCount;

    // Generate semi-random but consistent scores
    var aiScore = 25.0;
    if (avgWordLength > 6) aiScore += 15;
    if (hasRepetition) aiScore -= 10;
    if (content.length > 500) aiScore += 10;
    if (content.contains('Therefore')) aiScore += 5;
    if (content.contains('However')) aiScore += 5;
    if (content.contains('Furthermore')) aiScore += 5;
    if (content.contains('In conclusion')) aiScore += 10;

    aiScore = aiScore.clamp(5.0, 95.0);
    final humanScore = 100.0 - aiScore;

    String verdict;
    if (aiScore > 70) {
      verdict =
          'This content appears to be primarily AI-generated. Consider rewriting key sections.';
    } else if (aiScore > 50) {
      verdict =
          'This content shows some AI-like patterns. Review highlighted sections.';
    } else if (aiScore > 30) {
      verdict =
          'This content appears to be mostly human-written with some AI assistance.';
    } else {
      verdict = 'This content appears to be primarily human-written. Good job!';
    }

    // Generate some mock highlights
    final highlights = <AIHighlight>[];
    if (content.contains('Therefore')) {
      final idx = content.indexOf('Therefore');
      highlights.add(AIHighlight(
        startIndex: idx,
        endIndex: (idx + 50).clamp(0, content.length),
        probability: 0.65,
        reason: 'Formal transitional phrase often used by AI',
      ));
    }
    if (content.contains('Furthermore')) {
      final idx = content.indexOf('Furthermore');
      highlights.add(AIHighlight(
        startIndex: idx,
        endIndex: (idx + 60).clamp(0, content.length),
        probability: 0.55,
        reason: 'Connecting phrase common in AI-generated content',
      ));
    }
    if (content.contains('In conclusion')) {
      final idx = content.indexOf('In conclusion');
      highlights.add(AIHighlight(
        startIndex: idx,
        endIndex: (idx + 80).clamp(0, content.length),
        probability: 0.70,
        reason: 'Standard conclusion opener frequently used by AI',
      ));
    }

    return AICheckResult(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      content: content,
      aiScore: aiScore,
      humanScore: humanScore,
      highlights: highlights,
      verdict: verdict,
      checkedAt: DateTime.now(),
    );
  }
}
