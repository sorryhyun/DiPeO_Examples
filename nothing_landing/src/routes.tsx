import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import PressKitPage from './pages/PressKitPage';
import APIDocsPage from './pages/APIDocsPage';
import { StatusPage } from './pages/StatusPage';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  title: string;
  isLazyLoaded?: boolean;
}

export const routeConfigs: RouteConfig[] = [
  {
    path: '/',
    element: HomePage,
    title: 'Nothing - The Ultimate Premium Product',
  },
  {
    path: '/press',
    element: PressKitPage,
    title: 'Press Kit - Nothing',
  },
  {
    path: '/docs',
    element: APIDocsPage,
    title: 'API Documentation - Nothing',
  },
  {
    path: '/status',
    element: StatusPage,
    title: 'System Status - Nothing',
  },
];

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {routeConfigs.map(({ path, element: Element }) => (
        <Route key={path} path={path} element={<Element />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
