/**
 * Formatting utilities for UI display
 */

/**
 * Format currency using Intl.NumberFormat
 */
export function formatCurrency(
  amount: number,
  locale: string = 'en-US',
  currency: string = 'USD'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback to simple format if locale/currency is invalid
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (!text || text.length <= length) {
    return text;
  }
  
  return text.slice(0, length).trim() + '...';
}

/**
 * Format date to short format (MM/DD/YYYY)
 */
export function shortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format large numbers with abbreviations (1K, 1M, etc.)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
