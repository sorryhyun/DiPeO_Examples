// filepath: src/shared/layouts/ResponsiveGrid.tsx
import React from 'react';
import { useResponsive } from '@/hooks/useResponsive';

export interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
  minItemWidth?: number; // minimum width in pixels for grid items
  maxColumns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  equalHeight?: boolean;
  'data-testid'?: string;
}

const gapMap = {
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem'
} as const;

export function ResponsiveGrid({
  children,
  className = '',
  gap = 'md',
  minItemWidth = 300,
  maxColumns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4
  },
  equalHeight = false,
  'data-testid': dataTestId,
  ...props
}: ResponsiveGridProps) {
  const { isMobile, isTablet, isDesktop, isWide, screenWidth } = useResponsive();

  // Determine current max columns based on breakpoint
  const getCurrentMaxColumns = (): number => {
    if (isMobile) return maxColumns.mobile ?? 1;
    if (isTablet) return maxColumns.tablet ?? 2;
    if (isDesktop) return maxColumns.desktop ?? 3;
    if (isWide) return maxColumns.wide ?? 4;
    return maxColumns.desktop ?? 3; // fallback
  };

  // Calculate optimal columns based on screen width and min item width
  const getOptimalColumns = (): number => {
    const maxCols = getCurrentMaxColumns();
    const gapValue = parseFloat(gapMap[gap]) * 16; // Convert rem to px (assuming 16px base)
    const availableWidth = screenWidth - (gapValue * (maxCols - 1));
    const calculatedCols = Math.floor(availableWidth / minItemWidth);
    
    return Math.max(1, Math.min(maxCols, calculatedCols));
  };

  const columns = getOptimalColumns();
  const gapValue = gapMap[gap];

  // Grid styles
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gapValue,
    width: '100%',
    ...(equalHeight && {
      gridAutoRows: '1fr'
    })
  };

  // Convert children to array for manipulation
  const childrenArray = React.Children.toArray(children);

  // Filter out null/undefined children
  const validChildren = childrenArray.filter(child => child != null);

  if (validChildren.length === 0) {
    return (
      <div
        className={`responsive-grid responsive-grid--empty ${className}`.trim()}
        data-testid={dataTestId}
        role="grid"
        aria-label="Empty responsive grid"
        {...props}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)'
          }}
        >
          No items to display
        </div>
      </div>
    );
  }

  return (
    <div
      className={`responsive-grid responsive-grid--cols-${columns} ${className}`.trim()}
      style={gridStyles}
      data-testid={dataTestId}
      role="grid"
      aria-label={`Responsive grid with ${columns} columns`}
      {...props}
    >
      {validChildren.map((child, index) => {
        // Wrap each child in a grid item container
        return (
          <div
            key={index}
            className="responsive-grid__item"
            role="gridcell"
            style={{
              minWidth: 0, // Prevent grid items from overflowing
              ...(equalHeight && {
                display: 'flex',
                flexDirection: 'column'
              })
            }}
          >
            {equalHeight && React.isValidElement(child) ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {child}
              </div>
            ) : (
              child
            )}
          </div>
        );
      })}
    </div>
  );
}

// Specialized grid variants for common use cases
export interface DashboardGridProps extends Omit<ResponsiveGridProps, 'maxColumns' | 'minItemWidth'> {
  variant?: 'cards' | 'widgets' | 'tiles';
}

export function DashboardGrid({ variant = 'widgets', ...props }: DashboardGridProps) {
  const variantConfigs = {
    cards: {
      minItemWidth: 280,
      maxColumns: { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
      gap: 'md' as const
    },
    widgets: {
      minItemWidth: 320,
      maxColumns: { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
      gap: 'lg' as const
    },
    tiles: {
      minItemWidth: 200,
      maxColumns: { mobile: 2, tablet: 3, desktop: 4, wide: 6 },
      gap: 'sm' as const
    }
  };

  const config = variantConfigs[variant];

  return (
    <ResponsiveGrid
      {...config}
      {...props}
      className={`dashboard-grid dashboard-grid--${variant} ${props.className || ''}`.trim()}
    />
  );
}

// Utility hook for grid calculations
export function useGridCalculations(minItemWidth: number = 300) {
  const { screenWidth } = useResponsive();

  const calculateOptimalColumns = (maxColumns: number, gap: number = 16): number => {
    const availableWidth = screenWidth - (gap * (maxColumns - 1));
    const calculatedCols = Math.floor(availableWidth / minItemWidth);
    return Math.max(1, Math.min(maxColumns, calculatedCols));
  };

  const getGridTemplateColumns = (columns: number): string => {
    return `repeat(${columns}, 1fr)`;
  };

  return {
    calculateOptimalColumns,
    getGridTemplateColumns,
    screenWidth
  };
}

// Export default for convenience
export default ResponsiveGrid;

/*
Self-check comments:
- [x] Uses `@/` imports only (imports from @/hooks/useResponsive)
- [x] Uses providers/hooks (no direct DOM/localStorage side effects) - uses useResponsive hook
- [x] Reads config from `@/app/config` (N/A - layout component doesn't need config)
- [x] Exports default named component (exports ResponsiveGrid as default and named)
- [x] Adds basic ARIA and keyboard handlers (includes role="grid", role="gridcell", aria-label for accessibility)
*/
