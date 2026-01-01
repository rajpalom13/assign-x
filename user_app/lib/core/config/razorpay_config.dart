/// Razorpay configuration for payment processing.
///
/// Contains API keys for test and production environments.
/// IMPORTANT: In production, these should come from --dart-define or secure storage.
class RazorpayConfig {
  RazorpayConfig._();

  /// Test API Key
  /// For development and testing purposes only.
  static const String testApiKey = String.fromEnvironment(
    'RAZORPAY_KEY_ID',
    defaultValue: 'rzp_test_Rv45IObrwfKRyf',
  );

  /// Test API Secret
  /// For development and testing purposes only.
  static const String testKeySecret = String.fromEnvironment(
    'RAZORPAY_KEY_SECRET',
    defaultValue: 'p2ZIwNBpnf1Gh7icvCm6oicD',
  );

  /// Whether to use test mode
  static const bool isTestMode = bool.fromEnvironment(
    'RAZORPAY_TEST_MODE',
    defaultValue: true,
  );

  /// Get the active API key
  static String get apiKey => testApiKey;

  /// Razorpay company name displayed during checkout
  static const String companyName = 'AssignX';

  /// Razorpay company description
  static const String description = 'Academic Support Platform';

  /// Company logo URL for checkout
  static const String logoUrl = 'https://assignx.in/logo.png';

  /// Theme color for Razorpay checkout (hex without #)
  static const String themeColor = '6366F1';

  /// Prefill customer details
  static Map<String, String> getPrefillData({
    String? name,
    String? email,
    String? phone,
  }) {
    return {
      if (name != null) 'name': name,
      if (email != null) 'email': email,
      if (phone != null) 'contact': phone,
    };
  }

  /// Create checkout options
  static Map<String, dynamic> createCheckoutOptions({
    required int amountInPaise,
    required String orderId,
    String? name,
    String? email,
    String? phone,
    String? description,
  }) {
    return {
      'key': apiKey,
      'amount': amountInPaise,
      'name': companyName,
      'description': description ?? RazorpayConfig.description,
      'order_id': orderId,
      'prefill': getPrefillData(name: name, email: email, phone: phone),
      'theme': {
        'color': '#$themeColor',
      },
    };
  }
}
