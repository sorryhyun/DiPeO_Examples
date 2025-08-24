// src/utils/i18n.ts

import type { SupportedLocale } from '@/types';

export const translations = {
  en: {
    common: {
      login: 'Login',
      logout: 'Logout',
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      close: 'Close',
      submit: 'Submit',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      print: 'Print',
      refresh: 'Refresh',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      home: 'Home',
      dashboard: 'Dashboard',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service'
    },
    navigation: {
      appointments: 'Appointments',
      medicalRecords: 'Medical Records',
      prescriptions: 'Prescriptions',
      telemedicine: 'Telemedicine',
      labResults: 'Lab Results',
      insurance: 'Insurance',
      medications: 'Medications'
    },
    appointments: {
      title: 'Appointments',
      schedule: 'Schedule Appointment',
      upcoming: 'Upcoming Appointments',
      past: 'Past Appointments',
      reschedule: 'Reschedule',
      cancel: 'Cancel Appointment',
      confirm: 'Confirm Appointment',
      date: 'Date',
      time: 'Time',
      doctor: 'Doctor',
      department: 'Department',
      reason: 'Reason for Visit',
      status: 'Status',
      notes: 'Notes'
    },
    medicalRecords: {
      title: 'Medical Records',
      view: 'View Records',
      download: 'Download',
      share: 'Share',
      history: 'Medical History',
      allergies: 'Allergies',
      conditions: 'Conditions',
      medications: 'Current Medications',
      vaccinations: 'Vaccinations',
      emergencyContact: 'Emergency Contact'
    },
    prescriptions: {
      title: 'Prescriptions',
      active: 'Active Prescriptions',
      expired: 'Expired',
      refill: 'Request Refill',
      pharmacy: 'Pharmacy',
      dosage: 'Dosage',
      instructions: 'Instructions',
      sideEffects: 'Side Effects',
      interactions: 'Drug Interactions'
    },
    telemedicine: {
      title: 'Telemedicine',
      videoCall: 'Video Call',
      chat: 'Chat',
      startCall: 'Start Call',
      endCall: 'End Call',
      joinCall: 'Join Call',
      camera: 'Camera',
      microphone: 'Microphone',
      shareScreen: 'Share Screen',
      recording: 'Recording'
    },
    labResults: {
      title: 'Lab Results',
      recent: 'Recent Results',
      pending: 'Pending',
      normal: 'Normal',
      abnormal: 'Abnormal',
      critical: 'Critical',
      trend: 'Trend',
      reference: 'Reference Range',
      unit: 'Unit'
    },
    insurance: {
      title: 'Insurance',
      coverage: 'Coverage Details',
      claims: 'Claims',
      benefits: 'Benefits',
      deductible: 'Deductible',
      copay: 'Copay',
      outOfPocket: 'Out of Pocket',
      provider: 'Insurance Provider',
      policyNumber: 'Policy Number'
    },
    medications: {
      title: 'Medication Reminders',
      reminders: 'Reminders',
      schedule: 'Schedule',
      taken: 'Taken',
      missed: 'Missed',
      dosage: 'Dosage',
      frequency: 'Frequency',
      setReminder: 'Set Reminder',
      snooze: 'Snooze'
    },
    auth: {
      username: 'Username',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember Me',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      invalidCredentials: 'Invalid credentials',
      sessionExpired: 'Session expired'
    },
    errors: {
      networkError: 'Network error occurred',
      serverError: 'Server error occurred',
      unauthorized: 'Unauthorized access',
      notFound: 'Resource not found',
      validationError: 'Validation error',
      unknownError: 'An unknown error occurred'
    }
  },
  ko: {
    common: {
      login: '로그인',
      logout: '로그아웃',
      loading: '로딩 중...',
      error: '오류',
      save: '저장',
      cancel: '취소',
      edit: '편집',
      delete: '삭제',
      confirm: '확인',
      close: '닫기',
      submit: '제출',
      search: '검색',
      filter: '필터',
      export: '내보내기',
      print: '인쇄',
      refresh: '새로고침',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      home: '홈',
      dashboard: '대시보드',
      profile: '프로필',
      settings: '설정',
      help: '도움말',
      about: '소개',
      contact: '연락처',
      privacy: '개인정보처리방침',
      terms: '이용약관'
    },
    navigation: {
      appointments: '진료 예약',
      medicalRecords: '의료 기록',
      prescriptions: '처방전',
      telemedicine: '원격 진료',
      labResults: '검사 결과',
      insurance: '보험',
      medications: '복용약'
    },
    appointments: {
      title: '진료 예약',
      schedule: '예약하기',
      upcoming: '예정된 진료',
      past: '지난 진료',
      reschedule: '일정 변경',
      cancel: '예약 취소',
      confirm: '예약 확인',
      date: '날짜',
      time: '시간',
      doctor: '의사',
      department: '진료과',
      reason: '진료 사유',
      status: '상태',
      notes: '메모'
    },
    medicalRecords: {
      title: '의료 기록',
      view: '기록 보기',
      download: '다운로드',
      share: '공유',
      history: '병력',
      allergies: '알레르기',
      conditions: '질환',
      medications: '복용 중인 약물',
      vaccinations: '예방접종',
      emergencyContact: '응급 연락처'
    },
    prescriptions: {
      title: '처방전',
      active: '활성 처방전',
      expired: '만료됨',
      refill: '재처방 요청',
      pharmacy: '약국',
      dosage: '복용량',
      instructions: '복용 방법',
      sideEffects: '부작용',
      interactions: '약물 상호작용'
    },
    telemedicine: {
      title: '원격 진료',
      videoCall: '화상 통화',
      chat: '채팅',
      startCall: '통화 시작',
      endCall: '통화 종료',
      joinCall: '통화 참여',
      camera: '카메라',
      microphone: '마이크',
      shareScreen: '화면 공유',
      recording: '녹화'
    },
    labResults: {
      title: '검사 결과',
      recent: '최근 결과',
      pending: '대기 중',
      normal: '정상',
      abnormal: '비정상',
      critical: '위험',
      trend: '추이',
      reference: '정상 범위',
      unit: '단위'
    },
    insurance: {
      title: '보험',
      coverage: '보장 내용',
      claims: '보험금 청구',
      benefits: '혜택',
      deductible: '공제액',
      copay: '본인부담금',
      outOfPocket: '본인 부담',
      provider: '보험사',
      policyNumber: '보험번호'
    },
    medications: {
      title: '복용약 알림',
      reminders: '알림',
      schedule: '일정',
      taken: '복용함',
      missed: '놓침',
      dosage: '복용량',
      frequency: '복용 빈도',
      setReminder: '알림 설정',
      snooze: '다시 알림'
    },
    auth: {
      username: '사용자명',
      password: '비밀번호',
      forgotPassword: '비밀번호를 잊으셨나요?',
      rememberMe: '로그인 상태 유지',
      signIn: '로그인',
      signOut: '로그아웃',
      invalidCredentials: '잘못된 인증 정보',
      sessionExpired: '세션이 만료되었습니다'
    },
    errors: {
      networkError: '네트워크 오류가 발생했습니다',
      serverError: '서버 오류가 발생했습니다',
      unauthorized: '권한이 없습니다',
      notFound: '리소스를 찾을 수 없습니다',
      validationError: '유효성 검사 오류',
      unknownError: '알 수 없는 오류가 발생했습니다'
    }
  }
} as const;

// Generate translation key type from the structure
type TranslationKeys = {
  [K in keyof typeof translations.en]: {
    [SK in keyof typeof translations.en[K]]: `${K}.${SK & string}`;
  };
};

export type TranslationKey = TranslationKeys[keyof TranslationKeys][keyof TranslationKeys[keyof TranslationKeys]];

/**
 * Get translation for a specific key and locale
 * Falls back to English if the key is not found in the requested locale
 */
export function getTranslation(locale: SupportedLocale, key: TranslationKey): string {
  const [namespace, translationKey] = key.split('.') as [keyof typeof translations.en, string];
  
  // Try to get translation from requested locale
  const localeTranslations = translations[locale];
  if (localeTranslations && 
      localeTranslations[namespace] && 
      localeTranslations[namespace][translationKey]) {
    return localeTranslations[namespace][translationKey];
  }
  
  // Fallback to English
  const englishTranslations = translations.en;
  if (englishTranslations[namespace] && englishTranslations[namespace][translationKey]) {
    return englishTranslations[namespace][translationKey];
  }
  
  // Return key if no translation found
  return key;
}

/**
 * Get all available translation keys for a specific namespace
 */
export function getNamespaceKeys(namespace: keyof typeof translations.en): TranslationKey[] {
  return Object.keys(translations.en[namespace]).map(key => `${namespace}.${key}` as TranslationKey);
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(locale: SupportedLocale, key: TranslationKey): boolean {
  const [namespace, translationKey] = key.split('.') as [keyof typeof translations.en, string];
  const localeTranslations = translations[locale];
  
  return !!(localeTranslations && 
           localeTranslations[namespace] && 
           localeTranslations[namespace][translationKey]);
}

// Self-check comments:
// [x] Uses @/ imports only (imports from @/types)
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from @/app/config (N/A for this utility)
// [x] Exports default named component (N/A - this is a utility module)
// [x] Adds basic ARIA and keyboard handlers (N/A for utility functions)
