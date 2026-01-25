import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:developer' as developer;

final authProvider =
    StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  return AuthNotifier();
});

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  AuthNotifier() : super(const AsyncValue.data(null)) {
    _init();
  }

  final _supabase = Supabase.instance.client;
  bool _initialized = false;

  void _init() {
    if (_initialized) return;
    _initialized = true;

    // Set initial state
    final currentUser = _supabase.auth.currentUser;
    state = AsyncValue.data(currentUser);
    developer.log('Auth initialized with user: ${currentUser?.email ?? 'none'}',
        name: 'Auth');

    // Listen for auth changes
    _supabase.auth.onAuthStateChange.listen((data) {
      developer.log(
          'Auth state changed: ${data.event} - ${data.session?.user.email ?? 'no user'}',
          name: 'Auth');
      state = AsyncValue.data(data.session?.user);
    });
  }

    Future<void> signUp({
    required String email,
    required String password,
    required String username,
    required String mobile,
  }) async {
    developer.log('Signing up: $email', name: 'Auth');
    state = const AsyncValue.loading();
    try {
      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {
          'username': username,
          'mobile': mobile,
        },
      );

      if (response.user != null) {
        developer.log('Signup successful: ${response.user?.email}',
            name: 'Auth');
        state = AsyncValue.data(response.user);
      } else {
        developer.log('Signup failed: No user returned', name: 'Auth');
        state = AsyncValue.error('Signup failed', StackTrace.current);
      }
    } on AuthException catch (e) {
      developer.log('Signup error: ${e.message}', name: 'Auth');
      state = AsyncValue.error(e.message, StackTrace.current);
    } catch (e, st) {
      developer.log('Signup error: $e', name: 'Auth', error: st);
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signIn(String email, String password) async {
    developer.log('Signing in: $email', name: 'Auth');
    state = const AsyncValue.loading();
    try {
      final response = await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      if (response.user != null) {
        developer.log('Login successful: ${response.user?.email}',
            name: 'Auth');
        state = AsyncValue.data(response.user);
      } else {
        developer.log('Login failed: No user returned', name: 'Auth');
        state = AsyncValue.error('Login failed', StackTrace.current);
      }
    } on AuthException catch (e) {
      developer.log('Login error: ${e.message}', name: 'Auth');
      state = AsyncValue.error(e.message, StackTrace.current);
    } catch (e, st) {
      developer.log('Login error: $e', name: 'Auth', error: st);
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signOut() async {
    developer.log('Signing out', name: 'Auth');
    await _supabase.auth.signOut();
    state = const AsyncValue.data(null);
  }

  User? get currentUser => _supabase.auth.currentUser;
}
