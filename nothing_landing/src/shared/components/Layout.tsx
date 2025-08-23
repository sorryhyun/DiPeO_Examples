import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from './CookieBanner';
import { useModal } from '../providers/ModalProvider';
import Modal from './Modal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isOpen, content, onClose } = useModal();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <Footer />
      
      <CookieBanner />
      
      {isOpen && content && (
        <Modal onClose={onClose}>
          {content}
        </Modal>
      )}
    </div>
  );
};

export default Layout;
