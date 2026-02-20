import React, { useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { usePathname } from 'expo-router';
import { PhoneNumberModal } from './PhoneNumberModal';
import { api } from '@/lib/api';
import { isOnline } from '@/lib/offline/sync';

/**
 * UserInfoGate - Blocks app ONLY if user has never entered their info
 *
 * - First time (no info) → BLOCKS until user enters info
 * - Info already entered → NEVER blocks
 * - Info deleted → BLOCKS again until re-entered
 * - OFFLINE → Skips check entirely (don't block app when no internet)
 */
export function UserInfoGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [missingPhone, setMissingPhone] = useState(false);
  const [missingCity, setMissingCity] = useState(false);
  const [missingWarehouse, setMissingWarehouse] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastPathname = useRef(pathname);

  const checkUserInfo = async () => {
    if (!isLoaded || !isSignedIn) return;

    // Skip check if offline - don't block the app
    const online = await isOnline();
    if (!online) {
      console.log('UserInfoGate: Offline - skipping check');
      return;
    }

    try {
      const response = await api.get<{ success: boolean; user: any }>('/api/user/profile');

      const phoneValue = response.user?.phone;
      const hasValidPhone = !!(phoneValue && phoneValue.startsWith('+'));
      const whatsappValue = response.user?.whatsappPhone;
      const hasValidWhatsapp = !!(whatsappValue && whatsappValue.startsWith('+'));
      const hasCity = !!response.user?.city;
      const hasWarehouse = !!response.user?.warehouseId;

      const phoneMissing = !hasValidPhone || !hasValidWhatsapp;
      const cityMissing = !hasCity;
      const warehouseMissing = !hasWarehouse;

      setMissingPhone(phoneMissing);
      setMissingCity(cityMissing);
      setMissingWarehouse(warehouseMissing);

      const shouldBlock = phoneMissing || cityMissing || warehouseMissing;

      if (shouldBlock) {
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } catch (error) {
      // Network error - don't block the app, let user use offline
      console.warn('UserInfoGate: Network error, skipping check');
    }
  };

  // Check on mount (non-blocking)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      checkUserInfo();
    }
  }, [isLoaded, isSignedIn]);

  // Re-check when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkUserInfo();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isLoaded, isSignedIn]);

  // Re-check on navigation
  useEffect(() => {
    if (lastPathname.current !== pathname && isLoaded && isSignedIn) {
      checkUserInfo();
    }
    lastPathname.current = pathname;
  }, [pathname, isLoaded, isSignedIn]);

  const handleSuccess = async () => {
    try {
      const response = await api.get<{ success: boolean; user: any }>('/api/user/profile');
      const phoneValue = response.user?.phone;
      const hasValidPhone = !!(phoneValue && phoneValue.startsWith('+'));
      const whatsappValue = response.user?.whatsappPhone;
      const hasValidWhatsapp = !!(whatsappValue && whatsappValue.startsWith('+'));
      const hasCity = !!response.user?.city;
      const hasWarehouse = !!response.user?.warehouseId;

      if (hasValidPhone && hasValidWhatsapp && hasCity && hasWarehouse) {
        setShowModal(false);
        setMissingPhone(false);
        setMissingCity(false);
        setMissingWarehouse(false);
      }
    } catch (error) {
      console.error('Error re-checking user info:', error);
    }
  };

  return (
    <>
      {children}
      {showModal && (
        <PhoneNumberModal
          visible={true}
          onSuccess={handleSuccess}
          missingPhone={missingPhone}
          missingCity={missingCity}
          missingWarehouse={missingWarehouse}
        />
      )}
    </>
  );
}
