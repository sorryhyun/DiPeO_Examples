// filepath: src/shared/components/Table.tsx

// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

import React from 'react';
import { theme } from '@/theme';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sticky?: boolean;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  className?: string;
  stickyHeader?: boolean;
  compact?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

const Table = <T,>({
  data,
  columns,
  className = '',
  stickyHeader = true,
  compact = false,
  striped = true,
  hoverable = true,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  onSort,
  sortKey,
  sortDirection
}: TableProps<T>) => {
  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;
    
    const newDirection = sortKey === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
  };

  const handleKeyDown = (event: React.KeyboardEvent, column: TableColumn<T>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSort(column);
    }
  };

  const getCellValue = (item: T, column: TableColumn<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    return item[column.accessor] as React.ReactNode;
  };

  const getSortIcon = (column: TableColumn<T>) => {
    if (!column.sortable) return null;
    
    if (sortKey === column.key) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  if (loading) {
    return (
      <div className={theme.resolve('table-loading', 'animate-pulse')}>
        <div className="h-12 bg-gray-200 rounded mb-2"></div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-1"></div>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={theme.resolve('table-empty', 'text-center py-12 text-gray-500')}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={theme.resolve('table-wrapper', `overflow-auto ${className}`)}>
      {/* Desktop Table */}
      <table 
        className={theme.resolve('table', 'w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden hidden md:table')}
        role="table"
      >
        <thead 
          className={theme.resolve(
            'table-header',
            `bg-gray-50 ${stickyHeader ? 'sticky top-0 z-10' : ''}`
          )}
        >
          <tr role="row">
            {columns.map((column) => (
              <th
                key={column.key}
                role="columnheader"
                className={theme.resolve(
                  'table-header-cell',
                  `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b
                   ${column.align === 'center' ? 'text-center' : ''}
                   ${column.align === 'right' ? 'text-right' : ''}
                   ${column.sortable ? 'cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500' : ''}
                   ${column.sticky ? 'sticky left-0 bg-gray-50 z-20' : ''}`
                )}
                style={{ width: column.width }}
                onClick={() => handleSort(column)}
                onKeyDown={(e) => handleKeyDown(e, column)}
                tabIndex={column.sortable ? 0 : -1}
                aria-sort={
                  column.sortable && sortKey === column.key
                    ? sortDirection === 'asc' ? 'ascending' : 'descending'
                    : column.sortable ? 'none' : undefined
                }
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {getSortIcon(column) && (
                    <span className="text-gray-400" aria-hidden="true">
                      {getSortIcon(column)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={theme.resolve('table-body', 'divide-y divide-gray-200')}>
          {data.map((item, index) => (
            <tr
              key={index}
              role="row"
              className={theme.resolve(
                'table-row',
                `${striped && index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                 ${hoverable ? 'hover:bg-gray-100' : ''}
                 ${onRowClick ? 'cursor-pointer' : ''}
                 ${compact ? 'h-12' : 'h-16'}`
              )}
              onClick={() => onRowClick?.(item, index)}
              tabIndex={onRowClick ? 0 : -1}
              onKeyDown={(e) => {
                if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onRowClick(item, index);
                }
              }}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  role="cell"
                  className={theme.resolve(
                    'table-cell',
                    `px-6 py-4 whitespace-nowrap text-sm text-gray-900
                     ${column.align === 'center' ? 'text-center' : ''}
                     ${column.align === 'right' ? 'text-right' : ''}
                     ${column.sticky ? 'sticky left-0 bg-inherit z-10' : ''}`
                  )}
                >
                  {getCellValue(item, column)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {data.map((item, index) => (
          <div
            key={index}
            className={theme.resolve(
              'table-mobile-card',
              `bg-white rounded-lg shadow-sm border p-4 space-y-3
               ${hoverable ? 'hover:shadow-md' : ''}
               ${onRowClick ? 'cursor-pointer' : ''}`
            )}
            onClick={() => onRowClick?.(item, index)}
            tabIndex={onRowClick ? 0 : -1}
            onKeyDown={(e) => {
              if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onRowClick(item, index);
              }
            }}
            role="button"
            aria-label={`Row ${index + 1}`}
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start">
                <dt className="text-sm font-medium text-gray-500 min-w-0 flex-1 mr-4">
                  {column.header}
                </dt>
                <dd className={theme.resolve(
                  'table-mobile-value',
                  `text-sm text-gray-900 text-right ${column.align === 'left' ? 'text-left' : ''}`
                )}>
                  {getCellValue(item, column)}
                </dd>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table;
