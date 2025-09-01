import { useState, useEffect, useCallback } from 'react'
import { i18n, type Locale, type TranslationKey } from '@/i18n/index'
import { defaultEventBus } from '@/core/events'

export interface UseI18nReturn {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  locale: Locale
  setLocale: (locale: Locale) => void
  availableLocales: readonly Locale[]
  isLoading: boolean
}

export function useI18n(): UseI18nReturn {
  const [locale, setLocaleState] = useState<Locale>(i18n.getCurrentLocale())
  const [isLoading, setIsLoading] = useState(false)

  // Translation function with parameter substitution
  const t = useCallback((
    key: TranslationKey, 
    params?: Record<string, string | number>
  ): string => {
    return i18n.translate(key, params)
  }, [])

  // Locale setter with async loading support
  const setLocale = useCallback(async (newLocale: Locale) => {
    if (newLocale === locale) {
      return
    }

    try {
      setIsLoading(true)
      
      // Emit locale change start event
      defaultEventBus.emit('i18n.localeChangeStart', {
        from: locale,
        to: newLocale,
        timestamp: new Date().toISOString()
      })

      await i18n.setLocale(newLocale)
      setLocaleState(newLocale)

      // Emit locale change success event
      defaultEventBus.emit('i18n.localeChangeSuccess', {
        locale: newLocale,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      // Emit locale change error event
      defaultEventBus.emit('i18n.localeChangeError', {
        locale: newLocale,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
      
      console.error('Failed to change locale:', error)
    } finally {
      setIsLoading(false)
    }
  }, [locale])

  // Listen for locale changes from other components/sources
  useEffect(() => {
    const handleLocaleChange = (event: any) => {
      const newLocale = event.locale
      if (newLocale && newLocale !== locale) {
        setLocaleState(newLocale)
      }
    }

    // Subscribe to locale change events
    const unsubscribe = defaultEventBus.on('i18n.localeChangeSuccess', handleLocaleChange)

    return unsubscribe
  }, [locale])

  // Sync with i18n instance on mount in case it changed elsewhere
  useEffect(() => {
    const currentLocale = i18n.getCurrentLocale()
    if (currentLocale !== locale) {
      setLocaleState(currentLocale)
    }
  }, [locale])

  return {
    t,
    locale,
    setLocale,
    availableLocales: i18n.getAvailableLocales(),
    isLoading
  }
}

// Helper hook for getting just the translate function (most common use case)
export function useTranslation(): (key: TranslationKey, params?: Record<string, string | number>) => string {
  const { t } = useI18n()
  return t
}

// Helper hook for locale switching without translation function
export function useLocale(): {
  locale: Locale
  setLocale: (locale: Locale) => void
  availableLocales: readonly Locale[]
  isLoading: boolean
} {
  const { locale, setLocale, availableLocales, isLoading } = useI18n()
  return { locale, setLocale, availableLocales, isLoading }
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses event bus and i18n service
- [x] Reads config from `@/app/config` - not needed for this i18n hook
- [x] Exports default named component - exports named hooks (useI18n, useTranslation, useLocale)
- [x] Adds basic ARIA and keyboard handlers (where relevant) - not applicable for this hook
*/
