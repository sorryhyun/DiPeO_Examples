import React from 'react';
import { cn } from '../../utils/cn';

interface GridProps {
  rows: number;
  cols: number;
  children: React.ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

const Grid: React.FC<GridProps> = ({ 
  rows, 
  cols, 
  children, 
  className = '',
  gap = 'md'
}) => {
  // Create grid template styles for dynamic values
  const gridStyle = {
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
  };

  // Gap classes mapping
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  // Responsive adjustments for mobile
  const getResponsiveClasses = () => {
    if (cols > 4) {
      // For larger grids, reduce columns on mobile
      return 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8';
    } else if (cols > 2) {
      return `grid-cols-2 sm:grid-cols-${cols}`;
    } else {
      return `grid-cols-${cols}`;
    }
  };

  return (
    <div
      className={cn(
        'grid',
        'place-items-center',
        'w-full',
        'h-full',
        getResponsiveClasses(),
        gapClasses[gap],
        'p-4',
        // Accessibility
        'focus-within:outline-none',
        className
      )}
      style={gridStyle}
      role="grid"
      aria-label={`Memory game grid with ${rows} rows and ${cols} columns`}
    >
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          className="w-full h-full flex items-center justify-center"
          role="gridcell"
          tabIndex={-1}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default Grid;
