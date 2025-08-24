import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Simple translation dictionaries
const translations: Record<string, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.courses': 'Courses',
    'nav.grades': 'Grades',
    'nav.forum': 'Forum',
    'nav.certificates': 'Certificates',
    'nav.logout': 'Logout',
    
    // Common actions
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    
    // Authentication
    'auth.login': 'Login',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.welcome': 'Welcome back!',
    
    // Courses
    'courses.title': 'My Courses',
    'courses.progress': 'Progress',
    'courses.continue': 'Continue Learning',
    'courses.start': 'Start Course',
    'courses.completed': 'Completed',
    
    // Quiz
    'quiz.question': 'Question',
    'quiz.submit': 'Submit Answer',
    'quiz.score': 'Score',
    'quiz.correct': 'Correct!',
    'quiz.incorrect': 'Incorrect',
    
    // Forum
    'forum.new-thread': 'New Thread',
    'forum.reply': 'Reply',
    'forum.by': 'by',
    
    // Assignments
    'assignments.upload': 'Upload Assignment',
    'assignments.due-date': 'Due Date',
    'assignments.submitted': 'Submitted',
    
    // Grades
    'grades.course': 'Course',
    'grades.grade': 'Grade',
    'grades.date': 'Date',
    
    // Certificates
    'certificates.available': 'Available Certificates',
    'certificates.download': 'Download',
    'certificates.view': 'View Certificate'
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.courses': 'Cursos',
    'nav.grades': 'Calificaciones',
    'nav.forum': 'Foro',
    'nav.certificates': 'Certificados',
    'nav.logout': 'Cerrar Sesión',
    
    // Common actions
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.submit': 'Enviar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    
    // Authentication
    'auth.login': 'Iniciar Sesión',
    'auth.email': 'Correo',
    'auth.password': 'Contraseña',
    'auth.welcome': '¡Bienvenido de nuevo!',
    
    // Courses
    'courses.title': 'Mis Cursos',
    'courses.progress': 'Progreso',
    'courses.continue': 'Continuar Aprendiendo',
    'courses.start': 'Iniciar Curso',
    'courses.completed': 'Completado',
    
    // Quiz
    'quiz.question': 'Pregunta',
    'quiz.submit': 'Enviar Respuesta',
    'quiz.score': 'Puntuación',
    'quiz.correct': '¡Correcto!',
    'quiz.incorrect': 'Incorrecto',
    
    // Forum
    'forum.new-thread': 'Nuevo Tema',
    'forum.reply': 'Responder',
    'forum.by': 'por',
    
    // Assignments
    'assignments.upload': 'Subir Tarea',
    'assignments.due-date': 'Fecha Límite',
    'assignments.submitted': 'Enviado',
    
    // Grades
    'grades.course': 'Curso',
    'grades.grade': 'Calificación',
    'grades.date': 'Fecha',
    
    // Certificates
    'certificates.available': 'Certificados Disponibles',
    'certificates.download': 'Descargar',
    'certificates.view': 'Ver Certificado'
  }
};

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<string>('en');

  const t = useCallback((key: string): string => {
    const currentTranslations = translations[locale];
    return currentTranslations?.[key] || key;
  }, [locale]);

  const handleSetLocale = useCallback((newLocale: string) => {
    if (translations[newLocale]) {
      setLocale(newLocale);
    } else {
      console.warn(`Locale '${newLocale}' not supported. Available locales: ${Object.keys(translations).join(', ')}`);
    }
  }, []);

  const value: I18nContextType = {
    locale,
    setLocale: handleSetLocale,
    t
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
