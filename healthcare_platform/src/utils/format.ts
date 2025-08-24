import type { User, Appointment, MedicalRecord, Prescription, LabResult, InsuranceClaim, Medication } from '@/types';

/**
 * Formats a date string or Date object to a localized date string
 * @param date - The date to format (string, Date, or undefined)
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (date: string | Date | undefined, locale: string = 'en-US'): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '';
  }
};

/**
 * Formats a date string or Date object to a localized time string
 * @param date - The date/time to format (string, Date, or undefined)
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted time string or empty string if invalid
 */
export const formatTime = (date: string | Date | undefined, locale: string = 'en-US'): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleTimeString(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '';
  }
};

/**
 * Formats a user's name from User object or separate first/last name strings
 * @param nameInput - User object with firstName/lastName or object with first/last properties or undefined
 * @returns Formatted full name or empty string if invalid
 */
export const formatName = (
  nameInput: User | { firstName?: string; lastName?: string } | { first?: string; last?: string } | undefined
): string => {
  if (!nameInput) return '';
  
  let firstName = '';
  let lastName = '';
  
  // Handle User type or objects with firstName/lastName
  if ('firstName' in nameInput) {
    firstName = nameInput.firstName || '';
    lastName = nameInput.lastName || '';
  }
  // Handle objects with first/last properties
  else if ('first' in nameInput) {
    firstName = nameInput.first || '';
    lastName = nameInput.last || '';
  }
  
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || '';
};

/**
 * Formats a number value safely with optional decimal places
 * @param value - The number to format (number, string, or undefined)
 * @param decimals - Number of decimal places (defaults to 0)
 * @returns Formatted number string or empty string if invalid
 */
export const formatNumber = (value: number | string | undefined, decimals: number = 0): string => {
  if (value === undefined || value === null || value === '') return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '';
  
  return numValue.toFixed(decimals);
};

/**
 * Formats currency values with proper currency symbol
 * @param amount - The amount to format (number, string, or undefined)
 * @param currency - Currency code (defaults to 'USD')
 * @param locale - Locale for formatting (defaults to 'en-US')
 * @returns Formatted currency string or empty string if invalid
 */
export const formatCurrency = (
  amount: number | string | undefined,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  if (amount === undefined || amount === null || amount === '') return '';
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return '';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(numAmount);
  } catch {
    return `$${numAmount.toFixed(2)}`;
  }
};

/**
 * Formats phone numbers to a readable format
 * @param phone - The phone number to format (string or undefined)
 * @returns Formatted phone number or empty string if invalid
 */
export const formatPhone = (phone: string | undefined): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone; // Return original if can't format
};

/**
 * Formats medical record status for display
 * @param status - The status string to format
 * @returns Formatted status string with proper capitalization
 */
export const formatStatus = (status: string | undefined): string => {
  if (!status) return '';
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
```

// Self-check comments:
// [ ] Uses `@/` imports only - Yes, imports types from @/types
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects) - Yes, pure functions only
// [ ] Reads config from `@/app/config` - N/A, no config needed for formatting utilities
// [ ] Exports default named component - N/A, this is a utilities file with named exports
// [ ] Adds basic ARIA and keyboard handlers (where relevant) - N/A, utilities file