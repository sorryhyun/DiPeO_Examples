import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import PressKitPage from './pages/PressKitPage';
import APIDocsPage from './pages/APIDocsPage';
import { StatusPage } from './pages/StatusPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/press" element={<PressKitPage />} />
      <Route path="/api" element={<APIDocsPage />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
