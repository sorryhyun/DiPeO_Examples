/**
 * Utility function to conditionally join CSS class names
 * Filters out falsy values and joins remaining strings with spaces
 * 
 * @param args - Array of class name values (strings, undefined, false, etc.)
 * @returns Joined class names as a single string
 */
export default function clsx(...args: (string | undefined | false | null)[]): string {
  return args
    .filter(Boolean)
    .join(' ');
}
