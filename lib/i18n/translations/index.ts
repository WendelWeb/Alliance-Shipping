import { en } from './en';
import { fr } from './fr';
import { ht } from './ht';
import { es } from './es';
import { Locale } from '@/types';

export const translations = {
  en,
  fr,
  ht,
  es,
};

export type TranslationKeys = typeof en;

export function getTranslation(locale: Locale): TranslationKeys {
  return translations[locale] || translations.en;
}
