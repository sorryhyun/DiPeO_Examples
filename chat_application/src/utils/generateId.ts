/**
 * Generates a short unique identifier with optional prefix.
 * Uses cryptographic randomness when available, falls back to timestamp + random for compatibility.
 * 
 * @param prefix - Optional prefix to prepend to the generated ID
 * @returns A unique string identifier
 * 
 * @example
 * generateId() // "a7f3e9d2"
 * generateId('msg') // "msg-a7f3e9d2"
 * generateId('user') // "user-1703123456-abc123f"
 */
export function generateId(prefix?: string): string {
  let randomPart: string;

  // Use crypto.getRandomValues if available (modern browsers/Node.js)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(4);
    crypto.getRandomValues(array);
    randomPart = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without crypto support
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 9);
    randomPart = `${timestamp}-${random}`;
  }

  return prefix ? `${prefix}-${randomPart}` : randomPart;
}

// Export as both default and named export for flexibility
export default generateId;
