const STORAGE_PREFIX = 'lms:';

export function setItem<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, serializedValue);
  } catch (error) {
    console.warn(`Failed to set item in localStorage for key: ${key}`, error);
  }
}

export function getItem<T>(key: string): T | undefined {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (item === null) {
      return undefined;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to get item from localStorage for key: ${key}`, error);
    return undefined;
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.warn(`Failed to remove item from localStorage for key: ${key}`, error);
  }
}

// Alias functions for different naming conventions
export const getStoredValue = getItem;
export const setStoredValue = setItem;

// Export storage object for object-based usage
export const storage = {
  getItem,
  setItem,
  removeItem,
};
