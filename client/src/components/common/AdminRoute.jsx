import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { ShieldAlert } from 'lucide-react';
import Button from './Button.jsx';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="animate-pulse space-y-6 max-w-2xl mx-auto">
          <div className="h-10 bg-slate-200 rounded-2xl w-48 mx-auto" />
          <div className="h-6 bg-slate-100 rounded-xl w-72 mx-auto" />
          <div className="h-64 bg-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-card">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">
          Super Admin Privileges Required
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-md mx-auto">
          The User Management panel is restricted to authorized platform administrators. Your account does not have sufficient administrative permissions.
        </p>
        <Link to="/feed">
          <Button variant="primary">Return to Feed</Button>
        </Link>
      </div>
    );
  }

  return children;
}
