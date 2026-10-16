import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import Layout from './components/layout/Layout.jsx';
import AdminRoute from './components/common/AdminRoute.jsx';

// Dynamic code-split page imports
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const FeedPage = lazy(() => import('./pages/FeedPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const PostViewPage = lazy(() => import('./pages/PostViewPage.jsx'));
const EditorPage = lazy(() => import('./pages/EditorPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
      <span className="text-xs font-mono text-slate-400">Loading module...</span>
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
