/**
 * Array shuffling utilities with optional seeded random number generation
 */

/**
 * Simple seeded pseudo-random number generator (Mulberry32)
 * Returns deterministic values for the same seed across platforms
 */
function seededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles an array using the Fisher-Yates algorithm with Math.random()
 * @param array - Array to shuffle (creates a copy, doesn't mutate original)
 * @returns New shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Shuffles an array using the Fisher-Yates algorithm with a seeded RNG
 * Produces deterministic results for the same seed and input array
 * @param array - Array to shuffle (creates a copy, doesn't mutate original)
 * @param seed - Numeric seed for deterministic shuffling
 * @returns New shuffled array
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  const rng = seededRandom(seed);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}
