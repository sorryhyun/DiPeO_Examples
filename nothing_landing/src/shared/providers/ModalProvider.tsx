import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Modal } from '../components/Modal';

interface ModalState {
  isOpen: boolean;
  key: string | null;
  props: Record<string, any>;
}

interface ModalContextType {
  openModal: (key: string, props?: Record<string, any>) => void;
  closeModal: () => void;
  isModalOpen: boolean;
  modalKey: string | null;
  modalProps: Record<string, any>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    key: null,
    props: {}
  });

  const openModal = (key: string, props: Record<string, any> = {}) => {
    setModalState({
      isOpen: true,
      key,
      props
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      key: null,
      props: {}
    });
  };

  const contextValue: ModalContextType = {
    openModal,
    closeModal,
    isModalOpen: modalState.isOpen,
    modalKey: modalState.key,
    modalProps: modalState.props
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {modalState.isOpen && (
        <Modal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          children={modalState.props.children || null}
          {...modalState.props}
        />
      )}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
