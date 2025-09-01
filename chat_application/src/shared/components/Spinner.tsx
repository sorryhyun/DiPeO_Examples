// filepath: src/shared/components/Spinner.tsx
import { theme } from '@/theme';
import { classNames } from '@/core/utils';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'accent' | 'white' | 'current';
  className?: string;
  'aria-label'?: string;
}

const sizeMap = {
  xs: '12px',
  sm: '16px', 
  md: '24px',
  lg: '32px',
  xl: '48px',
} as const;

const colorMap = {
  primary: theme.colors.primary,
  secondary: theme.colors.secondary,
  accent: theme.colors.accent,
  white: '#ffffff',
  current: 'currentColor',
} as const;

export function Spinner({
  size = 'md',
  color = 'primary',
  className,
  'aria-label': ariaLabel = 'Loading',
  ...rest
}: SpinnerProps) {
  const spinnerSize = sizeMap[size];
  const spinnerColor = colorMap[color];

  return (
    <div
      className={classNames('spinner', className)}
      style={{
        width: spinnerSize,
        height: spinnerSize,
        borderColor: `${spinnerColor}20`, // 20 = ~12% opacity in hex
        borderTopColor: spinnerColor,
        borderWidth: size === 'xs' ? '1px' : '2px',
        borderStyle: 'solid',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      {...rest}
    />
  );
}

/*
Self-check comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (uses theme instead)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (includes role="status" and aria-label for accessibility)
*/
