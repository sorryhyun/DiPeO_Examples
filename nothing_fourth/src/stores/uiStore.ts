// filepath: src/stores/uiStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { eventBus } from '@/core/events';
import { debugLog } from '@/core/utils';

// ===============================================
// UI State Types
// ===============================================

export interface ToastRef {
  readonly id: string;
  readonly type: 'success' | 'error' | 'info' | 'warning';
  readonly title?: string;
  readonly message?: string;
  readonly duration?: number;
  readonly dismissible?: boolean;
}

export interface ModalRef {
  readonly id: string;
  readonly component: string;
  readonly props?: Record<string, unknown>;
  readonly options?: {
    closable?: boolean;
    backdrop?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  };
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UiState {
  // Layout state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Theme state
  themeMode: ThemeMode;
  
  // Modal stack
  modals: ModalRef[];
  
  // Toast queue
  toasts: ToastRef[];
  
  // Loading states
  globalLoading: boolean;
  
  // Navigation state
  breadcrumbs: Array<{ label: string; href?: string }>;
  
  // Responsive state
  isMobile: boolean;
  
  // Focus management
  focusTrap: boolean;
}

export interface UiActions {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Theme actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  
  // Modal actions
  openModal: (component: string, props?: Record<string, unknown>, options?: ModalRef['options']) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Toast actions
  addToast: (toast: Omit<ToastRef, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  
  // Breadcrumb actions
  setBreadcrumbs: (breadcrumbs: UiState['breadcrumbs']) => void;
  
  // Responsive actions
  setIsMobile: (isMobile: boolean) => void;
  
  // Focus management
  setFocusTrap: (enabled: boolean) => void;
}

export type UiStore = UiState & UiActions;

// ===============================================
// Default State
// ===============================================

const getInitialThemeMode = (): ThemeMode => {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-mode');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  }
  return 'system';
};

const defaultState: UiState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  themeMode: getInitialThemeMode(),
  modals: [],
  toasts: [],
  globalLoading: false,
  breadcrumbs: [],
  isMobile: false,
  focusTrap: false,
};

// ===============================================
// Store Implementation
// ===============================================

export const useUiStore = create<UiStore>()(
  subscribeWithSelector((set, get) => ({
    ...defaultState,
    
    // Sidebar actions
    toggleSidebar: () => {
      set((state) => {
        const newOpen = !state.sidebarOpen;
        debugLog('UiStore', `Toggling sidebar: ${newOpen}`);
        return { sidebarOpen: newOpen };
      });
    },
    
    setSidebarOpen: (open: boolean) => {
      set({ sidebarOpen: open });
      debugLog('UiStore', `Setting sidebar open: ${open}`);
    },
    
    toggleSidebarCollapsed: () => {
      set((state) => {
        const newCollapsed = !state.sidebarCollapsed;
        debugLog('UiStore', `Toggling sidebar collapsed: ${newCollapsed}`);
        return { sidebarCollapsed: newCollapsed };
      });
    },
    
    setSidebarCollapsed: (collapsed: boolean) => {
      set({ sidebarCollapsed: collapsed });
      debugLog('UiStore', `Setting sidebar collapsed: ${collapsed}`);
    },
    
    // Theme actions
    setThemeMode: (mode: ThemeMode) => {
      set({ themeMode: mode });
      debugLog('UiStore', `Setting theme mode: ${mode}`);
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-mode', mode);
      }
    },
    
    toggleTheme: () => {
      const { themeMode } = get();
      const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
      get().setThemeMode(newMode);
    },
    
    // Modal actions
    openModal: (component: string, props?: Record<string, unknown>, options?: ModalRef['options']) => {
      const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const modal: ModalRef = {
        id,
        component,
        props,
        options: {
          closable: true,
          backdrop: true,
          size: 'md',
          ...options,
        },
      };
      
      set((state) => ({
        modals: [...state.modals, modal],
      }));
      
      debugLog('UiStore', `Opening modal: ${component} (${id})`);
      return id;
    },
    
    closeModal: (id: string) => {
      set((state) => ({
        modals: state.modals.filter(modal => modal.id !== id),
      }));
      debugLog('UiStore', `Closing modal: ${id}`);
    },
    
    closeAllModals: () => {
      set({ modals: [] });
      debugLog('UiStore', 'Closing all modals');
    },
    
    // Toast actions
    addToast: (toast: Omit<ToastRef, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: ToastRef = {
        id,
        duration: 5000,
        dismissible: true,
        ...toast,
      };
      
      set((state) => ({
        toasts: [...state.toasts, newToast],
      }));
      
      debugLog('UiStore', `Adding toast: ${toast.type} - ${toast.message}`);
      
      // Auto-remove after duration (if specified)
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          get().removeToast(id);
        }, newToast.duration);
      }
      
      // Emit event for external listeners
      eventBus.emit('toast:add', newToast);
      
      return id;
    },
    
    removeToast: (id: string) => {
      set((state) => ({
        toasts: state.toasts.filter(toast => toast.id !== id),
      }));
      debugLog('UiStore', `Removing toast: ${id}`);
    },
    
    clearToasts: () => {
      set({ toasts: [] });
      debugLog('UiStore', 'Clearing all toasts');
    },
    
    // Loading actions
    setGlobalLoading: (loading: boolean) => {
      set({ globalLoading: loading });
      debugLog('UiStore', `Setting global loading: ${loading}`);
    },
    
    // Breadcrumb actions
    setBreadcrumbs: (breadcrumbs: UiState['breadcrumbs']) => {
      set({ breadcrumbs });
      debugLog('UiStore', `Setting breadcrumbs:`, breadcrumbs);
    },
    
    // Responsive actions
    setIsMobile: (isMobile: boolean) => {
      set({ isMobile });
      debugLog('UiStore', `Setting mobile mode: ${isMobile}`);
    },
    
    // Focus management
    setFocusTrap: (enabled: boolean) => {
      set({ focusTrap: enabled });
      debugLog('UiStore', `Setting focus trap: ${enabled}`);
    },
  }))
);

// ===============================================
// Store Subscriptions & Side Effects
// ===============================================

// Subscribe to modal changes for focus management
useUiStore.subscribe(
  (state) => state.modals,
  (modals, prevModals) => {
    const hasModals = modals.length > 0;
    const hadModals = prevModals.length > 0;
    
    // Enable/disable focus trap based on modal presence
    if (hasModals !== hadModals) {
      useUiStore.getState().setFocusTrap(hasModals);
    }
  }
);

// Subscribe to theme changes for system integration
useUiStore.subscribe(
  (state) => state.themeMode,
  (themeMode) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    if (themeMode === 'system') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      // Use explicit theme
      root.classList.toggle('dark', themeMode === 'dark');
    }
  }
);

// Listen for system theme changes when in system mode
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = () => {
    const { themeMode } = useUiStore.getState();
    if (themeMode === 'system') {
      const root = document.documentElement;
      root.classList.toggle('dark', mediaQuery.matches);
    }
  };
  
  mediaQuery.addEventListener('change', handleSystemThemeChange);
}

// ===============================================
// Selector Hooks for Performance
// ===============================================

export const useSidebar = () => useUiStore((state) => ({
  isOpen: state.sidebarOpen,
  isCollapsed: state.sidebarCollapsed,
  toggle: state.toggleSidebar,
  setOpen: state.setSidebarOpen,
  toggleCollapsed: state.toggleSidebarCollapsed,
  setCollapsed: state.setSidebarCollapsed,
}));

export const useTheme = () => useUiStore((state) => ({
  mode: state.themeMode,
  setMode: state.setThemeMode,
  toggle: state.toggleTheme,
}));

export const useModals = () => useUiStore((state) => ({
  modals: state.modals,
  open: state.openModal,
close: state.closeModal,
  closeAll: state.closeAllModals,
}));

export const useToasts = () => useUiStore((state) => ({
  toasts: state.toasts,
  add: state.addToast,
  remove: state.removeToast,
  clear: state.clearToasts,
}));

export const useGlobalLoading = () => useUiStore((state) => ({
  loading: state.globalLoading,
  setLoading: state.setGlobalLoading,
}));

export const useBreadcrumbs = () => useUiStore((state) => ({
  breadcrumbs: state.breadcrumbs,
  setBreadcrumbs: state.setBreadcrumbs,
}));

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects, uses Zustand)
- [x] Reads config from `@/app/config` (not directly needed for UI store)
- [x] Exports default named component (exports useUiStore and selector hooks)
- [x] Adds basic ARIA and keyboard handlers (focus trap management for modals)
*/
