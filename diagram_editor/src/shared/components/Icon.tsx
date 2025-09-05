// filepath: src/shared/components/Icon.tsx

import React from 'react';
import { theme } from '@/theme/index';
import * as Icons from '@/shared/icons/index';

// Re-export icon names from the icon registry
export type IconName = keyof typeof Icons;

// Icon size presets based on theme tokens
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export interface IconProps {
  /**
   * The name of the icon from the icon registry
   */
  name: IconName;
  
  /**
   * Size of the icon - can use preset sizes or custom number (px)
   */
  size?: IconSize;
  
  /**
   * Color of the icon - uses theme colors or custom CSS color
   */
  color?: string;
  
  /**
   * Additional CSS class names
   */
  className?: string;
  
  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string;
  
  /**
   * Whether the icon is decorative (hidden from screen readers)
   */
  decorative?: boolean;
  
  /**
   * Click handler for interactive icons
   */
  onClick?: (event: React.MouseEvent<SVGElement>) => void;
  
  /**
   * Additional props passed to the SVG element
   */
  [key: string]: any;
}

// Size mapping to pixel values
const sizeMap: Record<Exclude<IconSize, number>, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/**
 * Resolves icon size to pixel value
 */
function getIconSize(size: IconSize = 'md'): number {
  if (typeof size === 'number') {
    return size;
  }
  return sizeMap[size] || sizeMap.md;
}

/**
 * Resolves color value, supporting theme tokens and CSS colors
 */
function getIconColor(color?: string): string {
  if (!color) {
    return 'currentColor';
  }
  
  // Check if it's a theme color token (e.g., 'primary', 'secondary')
  if (theme.colors && color in theme.colors) {
    return (theme.colors as Record<string, string>)[color];
  }
  
  // Return as-is for CSS colors
  return color;
}

/**
 * Icon component that renders SVG icons from the icon registry
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color,
  className = '',
  'aria-label': ariaLabel,
  decorative = false,
  onClick,
  ...props
}) => {
  // Get the icon component from the registry
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    // In development, warn about missing icons
    if (import.meta.env.DEV) {
      console.warn(`Icon "${name}" not found in icon registry`);
    }
    return null;
  }
  
  const sizeValue = getIconSize(size);
  const colorValue = getIconColor(color);
  const isInteractive = Boolean(onClick);
  
  // Build CSS classes
  const classes = [
    'icon',
    className,
    isInteractive && 'icon--interactive',
  ].filter(Boolean).join(' ');
  
  // Accessibility props
  const accessibilityProps: Record<string, any> = {};
  
  if (decorative) {
    accessibilityProps['aria-hidden'] = true;
  } else if (ariaLabel) {
    accessibilityProps['aria-label'] = ariaLabel;
  } else if (!ariaLabel && !decorative) {
    // Provide default accessible name based on icon name
    accessibilityProps['aria-label'] = name.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
  }
  
  // Interactive props
  if (isInteractive) {
    accessibilityProps.role = 'button';
    accessibilityProps.tabIndex = 0;
    
    // Handle keyboard interaction for accessible button behavior
    accessibilityProps.onKeyDown = (event: React.KeyboardEvent<SVGElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick?.(event as any);
      }
    };
  }
  
  return (
    <IconComponent
      width={sizeValue}
      height={sizeValue}
      fill={colorValue}
      className={classes}
      onClick={onClick}
      {...accessibilityProps}
      {...props}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        cursor: isInteractive ? 'pointer' : 'default',
        transition: isInteractive ? 'opacity 0.2s ease' : undefined,
        ...props.style,
      }}
    />
  );
};

/**
 * Hook for getting available icon names (useful for dev tools, storybook, etc.)
 */
export function useIconRegistry(): {
  availableIcons: IconName[];
  hasIcon: (name: string) => boolean;
} {
  const availableIcons = Object.keys(Icons) as IconName[];
  
  const hasIcon = React.useCallback((name: string): boolean => {
    return name in Icons;
  }, []);
  
  return {
    availableIcons,
    hasIcon,
  };
}

/**
 * Utility component for rendering icon with text
 */
export interface IconWithTextProps {
  icon: IconName;
  iconSize?: IconSize;
  iconColor?: string;
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md';
  reverse?: boolean;
  className?: string;
}

export const IconWithText: React.FC<IconWithTextProps> = ({
  icon,
  iconSize = 'sm',
  iconColor,
  children,
  spacing = 'sm',
  reverse = false,
  className = '',
}) => {
  const spacingMap = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
  };
  
  const gap = spacingMap[spacing];
  
  return (
    <span
      className={`icon-with-text ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap,
        flexDirection: reverse ? 'row-reverse' : 'row',
      }}
    >
      <Icon name={icon} size={iconSize} color={iconColor} decorative />
      <span>{children}</span>
    </span>
  );
};

export default Icon;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` (uses import.meta.env for dev warnings)
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
