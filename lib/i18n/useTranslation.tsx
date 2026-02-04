'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Locale } from '@/types';
import { getTranslation, TranslationKeys } from './translations';
import { defaultLocale } from './config';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [t, setT] = useState<TranslationKeys>(getTranslation(defaultLocale));
  const { isSignedIn } = useAuth();
  const hasFetchedFromDb = useRef(false);

  // On mount: load from localStorage first (instant), then override from DB if authenticated
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && ['ht', 'fr', 'en', 'es'].includes(savedLocale)) {
      setLocaleState(savedLocale);
      setT(getTranslation(savedLocale));
    }
  }, []);

  // When signed in, fetch language from DB
  useEffect(() => {
    if (!isSignedIn || hasFetchedFromDb.current) return;

    hasFetchedFromDb.current = true;

    fetch('/api/user/language')
      .then((res) => res.json())
      .then((data) => {
        if (data.locale && ['ht', 'fr', 'en', 'es'].includes(data.locale)) {
          setLocaleState(data.locale as Locale);
          setT(getTranslation(data.locale as Locale));
          localStorage.setItem('locale', data.locale);
          document.documentElement.lang = data.locale;
        }
      })
      .catch((err) => {
        console.error('Failed to fetch user language:', err);
      });
  }, [isSignedIn]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setT(getTranslation(newLocale));
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;

    // Persist to DB if authenticated
    if (isSignedIn) {
      fetch('/api/user/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      }).catch((err) => {
        console.error('Failed to persist language:', err);
      });
    }
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
