'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Leaf, Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthProvider';
import Button from '@/components/Button';

/**
 * Maps user role to a friendly display label
 */
function getRoleLabel(user) {
  if (!user) return '';
  
  if (user.role === 'receiver') {
    return 'NGO / Receiver';
  }
  
  if (user.role === 'donor') {
    // If donorType exists, use it (e.g., "Restaurant Donor", "Home Donor")
    if (user.donorType) {
      return user.donorType;
    }
    return 'Donor';
  }
  
  // Fallback: capitalize the role
  return user.role.charAt(0).toUpperCase() + user.role.slice(1);
}

/**
 * Gets user initials from name
 */
function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

export default function Navbar() {
  const { user, logout, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileMenuOpen]);

  const handleLogout = () => {
    logout();
    setProfileMenuOpen(false);
    router.push('/');
  };

  const roleLabel = user ? getRoleLabel(user) : '';
  const initials = user ? getInitials(user.name) : '';

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200 transition-colors">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              GreenChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <Link
                  href="/"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/'
                      ? 'text-emerald-600'
                      : 'text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/login"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/login'
                      ? 'text-emerald-600'
                      : 'text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/register'
                      ? 'text-emerald-600'
                      : 'text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  Register
                </Link>
                <Button
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="ml-2"
                >
                  Get Started
                </Button>
              </>
            ) : (
              <>
                <Link
                  href={user.role === 'donor' ? '/dashboard/donor' : '/dashboard/receiver'}
                  className={`text-sm font-medium transition-colors ${
                    pathname?.startsWith('/dashboard')
                      ? 'text-emerald-600'
                      : 'text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/donations"
                  className={`text-sm font-medium transition-colors ${
                    pathname?.startsWith('/donations')
                      ? 'text-emerald-600'
                      : 'text-slate-600 hover:text-emerald-600'
                  }`}
                >
                  Donations
                </Link>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                      {initials}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-medium text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{roleLabel}</p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 transition-transform ${
                        profileMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-lg py-1 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{roleLabel}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                {initials}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-3">
            {!user ? (
              <>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === '/'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === '/login'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname === '/register'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Register
                </Link>
                <div className="px-4 pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/login');
                    }}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href={user.role === 'donor' ? '/dashboard/donor' : '/dashboard/receiver'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname?.startsWith('/dashboard')
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/donations"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    pathname?.startsWith('/donations')
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Donations
                </Link>
                <div className="px-4 py-2 border-t border-slate-200 mt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="text-xs text-slate-500">{roleLabel}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

