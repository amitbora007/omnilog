import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import Layout from './components/layout/Layout.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';

import LandingPage from './pages/LandingPage.jsx';

// Dynamic code-split page imports for non-critical routes
const FeedPage = lazy(() => import('./pages/FeedPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const PostViewPage = lazy(() => import('./pages/PostViewPage.jsx'));
const EditorPage = lazy(() => import('./pages/EditorPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center shadow-glow-indigo animate-pulse">
          <div className="w-5 h-5 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-semibold text-slate-200">Loading module</span>
        <span className="text-xs font-mono text-slate-500">Preparing interface...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <AdminPage defaultTab="users" />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/posts"
                  element={
                    <AdminRoute>
                      <AdminPage defaultTab="posts" />
                    </AdminRoute>
                  }
                />
                <Route path="/posts/new" element={<EditorPage />} />
                <Route path="/posts/edit/:id" element={<EditorPage />} />
                <Route path="/posts/:id" element={<PostViewPage />} />
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
