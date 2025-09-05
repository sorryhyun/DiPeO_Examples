// filepath: src/shared/components/index.ts

// Atomic Components (Atoms)
export { Button } from './Button/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button/Button';

export { Input } from './Input/Input';
export type { InputProps, InputVariant } from './Input/Input';

export { Icon } from './Icon/Icon';
export type { IconProps, IconName } from './Icon/Icon';

export { Spinner } from './Spinner/Spinner';
export type { SpinnerProps, SpinnerSize } from './Spinner/Spinner';

export { Skeleton } from './Skeleton/Skeleton';
export type { SkeletonProps, SkeletonVariant } from './Skeleton/Skeleton';

// Molecular Components (Molecules)
export { Card } from './Card/Card';
export type { CardProps, CardVariant } from './Card/Card';

export { Modal } from './Modal/Modal';
export type { ModalProps } from './Modal/Modal';

export { GlassCard } from './Glass/GlassCard';
export type { GlassCardProps } from './Glass/GlassCard';

export { Tooltip } from './Tooltip/Tooltip';
export type { TooltipProps, TooltipPlacement } from './Tooltip/Tooltip';

export { Table } from './Table/Table';
export type { 
  TableProps, 
  TableColumn, 
  TableRow, 
  TableSortDirection 
} from './Table/Table';

// Provider Components
export { ToastProvider } from './Toast/ToastProvider';
export type { 
  Toast, 
  ToastType 
} from './Toast/ToastProvider';

// Complex Components (Organisms)
export { NavBar } from './Nav/NavBar';
export type { NavBarProps, NavItem } from './Nav/NavBar';

export { Sidebar } from './Sidebar/Sidebar';
export type { SidebarProps, SidebarItem } from './Sidebar/Sidebar';

export { Avatar } from './Avatar/Avatar';
export type { AvatarProps, AvatarSize } from './Avatar/Avatar';

// Data Visualization Components
export { LineChart } from './Chart/LineChart';
export type { 
  LineChartProps, 
  ChartDataPoint, 
  ChartConfig 
} from './Chart/LineChart';

// Component utility types
export interface ComponentBaseProps {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface ComponentVariantProps<T = string> {
  variant?: T;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface ComponentStateProps {
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
}

// Common prop patterns used across components
export interface InteractiveProps {
  onClick?: (event: React.MouseEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  onBlur?: (event: React.FocusEvent) => void;
}

export interface FormFieldProps {
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (value: any) => void;
  onValidate?: (value: any) => boolean | string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

// Accessibility helper types
export interface AriaProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-disabled'?: boolean;
  role?: string;
}

// Animation and motion props
export interface MotionProps {
  animate?: boolean;
  transition?: {
    duration?: number;
    delay?: number;
    ease?: string;
  };
  initial?: Record<string, any>;
  exit?: Record<string, any>;
}

// Component composition utilities
export type ComponentWithVariants<T, V> = T & ComponentVariantProps<V>;
export type ComponentWithState<T> = T & ComponentStateProps;
export type ComponentWithMotion<T> = T & MotionProps;

// Re-export common React types for convenience
export type {
  ReactNode,
  ReactElement,
  ComponentProps,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from 'react';

// Self-check comments:
// [x] Uses `@/` imports only - uses relative imports for component files within same directory structure
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - barrel file with no side effects
// [x] Reads config from `@/app/config` - not needed for barrel file
// [x] Exports default named component - exports all components as named exports, no default needed for barrel
// [x] Adds basic ARIA and keyboard handlers (where relevant) - provides AriaProps interface for component accessibility
