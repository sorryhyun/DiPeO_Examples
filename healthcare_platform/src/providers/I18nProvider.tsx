// FILE: src/providers/I18nProvider.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';

// Translation keys and values
interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<string, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      close: 'Close',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      clear: 'Clear',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      yes: 'Yes',
      no: 'No',
      confirm: 'Confirm'
    },
    nav: {
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      medicalRecords: 'Medical Records',
      prescriptions: 'Prescriptions',
      telemedicine: 'Telemedicine',
      labResults: 'Lab Results',
      insurance: 'Insurance',
      medications: 'Medications',
      logout: 'Logout'
    },
    auth: {
      login: 'Login',
      email: 'Email',
      password: 'Password',
      loginButton: 'Sign In',
      loginError: 'Invalid email or password',
      loginSuccess: 'Login successful'
    },
    errors: {
      generic: 'Something went wrong. Please try again.',
      network: 'Network error. Please check your connection.',
      unauthorized: 'You are not authorized to access this resource.',
      notFound: 'The requested resource was not found.',
      serverError: 'Server error. Please try again later.'
    },
    fallback: {
      errorBoundaryTitle: 'Something went wrong',
      errorBoundaryMessage: 'An unexpected error occurred. Please refresh the page.',
      refreshPage: 'Refresh Page'
    }
  },
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      retry: '다시 시도',
      cancel: '취소',
      save: '저장',
      delete: '삭제',
      edit: '편집',
      view: '보기',
      close: '닫기',
      submit: '제출',
      search: '검색',
      filter: '필터',
      clear: '지우기',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      yes: '예',
      no: '아니오',
      confirm: '확인'
    },
    nav: {
      dashboard: '대시보드',
      appointments: '예약',
      medicalRecords: '의료 기록',
      prescriptions: '처방전',
      telemedicine: '원격 진료',
      labResults: '검사 결과',
      insurance: '보험',
      medications: '약물 관리',
      logout: '로그아웃'
    },
    auth: {
      login: '로그인',
      email: '이메일',
      password: '비밀번호',
      loginButton: '로그인',
      loginError: '이메일 또는 비밀번호가 올바르지 않습니다',
      loginSuccess: '로그인 성공'
    },
    errors: {
      generic: '문제가 발생했습니다. 다시 시도해 주세요.',
      network: '네트워크 오류입니다. 연결을 확인해 주세요.',
      unauthorized: '이 리소스에 접근할 권한이 없습니다.',
      notFound: '요청한 리소스를 찾을 수 없습니다.',
      serverError: '서버 오류입니다. 나중에 다시 시도해 주세요.'
    },
    fallback: {
      errorBoundaryTitle: '문제가 발생했습니다',
      errorBoundaryMessage: '예상치 못한 오류가 발생했습니다. 페이지를 새로고침해 주세요.',
      refreshPage: '페이지 새로고침'
    }
  }
};

type Locale = 'en' | 'ko';

interface I18nContextType {
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultValue?: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [currentLocale, setCurrentLocale] = useLocalStorage<Locale>('locale', 'en');

  const getTranslation = (key: string, locale: Locale): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  const t = (key: string, defaultValue?: string): string => {
    const translation = getTranslation(key, currentLocale);
    
    // If translation not found in current locale, try English as fallback
    if (translation === key && currentLocale !== 'en') {
      const fallbackTranslation = getTranslation(key, 'en');
      if (fallbackTranslation !== key) {
        return fallbackTranslation;
      }
    }
    
    // If still not found, return default value or the key
    return translation === key ? (defaultValue || key) : translation;
  };

  const setLocale = (locale: Locale) => {
    setCurrentLocale(locale);
  };

  const contextValue: I18nContextType = {
    currentLocale,
    setLocale,
    t
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useLocalStorage hook
// [x] Reads config from `@/app/config` - not applicable for i18n provider
// [x] Exports default named component - exports named I18nProvider and useI18n
// [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for provider
