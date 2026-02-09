import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { usePathname } from 'expo-router';
import { PhoneNumberModal } from './PhoneNumberModal';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/themes/ThemeProvider';

/**
 * UserInfoGate - Blocks app ONLY if user has never entered their info
 *
 * - First time (no info) → BLOCKS until user enters info
 * - Info already entered → NEVER blocks
 * - Info deleted → BLOCKS again until re-entered
 */
export function UserInfoGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { colors, fonts } = useTheme();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [missingPhone, setMissingPhone] = useState(false);
  const [missingCity, setMissingCity] = useState(false);
  const [missingWarehouse, setMissingWarehouse] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const appState = useRef(AppState.currentState);
  const lastPathname = useRef(pathname);

  const checkUserInfo = async () => {
    if (!isLoaded || !isSignedIn) {
      setIsChecking(false);
      return;
    }

    try {
      const response = await api.get<{ success: boolean; user: any }>('/api/user/profile');

      // Check if info is missing
      const phoneValue = response.user?.phone;
      const hasValidPhone = !!(phoneValue && phoneValue.startsWith('+'));
      const hasCity = !!response.user?.city;
      const hasWarehouse = !!response.user?.warehouseId;

      const phoneMissing = !hasValidPhone;
      const cityMissing = !hasCity;
      const warehouseMissing = !hasWarehouse;

      setMissingPhone(phoneMissing);
      setMissingCity(cityMissing);
      setMissingWarehouse(warehouseMissing);

      // Block ONLY if ANY info is missing
      const shouldBlock = phoneMissing || cityMissing || warehouseMissing;

      if (shouldBlock) {
        console.log('⚠️ UserInfoGate: Missing info - Phone:', phoneMissing, 'City:', cityMissing, 'Warehouse:', warehouseMissing);
        setShowModal(true);
      } else {
        console.log('✅ UserInfoGate: All info present');
        setShowModal(false);
      }
    } catch (error) {
      console.error('❌ Error checking user info:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Check on mount
  useEffect(() => {
    checkUserInfo();
  }, [isLoaded, isSignedIn]);

  // Re-check when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App came to foreground, re-checking user info...');
        checkUserInfo();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isLoaded, isSignedIn]);

  // Re-check on every navigation (to catch immediate deletions)
  useEffect(() => {
    if (lastPathname.current !== pathname && isLoaded && isSignedIn) {
      console.log('🔄 Navigation detected, re-checking user info...');
      checkUserInfo();
    }
    lastPathname.current = pathname;
  }, [pathname, isLoaded, isSignedIn]);

  const handleSuccess = async () => {
    // Re-check user info after saving
    try {
      const response = await api.get<{ success: boolean; user: any }>('/api/user/profile');
      const phoneValue = response.user?.phone;
      const hasValidPhone = !!(phoneValue && phoneValue.startsWith('+'));
      const hasCity = !!response.user?.city;
      const hasWarehouse = !!response.user?.warehouseId;

      if (hasValidPhone && hasCity && hasWarehouse) {
        console.log('✅ All info completed! Unblocking app...');
        setShowModal(false);
        setMissingPhone(false);
        setMissingCity(false);
        setMissingWarehouse(false);
      } else {
        console.log('⚠️ Info still incomplete');
      }
    } catch (error) {
      console.error('❌ Error re-checking user info:', error);
    }
  };

  // Show loading while checking
  if (isChecking) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={[styles.loadingText, { fontFamily: fonts.medium, color: colors.gray[600] }]}>
          Chargement...
        </Text>
      </View>
    );
  }

  // If info is missing, show modal (blocks app)
  if (showModal) {
    return (
      <PhoneNumberModal
        visible={true}
        onSuccess={handleSuccess}
        missingPhone={missingPhone}
        missingCity={missingCity}
        missingWarehouse={missingWarehouse}
      />
    );
  }

  // Otherwise, render app normally
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
});
