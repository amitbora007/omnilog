import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Heart, Terminal, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white/80 border-t border-slate-200/80 mt-auto py-10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Brand & Architecture Badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm tracking-tight">OmniLog</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  v2.0.0
                </span>
              </div>
              <p className="text-xs text-slate-500">Developer publishing engine</p>
            </div>
          </div>

          {/* Center Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <Link to="/feed" className="hover:text-indigo-600 transition-colors">
              Public Feed
            </Link>
            <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">
              Author Dashboard
            </Link>
            <span className="text-slate-200" aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              REST API & Markdown
            </span>
            <span className="text-slate-200" aria-hidden="true">•</span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Sanitized XSS
            </span>
          </div>

          {/* Right Signature */}
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <span>Built by</span>
            <span className="font-bold text-slate-800">Amit Bora</span>
            <span>with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current inline" aria-label="love" />
          </div>
        </div>
      </div>
    </footer>
  );
}
