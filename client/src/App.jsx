import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import Layout from './components/layout/Layout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import FeedPage from './pages/FeedPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import PostViewPage from './pages/PostViewPage.jsx';
import EditorPage from './pages/EditorPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/posts/new" element={<EditorPage />} />
              <Route path="/posts/edit/:id" element={<EditorPage />} />
              <Route path="/posts/:id" element={<PostViewPage />} />
              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
