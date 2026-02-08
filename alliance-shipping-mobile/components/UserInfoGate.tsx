import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { PhoneNumberModal } from './PhoneNumberModal';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/themes/ThemeProvider';

export function UserInfoGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { colors, fonts } = useTheme();
  const [isBlocked, setIsBlocked] = useState(false);
  const [missingPhone, setMissingPhone] = useState(false);
  const [missingCity, setMissingCity] = useState(false);
  const [missingWarehouse, setMissingWarehouse] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserInfo = async () => {
      if (!isLoaded || !isSignedIn) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await api.get<{ success: boolean; user: any }>('/api/user/profile');
        // Check if phone exists AND is properly formatted (with country code)
        const phoneValue = response.user?.phone;
        const hasValidPhone = !!(phoneValue && phoneValue.startsWith('+'));
        const hasCity = !!response.user?.city;
        const hasWarehouse = !!response.user?.warehouseId;

        setMissingPhone(!hasValidPhone);
        setMissingCity(!hasCity);
        setMissingWarehouse(!hasWarehouse);

        // BLOCK app if any is missing
        if (!hasValidPhone || !hasCity || !hasWarehouse) {
          console.log('🚫 UserInfoGate (Mobile): BLOCKING APP - Phone:', !hasValidPhone, 'City:', !hasCity, 'Warehouse:', !hasWarehouse);
          setIsBlocked(true);
        } else {
          console.log('✅ UserInfoGate (Mobile): User has all required info');
          setIsBlocked(false);
        }
      } catch (error) {
        console.error('❌ Error checking user info:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserInfo();
  }, [isLoaded, isSignedIn]);

  const handleSuccess = async () => {
    // Re-check user info after saving
    setIsChecking(true);
    try {
      const response = await api.get<{ success: boolean; user: any }>('/api/user/profile');
      const phoneValue = response.user?.phone;
      const hasValidPhone = !!(phoneValue && phoneValue.startsWith('+'));
      const hasCity = !!response.user?.city;
      const hasWarehouse = !!response.user?.warehouseId;

      if (hasValidPhone && hasCity && hasWarehouse) {
        console.log('✅ All info completed! Unblocking app...');
        setIsBlocked(false);
        setMissingPhone(false);
        setMissingCity(false);
        setMissingWarehouse(false);
      } else {
        console.log('⚠️ Info still incomplete, keeping blocked');
      }
    } catch (error) {
      console.error('❌ Error re-checking user info:', error);
    } finally {
      setIsChecking(false);
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

  // If blocked, show ONLY the modal (hide app completely)
  if (isBlocked) {
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
