'use client';

import { useAuthContext } from '@/contexts/AuthProvider';

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

export default function ProfileCard({ stats }) {
  const { user } = useAuthContext();

  if (!user) return null;

  const roleLabel = getRoleLabel(user);
  const initials = getInitials(user.name);

  return (
    <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/30 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 text-xl font-bold shadow-sm">
          {initials}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-900">
            Hello, {user.name}
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            You are logged in as: <span className="font-semibold text-emerald-600">{roleLabel}</span>
          </p>
          {user.role === 'donor' && user.donorType && (
            <p className="text-sm text-slate-500 mt-1">
              Donor Type: <span className="font-medium text-slate-700">{user.donorType}</span>
            </p>
          )}
        </div>

        {/* Optional Stats */}
        {stats && (
          <div className="flex flex-wrap gap-4 sm:gap-6 mt-4 sm:mt-0">
            {stats.totalDonations !== undefined && (
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.totalDonations}</p>
                <p className="text-xs text-slate-500 mt-1">Total Donations</p>
              </div>
            )}
            {stats.activeClaims !== undefined && (
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.activeClaims}</p>
                <p className="text-xs text-slate-500 mt-1">Active Claims</p>
              </div>
            )}
            {stats.available !== undefined && (
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
                <p className="text-xs text-slate-500 mt-1">Available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

