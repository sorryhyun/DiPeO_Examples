// filepath: src/shared/layouts/ResponsiveContainer.tsx
// [x] Uses `@/` imports as much as possible
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config` (not needed for layout container)
// [x] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant - N/A for layout wrapper)

import React from 'react'
import { theme } from '@/theme'

export interface ResponsiveContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  as?: keyof JSX.IntrinsicElements
  noPadding?: boolean
}

const sizeVariants = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl', 
  lg: 'max-w-7xl',
  xl: 'max-w-screen-2xl',
  full: 'max-w-none'
} as const

export function ResponsiveContainer({ 
  children, 
  size = 'lg',
  className = '',
  as: Component = 'div',
  noPadding = false
}: ResponsiveContainerProps) {
  const maxWidthClass = sizeVariants[size]
  const paddingClass = noPadding ? '' : 'px-4 sm:px-6 lg:px-8'
  
  const combinedClasses = theme.cn(
    'mx-auto w-full',
    maxWidthClass,
    paddingClass,
    className
  )

  return (
    <Component className={combinedClasses}>
      {children}
    </Component>
  )
}

export default ResponsiveContainer
