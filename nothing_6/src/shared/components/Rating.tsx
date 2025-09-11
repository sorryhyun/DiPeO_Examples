// filepath: src/shared/components/Rating.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config`
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)

import React, { useState, useCallback, useMemo } from 'react'
import Icon from '@/shared/components/Icon'
import { config } from '@/app/config'

export interface RatingProps {
  /** Current rating value (0-5, supports decimals for half stars) */
  value: number
  /** Maximum rating value (default: 5) */
  max?: number
  /** Whether the rating is interactive/editable */
  interactive?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant */
  variant?: 'default' | 'gold' | 'amber'
  /** Show numeric value alongside stars */
  showValue?: boolean
  /** Accessible label for screen readers */
  ariaLabel?: string
  /** Callback when rating changes (interactive mode) */
  onChange?: (rating: number) => void
  /** Optional CSS class name */
  className?: string
  /** Whether to show half-star increments in interactive mode */
  allowHalfStars?: boolean
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
} as const

const colorClasses = {
  default: {
    filled: 'text-blue-500',
    empty: 'text-gray-300',
    hover: 'hover:text-blue-400'
  },
  gold: {
    filled: 'text-yellow-500',
    empty: 'text-gray-300',
    hover: 'hover:text-yellow-400'
  },
  amber: {
    filled: 'text-amber-500',
    empty: 'text-gray-300',
    hover: 'hover:text-amber-400'
  }
} as const

export function Rating({
  value,
  max = 5,
  interactive = false,
  size = 'md',
  variant = 'gold',
  showValue = false,
  ariaLabel,
  onChange,
  className = '',
  allowHalfStars = true
}: RatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  
  const clampedValue = Math.max(0, Math.min(max, value))
  const colors = colorClasses[variant]
  const sizeClass = sizeClasses[size]

  // Generate array of star states
  const stars = useMemo(() => {
    const displayValue = hoverRating !== null ? hoverRating : clampedValue
    const starStates = []
    
    for (let i = 1; i <= max; i++) {
      const diff = displayValue - (i - 1)
      let state: 'empty' | 'half' | 'full'
      
      if (diff <= 0) {
        state = 'empty'
      } else if (diff >= 1) {
        state = 'full'
      } else {
        state = 'half'
      }
      
      starStates.push({ index: i, state })
    }
    
    return starStates
  }, [clampedValue, hoverRating, max])

  const handleStarClick = useCallback((index: number, isHalf?: boolean) => {
    if (!interactive || !onChange) return
    
    const newRating = allowHalfStars && isHalf ? index - 0.5 : index
    onChange(newRating)
  }, [interactive, onChange, allowHalfStars])

  const handleStarHover = useCallback((index: number, isHalf?: boolean) => {
    if (!interactive) return
    
    const hoverValue = allowHalfStars && isHalf ? index - 0.5 : index
    setHoverRating(hoverValue)
  }, [interactive, allowHalfStars])

  const handleMouseLeave = useCallback(() => {
    if (!interactive) return
    setHoverRating(null)
  }, [interactive])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!interactive || !onChange) return

    const { key } = event
    let newRating = clampedValue

    switch (key) {
      case 'ArrowRight':
      case 'ArrowUp':
        newRating = Math.min(max, clampedValue + (allowHalfStars ? 0.5 : 1))
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        newRating = Math.max(0, clampedValue - (allowHalfStars ? 0.5 : 1))
        break
      case 'Home':
        newRating = 0
        break
      case 'End':
        newRating = max
        break
      default:
        return
    }

    event.preventDefault()
    onChange(newRating)
  }, [interactive, onChange, clampedValue, max, allowHalfStars])

  const defaultAriaLabel = `Rating: ${clampedValue} out of ${max} stars`
  const effectiveAriaLabel = ariaLabel || defaultAriaLabel

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div 
        className={`flex items-center ${interactive ? 'cursor-pointer' : ''}`}
        onMouseLeave={handleMouseLeave}
        role={interactive ? 'slider' : 'img'}
        aria-label={effectiveAriaLabel}
        aria-valuemin={interactive ? 0 : undefined}
        aria-valuemax={interactive ? max : undefined}
        aria-valuenow={interactive ? clampedValue : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
      >
        {stars.map(({ index, state }) => (
          <div key={index} className="relative">
            {/* Interactive overlay for half-star clicks */}
            {interactive && allowHalfStars && (
              <>
                <button
                  type="button"
                  className="absolute inset-0 w-1/2 z-10 opacity-0"
                  onClick={() => handleStarClick(index, true)}
                  onMouseEnter={() => handleStarHover(index, true)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
                <button
                  type="button"
                  className="absolute inset-0 left-1/2 w-1/2 z-10 opacity-0"
                  onClick={() => handleStarClick(index, false)}
                  onMouseEnter={() => handleStarHover(index, false)}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </>
            )}
            
{/* Full star click for non-half-star mode */}
            {interactive && !allowHalfStars && (
              <button
                type="button"
                className="absolute inset-0 z-10 opacity-0"
                onClick={() => handleStarClick(index)}
                onMouseEnter={() => handleStarHover(index)}
                tabIndex={-1}
                aria-hidden="true"
              />
            )}

            {/* Star visual */}
            <div className="relative">
              {state === 'half' ? (
                <div className="relative">
                  {/* Empty star background */}
                  <Icon 
                    name="star"
                    className={`${sizeClass} ${colors.empty} ${interactive ? colors.hover : ''}`}
                  />
                  {/* Half-filled overlay */}
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: '50%' }}
                  >
                    <Icon 
                      name="star-filled"
                      className={`${sizeClass} ${colors.filled}`}
                    />
                  </div>
                </div>
              ) : (
                <Icon 
                  name={state === 'full' ? 'star-filled' : 'star'}
                  className={`${sizeClass} ${
                    state === 'full' ? colors.filled : colors.empty
                  } ${interactive ? colors.hover : ''}`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 ml-2 font-medium">
          {clampedValue.toFixed(allowHalfStars ? 1 : 0)} / {max}
        </span>
      )}
    </div>
  )
}

export default Rating
