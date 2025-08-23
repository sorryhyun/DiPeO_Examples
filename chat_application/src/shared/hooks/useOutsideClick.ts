import { useEffect, useRef } from 'react';

/**
 * Hook that detects clicks outside of a referenced element
 * @param callback Function to execute when clicking outside the element
 * @returns RefObject to attach to the element
 */
export function useOutsideClick<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
}