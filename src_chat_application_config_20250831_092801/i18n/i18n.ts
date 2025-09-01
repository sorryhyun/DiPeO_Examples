import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { appConfig, isDevelopment } from '@/app/config';

// Import locale resources
import en from './locales/en.json';
import es from './locales/es.json';

// Define available languages
export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Type-safe translation keys (inferred from English locale)
export type TranslationKey = keyof typeof en;

// Resources configuration
const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en',
    
    // Language detection options
    detection: {
      order: [
        'localStorage',
        'navigator',
        'htmlTag'
      ],
      lookupLocalStorage: 'dipeo:language',
      caches: ['localStorage'],
      checkWhitelist: true,
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
      formatSeparator: ',',
      format: function(value, format, lng) {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (value instanceof Date) {
          if (format === 'short') return value.toLocaleDateString(lng);
          if (format === 'long') return value.toLocaleDateString(lng, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
        return value;
      }
    },

    // Debugging
    debug: isDevelopment,
    
    // Namespace and key separator
    defaultNS: 'translation',
    keySeparator: '.',
    nsSeparator: ':',
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Missing key handling
    saveMissing: isDevelopment,
    missingKeyHandler: isDevelopment 
      ? (lng, ns, key, fallbackValue) => {
          console.warn(`Missing translation key: ${key}`, { lng, ns, fallbackValue });
        }
      : undefined,
    
    // Performance optimizations
    load: 'languageOnly',
    preload: SUPPORTED_LANGUAGES,
    
    // React specific options
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
    }
  });

// Type-safe translation function
export function t(key: TranslationKey, options?: any): string {
  return i18n.t(key, options);
}

// Get current language
export function getCurrentLanguage(): SupportedLanguage {
  return (i18n.language as SupportedLanguage) || 'en';
}

// Change language
export async function changeLanguage(language: SupportedLanguage): Promise<void> {
  try {
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Failed to change language', { language, error });
    throw error;
  }
}

// Check if language is supported
export function isLanguageSupported(language: string): language is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
}

// Get available languages with display names
export function getAvailableLanguages(): Array<{ code: SupportedLanguage; name: string; nativeName: string }> {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
  ];
}

// Format number according to current locale
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  try {
    return new Intl.NumberFormat(getCurrentLanguage(), options).format(value);
  } catch (error) {
    console.warn('Number formatting failed', { value, error });
    return value.toString();
  }
}

// Format date according to current locale
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(getCurrentLanguage(), options).format(date);
  } catch (error) {
    console.warn('Date formatting failed', { date, error });
    return date.toISOString();
  }
}

// Format relative time (e.g., "2 minutes ago")
export function formatRelativeTime(date: Date): string {
  try {
    const rtf = new Intl.RelativeTimeFormat(getCurrentLanguage(), { numeric: 'auto' });
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    
    // Define time units in seconds
    const units: Array<[string, number]> = [
      ['year', 365 * 24 * 60 * 60],
      ['month', 30 * 24 * 60 * 60],
      ['week', 7 * 24 * 60 * 60],
      ['day', 24 * 60 * 60],
      ['hour', 60 * 60],
      ['minute', 60],
      ['second', 1],
    ];
    
    for (const [unit, secondsInUnit] of units) {
      if (Math.abs(diffInSeconds) >= secondsInUnit) {
        const value = Math.floor(diffInSeconds / secondsInUnit);
        return rtf.format(value, unit as Intl.RelativeTimeFormatUnit);
      }
    }
    
    return rtf.format(0, 'second');
  } catch (error) {
    console.warn('Relative time formatting failed', { date, error });
    return date.toLocaleString();
  }
}

// Export the configured i18n instance
export default i18n;
