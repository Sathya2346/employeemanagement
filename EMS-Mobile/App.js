import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Web Polyfill for Expo Modules Core Web Runtime & Document Title
if (typeof window !== 'undefined') {
  if (!window._expoModulesCore) {
    window._expoModulesCore = {};
  }
  if (typeof window._expoModulesCore.registerWebModule !== 'function') {
    window._expoModulesCore.registerWebModule = (mod) => {
      if (typeof mod === 'function') {
        try {
          return new mod();
        } catch (e) {
          return mod();
        }
      }
      return mod;
    };
  }
  if (typeof document !== 'undefined') {
    document.title = 'Employee Management System | EMS';
    // Inject global CSS to match Thymeleaf font family and base styles
    const style = document.createElement('style');
    style.textContent = `
      body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
      input, select, textarea { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
    `;
    document.head.appendChild(style);
  }
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'Employee Management System | EMS';
    }
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer
          documentTitle={{
            formatter: (options, route) => `EMS | ${route?.name ? route.name.replace('User', '').replace('Admin', 'Admin ') : 'Portal'}`,
          }}
        >
          {Platform.OS !== 'web' && <StatusBar barStyle="dark-content" />}
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
