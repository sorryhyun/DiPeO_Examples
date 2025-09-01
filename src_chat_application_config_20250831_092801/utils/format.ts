// Small formatting utilities for message timestamps, file sizes, and sanitizing text for rendering.

// Format timestamp for display in messages
export function formatTimestamp(timestamp: string | Date, options: {
  relative?: boolean;
  includeTime?: boolean;
  includeSeconds?: boolean;
} = {}): string {
  const {
    relative = true,
    includeTime = true,
    includeSeconds = false
  } = options;

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Invalid date handling
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }

  // For relative formatting
  if (relative) {
    if (diffMinutes < 1) {
      return 'Just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
  }

  // Format options for absolute timestamps
  const formatOptions: Intl.DateTimeFormatOptions = {};

  // Same day - show time only
  if (diffDays === 0 && includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
    if (includeSeconds) {
      formatOptions.second = '2-digit';
    }
    formatOptions.hour12 = true;
    return date.toLocaleTimeString(undefined, formatOptions);
  }

  // This week - show day and time
  if (diffDays < 7) {
    formatOptions.weekday = 'short';
    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      formatOptions.hour12 = true;
    }
    return date.toLocaleDateString(undefined, formatOptions);
  }

  // This year - show month/day and optionally time
  if (date.getFullYear() === now.getFullYear()) {
    formatOptions.month = 'short';
    formatOptions.day = 'numeric';
    if (includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      formatOptions.hour12 = true;
    }
    return date.toLocaleDateString(undefined, formatOptions);
  }

  // Different year - show full date and optionally time
  formatOptions.year = 'numeric';
  formatOptions.month = 'short';
  formatOptions.day = 'numeric';
  if (includeTime) {
    formatOptions.hour = '2-digit';
    formatOptions.minute = '2-digit';
    formatOptions.hour12 = true;
  }
  
  return date.toLocaleDateString(undefined, formatOptions);
}

// Convert file size in bytes to human readable format
export function humanFileSize(bytes: number, si = false, dp = 1): string {
  if (bytes === 0) return '0 B';
  
  const thresh = si ? 1000 : 1024;
  const units = si 
    ? ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  let u = -1;
  const r = 10 ** dp;
  let size = bytes;

  do {
    size /= thresh;
    ++u;
  } while (Math.round(Math.abs(size) * r) / r >= thresh && u < units.length - 1);

  return `${size.toFixed(dp)} ${units[u]}`;
}

// Basic text sanitization to prevent XSS while preserving newlines and basic formatting
export function sanitizeText(text: string, options: {
  preserveNewlines?: boolean;
  maxLength?: number;
  allowBasicMarkdown?: boolean;
} = {}): string {
  const {
    preserveNewlines = true,
    maxLength,
    allowBasicMarkdown = false
  } = options;

  if (!text || typeof text !== 'string') {
    return '';
  }

  let sanitized = text;

  // Basic HTML entity encoding for security
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Preserve newlines by converting to <br> tags
  if (preserveNewlines) {
    sanitized = sanitized.replace(/\n/g, '<br>');
  }

  // Basic markdown support (very limited for safety)
  if (allowBasicMarkdown) {
    // Bold text **text**
    sanitized = sanitized.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic text *text*
    sanitized = sanitized.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code `code`
    sanitized = sanitized.replace(/`(.*?)`/g, '<code>$1</code>');
  }

  // Truncate if max length specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength - 3) + '...';
  }

  return sanitized;
}

// Format duration in milliseconds to human readable format
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

// Format phone number to display format
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format US phone numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format international numbers (basic)
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  // Return original if we can't format
  return phone;
}

// Extract initials from display name for avatar fallbacks
export function extractInitials(name: string, maxInitials = 2): string {
  if (!name || typeof name !== 'string') {
    return '?';
  }

  const words = name.trim().split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) {
    return '?';
  }

  // Take first letter of each word, up to maxInitials
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return initials || '?';
}

// Pluralize words based on count
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) {
    return `${count} ${singular}`;
  }
  
  const pluralForm = plural || `${singular}s`;
  return `${count} ${pluralForm}`;
}

// Format percentage with proper rounding
export function formatPercentage(value: number, decimals = 1): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return `${(value * 100).toFixed(decimals)}%`;
}

// Capitalize first letter of each word
export function titleCase(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number, ellipsis = '...'): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}