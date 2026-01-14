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
  const { initialize: initializeAuth, isInitialized: authInitialized, isAuthenticated } = useAuthStore();

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
    if (!isReady || !fontsLoaded || !settingsHydrated || !wordHydrated || !authInitialized) {
      return;
    }

    const inAuthFlow = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    // Priority 1: Auth Guard (redirect to login if not authenticated)
    if (!isAuthenticated && !inAuthFlow) {
      router.replace('/auth/login');
      SplashScreen.hideAsync();
      return;
    }

    // Priority 2: Redirect authenticated users away from auth flow
    if (isAuthenticated && inAuthFlow) {
      router.replace('/(tabs)');
      SplashScreen.hideAsync();
      return;
    }

    // Priority 3: Onboarding flow (only for authenticated users)
    if (isAuthenticated && !hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
      SplashScreen.hideAsync();
      return;
    }

    if (isAuthenticated && hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
      SplashScreen.hideAsync();
      return;
    }

    SplashScreen.hideAsync();
  }, [isReady, fontsLoaded, settingsHydrated, wordHydrated, authInitialized, isAuthenticated, hasCompletedOnboarding, segments]);

  if (!fontsLoaded || !isReady || !settingsHydrated || !wordHydrated) {
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
