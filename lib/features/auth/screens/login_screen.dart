import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../wallet/screens/wallet_screen.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _usernameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _isSignUp = false;
  String _statusMessage = '';
  bool _passwordVisible = false;
  bool _confirmPasswordVisible = false;

  void _togglePasswordVisibility() {
    setState(() => _passwordVisible = !_passwordVisible);
  }

  void _toggleConfirmPasswordVisibility() {
    setState(() => _confirmPasswordVisible = !_confirmPasswordVisible);
  }

  void _submit() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) {
      setState(() => _statusMessage = 'Please fill in all required fields');
      return;
    }

    if (_isSignUp) {
      final username = _usernameController.text.trim();
      final mobile = _mobileController.text.trim();
      final confirmPassword = _confirmPasswordController.text.trim();

      if (username.isEmpty || mobile.isEmpty) {
        setState(() => _statusMessage = 'Please fill in all fields');
        return;
      }

      if (password != confirmPassword) {
        setState(() => _statusMessage = 'Passwords do not match');
        return;
      }

      setState(() => _statusMessage = 'Creating account...');
      await ref.read(authProvider.notifier).signUp(
            email: email,
            password: password,
            username: username,
            mobile: mobile,
          );
    } else {
      setState(() => _statusMessage = 'Logging in...');
      await ref.read(authProvider.notifier).signIn(email, password);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authAsync = ref.watch(authProvider);
    final isLoading = authAsync.isLoading;

    // Handle navigation when auth state changes
    ref.listen(authProvider, (previous, next) {
      next.whenData((user) {
        if (user != null && mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const WalletScreen()),
          );
        }
      });
    });

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Icon(
              Icons.account_balance_wallet,
              size: 80,
              color: AppTheme.primaryColor,
            ),
            const SizedBox(height: 24),
            Text(
              _isSignUp ? 'Create Account' : 'Welcome Back',
              style: Theme.of(context).textTheme.headlineMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            if (_isSignUp) ...[
              TextField(
                controller: _usernameController,
                decoration: const InputDecoration(
                  labelText: 'Username',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _mobileController,
                decoration: const InputDecoration(
                  labelText: 'Mobile Number',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.phone_outlined),
                ),
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
            ],
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                labelText: 'Email',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.email_outlined),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passwordController,
              decoration: InputDecoration(
                labelText: 'Password',
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.lock_outline),
                suffixIcon: IconButton(
                  icon: Icon(
                    _passwordVisible ? Icons.visibility : Icons.visibility_off,
                  ),
                  onPressed: _togglePasswordVisibility,
                ),
              ),
              obscureText: !_passwordVisible,
            ),
            if (_isSignUp) ...[
              const SizedBox(height: 16),
              TextField(
                controller: _confirmPasswordController,
                decoration: InputDecoration(
                  labelText: 'Confirm Password',
                  border: const OutlineInputBorder(),
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _confirmPasswordVisible
                          ? Icons.visibility
                          : Icons.visibility_off,
                    ),
                    onPressed: _toggleConfirmPasswordVisibility,
                  ),
                ),
                obscureText: !_confirmPasswordVisible,
              ),
            ],
            if (_statusMessage.isNotEmpty) ...[
              const SizedBox(height: 16),
              Text(
                _statusMessage,
                style: TextStyle(
                  color: _statusMessage.startsWith('Error')
                      ? AppTheme.errorColor
                      : AppTheme.primaryColor,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: isLoading ? null : _submit,
              child: isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2),
                    )
                  : Text(_isSignUp ? 'Sign Up' : 'Login'),
            ),
            TextButton(
              onPressed: () => setState(() {
                _isSignUp = !_isSignUp;
                _statusMessage = '';
              }),
              child: Text(_isSignUp
                  ? 'Already have an account? Login'
                  : 'New here? Create an account'),
            ),
          ],
        ),
      ),
    );
  }
}
