import React, { useState, useEffect, Suspense } from 'react';
import Header from './shared/components/Header';
import Footer from './shared/components/Footer';

// Lazy load pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const GamePage = React.lazy(() => import('./pages/GamePage'));
const LeaderboardPage = React.lazy(() => import('./pages/LeaderboardPage'));
const MultiplayerPage = React.lazy(() => import('./pages/MultiplayerPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const DailyChallengePage = React.lazy(() => import('./pages/DailyChallengePage'));

// Simple spinner component for Suspense fallback
const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<string>('/');

  useEffect(() => {
    // Initialize route from hash
    const hash = window.location.hash.slice(1) || '/';
    setCurrentRoute(hash);

    // Listen for hash changes
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1) || '/';
      setCurrentRoute(newHash);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderPage = () => {
    switch (currentRoute) {
      case '/':
        return <HomePage />;
      case '/game':
        return <GamePage />;
      case '/leaderboard':
        return <LeaderboardPage />;
      case '/multiplayer':
        return <MultiplayerPage />;
      case '/settings':
        return <SettingsPage />;
      case '/daily':
        return <DailyChallengePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      
      <main className="flex-1">
        <Suspense fallback={<Spinner />}>
          {renderPage()}
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
