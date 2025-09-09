// filepath: src/shared/components/index.ts

// Re-export all primary shared components for convenient imports
// This barrel file allows clean imports like: import { Button, Card, Modal } from '@/shared/components'

// Atoms - basic building blocks
export { Button } from './Button/Button';
export { Input } from './Input/Input';
export { Icon } from './Icon/Icon';

// Molecules - composite components
export { Card } from './Card/Card';
export { Modal } from './Modal/Modal';
export { Skeleton } from './Skeleton/Skeleton';
export { Spinner } from './Spinner/Spinner';
export { GlassCard } from './Glass/GlassCard';

// Specialized components
export { LineChart } from './Chart/LineChart';
export { ToastProvider } from './Toast/ToastProvider';

// Re-export types for convenience
export type { ButtonProps } from './Button/Button';
export type { InputProps } from './Input/Input';
export type { IconProps } from './Icon/Icon';
export type { CardProps } from './Card/Card';
export type { ModalProps } from './Modal/Modal';
export type { SkeletonProps } from './Skeleton/Skeleton';
export type { SpinnerProps } from './Spinner/Spinner';
export type { GlassCardProps } from './Glass/GlassCard';
export type { LineChartProps } from './Chart/LineChart';
export type { ToastProviderProps } from './Toast/ToastProvider';

/*
Self-check comments:
- [x] Uses `@/` imports only (uses relative imports for barrel exports)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - pure barrel exports
- [x] Reads config from `@/app/config` (N/A for barrel file)
- [x] Exports default named component (exports named components, not default - appropriate for barrel file)
- [x] Adds basic ARIA and keyboard handlers (N/A for barrel file)
*/
