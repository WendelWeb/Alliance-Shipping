'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PhoneNumberModal } from './PhoneNumberModal';

export function UserInfoGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [missingPhone, setMissingPhone] = useState(false);
  const [missingCity, setMissingCity] = useState(false);
  const [missingWarehouse, setMissingWarehouse] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUserInfo = async () => {
      if (!isLoaded || !user) {
        setIsChecking(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          const hasPhone = !!data.user?.phone;
          const hasCity = !!data.user?.city;
          const hasWarehouse = !!data.user?.warehouseId;

          setMissingPhone(!hasPhone);
          setMissingCity(!hasCity);
          setMissingWarehouse(!hasWarehouse);

          // Show modal if any is missing
          if (!hasPhone || !hasCity || !hasWarehouse) {
            console.log('🔔 UserInfoGate: Missing info detected - Phone:', !hasPhone, 'City:', !hasCity, 'Warehouse:', !hasWarehouse);
            setShowModal(true);
          } else {
            console.log('✅ UserInfoGate: User has all required info');
          }
        }
      } catch (error) {
        console.error('Error checking user info:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserInfo();
  }, [isLoaded, user]);

  const handleSuccess = () => {
    setShowModal(false);
    setMissingPhone(false);
    setMissingCity(false);
    setMissingWarehouse(false);
  };

  // Don't render anything until we've checked
  if (isChecking) {
    return null;
  }

  return (
    <>
      {children}
      <PhoneNumberModal
        isOpen={showModal}
        onSuccess={handleSuccess}
        missingPhone={missingPhone}
        missingCity={missingCity}
        missingWarehouse={missingWarehouse}
      />
    </>
  );
}
