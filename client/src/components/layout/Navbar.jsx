import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../common/Avatar.jsx';
import Button from '../common/Button.jsx';
import GoogleSignInButton from '../common/GoogleSignInButton.jsx';
import Modal from '../common/Modal.jsx';
import {
  PenSquare,
  Compass,
  LayoutDashboard,
  LogOut,
  Shield,
  Menu,
  X,
  Code2,
  Users,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, loginWithGoogle, logout, adminLogin } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@omnilog.local');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminLogin({ email: adminEmail, role: 'admin' });
      setAdminModalOpen(false);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-slate-100 text-indigo-600 shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
              <Code2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Omni<span className="text-indigo-600">Log</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 -mt-1 font-mono">
                Platform 2.0
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/feed" className={navLinkClasses}>
              <Compass className="w-4 h-4 text-slate-400" />
              Explore Feed
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/dashboard" className={navLinkClasses}>
                <LayoutDashboard className="w-4 h-4 text-slate-400" />
                Author Dashboard
              </NavLink>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <NavLink to="/admin" className={navLinkClasses}>
                <Shield className="w-4 h-4 text-indigo-500" />
                Admin Console
              </NavLink>
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
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-0.5 rounded-full ring-2 ring-slate-200/80 hover:ring-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
                      className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-dropdown border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-slate-900 truncate">{user?.displayName}</p>
                          {user?.role === 'admin' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shrink-0">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5 font-mono">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          My Dashboard
                        </Link>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
                          >
                            <Shield className="w-4 h-4 text-indigo-500" />
                            Admin Console
                          </Link>
                        )}
                        <Link
                          to="/posts/new"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-medium transition-colors"
                        >
                          <PenSquare className="w-4 h-4 text-slate-400" />
                          New Publication
                        </Link>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left font-medium transition-colors"
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
                {import.meta.env.DEV && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Shield}
                    onClick={() => setAdminModalOpen(true)}
                    title="Dev-Only Quick Admin Login"
                  >
                    Dev Admin
                  </Button>
                )}

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
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle mobile navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <NavLink
              to="/feed"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClasses}
            >
              <Compass className="w-4 h-4" />
              Explore Feed
            </NavLink>

            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={navLinkClasses}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Author Dashboard
                </NavLink>
                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClasses}
                  >
                    <Shield className="w-4 h-4 text-indigo-500" />
                    Admin Console
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
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between py-2 text-xs text-slate-500">
                    <span className="font-bold text-slate-800">{user?.displayName}</span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-rose-600 font-bold hover:underline"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="pt-2 space-y-2">
                {import.meta.env.DEV && (
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    icon={Shield}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAdminModalOpen(true);
                    }}
                  >
                    Dev Admin Login
                  </Button>
                )}
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

      {/* Super Admin Login Modal (Dev Mode Only) */}
      {import.meta.env.DEV && (
        <Modal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          title="Development Admin Login"
        >
          <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium">
            <strong>Development Environment Only:</strong> This quick-login bypass is disabled in production. In production, users authenticate via Google and are assigned roles via <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-200">ADMIN_EMAILS</code> or CLI seed script.
          </div>
          <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          Log in with Super Administrator privileges to create, read, update, and delete all publications across the entire application.
        </p>
        <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 transition-colors font-mono"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="md" onClick={() => setAdminModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={isSubmitting}>
              Login
            </Button>
          </div>
        </form>
      </Modal>
      )}
    </>
  );
}
