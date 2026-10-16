import React, { useEffect } from 'react';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import InteractiveBackground from '../common/InteractiveBackground.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../common/Toast.jsx';
import { AlertCircle, X } from 'lucide-react';

export default function Layout({ children }) {
  const { authError, clearAuthError } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (authError) {
      showToast(authError, 'error', 7000);
    }
  }, [authError, showToast]);

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 relative selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 3D Dynamic Particle & Constellation Background */}
      <InteractiveBackground />

      {/* Main Content Layout */}
      <Navbar />

      {/* Account Deactivated / Authentication Alert Banner */}
      {authError && (
        <div
          data-testid="auth-error-banner"
          className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-2 mb-6"
        >
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 backdrop-blur-xl shadow-lg shadow-rose-950/30 text-rose-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-100">
                  {authError}
                </p>
              </div>
            </div>
            <button
              onClick={clearAuthError}
              className="p-1.5 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all duration-200"
              aria-label="Dismiss message"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 pb-20 relative z-10 w-full">{children}</main>
      <Footer />
    </div>
  );
}
