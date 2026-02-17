'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { PhoneNumberModal } from './PhoneNumberModal';

export function UserInfoGate({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [missingPhone, setMissingPhone] = useState(false);
  const [missingCity, setMissingCity] = useState(false);
  const [missingWarehouse, setMissingWarehouse] = useState(false);
  const lastPathname = useRef(pathname);

  const checkUserInfo = async () => {
    if (!isLoaded || !user) return;

    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const phoneValue = data.user?.phone;
        const whatsappValue = data.user?.whatsappPhone;
        const hasValidPhone = !!(phoneValue && phoneValue.startsWith('+'));
        const hasValidWhatsapp = !!(whatsappValue && whatsappValue.startsWith('+'));
        const phoneMissing = !hasValidPhone || !hasValidWhatsapp;
        const hasCity = !!data.user?.city;
        const hasWarehouse = !!data.user?.warehouseId;

        setMissingPhone(phoneMissing);
        setMissingCity(!hasCity);
        setMissingWarehouse(!hasWarehouse);

        if (phoneMissing || !hasCity || !hasWarehouse) {
          console.log('UserInfoGate: Missing info - Phone:', phoneMissing, 'City:', !hasCity, 'Warehouse:', !hasWarehouse);
          setShowModal(true);
        } else {
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error checking user info:', error);
    }
  };

  // Check on mount (non-blocking)
  useEffect(() => {
    if (isLoaded && user) {
      checkUserInfo();
    }
  }, [isLoaded, user]);

  // Re-check on navigation
  useEffect(() => {
    if (lastPathname.current !== pathname && isLoaded && user) {
      checkUserInfo();
    }
    lastPathname.current = pathname;
  }, [pathname, isLoaded, user]);

  // Re-check on window focus (like mobile app foreground)
  useEffect(() => {
    const handleFocus = () => {
      if (isLoaded && user) {
        checkUserInfo();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isLoaded, user]);

  const handleSuccess = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        const phoneValue = data.user?.phone;
        const whatsappValue = data.user?.whatsappPhone;
        const hasValidPhone = !!(phoneValue && phoneValue.startsWith('+'));
        const hasValidWhatsapp = !!(whatsappValue && whatsappValue.startsWith('+'));
        const hasCity = !!data.user?.city;
        const hasWarehouse = !!data.user?.warehouseId;

        if (hasValidPhone && hasValidWhatsapp && hasCity && hasWarehouse) {
          setShowModal(false);
          setMissingPhone(false);
          setMissingCity(false);
          setMissingWarehouse(false);
        }
      }
    } catch (error) {
      console.error('Error re-checking user info:', error);
    }
  };

  // Don't block startup - render children always, show modal as overlay
  return (
    <>
      {children}
      {showModal && (
        <PhoneNumberModal
          isOpen={true}
          onSuccess={handleSuccess}
          missingPhone={missingPhone}
          missingCity={missingCity}
          missingWarehouse={missingWarehouse}
        />
      )}
    </>
  );
}
