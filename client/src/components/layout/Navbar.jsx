import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../common/Avatar.jsx';
import Button from '../common/Button.jsx';
import GoogleSignInButton from '../common/GoogleSignInButton.jsx';
import {
  PenSquare,
  Compass,
  LayoutDashboard,
  LogOut,
  Shield,
  Menu,
  X,
  Code2,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, loginWithGoogle, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-white/10 text-white shadow-xs border border-white/15'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
    }`;

  return (
    <>
      <header className="sticky top-3 z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="glass-dock rounded-2xl border border-white/10 shadow-2xl px-4 sm:px-6 h-16 flex items-center justify-between w-full">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-glow-indigo group-hover:scale-105 transition-transform duration-200">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                Omni<span className="text-indigo-400">Log</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1 font-mono">
                Platform 2.0
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/feed" className={navLinkClasses}>
              <Compass className="w-4 h-4 text-indigo-400" />
              Explore Feed
            </NavLink>
            {isAuthenticated && (
              user?.role === 'admin' ? (
                <NavLink to="/admin" className={navLinkClasses}>
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Admin Dashboard
                </NavLink>
              ) : (
                <NavLink to="/dashboard" className={navLinkClasses}>
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  Author Dashboard
                </NavLink>
              )
            )}
          </nav>

          {/* Action CTAs & Auth Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/posts/new">
                  <Button variant="primary" size="sm" icon={PenSquare}>
                    Write Post
                  </Button>
                </Link>

                {/* User Avatar & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-indigo-500/40 hover:ring-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                    aria-expanded={dropdownOpen}
                    aria-label="User account menu"
                  >
                    <Avatar
                      src={user?.image}
                      name={user?.displayName}
                      size="md"
                    />
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-3 w-64 bg-slate-950/95 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-white/10"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-white truncate">{user?.displayName}</p>
                          {user?.role === 'admin' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 shrink-0">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        {user?.role === 'admin' ? (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white font-medium transition-colors"
                          >
                            <Shield className="w-4 h-4 text-indigo-400" />
                            Admin Dashboard
                          </Link>
                        ) : (
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white font-medium transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400" />
                            My Dashboard
                          </Link>
                        )}
                        <Link
                          to="/posts/new"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white font-medium transition-colors"
                        >
                          <PenSquare className="w-4 h-4 text-slate-400" />
                          New Publication
                        </Link>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 text-left font-medium transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <GoogleSignInButton
                  size="sm"
                  text="Sign in with Google"
                  onClick={loginWithGoogle}
                />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 border border-white/10 bg-slate-950/95 backdrop-blur-2xl rounded-2xl px-4 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <NavLink
              to="/feed"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClasses}
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              Explore Feed
            </NavLink>

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' ? (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClasses}
                  >
                    <Shield className="w-4 h-4 text-indigo-400" />
                    Admin Dashboard
                  </NavLink>
                ) : (
                  <NavLink
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClasses}
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    Author Dashboard
                  </NavLink>
                )}
                <Link
                  to="/posts/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block pt-2"
                >
                  <Button variant="primary" size="md" className="w-full" icon={PenSquare}>
                    Write New Post
                  </Button>
                </Link>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between py-2 text-xs text-slate-400">
                    <span className="font-bold text-white">{user?.displayName}</span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-rose-400 font-bold hover:underline"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                <GoogleSignInButton
                  size="md"
                  className="w-full"
                  text="Sign in with Google"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    loginWithGoogle();
                  }}
                />
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
