import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@/lib/tokenCache';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';
import { ThemeProvider, useTheme } from '@/lib/themes/ThemeProvider';
import { setTokenGetter } from '@/lib/api';
import { registerForPushNotifications } from '@/lib/notifications';
import { isBiometricEnabled, isBiometricAvailable } from '@/lib/biometrics';
import { BiometricLock } from '@/components/BiometricLock';
import { UserInfoGate } from '@/components/UserInfoGate';
import { useBackgroundSync } from '@/lib/offline/hooks';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';

const CLERK_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

function BiometricGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [locked, setLocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const appState = useRef(AppState.currentState);

  const checkAndLock = useCallback(async () => {
    if (!isSignedIn) {
      setLocked(false);
      setChecked(true);
      return;
    }
    const [enabled, available] = await Promise.all([
      isBiometricEnabled(),
      isBiometricAvailable(),
    ]);
    if (enabled && available) {
      setLocked(true);
    }
    setChecked(true);
  }, [isSignedIn]);

  // Check on mount
  useEffect(() => {
    checkAndLock();
  }, [checkAndLock]);

  // Lock when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        checkAndLock();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [checkAndLock]);

  if (!checked) return null;

  return (
    <>
      {children}
      {locked && <BiometricLock onSuccess={() => setLocked(false)} />}
    </>
  );
}

function AuthGate() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasRegisteredPush = useRef(false);

  useEffect(() => {
    if (isLoaded) {
      setTokenGetter(() => getToken());
    }
  }, [isLoaded, getToken]);

  // Register for push notifications when user signs in
  useEffect(() => {
    if (!isLoaded || !isSignedIn || hasRegisteredPush.current) return;
    hasRegisteredPush.current = true;

    registerForPushNotifications()
      .then(token => console.log('Push token registered:', token ? 'OK' : 'NO TOKEN'))
      .catch(err => console.error('Push registration failed:', err));
  }, [isLoaded, isSignedIn]);

  // Handle notifications arriving while app is in foreground
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification.request.content.title);
    });
    return () => subscription.remove();
  }, []);

  // Handle notification taps (navigate to relevant screen)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.type?.startsWith('package_') || data?.type?.startsWith('request_')) {
        router.push('/(tabs)/packages');
      } else if (data?.type === 'new_announcement') {
        router.push('/(tabs)/');
      }
    });

    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    if (!isLoaded) return;
    const inAuth = segments[0] === '(auth)';
    const inSSOCallback = segments[0] === 'sso-callback';

    if (!isSignedIn && !inAuth && !inSSOCallback) {
      router.replace('/(auth)/sign-up');
    }
  }, [isLoaded, isSignedIn, segments]);

  // Background sync when app comes to foreground
  useBackgroundSync();

  return (
    <BiometricGate>
      <UserInfoGate>
        <Slot />
      </UserInfoGate>
    </BiometricGate>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ClerkProvider publishableKey={CLERK_KEY} tokenCache={tokenCache}>
        <ClerkLoaded>
          <ThemeProvider>
            <LanguageProvider>
              <ThemedStatusBar />
              <AuthGate />
            </LanguageProvider>
          </ThemeProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
