import '../models/quiz_model.dart';
import '../models/training_model.dart';

/// Mock data for the doer activation and onboarding flow.
///
/// Provides sample data for the activation process including training modules
/// and quiz questions that new doers must complete before becoming active on
/// the platform. This class supports development of the activation gate feature.
///
/// ## Activation Flow Overview
///
/// The activation process consists of:
/// 1. **Profile Setup**: Personal and professional information
/// 2. **Training Completion**: Watch videos, read documents
/// 3. **Quiz Assessment**: Answer questions to verify understanding
/// 4. **Bank Details**: Add payment information
///
/// ## Data Categories
///
/// The activation mock data includes:
/// - **Training Modules**: Onboarding content (videos, PDFs, articles)
/// - **Quiz Questions**: Assessment questions with multiple choice answers
///
/// ## Usage
///
/// ```dart
/// import 'package:doer_app/data/mock/mock_data.dart';
///
/// // Get training modules for onboarding
/// final modules = MockActivationData.getTrainingModules();
/// final totalDuration = modules.fold<int>(
///   0,
///   (sum, m) => sum + m.durationMinutes,
/// );
///
/// // Get quiz questions for assessment
/// final questions = MockActivationData.getQuizQuestions();
/// final passingScore = (questions.length * 0.8).ceil(); // 80% to pass
/// ```
///
/// ## Training Module Types
///
/// The mock training includes different content formats:
/// - **Video**: Platform introduction and quality standards
/// - **PDF**: Project guidelines documentation
/// - **Article**: Communication best practices
///
/// ## Quiz Structure
///
/// Each quiz question includes:
/// - Question text with 4 answer options (A-D)
/// - Correct answer index (0-based)
/// - Explanation for the correct answer
/// - Order index for sequencing
///
/// ## Note
///
/// This data should only be used in development and testing environments.
/// For production, use the ActivationRepository (planned) with actual API calls.
///
/// See also:
/// - [TrainingModule] for training content structure
/// - [QuizQuestion] for quiz question structure
/// - [QuizOption] for answer option structure
class MockActivationData {
  /// Private constructor to prevent instantiation.
  ///
  /// This class only contains static methods and should not be instantiated.
  MockActivationData._();

  /// Generates a list of training modules for the activation flow.
  ///
  /// Returns a list of [TrainingModule] objects representing mandatory
  /// onboarding content that new doers must complete before activation.
  ///
  /// The mock data includes 4 training modules:
  ///
  /// | # | Title | Type | Duration |
  /// |---|-------|------|----------|
  /// | 1 | Welcome to DOER | Video | 10 min |
  /// | 2 | Project Guidelines | PDF | 15 min |
  /// | 3 | Quality Standards | Video | 12 min |
  /// | 4 | Communication Best Practices | Article | 8 min |
  ///
  /// **Total Duration**: 45 minutes
  ///
  /// Each module contains:
  /// - Unique identifier
  /// - Title and description
  /// - Content type (video, pdf, article)
  /// - Content URL for the resource
  /// - Estimated duration in minutes
  /// - Order index for sequencing
  /// - Creation timestamp
  ///
  /// Returns a [List<TrainingModule>] containing 4 mock training modules.
  ///
  /// Example:
  /// ```dart
  /// final modules = MockActivationData.getTrainingModules();
  ///
  /// // Calculate total training time
  /// final totalMinutes = modules.fold<int>(
  ///   0,
  ///   (sum, module) => sum + module.durationMinutes,
  /// );
  /// print('Total training time: $totalMinutes minutes');
  ///
  /// // Get video modules only
  /// final videos = modules.where(
  ///   (m) => m.type == TrainingModuleType.video,
  /// );
  /// ```
  static List<TrainingModule> getTrainingModules() {
    return [
      TrainingModule(
        id: '1',
        title: 'Welcome to DOER',
        description: 'Introduction to the platform and how it works',
        type: TrainingModuleType.video,
        contentUrl: 'https://example.com/video1.mp4',
        durationMinutes: 10,
        orderIndex: 1,
        createdAt: DateTime.now(),
      ),
      TrainingModule(
        id: '2',
        title: 'Project Guidelines',
        description: 'Learn how to handle projects professionally',
        type: TrainingModuleType.pdf,
        contentUrl: 'https://example.com/guidelines.pdf',
        durationMinutes: 15,
        orderIndex: 2,
        createdAt: DateTime.now(),
      ),
      TrainingModule(
        id: '3',
        title: 'Quality Standards',
        description: 'Understanding our quality requirements',
        type: TrainingModuleType.video,
        contentUrl: 'https://example.com/video2.mp4',
        durationMinutes: 12,
        orderIndex: 3,
        createdAt: DateTime.now(),
      ),
      TrainingModule(
        id: '4',
        title: 'Communication Best Practices',
        description: 'How to communicate with supervisors',
        type: TrainingModuleType.article,
        contentUrl: 'https://example.com/article1',
        durationMinutes: 8,
        orderIndex: 4,
        createdAt: DateTime.now(),
      ),
    ];
  }

  /// Generates a list of quiz questions for the activation assessment.
  ///
  /// Returns a list of [QuizQuestion] objects that test the doer's
  /// understanding of platform policies, quality standards, and best practices.
  ///
  /// The mock quiz includes 10 questions covering:
  ///
  /// | Topic | Questions |
  /// |-------|-----------|
  /// | Platform Purpose | 1 |
  /// | Deadline Management | 2 |
  /// | Quality Standards | 1 |
  /// | Payment Process | 1 |
  /// | Bug Reporting | 1 |
  /// | Urgency Indicators | 1 |
  /// | Performance Impact | 1 |
  /// | Confidentiality | 1 |
  /// | Rating Improvement | 1 |
  /// | Citation Styles | 1 |
  ///
  /// Each question contains:
  /// - Unique identifier
  /// - Question text
  /// - 4 answer options (QuizOption with id and text)
  /// - Correct option index (0-based)
  /// - Explanation for the correct answer
  /// - Order index for sequencing
  ///
  /// ## Passing Criteria
  ///
  /// Typically, doers must score 80% or higher to pass the quiz.
  /// With 10 questions, this means answering at least 8 correctly.
  ///
  /// Returns a [List<QuizQuestion>] containing 10 mock quiz questions.
  ///
  /// Example:
  /// ```dart
  /// final questions = MockActivationData.getQuizQuestions();
  ///
  /// // Simulate quiz attempt
  /// int correctAnswers = 0;
  /// for (final question in questions) {
  ///   final userAnswer = getUserAnswer(question); // User's selection
  ///   if (userAnswer == question.correctOptionIndex) {
  ///     correctAnswers++;
  ///   }
  /// }
  ///
  /// final score = correctAnswers / questions.length * 100;
  /// final passed = score >= 80;
  /// print('Score: $score% - ${passed ? "PASSED" : "FAILED"}');
  /// ```
  static List<QuizQuestion> getQuizQuestions() {
    return [
      const QuizQuestion(
        id: '1',
        question: 'What is the primary focus of DOER platform?',
        options: [
          QuizOption(id: 'a', text: 'Social networking'),
          QuizOption(
              id: 'b', text: 'Academic and professional task completion'),
          QuizOption(id: 'c', text: 'Gaming'),
          QuizOption(id: 'd', text: 'Entertainment'),
        ],
        correctOptionIndex: 1,
        explanation:
            'DOER platform connects doers with academic and professional tasks.',
        orderIndex: 1,
      ),
      const QuizQuestion(
        id: '2',
        question: 'What should you do if you cannot meet a deadline?',
        options: [
          QuizOption(id: 'a', text: 'Ignore it'),
          QuizOption(id: 'b', text: 'Submit incomplete work'),
          QuizOption(id: 'c', text: 'Inform your supervisor immediately'),
          QuizOption(id: 'd', text: 'Delete the project'),
        ],
        correctOptionIndex: 2,
        explanation:
            'Always communicate with your supervisor about deadline issues.',
        orderIndex: 2,
      ),
      const QuizQuestion(
        id: '3',
        question: 'What is the minimum quality standard for submitted work?',
        options: [
          QuizOption(id: 'a', text: 'No specific standard'),
          QuizOption(id: 'b', text: 'Original, plagiarism-free content'),
          QuizOption(id: 'c', text: 'Copy-paste from internet'),
          QuizOption(id: 'd', text: 'Only grammar matters'),
        ],
        correctOptionIndex: 1,
        explanation: 'All work must be original and plagiarism-free.',
        orderIndex: 3,
      ),
      const QuizQuestion(
        id: '4',
        question: 'How do you receive payments for completed projects?',
        options: [
          QuizOption(id: 'a', text: 'Cash on delivery'),
          QuizOption(id: 'b', text: 'Through your linked bank account'),
          QuizOption(id: 'c', text: 'Gift cards'),
          QuizOption(id: 'd', text: 'Cryptocurrency only'),
        ],
        correctOptionIndex: 1,
        explanation: 'Payments are transferred to your linked bank account.',
        orderIndex: 4,
      ),
      const QuizQuestion(
        id: '5',
        question: 'What should you do if you find a bug in the platform?',
        options: [
          QuizOption(id: 'a', text: 'Exploit it for personal gain'),
          QuizOption(id: 'b', text: 'Report it to support'),
          QuizOption(id: 'c', text: 'Share it on social media'),
          QuizOption(id: 'd', text: 'Ignore it'),
        ],
        correctOptionIndex: 1,
        explanation: 'Always report bugs to our support team.',
        orderIndex: 5,
      ),
      const QuizQuestion(
        id: '6',
        question: 'What indicates an urgent project?',
        options: [
          QuizOption(id: 'a', text: 'Red badge or urgent label'),
          QuizOption(id: 'b', text: 'Higher word count'),
          QuizOption(id: 'c', text: 'Lower payment'),
          QuizOption(id: 'd', text: 'Multiple attachments'),
        ],
        correctOptionIndex: 0,
        explanation:
            'Urgent projects are marked with a red badge or urgent label.',
        orderIndex: 6,
      ),
      const QuizQuestion(
        id: '7',
        question: 'What happens if you miss a deadline?',
        options: [
          QuizOption(id: 'a', text: 'Nothing'),
          QuizOption(
              id: 'b', text: 'It may affect your rating and future projects'),
          QuizOption(id: 'c', text: 'You get a bonus'),
          QuizOption(id: 'd', text: 'Project is auto-completed'),
        ],
        correctOptionIndex: 1,
        explanation:
            'Missing deadlines can affect your rating and future project assignments.',
        orderIndex: 7,
      ),
      const QuizQuestion(
        id: '8',
        question: 'How should you handle confidential project information?',
        options: [
          QuizOption(id: 'a', text: 'Share it with friends'),
          QuizOption(id: 'b', text: 'Keep it strictly confidential'),
          QuizOption(id: 'c', text: 'Post it on social media'),
          QuizOption(id: 'd', text: 'Use it for other projects'),
        ],
        correctOptionIndex: 1,
        explanation:
            'All project information must be kept strictly confidential.',
        orderIndex: 8,
      ),
      const QuizQuestion(
        id: '9',
        question: 'What is the best way to improve your rating?',
        options: [
          QuizOption(
              id: 'a', text: 'Accept many projects and cancel some'),
          QuizOption(id: 'b', text: 'Deliver quality work on time'),
          QuizOption(id: 'c', text: 'Only accept low-paying projects'),
          QuizOption(id: 'd', text: 'Avoid difficult projects'),
        ],
        correctOptionIndex: 1,
        explanation:
            'Consistently delivering quality work on time is the best way to improve your rating.',
        orderIndex: 9,
      ),
      const QuizQuestion(
        id: '10',
        question: 'What citation styles should you be familiar with?',
        options: [
          QuizOption(id: 'a', text: 'Only APA'),
          QuizOption(id: 'b', text: 'Only MLA'),
          QuizOption(id: 'c', text: 'APA, MLA, Harvard, and others'),
          QuizOption(id: 'd', text: 'No citation is needed'),
        ],
        correctOptionIndex: 2,
        explanation:
            'Different projects may require different citation styles like APA, MLA, Harvard, etc.',
        orderIndex: 10,
      ),
    ];
  }
}
