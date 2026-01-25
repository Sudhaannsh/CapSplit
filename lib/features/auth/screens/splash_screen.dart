import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'login_screen.dart';
import '../../wallet/screens/wallet_screen.dart';

class VideoSplashScreen extends StatefulWidget {
  const VideoSplashScreen({super.key});

  @override
  State<VideoSplashScreen> createState() => _VideoSplashScreenState();
}

class _VideoSplashScreenState extends State<VideoSplashScreen> {
  late VideoPlayerController _videoPlayerController;
  ChewieController? _chewieController;
  bool _isLoading = true;
  bool _videoFinished = false;

  @override
  void initState() {
    super.initState();
    _initializeVideoPlayer();
  }

  void _initializeVideoPlayer() {
    _videoPlayerController =
        VideoPlayerController.asset('assets/splash_video.mp4')
          ..initialize().then((_) {
            setState(() => _isLoading = false);
            _videoPlayerController.play();

            // Set up video completion listener
            _videoPlayerController.addListener(() {
              if (_videoPlayerController.value.position >=
                  _videoPlayerController.value.duration) {
                _videoFinished = true;
                _checkAuthStatus();
              }
            });
          });

    _chewieController = ChewieController(
      videoPlayerController: _videoPlayerController,
      autoPlay: true,
      looping: false,
      showControls: false,
      showOptions: false,
      allowedScreenSleep: false,
      allowFullScreen: false,
      allowMuting: false,
      allowPlaybackSpeedChanging: false,
      errorBuilder: (context, errorMessage) {
        return Center(
          child: Text(
            errorMessage,
            style: const TextStyle(color: Colors.white),
          ),
        );
      },
    );
  }

  Future<void> _checkAuthStatus() async {
    if (!mounted) return;

    final session = Supabase.instance.client.auth.currentSession;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) =>
            session != null ? const WalletScreen() : const LoginScreen(),
      ),
    );
  }

  @override
  void dispose() {
    _videoPlayerController.dispose();
    _chewieController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Stack(
          children: [
            // Video Player
            _isLoading
                ? const CircularProgressIndicator()
                : Chewie(controller: _chewieController!),

            // App Logo Overlay
            Positioned(
              top: 60,
              left: 0,
              right: 0,
              child: Center(
                child: Column(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(30),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.account_balance_wallet,
                        size: 60,
                        color: Color(0xFF6366F1),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'CapSplit',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        shadows: [
                          Shadow(
                            blurRadius: 10,
                            color: Colors.black38,
                            offset: Offset(0, 2),
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom Text
            const Positioned(
              bottom: 60,
              left: 0,
              right: 0,
              child: Center(
                child: Text(
                  'Smart Money Management',
                  style: TextStyle(
                    fontSize: 18,
                    color: Colors.white70,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),

            // Skip Button
            Positioned(
              top: 40,
              right: 20,
              child: GestureDetector(
                onTap: _videoFinished ? null : _checkAuthStatus,
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Skip',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
