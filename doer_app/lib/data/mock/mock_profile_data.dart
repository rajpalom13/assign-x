import '../../providers/profile_provider.dart';

/// Mock data for profile-related entities and user account features.
///
/// Provides realistic sample data for the profile feature including user
/// information, payment history, bank details, and notifications. This class
/// is essential for development and testing of user account screens.
///
/// ## Data Categories
///
/// The profile mock data includes:
/// - **User Profile**: Personal information, skills, and performance metrics
/// - **Payment History**: Transaction records with various statuses
/// - **Bank Details**: Verified bank account information
/// - **Notifications**: Various notification types and read states
///
/// ## Usage
///
/// ```dart
/// import 'package:doer_app/data/mock/mock_data.dart';
///
/// // Get user profile data
/// final profile = MockProfileData.getProfile();
/// print('Welcome, ${profile.fullName}');
///
/// // Get payment transaction history
/// final payments = MockProfileData.getPaymentHistory();
/// final pendingPayments = payments.where(
///   (p) => p.status == PaymentStatus.pending,
/// );
///
/// // Get bank account details
/// final bank = MockProfileData.getBankDetails();
///
/// // Get notification list
/// final notifications = MockProfileData.getNotifications();
/// final unreadCount = notifications.where((n) => !n.isRead).length;
/// ```
///
/// ## Data Characteristics
///
/// The mock data demonstrates various UI states:
/// - Payment statuses: pending, processing, completed
/// - Payment types: project payments, referral bonuses
/// - Notification types: project, payment, deadline, review, system
/// - Read/unread notification states
///
/// ## Note
///
/// This data should only be used in development and testing environments.
/// For production, use the ProfileRepository (planned) with actual API calls.
///
/// See also:
/// - [UserProfile] for profile data structure
/// - [PaymentTransaction] for payment data structure
/// - [BankDetails] for bank account structure
/// - [AppNotification] for notification structure
class MockProfileData {
  /// Private constructor to prevent instantiation.
  ///
  /// This class only contains static methods and should not be instantiated.
  MockProfileData._();

  /// Generates a complete mock user profile.
  ///
  /// Returns a [UserProfile] object with comprehensive user data including
  /// personal information, professional details, and performance metrics.
  ///
  /// The mock profile includes:
  /// - **Personal Info**: Name, email, phone, bio
  /// - **Professional**: Education level, skill set
  /// - **Performance**: Rating (4.8), 47 completed projects
  /// - **Financial**: Rs. 125,000 total earnings
  /// - **Account Status**: Verified, 180 days membership
  ///
  /// Returns a [UserProfile] object representing an experienced doer.
  ///
  /// Example:
  /// ```dart
  /// final profile = MockProfileData.getProfile();
  /// print('${profile.fullName} - Rating: ${profile.rating}');
  /// print('Skills: ${profile.skills.join(", ")}');
  /// ```
  static UserProfile getProfile() {
    return UserProfile(
      id: 'mock-user-id',
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      phone: '+91 98765 43210',
      bio:
          'Experienced academic writer with expertise in research papers, essays, and technical writing.',
      education: 'M.A. in English Literature',
      skills: [
        'Research Papers',
        'Essays',
        'Technical Writing',
        'APA Format',
        'MLA Format'
      ],
      rating: 4.8,
      completedProjects: 47,
      totalEarnings: 125000,
      joinedAt: DateTime.now().subtract(const Duration(days: 180)),
      isVerified: true,
      isAvailable: true,
    );
  }

  /// Generates a list of mock payment transactions.
  ///
  /// Returns a list of [PaymentTransaction] objects representing the doer's
  /// payment history with various transaction types and statuses.
  ///
  /// The mock data includes:
  /// - 5 transactions demonstrating different scenarios
  /// - **Completed payments**: Successfully processed to bank
  /// - **Processing payments**: Currently being transferred
  /// - **Pending payments**: Awaiting processing
  /// - **Referral bonus**: Non-project payment type
  ///
  /// Transaction details include:
  /// - Project references and titles
  /// - Amount in Indian Rupees
  /// - Timestamps for creation and processing
  /// - Transaction IDs for completed payments
  ///
  /// Returns a [List<PaymentTransaction>] containing 5 mock transactions.
  ///
  /// Example:
  /// ```dart
  /// final payments = MockProfileData.getPaymentHistory();
  ///
  /// // Calculate total completed earnings
  /// final completedTotal = payments
  ///   .where((p) => p.status == PaymentStatus.completed)
  ///   .map((p) => p.amount)
  ///   .fold(0.0, (a, b) => a + b);
  ///
  /// // Find pending payments
  /// final pending = payments.where(
  ///   (p) => p.status == PaymentStatus.pending,
  /// );
  /// ```
  static List<PaymentTransaction> getPaymentHistory() {
    return [
      PaymentTransaction(
        id: '1',
        projectId: 'p1',
        projectTitle: 'Research Paper on Climate Change',
        amount: 3500,
        status: PaymentStatus.completed,
        type: PaymentType.projectPayment,
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
        processedAt: DateTime.now().subtract(const Duration(days: 1)),
        transactionId: 'TXN001234567',
      ),
      PaymentTransaction(
        id: '2',
        projectId: 'p2',
        projectTitle: 'Business Case Study Analysis',
        amount: 2800,
        status: PaymentStatus.completed,
        type: PaymentType.projectPayment,
        createdAt: DateTime.now().subtract(const Duration(days: 7)),
        processedAt: DateTime.now().subtract(const Duration(days: 6)),
        transactionId: 'TXN001234568',
      ),
      PaymentTransaction(
        id: '3',
        projectId: 'p3',
        projectTitle: 'Literature Review Essay',
        amount: 1500,
        status: PaymentStatus.processing,
        type: PaymentType.projectPayment,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
      PaymentTransaction(
        id: '4',
        projectId: '',
        projectTitle: 'Referral Bonus - Sarah M.',
        amount: 500,
        status: PaymentStatus.completed,
        type: PaymentType.referral,
        createdAt: DateTime.now().subtract(const Duration(days: 14)),
        processedAt: DateTime.now().subtract(const Duration(days: 13)),
      ),
      PaymentTransaction(
        id: '5',
        projectId: 'p4',
        projectTitle: 'MBA Dissertation Chapter',
        amount: 5000,
        status: PaymentStatus.pending,
        type: PaymentType.projectPayment,
        createdAt: DateTime.now(),
      ),
    ];
  }

  /// Generates mock verified bank account details.
  ///
  /// Returns a [BankDetails] object representing the doer's linked bank
  /// account for receiving payments.
  ///
  /// The mock bank details include:
  /// - **Account Name**: John Doe (matching profile name)
  /// - **Account Number**: 16-digit masked account number
  /// - **IFSC Code**: HDFC0001234 (HDFC Bank format)
  /// - **Bank Name**: HDFC Bank
  /// - **Verification Status**: Verified and set as primary
  ///
  /// Returns a [BankDetails] object with verified bank information.
  ///
  /// Example:
  /// ```dart
  /// final bank = MockProfileData.getBankDetails();
  /// if (bank.isVerified) {
  ///   print('Bank: ${bank.bankName}');
  ///   print('Account: ****${bank.accountNumber.substring(12)}');
  /// }
  /// ```
  static BankDetails getBankDetails() {
    return const BankDetails(
      id: 'bank1',
      accountName: 'John Doe',
      accountNumber: '1234567890123456',
      ifscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
      isVerified: true,
      isPrimary: true,
    );
  }

  /// Generates a list of mock app notifications.
  ///
  /// Returns a list of [AppNotification] objects representing various
  /// notification types that a doer might receive.
  ///
  /// The mock data includes:
  /// - 5 notifications of different types
  /// - **Project**: New project matching skills
  /// - **Payment**: Payment processing updates
  /// - **Deadline**: Upcoming deadline reminders
  /// - **Review**: New review received alerts
  /// - **System**: Platform announcements
  ///
  /// Notifications span the past 4 days with mixed read states:
  /// - 2 unread notifications (recent)
  /// - 3 read notifications (older)
  ///
  /// Returns a [List<AppNotification>] containing 5 mock notifications.
  ///
  /// Example:
  /// ```dart
  /// final notifications = MockProfileData.getNotifications();
  ///
  /// // Get unread count for badge
  /// final unreadCount = notifications.where((n) => !n.isRead).length;
  ///
  /// // Filter by type
  /// final paymentNotifications = notifications.where(
  ///   (n) => n.type == NotificationType.payment,
  /// );
  /// ```
  static List<AppNotification> getNotifications() {
    return [
      AppNotification(
        id: 'n1',
        title: 'New Project Available',
        message:
            'A new research paper project matching your skills is now available.',
        type: NotificationType.project,
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        isRead: false,
        actionUrl: '/projects',
      ),
      AppNotification(
        id: 'n2',
        title: 'Payment Processed',
        message:
            'Your payment of Rs. 3,500 for "Research Paper on Climate Change" has been processed.',
        type: NotificationType.payment,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        isRead: false,
      ),
      AppNotification(
        id: 'n3',
        title: 'Deadline Reminder',
        message: 'Project "Business Case Study" is due in 24 hours.',
        type: NotificationType.deadline,
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
        isRead: true,
      ),
      AppNotification(
        id: 'n4',
        title: 'New Review Received',
        message: 'You received a 5-star review for your recent project.',
        type: NotificationType.review,
        createdAt: DateTime.now().subtract(const Duration(days: 3)),
        isRead: true,
      ),
      AppNotification(
        id: 'n5',
        title: 'System Maintenance',
        message: 'Scheduled maintenance on Sunday 2-4 AM.',
        type: NotificationType.system,
        createdAt: DateTime.now().subtract(const Duration(days: 4)),
        isRead: true,
      ),
    ];
  }
}
