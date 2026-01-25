import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/config/supabase_config.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/auth/screens/splash_screen.dart';
import 'features/wallet/providers/wallet_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: SupabaseConfig.supabaseUrl,
    anonKey: SupabaseConfig.supabaseAnonKey,
  );

  runApp(
    const ProviderScope(
      child: CapSplitApp(),
    ),
  );
}

class CapSplitApp extends ConsumerWidget {
  const CapSplitApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Initialize wallet provider
    ref.watch(walletProvider);

    return MaterialApp(
      title: 'CapSplit',
      theme: AppTheme.lightTheme,
      debugShowCheckedModeBanner: false,
      home: const VideoSplashScreen(),
    );
  }
}
