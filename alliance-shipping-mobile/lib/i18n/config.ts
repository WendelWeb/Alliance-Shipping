export type Locale = 'ht' | 'fr' | 'en' | 'es';

export const locales: Locale[] = ['ht', 'fr', 'en', 'es'];

export const defaultLocale: Locale = 'ht';

export const localeNames: Record<Locale, string> = {
  ht: 'Kreyòl',
  fr: 'Français',
  en: 'English',
  es: 'Español',
};

export const localeFlags: Record<Locale, string> = {
  ht: '🇭🇹',
  fr: '🇫🇷',
  en: '🇺🇸',
  es: '🇩🇴',
};

export const localeMap: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ht: 'fr-FR',
  es: 'es-ES',
};
