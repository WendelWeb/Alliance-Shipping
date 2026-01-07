'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { locales, localeNames, localeFlags } from '@/lib/i18n/config';
import { Locale } from '@/types';
import { cn } from '@/lib/utils/cn';

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4 flex-shrink-0" />
        <span className="flex-shrink-0">{localeFlags[locale]}</span>
        <span className="hidden sm:inline whitespace-nowrap">{localeNames[locale]}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2',
                  {
                    'bg-primary-50 text-primary-700 font-medium': locale === loc,
                  }
                )}
              >
                <span>{localeFlags[loc]}</span>
                <span>{localeNames[loc]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
