import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'dart:developer' as developer;

final profileProvider =
    FutureProvider.autoDispose.family<Profile, String>((ref, userId) async {
  final supabase = Supabase.instance.client;

  developer.log('Fetching profile for user: $userId', name: 'Profile');

  final data = await supabase
      .from('profiles')
      .select('username, wallet_balance')
      .eq('id', userId)
      .single();

  developer.log('Profile data: $data', name: 'Profile');

  return Profile(
    username: data['username'] as String? ?? 'User',
    walletBalance: (data['wallet_balance'] as num?)?.toDouble() ?? 0.0,
  );
});

class Profile {
  final String username;
  final double walletBalance;

  Profile({
    required this.username,
    required this.walletBalance,
  });
}
