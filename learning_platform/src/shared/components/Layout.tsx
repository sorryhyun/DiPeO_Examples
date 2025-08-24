import { ReactNode } from 'react';
import { NavBar } from './NavBar';

interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export const Layout = ({ children, sidebar }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      <div className="flex">
        {sidebar && (
          <aside 
            className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)]"
            role="complementary"
            aria-label="Sidebar navigation"
          >
            {sidebar}
          </aside>
        )}
        
        <main 
          className={`flex-1 ${sidebar ? '' : 'w-full'}`}
          role="main"
        >
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
