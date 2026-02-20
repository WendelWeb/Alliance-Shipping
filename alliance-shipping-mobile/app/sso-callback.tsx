import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';

// Critical: handle OAuth redirect on Android
WebBrowser.maybeCompleteAuthSession();

export default function SSOCallbackScreen() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const hasNavigated = useRef(false);

  // Redirect as soon as auth is confirmed
  useEffect(() => {
    if (!isLoaded || hasNavigated.current) return;
    if (isSignedIn) {
      hasNavigated.current = true;
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoaded, router]);

  // Fallback: if still not signed in after 12s, go back to sign-in
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasNavigated.current && !isSignedIn) {
        hasNavigated.current = true;
        router.replace('/(auth)/sign-in');
      }
    }, 12000);
    return () => clearTimeout(timeout);
  }, [isSignedIn, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16, color: '#6b7280', fontSize: 14 }}>
        Connecting...
      </Text>
    </View>
  );
}
