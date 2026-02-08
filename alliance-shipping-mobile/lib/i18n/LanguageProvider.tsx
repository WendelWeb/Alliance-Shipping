import React, { createContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@clerk/clerk-expo';
import { Locale, defaultLocale } from './config';
import { en } from './translations/en';
import { fr } from './translations/fr';
import { ht } from './translations/ht';
import { es } from './translations/es';
import { api } from '@/lib/api';

export type TranslationKeys = typeof en;

const translations: Record<Locale, TranslationKeys> = {
  en: en as TranslationKeys,
  fr: fr as unknown as TranslationKeys,
  ht: ht as unknown as TranslationKeys,
  es: es as unknown as TranslationKeys,
};

const STORAGE_KEY = 'alliance-shipping-locale';
const VALID_LOCALES = ['ht', 'fr', 'en', 'es'];

interface LanguageContextValue {
  locale: Locale;
  t: TranslationKeys;
  setLocale: (locale: Locale) => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  t: translations[defaultLocale],
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const { isSignedIn } = useAuth();
  const hasFetchedFromDb = useRef(false);

  // Load from AsyncStorage on mount (instant)
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored && VALID_LOCALES.includes(stored)) {
        setLocaleState(stored as Locale);
      }
    });
  }, []);

  // Sync from database when authenticated
  useEffect(() => {
    if (!isSignedIn || hasFetchedFromDb.current) return;
    hasFetchedFromDb.current = true;

    api.get<{ locale: string }>('/api/user/language')
      .then((data) => {
        if (data.locale && VALID_LOCALES.includes(data.locale)) {
          setLocaleState(data.locale as Locale);
          AsyncStorage.setItem(STORAGE_KEY, data.locale);
        }
      })
      .catch(() => {});
  }, [isSignedIn]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    AsyncStorage.setItem(STORAGE_KEY, newLocale);

    // Persist to database if authenticated
    if (isSignedIn) {
      api.patch('/api/user/language', { locale: newLocale }).catch(() => {});
    }
  }, [isSignedIn]);

  const t = translations[locale];

  return (
    <LanguageContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
