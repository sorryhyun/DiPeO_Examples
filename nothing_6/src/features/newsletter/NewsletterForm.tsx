// filepath: src/features/newsletter/NewsletterForm.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import { useState, FormEvent } from 'react'
import { ApiResult } from '@/core/contracts'
import { eventBus } from '@/core/events'
import { config } from '@/app/config'
import { nothingService } from '@/services/nothingService'
import { useFetch } from '@/hooks/useFetch'
import Button from '@/shared/components/Button'

interface NewsletterFormData {
  email: string
  interests?: string[]
}

interface NewsletterFormProps {
  className?: string
  placeholder?: string
  buttonText?: string
  onSuccess?: (email: string) => void
  onError?: (error: string) => void
}

export function NewsletterForm({
  className = '',
  placeholder = 'Enter your email for updates about nothing',
  buttonText = 'Subscribe to Nothing',
  onSuccess,
  onError
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const {
    data: subscriptionResult,
    loading: isSubmitting,
    error: submitError,
    execute: submitSubscription
  } = useFetch<ApiResult<{ message: string; subscriptionId: string }>>()

  const availableInterests = [
    'Product updates about nothing',
    'Marketing emails about nothing', 
    'Technical updates about nothing',
    'Community events about nothing'
  ]

  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return null
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (touched.email) {
      const error = validateEmail(value)
      setErrors(prev => ({ ...prev, email: error || '' }))
    }
  }

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }))
    const error = validateEmail(email)
    setErrors(prev => ({ ...prev, email: error || '' }))
  }

  const handleInterestChange = (interest: string, checked: boolean) => {
    setInterests(prev => 
      checked 
        ? [...prev, interest]
        : prev.filter(i => i !== interest)
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const emailError = validateEmail(email)
    setErrors({ email: emailError || '' })
    setTouched({ email: true })

    if (emailError) {
      eventBus.emit('analytics:event', {
        name: 'newsletter_signup_validation_failed',
        properties: { error: emailError }
      })
      return
    }

    // Track submission attempt
    eventBus.emit('analytics:event', {
      name: 'newsletter_signup_attempted',
      properties: { 
        email_domain: email.split('@')[1] || 'unknown',
        interests_count: interests.length,
        has_interests: interests.length > 0
      }
    })

    try {
      const formData: NewsletterFormData = {
        email,
        ...(interests.length > 0 && { interests })
      }

      const result = await submitSubscription(() => 
        nothingService.subscribeToNewsletter(formData)
      )

      if (result?.ok && result.data) {
        // Success - reset form and notify
        setEmail('')
        setInterests([])
        setErrors({})
        setTouched({})

        eventBus.emit('analytics:event', {
          name: 'newsletter_signup_success',
          properties: { 
            subscription_id: result.data.subscriptionId,
            interests_selected: interests.length 
          }
        })

        onSuccess?.(email)
      } else {
        const errorMessage = result?.error?.message || 'Failed to subscribe. Please try again.'
        
        eventBus.emit('analytics:event', {
          name: 'newsletter_signup_failed',
          properties: { 
            error: errorMessage,
            email_domain: email.split('@')[1] || 'unknown'
          }
        })

        onError?.(errorMessage)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      
      eventBus.emit('analytics:event', {
        name: 'newsletter_signup_error',
        properties: { error: errorMessage }
      })

      onError?.(errorMessage)
    }
  }

  const hasEmailError = errors.email && touched.email
  const formId = 'newsletter-form'
  const emailId = `${formId}-email`
  const errorId = `${emailId}-error`

  return (
    <div className={`newsletter-form-container ${className}`}>
      <form 
        id={formId}
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
        aria-labelledby="newsletter-heading"
      >
        <div className="space-y-2">
          <label 
            htmlFor={emailId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              placeholder={placeholder}
              className={`
                w-full px-4 py-3 rounded-lg border text-base
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${hasEmailError
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }
              `}
              disabled={isSubmitting}
              autoComplete="email"
              aria-invalid={hasEmailError}
              aria-describedby={hasEmailError ? errorId : undefined}
            />
            {hasEmailError && (
              <div 
                id={errorId}
                className="mt-1 text-sm text-red-600 dark:text-red-400"
                role="alert"
                aria-live="polite"
              >
                {errors.email}
              </div>
            )}
          </div>
        </div>

        {config.featureToggles['newsletter-interests'] && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Interests (Optional)
            </legend>
            <div className="space-y-2">
              {availableInterests.map((interest) => (
                <label key={interest} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={(e) => handleInterestChange(interest, e.target.checked)}
                    disabled={isSubmitting}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-gray-600 dark:text-gray-300">{interest}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !email || !!hasEmailError}
          className="w-full"
          aria-describedby={isSubmitting ? 'submit-status' : undefined}
        >
          {isSubmitting ? 'Subscribing...' : buttonText}
        </Button>

        {isSubmitting && (
          <div 
            id="submit-status"
            className="text-sm text-gray-500 text-center"
            aria-live="polite"
          >
            Processing your subscription to nothing...
          </div>
        )}

        {submitError && (
          <div 
            className="text-sm text-red-600 dark:text-red-400 text-center"
            role="alert"
            aria-live="polite"
          >
            {submitError}
          </div>
        )}
      </form>

      {config.isDevelopment && (
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500">
          <strong>Dev Mode:</strong> Newsletter signup will use mock API. 
          Interests feature: {config.featureToggles['newsletter-interests'] ? 'enabled' : 'disabled'}
        </div>
      )}
    </div>
  )
}

export default NewsletterForm
