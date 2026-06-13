import 'package:flutter/material.dart';
import 'screens/splash_screen.dart';
import 'screens/webview_screen.dart';
import 'screens/error_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EmsMobileApp());
}

class EmsMobileApp extends StatelessWidget {
  const EmsMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Employee Management System',
      debugShowCheckedModeBanner: false,
      
      // Premium dark/light themes inspired by the web portal design
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1), // Indigo primary accent
          primary: const Color(0xFF6366F1),
          secondary: const Color(0xFF14B8A6), // Teal secondary accent
          surface: Colors.white,
          background: const Color(0xFFF8FAFC), // Cool grey background
        ),
        fontFamily: 'Poppins',
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF1E293B), // Slate dark header
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      
      // Route definitions
      initialRoute: '/',
      routes: {
        '/': (context) => const SplashScreen(),
        '/webview': (context) => const WebViewScreen(url: 'http://192.168.1.39:8080'), // Point to your computer's local IP address
        '/offline': (context) => const ErrorScreen(),
      },
    );
  }
}
