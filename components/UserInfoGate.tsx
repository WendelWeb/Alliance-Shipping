'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { PhoneNumberModal } from './PhoneNumberModal';

export function UserInfoGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [isBlocked, setIsBlocked] = useState(false);
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
          // Check if phone exists AND is properly formatted (with country code)
          const phoneValue = data.user?.phone;
          const hasValidPhone = !!(phoneValue && phoneValue.startsWith('+'));
          const hasCity = !!data.user?.city;
          const hasWarehouse = !!data.user?.warehouseId;

          setMissingPhone(!hasValidPhone);
          setMissingCity(!hasCity);
          setMissingWarehouse(!hasWarehouse);

          // BLOCK app if any is missing
          if (!hasValidPhone || !hasCity || !hasWarehouse) {
            console.log('🚫 UserInfoGate: BLOCKING APP - Phone:', !hasValidPhone, 'City:', !hasCity, 'Warehouse:', !hasWarehouse);
            setIsBlocked(true);
          } else {
            console.log('✅ UserInfoGate: User has all required info');
            setIsBlocked(false);
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

  const handleSuccess = async () => {
    // Re-check user info after saving
    setIsChecking(true);
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const phoneValue = data.user?.phone;
        const hasValidPhone = !!(phoneValue && phoneValue.startsWith('+'));
        const hasCity = !!data.user?.city;
        const hasWarehouse = !!data.user?.warehouseId;

        if (hasValidPhone && hasCity && hasWarehouse) {
          console.log('✅ All info completed! Unblocking app...');
          setIsBlocked(false);
          setMissingPhone(false);
          setMissingCity(false);
          setMissingWarehouse(false);
        } else {
          console.log('⚠️ Info still incomplete, keeping blocked');
        }
      }
    } catch (error) {
      console.error('Error re-checking user info:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // If blocked, show ONLY the modal (hide app completely)
  if (isBlocked) {
    return (
      <PhoneNumberModal
        isOpen={true}
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
