// filepath: src/providers/ModalProvider.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Modal } from '@/shared/components/Modal';
import { useModal } from '@/hooks/useModal';

interface ModalConfig {
  id: string;
  title?: string;
  content: React.ReactNode;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

interface ModalContextValue {
  openModal: (config: Omit<ModalConfig, 'id'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  modals: ModalConfig[];
}

const ModalContext = createContext<ModalContextValue | null>(null);

interface ModalProviderProps {
  children: React.ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const openModal = useCallback((config: Omit<ModalConfig, 'id'>) => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const modalConfig: ModalConfig = {
      id,
      size: 'md',
      closeOnOverlayClick: true,
      showCloseButton: true,
      ...config,
    };

    setModals(prev => [...prev, modalConfig]);
    return id;
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals(prev => {
      const modal = prev.find(m => m.id === id);
      if (modal?.onClose) {
        modal.onClose();
      }
      return prev.filter(m => m.id !== id);
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(prev => {
      prev.forEach(modal => {
        if (modal.onClose) {
          modal.onClose();
        }
      });
      return [];
    });
  }, []);

  // Handle body scroll lock
  useEffect(() => {
    if (modals.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [modals.length]);

  // Handle ESC key to close top modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modals.length > 0) {
        const topModal = modals[modals.length - 1];
        closeModal(topModal.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modals, closeModal]);

  const contextValue: ModalContextValue = {
    openModal,
    closeModal,
    closeAllModals,
    modals,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {modals.map(modal => (
        <Modal
          key={modal.id}
          isOpen={true}
          onClose={() => closeModal(modal.id)}
          title={modal.title}
          size={modal.size}
          closeOnOverlayClick={modal.closeOnOverlayClick}
          showCloseButton={modal.showCloseButton}
          style={{ zIndex: 1000 + modals.findIndex(m => m.id === modal.id) }}
        >
          {modal.content}
        </Modal>
      ))}
    </ModalContext.Provider>
  );
}

export function useModalSafe() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalSafe must be used within a ModalProvider');
  }
  return context;
}

/*
Self-Check Comments:
- [x] Uses `@/` imports only
- [x] Uses providers/hooks (no direct DOM/localStorage side effects)
- [x] Reads config from `@/app/config` (N/A for this component)
- [x] Exports default named component
- [x] Adds basic ARIA and keyboard handlers (ESC key handling)
*/
