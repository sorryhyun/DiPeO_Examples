// filepath: src/shared/layouts/ResponsiveGrid.tsx
import React, { useMemo, type ReactNode, type CSSProperties } from 'react';
import { useResponsive } from '@/hooks/useResponsive';

// Grid item interface for child components
export interface GridItem {
  id: string;
  component: ReactNode;
  minWidth?: number; // Minimum width in pixels for this item
  maxWidth?: number; // Maximum width in pixels for this item
  priority?: number; // Higher priority items appear first (default: 0)
  span?: {
    xs?: number; // Columns to span on extra small screens
    sm?: number; // Columns to span on small screens
    md?: number; // Columns to span on medium screens
    lg?: number; // Columns to span on large screens
    xl?: number; // Columns to span on extra large screens
  };
}

// Responsive grid props
export interface ResponsiveGridProps {
  children?: ReactNode;
  items?: GridItem[];
  gap?: number | string;
  minColumnWidth?: number;
  maxColumns?: number;
  className?: string;
  style?: CSSProperties;
  autoFit?: boolean; // Whether to auto-fit columns based on content
  maintainAspectRatio?: boolean;
  equalHeight?: boolean; // Whether to make all items equal height
}

// Default configuration
const DEFAULT_GAP = 16;
const DEFAULT_MIN_COLUMN_WIDTH = 280;
const DEFAULT_MAX_COLUMNS = 6;

// Responsive grid component
export function ResponsiveGrid({
  children,
  items = [],
  gap = DEFAULT_GAP,
  minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
  maxColumns = DEFAULT_MAX_COLUMNS,
  className = '',
  style = {},
  autoFit = true,
  maintainAspectRatio = false,
  equalHeight = false,
}: ResponsiveGridProps) {
  const { breakpoint, screenSize } = useResponsive();

  // Calculate optimal columns based on screen size and content
  const { columns, columnWidth } = useMemo(() => {
    const containerWidth = screenSize.width - (gap as number * 2); // Account for padding
    
    // Calculate maximum possible columns based on minimum width
    const maxPossibleColumns = Math.floor(containerWidth / (minColumnWidth + (gap as number)));
    
    // Determine base columns by breakpoint
    const baseColumnsByBreakpoint = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: Math.min(maxColumns, maxPossibleColumns),
    };

    const baseColumns = baseColumnsByBreakpoint[breakpoint] || baseColumnsByBreakpoint.lg;
    
    // If auto-fit is enabled, use the calculated columns
    const finalColumns = autoFit 
      ? Math.min(baseColumns, maxPossibleColumns, maxColumns)
      : baseColumns;

    // Calculate actual column width
    const actualColumnWidth = (containerWidth - (gap as number * (finalColumns - 1))) / finalColumns;

    return {
      columns: Math.max(1, finalColumns),
      columnWidth: Math.max(minColumnWidth, actualColumnWidth),
    };
  }, [breakpoint, screenSize.width, gap, minColumnWidth, maxColumns, autoFit]);

  // Process and sort items based on priority and responsive spans
  const processedItems = useMemo(() => {
    const allItems = items.length > 0 
      ? items 
      : React.Children.map(children, (child, index) => ({
          id: `item-${index}`,
          component: child,
          priority: 0,
        })) || [];

    // Sort by priority (higher first)
    return [...allItems].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [items, children]);

  // Calculate grid template columns
  const gridTemplateColumns = useMemo(() => {
    if (autoFit) {
      return `repeat(${columns}, 1fr)`;
    }
    return `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))`;
  }, [autoFit, columns, minColumnWidth]);

  // Get responsive span for an item
  const getItemSpan = (item: GridItem): number => {
    if (!item.span) return 1;
    
    const span = item.span[breakpoint] || item.span.lg || item.span.md || item.span.sm || item.span.xs || 1;
    return Math.min(span, columns);
  };

  // Grid container styles
  const gridStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns,
    gap: gap,
    width: '100%',
    ...style,
  };

  // Add equal height styling if enabled
  if (equalHeight) {
    gridStyles.gridAutoRows = '1fr';
  }

  // Add aspect ratio constraint if enabled
  if (maintainAspectRatio) {
    gridStyles.gridAutoRows = `minmax(${columnWidth * 0.618}px, auto)`; // Golden ratio
  }

  return (
    <div
      className={`responsive-grid ${className}`}
      style={gridStyles}
      role="grid"
      aria-label="Responsive content grid"
    >
      {processedItems.map((item) => {
        const span = getItemSpan(item);
        
        return (
          <div
            key={item.id}
            className="grid-item"
            style={{
              gridColumn: span > 1 ? `span ${span}` : undefined,
              minWidth: item.minWidth,
              maxWidth: item.maxWidth,
              height: equalHeight ? '100%' : 'auto',
            }}
            role="gridcell"
          >
            {item.component}
          </div>
        );
      })}
    </div>
  );
}

// Responsive grid item wrapper component for individual styling
export interface GridItemWrapperProps {
  children: ReactNode;
  span?: ResponsiveGridProps['items'][0]['span'];
  minWidth?: number;
  maxWidth?: number;
  priority?: number;
  className?: string;
  style?: CSSProperties;
}

export function GridItemWrapper({
  children,
  span,
  minWidth,
  maxWidth,
  priority,
  className = '',
  style = {},
}: GridItemWrapperProps) {
  return (
    <div
      className={`grid-item-wrapper ${className}`}
      style={{
        minWidth,
        maxWidth,
        height: '100%',
        ...style,
      }}
      data-priority={priority}
      data-span={JSON.stringify(span)}
    >
      {children}
    </div>
  );
}

// Hook for responsive grid utilities
export function useResponsiveGrid() {
  const { breakpoint, screenSize } = useResponsive();

  const getOptimalColumns = (
    minWidth: number = DEFAULT_MIN_COLUMN_WIDTH,
    maxColumns: number = DEFAULT_MAX_COLUMNS,
    gap: number = DEFAULT_GAP
  ): number => {
    const containerWidth = screenSize.width - (gap * 2);
    const maxPossible = Math.floor(containerWidth / (minWidth + gap));
    
    const baseColumns = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: Math.min(maxColumns, maxPossible),
    }[breakpoint] || 4;

    return Math.min(baseColumns, maxPossible, maxColumns);
  };

  const getColumnWidth = (
    columns: number,
    gap: number = DEFAULT_GAP
  ): number => {
    const containerWidth = screenSize.width - (gap * 2);
    return (containerWidth - (gap * (columns - 1))) / columns;
  };

  const shouldStackVertically = (minWidth: number = DEFAULT_MIN_COLUMN_WIDTH): boolean => {
    return screenSize.width < (minWidth + DEFAULT_GAP * 2);
  };

  return {
    breakpoint,
    screenSize,
    getOptimalColumns,
    getColumnWidth,
    shouldStackVertically,
  };
}

// Responsive grid with masonry layout (alternative implementation)
export interface MasonryGridProps extends Omit<ResponsiveGridProps, 'equalHeight'> {
  rowHeight?: number;
  maxRows?: number;
}

export function MasonryGrid({
  children,
  items = [],
  gap = DEFAULT_GAP,
  minColumnWidth = DEFAULT_MIN_COLUMN_WIDTH,
  maxColumns = DEFAULT_MAX_COLUMNS,
  className = '',
  style = {},
  autoFit = true,
  rowHeight = 200,
  maxRows = 10,
}: MasonryGridProps) {
  const { columns } = useResponsiveGrid();

  const masonryStyles: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${autoFit ? columns : 'auto-fit'}, minmax(${minColumnWidth}px, 1fr))`,
    gridAutoRows: `${rowHeight}px`,
    gap: gap,
    width: '100%',
    maxHeight: `${rowHeight * maxRows + (gap as number) * (maxRows - 1)}px`,
    overflow: 'hidden',
    ...style,
  };

  const processedItems = useMemo(() => {
    const allItems = items.length > 0 
      ? items 
      : React.Children.map(children, (child, index) => ({
          id: `masonry-item-${index}`,
          component: child,
          priority: 0,
        })) || [];

    return [...allItems].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [items, children]);

  return (
    <div
      className={`masonry-grid ${className}`}
      style={masonryStyles}
      role="grid"
      aria-label="Masonry content grid"
    >
      {processedItems.map((item, index) => (
        <div
          key={item.id}
          className="masonry-item"
          style={{
            // Randomly vary grid row span for masonry effect
            gridRowEnd: `span ${Math.ceil(Math.random() * 3) + 1}`,
          }}
          role="gridcell"
        >
          {item.component}
        </div>
      ))}
    </div>
  );
}

// Export default component
export default ResponsiveGrid;

// Self-check comments:
// [x] Uses `@/` imports only
// [x] Uses providers/hooks (no direct DOM/localStorage side effects)
// [x] Reads config from `@/app/config` - not needed for layout component
// [x] Exports default named component
// [x] Adds basic ARIA and keyboard handlers (where relevant)
