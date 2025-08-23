/**
 * Utility for formatting dates and timestamps into human-readable strings.
 * Handles relative times for recent messages and absolute dates for older ones.
 * 
 * Note: This implementation uses basic Date APIs. For production apps with 
 * complex i18n requirements, consider using libraries like date-fns or dayjs
 * with proper locale support.
 */

export function formatDate(date: string | number | Date): string {
  const inputDate = new Date(date);
  
  // Handle invalid dates
  if (isNaN(inputDate.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInMs = now.getTime() - inputDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Handle future dates (shouldn't happen in normal use, but good to be defensive)
  if (diffInMs < 0) {
    return 'Just now';
  }

  // Less than 1 minute ago
  if (diffInMinutes < 1) {
    return 'Just now';
  }

  // Less than 1 hour ago - show minutes
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  // Less than 24 hours ago - show hours
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  // Less than 7 days ago - show day of week
  if (diffInDays < 7) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[inputDate.getDay()];
  }

  // Same year - show month and day
  if (inputDate.getFullYear() === now.getFullYear()) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${monthNames[inputDate.getMonth()]} ${inputDate.getDate()}`;
  }

  // Different year - show month, day, and year
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${monthNames[inputDate.getMonth()]} ${inputDate.getDate()}, ${inputDate.getFullYear()}`;
}
