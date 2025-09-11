// filepath: src/shared/layouts/MainLayout.tsx

// [ ] Uses `@/` imports as much as possible
// [ ] Uses providers/hooks (no direct DOM/localStorage side effects)
// [ ] Reads config from `@/app/config`
// [ ] Exports default named component
// [ ] Adds basic ARIA and keyboard handlers (where relevant)

import React from 'react';
import { config } from '@/app/config';
import Header from '@/shared/components/Header';
import Footer from '@/shared/components/Footer';
import CookieBanner from '@/features/cookie/CookieBanner';
import LiveChatWidget from '@/features/chat/LiveChatWidget';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainLayout({ children, className = '' }: MainLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 transition-all duration-200"
        tabIndex={0}
      >
        Skip to main content
      </a>

      {/* Header */}
      <Header />

      {/* Main content area */}
      <main
        id="main-content"
        className="flex-1 flex flex-col"
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Overlay components */}
      {config.features.cookieBanner && <CookieBanner />}
      {config.features.liveChat && <LiveChatWidget />}
    </div>
  );
}
