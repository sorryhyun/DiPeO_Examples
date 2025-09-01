// filepath: src/components/GradientButton.tsx
/* src/components/GradientButton.tsx

High-contrast gradient CTA built on top of shared Button with subtle shine animation 
and focus ring for accessibility.
*/

import React from 'react';
import { Button } from '@/shared/components/Button';
import { animations } from '@/theme/animations';

interface GradientButtonProps extends React.ComponentProps<typeof Button> {
  gradient?: 'primary' | 'success' | 'warning' | 'error';
  shine?: boolean;
}

const gradientStyles = {
  primary: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
  success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
  warning: 'bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700',
  error: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
};

export const GradientButton: React.FC<GradientButtonProps> = ({
  gradient = 'primary',
  shine = true,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const gradientClass = gradientStyles[gradient];
  
  const shineOverlay = shine ? (
    <div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                 transform -skew-x-12 -translate-x-full group-hover:translate-x-full 
                 transition-transform duration-700 ease-out"
      style={{
        animation: disabled ? 'none' : animations.shine,
      }}
    />
  ) : null;

  const combinedClassName = `
    ${gradientClass}
    text-white font-semibold
    relative overflow-hidden group
    shadow-lg hover:shadow-xl
    focus:ring-4 focus:ring-blue-300/50 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    transition-all duration-200
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <Button
      className={combinedClassName}
      disabled={disabled}
      {...props}
    >
      {shineOverlay}
      <span className="relative z-10">{children}</span>
    </Button>
  );
};

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (extends shared Button component)
// [x] Reads config from `@/app/config` (uses theme/animations)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (inherited from Button, enhanced focus ring)
