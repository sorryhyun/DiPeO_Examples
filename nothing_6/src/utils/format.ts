// src/utils/format.ts
// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

/**
 * Format a number with elegant handling of zeros and infinity
 */
export function formatNumber(
  value: number | null | undefined,
  options: {
    decimals?: number;
    showZeroAsSymbol?: boolean;
    showInfinityAsSymbol?: boolean;
    compact?: boolean;
    currency?: string;
  } = {}
): string {
  const {
    decimals = 0,
    showZeroAsSymbol = false,
    showInfinityAsSymbol = true,
    compact = false,
    currency
  } = options;

  // Handle null/undefined
  if (value == null) return '—';

  // Handle zero with elegant symbol
  if (value === 0 && showZeroAsSymbol) {
    return '∅'; // Empty set symbol for zero
  }

  // Handle infinity with elegant symbol
  if (!isFinite(value)) {
    if (showInfinityAsSymbol) {
      return value > 0 ? '∞' : '-∞';
    }
    return value > 0 ? 'Infinity' : '-Infinity';
  }

  // Format with currency if specified
  if (currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      notation: compact ? 'compact' : 'standard'
    }).format(value);
  }

  // Standard number formatting
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    notation: compact ? 'compact' : 'standard'
  }).format(value);
}

/**
 * Pluralize a word based on count with elegant zero handling
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
  options: {
    showCount?: boolean;
    showZeroAsNone?: boolean;
    includeNumber?: boolean;
  } = {}
): string {
  const {
    showCount = true,
    showZeroAsNone = false,
    includeNumber = true
  } = options;

  const pluralForm = plural ?? `${singular}s`;
  const word = count === 1 ? singular : pluralForm;

  // Handle zero with "none" instead of "0"
  if (count === 0 && showZeroAsNone) {
    return includeNumber ? `no ${word}` : word;
  }

  // Format the count elegantly
  const formattedCount = formatNumber(count, { compact: true });
  
  if (!showCount) {
    return word;
  }

  return includeNumber ? `${formattedCount} ${word}` : word;
}

/**
 * Format duration in a human-readable way
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return '∅';
  if (!isFinite(seconds)) return '∞';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format file size with appropriate units
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '∅';
  if (!isFinite(bytes)) return '∞';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const threshold = 1024;
  
  let size = Math.abs(bytes);
  let unitIndex = 0;

  while (size >= threshold && unitIndex < units.length - 1) {
    size /= threshold;
    unitIndex++;
  }

  const formatted = size < 10 ? size.toFixed(1) : Math.round(size).toString();
  return `${formatted}${units[unitIndex]}`;
}

/**
 * Format percentage with elegant zero and infinity handling
 */
export function formatPercentage(
  value: number,
  options: { decimals?: number; showSign?: boolean } = {}
): string {
  const { decimals = 1, showSign = false } = options;
  
  if (value === 0) return '∅%';
  if (!isFinite(value)) return value > 0 ? '∞%' : '-∞%';

  const formatted = formatNumber(value * 100, { decimals });
  const sign = showSign && value > 0 ? '+' : '';
  
  return `${sign}${formatted}%`;
}

/**
 * Truncate text with elegant ellipsis
 */
export function truncate(
  text: string,
  maxLength: number,
  options: { ellipsis?: string; preserveWords?: boolean } = {}
): string {
  const { ellipsis = '…', preserveWords = true } = options;
  
  if (text.length <= maxLength) return text;

  if (preserveWords) {
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 
      ? `${truncated.slice(0, lastSpace)}${ellipsis}`
      : `${truncated}${ellipsis}`;
  }

  return `${text.slice(0, maxLength)}${ellipsis}`;
}
