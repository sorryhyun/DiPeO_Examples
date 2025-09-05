// filepath: src/shared/icons/index.tsx

import React from 'react';

// =============================
// ICON PROPS INTERFACE
// =============================

export interface IconProps {
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

// Default props for all icons
const defaultIconProps: Required<Pick<IconProps, 'size' | 'strokeWidth'>> = {
  size: 24,
  strokeWidth: 2,
};

// =============================
// BASE ICON WRAPPER
// =============================

interface BaseIconProps extends IconProps {
  children: React.ReactNode;
  viewBox?: string;
}

const BaseIcon: React.FC<BaseIconProps> = ({
  size = defaultIconProps.size,
  className = '',
  color = 'currentColor',
  strokeWidth = defaultIconProps.strokeWidth,
  viewBox = '0 0 24 24',
  children,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden,
  ...rest
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block ${className}`}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      role={ariaLabel ? 'img' : 'presentation'}
      {...rest}
    >
      {children}
    </svg>
  );
};

// =============================
// ICON COMPONENTS
// =============================

/**
 * Menu/Hamburger icon for navigation toggles
 */
export const MenuIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Menu'}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </BaseIcon>
);

/**
 * Close/X icon for dismissing modals, notifications, etc.
 */
export const CloseIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Close'}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseIcon>
);

/**
 * User/Person icon for profiles, accounts, etc.
 */
export const UserIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'User'}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </BaseIcon>
);

/**
 * Check/Checkmark icon for success states, completed actions
 */
export const CheckIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Check'}>
    <polyline points="20,6 9,17 4,12" />
  </BaseIcon>
);

/**
 * Alert/Warning icon for error states, important notifications
 */
export const AlertIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Alert'}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </BaseIcon>
);

/**
 * Chart/Analytics icon for dashboards, data visualization
 */
export const ChartIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Chart'}>
    <path d="M3 3v18h18" />
    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
  </BaseIcon>
);

/**
 * Search icon for search inputs and functionality
 */
export const SearchIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Search'}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </BaseIcon>
);

/**
 * Settings/Gear icon for configuration, preferences
 */
export const SettingsIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Settings'}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m10.5-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM21 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-18 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z" />
  </BaseIcon>
);

/**
 * Arrow Right icon for navigation, CTAs
 */
export const ArrowRightIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Arrow Right'}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12,5 19,12 12,19" />
  </BaseIcon>
);

/**
 * Arrow Left icon for back navigation
 */
export const ArrowLeftIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Arrow Left'}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12,19 5,12 12,5" />
  </BaseIcon>
);

/**
 * Download icon for file downloads, export actions
 */
export const DownloadIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Download'}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </BaseIcon>
);

/**
 * Upload icon for file uploads, import actions
 */
export const UploadIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Upload'}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </BaseIcon>
);

/**
 * Heart icon for favorites, likes
 */
export const HeartIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Heart'}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </BaseIcon>
);

/**
 * Eye icon for visibility toggles, view actions
 */
export const EyeIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Show'}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
);

/**
 * Eye Off icon for hiding content, privacy
 */
export const EyeOffIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Hide'}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </BaseIcon>
);

/**
 * Calendar icon for dates, scheduling
 */
export const CalendarIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Calendar'}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </BaseIcon>
);

/**
 * Clock icon for time, history
 */
export const ClockIcon: React.FC<IconProps> = (props) => (
  <BaseIcon {...props} aria-label={props['aria-label'] || 'Clock'}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </BaseIcon>
);

// =============================
// ICON COLLECTION OBJECT
// =============================

/**
 * Object containing all available icons for easy programmatic access
 */
export const Icons = {
  Menu: MenuIcon,
  Close: CloseIcon,
  User: UserIcon,
  Check: CheckIcon,
  Alert: AlertIcon,
  Chart: ChartIcon,
  Search: SearchIcon,
  Settings: SettingsIcon,
  ArrowRight: ArrowRightIcon,
  ArrowLeft: ArrowLeftIcon,
  Download: DownloadIcon,
  Upload: UploadIcon,
  Heart: HeartIcon,
  Eye: EyeIcon,
  EyeOff: EyeOffIcon,
  Calendar: CalendarIcon,
  Clock: ClockIcon,
} as const;

/**
 * Type for icon names (useful for props that accept icon names)
 */
export type IconName = keyof typeof Icons;

// =============================
// DYNAMIC ICON COMPONENT
// =============================

export interface DynamicIconProps extends IconProps {
  name: IconName;
}

/**
 * Dynamic icon component that renders based on name prop
 */
export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = Icons[name];
  
  if (!IconComponent) {
    if (import.meta.env.DEV) {
      console.warn(`Icon "${name}" not found in Icons collection`);
    }
    return null;
  }
  
  return <IconComponent {...props} />;
};

// =============================
// HELPER UTILITIES
// =============================

/**
 * Get all available icon names
 */
export function getIconNames(): IconName[] {
  return Object.keys(Icons) as IconName[];
}

/**
 * Check if an icon name exists
 */
export function hasIcon(name: string): name is IconName {
  return name in Icons;
}

/**
 * Get icon component by name (with type safety)
 */
export function getIconComponent(name: IconName): React.FC<IconProps> {
  return Icons[name];
}

// =============================
// DEFAULT EXPORT
// =============================

// Export Icons object as default for easy importing
export default Icons;

// Self-check comments:
// [x] Uses `@/` imports only (no external imports needed for this icon collection)
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - N/A for pure SVG components
// [x] Reads config from `@/app/config` (uses import.meta.env appropriately for dev warnings)
// [x] Exports default named component (exports Icons object and individual components)
// [x] Adds basic ARIA and keyboard handlers (where relevant) - Added aria-label, aria-hidden, and role attributes
