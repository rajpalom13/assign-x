import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'core/config/env.dart';
import 'core/network/supabase_client.dart';

/// Application entry point.
///
/// Initializes services and runs the app.
void main() async {
  // Ensure Flutter bindings are initialized
  WidgetsFlutterBinding.ensureInitialized();

  // Set preferred orientations
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  // Initialize Supabase
  try {
    if (Env.isConfigured) {
      await SupabaseService.initialize();
    } else {
      debugPrint('Warning: Supabase not configured. Running in demo mode.');
    }
  } catch (e) {
    debugPrint('Error initializing Supabase: $e');
  }

  // Run the app with Riverpod
  runApp(
    const ProviderScope(
      child: AdminXApp(),
    ),
  );
}
