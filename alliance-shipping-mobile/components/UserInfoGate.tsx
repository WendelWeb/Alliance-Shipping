import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { PhoneNumberModal } from './PhoneNumberModal';
import { api } from '@/lib/api';

export function UserInfoGate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
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
        const hasPhone = !!response.user?.phone;
        const hasCity = !!response.user?.city;
        const hasWarehouse = !!response.user?.warehouseId;

        setMissingPhone(!hasPhone);
        setMissingCity(!hasCity);
        setMissingWarehouse(!hasWarehouse);

        // Show modal if any is missing
        if (!hasPhone || !hasCity || !hasWarehouse) {
          console.log('🔔 UserInfoGate (Mobile): Missing info detected - Phone:', !hasPhone, 'City:', !hasCity, 'Warehouse:', !hasWarehouse);
          setShowModal(true);
        } else {
          console.log('✅ UserInfoGate (Mobile): User has all required info');
        }
      } catch (error) {
        console.error('❌ Error checking user info:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserInfo();
  }, [isLoaded, isSignedIn]);

  const handleSuccess = () => {
    setShowModal(false);
    setMissingPhone(false);
    setMissingCity(false);
    setMissingWarehouse(false);
  };

  // Don't render modal until we've checked
  if (isChecking) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <PhoneNumberModal
        visible={showModal}
        onSuccess={handleSuccess}
        missingPhone={missingPhone}
        missingCity={missingCity}
        missingWarehouse={missingWarehouse}
      />
    </>
  );
}
