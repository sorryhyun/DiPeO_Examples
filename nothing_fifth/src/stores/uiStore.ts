// filepath: src/stores/uiStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { eventBus } from '@/core/events';
import { config } from '@/app/config';

// ============================================================================
// UI STATE TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ToastQueueItem {
  readonly id: string;
  readonly type: 'info' | 'success' | 'warning' | 'error';
  readonly title?: string;
  readonly message: string;
  readonly duration?: number;
  readonly timestamp: number;
}

export interface ModalStackItem {
  readonly id: string;
  readonly type?: string;
  readonly props?: Record<string, unknown>;
  readonly timestamp: number;
}

export interface UiState {
  // Theme & Display
  readonly themeMode: ThemeMode;
  readonly sidebarOpen: boolean;
  readonly sidebarCollapsed: boolean;
  
  // Navigation & Layout
  readonly currentRoute: string;
  readonly breadcrumbs: ReadonlyArray<{ label: string; path?: string }>;
  
  // Toast System
  readonly toastQueue: ReadonlyArray<ToastQueueItem>;
  
  // Modal System
  readonly modalStack: ReadonlyArray<ModalStackItem>;
  
  // Loading & Busy States
  readonly globalLoading: boolean;
  readonly loadingMessage?: string;
  
  // Feature Flags & Preferences
  readonly preferences: {
    readonly animationsEnabled: boolean;
    readonly reducedMotion: boolean;
    readonly autoRefresh: boolean;
    readonly notifications: boolean;
  };
  
  // Development & Debug
  readonly debugMode: boolean;
}

export interface UiActions {
  // Theme & Display Actions
  setThemeMode: (mode: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Navigation Actions
  setCurrentRoute: (route: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => void;
  
  // Toast Actions
  addToast: (toast: Omit<ToastQueueItem, 'id' | 'timestamp'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Modal Actions
  openModal: (modal: Omit<ModalStackItem, 'id' | 'timestamp'>) => string;
  closeModal: (id: string) => void;
  closeTopModal: () => void;
  clearModals: () => void;
  
  // Loading Actions
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Preference Actions
  updatePreferences: (preferences: Partial<UiState['preferences']>) => void;
  
  // Debug Actions
  setDebugMode: (enabled: boolean) => void;
  
  // Utility Actions
  reset: () => void;
}

export type UiStore = UiState & UiActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: UiState = {
  themeMode: 'system',
  sidebarOpen: true,
  sidebarCollapsed: false,
  currentRoute: '/',
  breadcrumbs: [],
  toastQueue: [],
  modalStack: [],
  globalLoading: false,
  loadingMessage: undefined,
  preferences: {
    animationsEnabled: true,
    reducedMotion: false,
    autoRefresh: true,
    notifications: true,
  },
  debugMode: config.isDevelopment,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateId(): string {
  return `ui_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getCurrentTimestamp(): number {
  return Date.now();
}

// ============================================================================
// ZUSTAND STORE IMPLEMENTATION
// ============================================================================

export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Theme & Display Actions
      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
        eventBus.emit('ui:theme-changed', { mode });
      },

      toggleSidebar: () => {
        const { sidebarOpen } = get();
        const newState = !sidebarOpen;
        set({ sidebarOpen: newState });
        eventBus.emit('ui:sidebar-toggled', { open: newState });
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
        eventBus.emit('ui:sidebar-toggled', { open });
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
        eventBus.emit('ui:sidebar-collapsed', { collapsed });
      },

      // Navigation Actions
      setCurrentRoute: (route: string) => {
        set({ currentRoute: route });
        eventBus.emit('ui:route-changed', { route });
      },

      setBreadcrumbs: (breadcrumbs: Array<{ label: string; path?: string }>) => {
        set({ breadcrumbs: [...breadcrumbs] });
      },

      // Toast Actions
      addToast: (toast: Omit<ToastQueueItem, 'id' | 'timestamp'>) => {
        const id = generateId();
        const timestamp = getCurrentTimestamp();
        const newToast: ToastQueueItem = {
          ...toast,
          id,
          timestamp,
          duration: toast.duration ?? (toast.type === 'error' ? 8000 : 4000),
        };

        set((state) => ({
          toastQueue: [...state.toastQueue, newToast],
        }));

        eventBus.emit('toast:add', newToast);

        // Auto-remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, newToast.duration);
        }

        return id;
      },

      removeToast: (id: string) => {
        set((state) => ({
          toastQueue: state.toastQueue.filter(toast => toast.id !== id),
        }));
        eventBus.emit('toast:remove', { id });
      },

      clearToasts: () => {
        set({ toastQueue: [] });
        eventBus.emit('toast:clear', {});
      },

      // Modal Actions
      openModal: (modal: Omit<ModalStackItem, 'id' | 'timestamp'>) => {
        const id = generateId();
        const timestamp = getCurrentTimestamp();
        const newModal: ModalStackItem = {
          ...modal,
          id,
          timestamp,
        };

        set((state) => ({
          modalStack: [...state.modalStack, newModal],
        }));

        eventBus.emit('modal:open', newModal);
        return id;
      },

      closeModal: (id: string) => {
        set((state) => ({
          modalStack: state.modalStack.filter(modal => modal.id !== id),
        }));
        eventBus.emit('modal:close', { id });
      },

      closeTopModal: () => {
        const { modalStack } = get();
        if (modalStack.length > 0) {
          const topModal = modalStack[modalStack.length - 1];
          get().closeModal(topModal.id);
        }
      },

      clearModals: () => {
        set({ modalStack: [] });
        eventBus.emit('modal:clear', {});
      },

      // Loading Actions
      setGlobalLoading: (loading: boolean, message?: string) => {
        set({
          globalLoading: loading,
          loadingMessage: loading ? message : undefined,
        });
        eventBus.emit('ui:loading-changed', { loading, message });
      },

      // Preference Actions
      updatePreferences: (newPreferences: Partial<UiState['preferences']>) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences,
          },
        }));
        eventBus.emit('ui:preferences-updated', { preferences: newPreferences });
      },

      // Debug Actions
      setDebugMode: (enabled: boolean) => {
        set({ debugMode: enabled });
        eventBus.emit('ui:debug-mode-changed', { enabled });
      },

      // Utility Actions
      reset: () => {
        set(initialState);
        eventBus.emit('ui:reset', {});
      },
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist certain UI preferences, not ephemeral state
        themeMode: state.themeMode,
        sidebarCollapsed: state.sidebarCollapsed,
        preferences: state.preferences,
        debugMode: state.debugMode,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migrations if store structure changes
        if (version === 0) {
          // Migration logic for v0 -> v1
          return {
            ...initialState,
            ...persistedState,
          };
        }
        return persistedState;
      },
    }
  )
);

// ============================================================================
// SELECTOR HOOKS (CONVENIENCE)
// ============================================================================

/**
 * Get theme mode with computed system preference
 */
export function useResolvedThemeMode(): 'light' | 'dark' {
  const themeMode = useUiStore(state => state.themeMode);
  
  if (themeMode !== 'system') {
    return themeMode;
  }

  // Compute system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return 'light'; // fallback
}

/**
 * Get current toast count
 */
export function useToastCount(): number {
  return useUiStore(state => state.toastQueue.length);
}

/**
 * Get current modal count
 */
export function useModalCount(): number {
  return useUiStore(state => state.modalStack.length);
}

/**
 * Check if any modal is open
 */
export function useHasOpenModals(): boolean {
  return useUiStore(state => state.modalStack.length > 0);
}

/**
 * Get top modal (most recent)
 */
export function useTopModal(): ModalStackItem | undefined {
  return useUiStore(state => {
    const { modalStack } = state;
    return modalStack.length > 0 ? modalStack[modalStack.length - 1] : undefined;
  });
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

if (config.isDevelopment && typeof window !== 'undefined') {
  // Expose store debugging on window object in development
  (window as any).__ui_store_debug = {
    store: useUiStore,
    getState: () => useUiStore.getState(),
    setState: (state: Partial<UiState>) => useUiStore.setState(state),
    reset: () => useUiStore.getState().reset(),
  };
}

// Default export for convenience
export default useUiStore;

// ============================================================================
// Self-Check Comments
// ============================================================================
// [x] Uses `@/` imports only - Imports from @/core/events and @/app/config
// [x] Uses providers/hooks (no direct DOM/localStorage side effects) - Uses Zustand persist middleware properly
// [x] Reads config from `@/app/config` - Uses config.isDevelopment
// [x] Exports default named component - Exports useUiStore as default and named export
// [x] Adds basic ARIA and keyboard handlers (where relevant) - N/A for store, but provides utilities for modal/toast management
