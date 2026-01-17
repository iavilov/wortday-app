import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
  IBMPlexSans_700Bold,
} from '@expo-google-fonts/ibm-plex-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import "../global.css";

import { Colors } from '@/constants/design-tokens';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { initializeNotifications } from '@/lib/notifications';
import { setupAuthListener, useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { useWordStore } from '@/store/word-store';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  const { hasCompletedOnboarding, _hasHydrated: settingsHydrated, hydrate: hydrateSettings } = useSettingsStore();
  const { _hasHydrated: wordHydrated, hydrate: hydrateWords } = useWordStore();
  const { initialize: initializeAuth, isInitialized: authInitialized, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [fontsLoaded] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexSans_700Bold,
  });

  // Hydrate stores, initialize auth, and initialize notifications on mount
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        hydrateSettings(),
        hydrateWords(),
        initializeAuth(),
      ]);

      // Initialize notifications (iOS/Android only)
      await initializeNotifications();

      setIsReady(true);
    };
    init();
  }, []);

  // Setup auth state listener
  useEffect(() => {
    const subscription = setupAuthListener();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle navigation after hydration (Auth Guard + Onboarding)
  useEffect(() => {
    if (!isReady || !fontsLoaded || !settingsHydrated || !wordHydrated || !authInitialized || authLoading) {
      console.log('[AuthGuard] Waiting for initialization...', {
        isReady,
        fontsLoaded,
        settingsHydrated,
        wordHydrated,
        authInitialized,
        authLoading,
      });
      return;
    }

    const inAuthFlow = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    console.log('[AuthGuard] Checking navigation:', {
      isAuthenticated,
      hasCompletedOnboarding,
      segments: segments.join('/'),
      inAuthFlow,
      inOnboarding,
    });

    // Priority 1: Auth Guard (redirect to login if not authenticated)
    if (!isAuthenticated && !inAuthFlow) {
      console.log('[AuthGuard] Priority 1: Redirecting to login (not authenticated)');
      router.replace('/auth/login');
      SplashScreen.hideAsync();
      return;
    }

    // Priority 2: Redirect authenticated users away from auth flow
    // BUT only if onboarding is completed (otherwise Priority 3 will handle it)
    if (isAuthenticated && inAuthFlow && hasCompletedOnboarding) {
      console.log('[AuthGuard] Priority 2: Redirecting to tabs (auth flow + onboarding completed)');
      router.replace('/(tabs)');
      SplashScreen.hideAsync();
      return;
    }

    // Priority 3: Onboarding flow (only for authenticated users)
    if (isAuthenticated && !hasCompletedOnboarding && !inOnboarding) {
      console.log('[AuthGuard] Priority 3: Redirecting to onboarding (not completed)');
      router.replace('/onboarding');
      SplashScreen.hideAsync();
      return;
    }

    if (isAuthenticated && hasCompletedOnboarding && inOnboarding) {
      console.log('[AuthGuard] Redirecting to tabs (onboarding completed but in onboarding screen)');
      router.replace('/(tabs)');
      SplashScreen.hideAsync();
      return;
    }

    console.log('[AuthGuard] No redirect needed, hiding splash screen');
    SplashScreen.hideAsync();
  }, [isReady, fontsLoaded, settingsHydrated, wordHydrated, authInitialized, isAuthenticated, hasCompletedOnboarding, segments, authLoading]);

  if (!fontsLoaded || !isReady || !settingsHydrated || !wordHydrated || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, width: '100%', backgroundColor: Colors.background }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="auth/reset-password" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="history" options={{ headerShown: false }} />
        </Stack>
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
