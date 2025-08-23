import { useEffect, useRef, useCallback } from 'react';

type KeyboardHandler = (event: KeyboardEvent) => void;

interface UseKeyboardShortcutsReturn {
  registerShortcut: (key: string, handler: KeyboardHandler) => void;
  unregisterShortcut: (key: string) => void;
}

export const useKeyboardShortcuts = (): UseKeyboardShortcutsReturn => {
  const shortcutsRef = useRef<Map<string, KeyboardHandler>>(new Map());

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't interfere with typing in input elements
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                   target.tagName === 'TEXTAREA' || 
                   target.contentEditable === 'true';

    if (isInput) {
      return;
    }

    const key = event.key.toLowerCase();
    const handler = shortcutsRef.current.get(key);
    
    if (handler) {
      event.preventDefault();
      handler(event);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const registerShortcut = useCallback((key: string, handler: KeyboardHandler) => {
    shortcutsRef.current.set(key.toLowerCase(), handler);
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    shortcutsRef.current.delete(key.toLowerCase());
  }, []);

  return {
    registerShortcut,
    unregisterShortcut,
  };
};
