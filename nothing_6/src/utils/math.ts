// filepath: src/utils/math.ts
// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

/**
 * Linear interpolation between two values
 * @param start Starting value
 * @param end Ending value
 * @param t Progress value between 0 and 1
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Ease-in-out cubic easing function
 * @param t Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Clamps a value between min and max bounds
 * @param value Value to clamp
 * @param min Minimum bound
 * @param max Maximum bound
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Maps a value from one range to another
 * @param value Input value
 * @param inMin Input range minimum
 * @param inMax Input range maximum
 * @param outMin Output range minimum
 * @param outMax Output range maximum
 * @returns Mapped value
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Smoothstep function for smooth interpolation
 * @param edge0 Lower edge
 * @param edge1 Upper edge
 * @param x Input value
 * @returns Smoothstepped value between 0 and 1
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Converts degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Generates a random number between min and max
 * @param min Minimum value (inclusive)
 * @param max Maximum value (exclusive)
 * @returns Random number
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generates a random integer between min and max
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Random integer
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Rounds a number to specified decimal places
 * @param value Number to round
 * @param decimals Number of decimal places
 * @returns Rounded number
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
