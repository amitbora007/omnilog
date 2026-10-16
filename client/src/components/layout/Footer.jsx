import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Heart, Terminal, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Footer() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <footer className="bg-slate-950/80 border-t border-white/10 mt-auto py-10 backdrop-blur-md relative z-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Brand & Architecture Badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-glow-indigo">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-tight">OmniLog</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
                  v2.0.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Developer publishing engine</p>
            </div>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
            <Link to="/feed" className="hover:text-indigo-400 transition-colors">
              Public Feed
            </Link>
            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className="hover:text-indigo-400 transition-colors"
            >
              {isAdmin ? 'Admin Dashboard' : 'Author Dashboard'}
            </Link>
            <span className="text-slate-700" aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              REST API & Markdown
            </span>
            <span className="text-slate-700" aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Sanitized XSS
            </span>
          </div>

          {/* Right Signature */}
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <span>Built by</span>
            <span className="font-bold text-slate-200">Amit Bora</span>
            <span>with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline animate-pulse" aria-label="love" />
          </div>
        </div>
      </div>
    </footer>
  );
}
