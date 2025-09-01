import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { appConfig } from '@/app/config'
import { defaultEventBus } from '@/core/events'

// Type definitions for i18n
export interface TranslationResource {
  [key: string]: string | TranslationResource
}

export interface TranslationResources {
  [locale: string]: TranslationResource
}

export interface I18nConfig {
  fallbackLocale: string
  supportedLocales: string[]
  resources: TranslationResources
}

export interface I18nContextValue {
  locale: string
  isLoading: boolean
  error: string | null
  t: (key: string, params?: Record<string, string | number>) => string
  changeLocale: (locale: string) => Promise<void>
  availableLocales: string[]
}

// Translation cache
const translationCache: TranslationResources = {}

// Default configuration
const defaultConfig: I18nConfig = {
  fallbackLocale: 'en',
  supportedLocales: ['en', 'es'],
  resources: {},
}

// Context for i18n
const I18nContext = createContext<I18nContextValue | null>(null)

// Utility function to get nested translation value
function getNestedValue(obj: TranslationResource, path: string): string | undefined {
  const keys = path.split('.')
  let current: any = obj
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }
  
  return typeof current === 'string' ? current : undefined
}

// Interpolate parameters in translation string
function interpolateParams(
  text: string, 
  params: Record<string, string | number> = {}
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = params[key]
    return value !== undefined ? String(value) : match
  })
}

// Load translation resource
async function loadTranslationResource(locale: string): Promise<TranslationResource | null> {
  // Check cache first
  if (translationCache[locale]) {
    return translationCache[locale]
  }

  try {
    // Dynamic import based on locale
    let resource: TranslationResource

    switch (locale) {
      case 'en':
        resource = (await import('./locales/en.json')).default
        break
      case 'es':
        resource = (await import('./locales/es.json')).default
        break
      default:
        console.warn(`Unsupported locale: ${locale}`)
        return null
    }

    // Cache the resource
    translationCache[locale] = resource

    // Emit event for successful load
    defaultEventBus.emit('i18n.languageChanged', {
      language: locale,
      timestamp: new Date().toISOString(),
    })

    return resource
  } catch (error) {
    console.error(`Failed to load translation resource for locale: ${locale}`, error)
    
    // Emit error event
    defaultEventBus.emit('error.reported', {
      error: error as Error,
      context: { 
        i18n: true, 
        locale,
        operation: 'loadTranslationResource'
      },
    })

    return null
  }
}

// I18n Provider Component
export interface I18nProviderProps {
  children: ReactNode
  initialLocale?: string
  fallbackLocale?: string
}

export function I18nProvider({
  children,
  initialLocale = 'en',
  fallbackLocale = 'en'
}: I18nProviderProps) {
  const [locale, setLocale] = useState<string>(initialLocale)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentResource, setCurrentResource] = useState<TranslationResource | null>(null)
  const [fallbackResource, setFallbackResource] = useState<TranslationResource | null>(null)

  const supportedLocales = defaultConfig.supportedLocales

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Try to get from current locale resource
    let translation = currentResource ? getNestedValue(currentResource, key) : undefined

    // Fall back to fallback locale if not found
    if (translation === undefined && fallbackResource && locale !== fallbackLocale) {
      translation = getNestedValue(fallbackResource, key)
    }

    // If still not found, return the key itself as fallback
    if (translation === undefined) {
      console.warn(`Translation key not found: ${key} for locale: ${locale}`)
      translation = key
    }

    // Interpolate parameters if provided
    return params ? interpolateParams(translation, params) : translation
  }

  // Change locale function
  const changeLocale = async (newLocale: string): Promise<void> => {
    if (!supportedLocales.includes(newLocale)) {
      const errorMsg = `Unsupported locale: ${newLocale}`
      console.error(errorMsg)
      setError(errorMsg)
      return
    }

    if (newLocale === locale) {
      return // No change needed
    }

    setIsLoading(true)
    setError(null)

    try {
      // Load new locale resource
      const resource = await loadTranslationResource(newLocale)
      
      if (resource) {
        setLocale(newLocale)
        setCurrentResource(resource)
        
        // Store locale preference in localStorage for dev mode
        if (appConfig.developmentMode.useLocalstoragePersistence && typeof window !== 'undefined') {
          try {
            localStorage.setItem('preferred_locale', newLocale)
          } catch (e) {
            // Ignore localStorage errors
          }
        }

        // Emit locale change event
        defaultEventBus.emit('i18n.languageChanged', {
          language: newLocale,
          timestamp: new Date().toISOString(),
        })
      } else {
        throw new Error(`Failed to load translations for locale: ${newLocale}`)
      }
    } catch (err) {
      const errorMsg = `Failed to change locale to: ${newLocale}`
      console.error(errorMsg, err)
      setError(errorMsg)

      // Emit error event
      defaultEventBus.emit('error.reported', {
        error: err as Error,
        context: { 
          i18n: true, 
          operation: 'changeLocale',
          newLocale,
          currentLocale: locale
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize i18n on mount
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Determine initial locale
        let targetLocale = initialLocale

        // In dev mode, check localStorage for preferred locale
        if (appConfig.developmentMode.useLocalstoragePersistence && typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('preferred_locale')
            if (stored && supportedLocales.includes(stored)) {
              targetLocale = stored
            }
          } catch (e) {
            // Ignore localStorage errors
          }
        }

        // Load current locale resource
        const currentRes = await loadTranslationResource(targetLocale)
        if (currentRes) {
          setCurrentResource(currentRes)
          setLocale(targetLocale)
        } else {
          throw new Error(`Failed to load initial locale: ${targetLocale}`)
        }

        // Load fallback locale resource if different
        if (targetLocale !== fallbackLocale) {
          const fallbackRes = await loadTranslationResource(fallbackLocale)
          setFallbackResource(fallbackRes)
        } else {
          setFallbackResource(currentRes)
        }

      } catch (err) {
        const errorMsg = 'Failed to initialize i18n'
        console.error(errorMsg, err)
        setError(errorMsg)

        // Emit error event
        defaultEventBus.emit('error.reported', {
          error: err as Error,
          context: { 
            i18n: true, 
            operation: 'initialize',
            initialLocale,
            fallbackLocale
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [initialLocale, fallbackLocale])

  const contextValue: I18nContextValue = {
    locale,
    isLoading,
    error,
    t,
    changeLocale,
    availableLocales: supportedLocales,
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook to use i18n context
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  
  return context
}

// Initialize i18n function (for use outside React components)
export async function initI18n(config: Partial<I18nConfig> = {}): Promise<void> {
  const mergedConfig = { ...defaultConfig, ...config }
  
  try {
    // Pre-load all supported locales
    const loadPromises = mergedConfig.supportedLocales.map(async (locale) => {
      const resource = await loadTranslationResource(locale)
      if (resource) {
        translationCache[locale] = resource
      }
      return resource
    })

    await Promise.all(loadPromises)

    console.log('i18n initialized successfully')
  } catch (error) {
    console.error('Failed to initialize i18n:', error)
    
    // Emit error event
    defaultEventBus.emit('error.reported', {
      error: error as Error,
      context: { 
        i18n: true, 
        operation: 'initI18n'
      },
    })

    throw error
  }
}

// Get available locales
export function getAvailableLocales(): string[] {
  return [...defaultConfig.supportedLocales]
}

// Export types for external use
export type { I18nConfig, TranslationResource, TranslationResources }
