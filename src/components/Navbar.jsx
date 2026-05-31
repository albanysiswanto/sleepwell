import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Moon, LogOut, Menu, X } from 'lucide-react';
import LogoutModal from './LogoutModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-outline-variant transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary-container text-on-primary-container rounded-md">
              <Moon className="w-5 h-5 stroke-[2px]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-on-surface">
              SleepWell
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`btn-ghost ${isActive('/dashboard') ? 'bg-surface-container' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/consult"
                  className={`btn-ghost ${isActive('/consult') ? 'bg-surface-container' : ''}`}
                >
                  Konsultasi
                </Link>
                <Link
                  to="/chat"
                  className={`btn-ghost ${isActive('/chat') ? 'bg-surface-container' : ''}`}
                >
                  Tanya AI
                </Link>

                <div className="h-4 w-px bg-outline-variant mx-2" />

                {/* Profile indicator */}
                <div className="flex items-center gap-3 pl-2">
                  <div className="text-right">
                    <p className="text-sm font-bold text-on-surface">{user.name}</p>
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="p-2 text-error hover:bg-error-container rounded-md transition-all cursor-pointer"
                    title="Keluar"
                  >
                    <LogOut className="w-4 h-4 stroke-[2px]" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-ghost"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-md transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[2px]" /> : <Menu className="w-6 h-6 stroke-[2px]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant bg-surface">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user ? (
              <>
                <div className="px-3 py-2 border-b border-outline-variant mb-2">
                  <p className="text-sm font-bold text-on-surface">{user.name}</p>
                  <p className="text-xs text-on-surface-variant">{user.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-base font-semibold text-on-surface hover:bg-surface-container"
                >
                  Dashboard
                </Link>
                <Link
                  to="/consult"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-base font-semibold text-on-surface hover:bg-surface-container"
                >
                  Konsultasi
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-md text-base font-semibold text-on-surface hover:bg-surface-container"
                >
                  Tanya AI
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left rounded-md text-base font-semibold text-error hover:bg-error-container mt-2"
                >
                  <LogOut className="w-4 h-4 stroke-[2px]" /> Keluar
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 p-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full justify-center"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full justify-center"
                >
                  Daftar Gratis
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={confirmLogout} 
      />
    </nav>
  );
};

export default Navbar;
