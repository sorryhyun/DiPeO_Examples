import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface I18nContextType {
  t: (key: string, fallback?: string) => string;
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

interface Translations {
  [key: string]: string;
}

const STORAGE_KEY = 'dipeo-language';
const DEFAULT_LANGUAGE = 'en';

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Translations>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTranslations = async (lang: string): Promise<Translations> => {
    try {
      // Dynamic import for translations
      const translationModule = await import(`../../i18n/${lang}.json`);
      return translationModule.default || translationModule;
    } catch (error) {
      console.warn(`Failed to load translations for ${lang}, falling back to English`);
      try {
        const fallbackModule = await import(`../../i18n/en.json`);
        return fallbackModule.default || fallbackModule;
      } catch (fallbackError) {
        console.error('Failed to load fallback translations:', fallbackError);
        return {};
      }
    }
  };

  const changeLanguage = async (lang: string) => {
    setIsLoading(true);
    try {
      const newTranslations = await loadTranslations(lang);
      setTranslations(newTranslations);
      setLanguage(lang);
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : fallback || key;
  };

  useEffect(() => {
    const initializeI18n = async () => {
      // Get saved language from localStorage
      const savedLanguage = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
      
      // Load initial translations
      const initialTranslations = await loadTranslations(savedLanguage);
      setTranslations(initialTranslations);
      setLanguage(savedLanguage);
      setIsLoading(false);
    };

    initializeI18n();
  }, []);

  const value: I18nContextType = {
    t,
    language,
    changeLanguage,
    isLoading,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
