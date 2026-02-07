'use client';

import { useAuthContext } from '@/contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Mail, Shield, CheckCircle, XCircle, Award, Phone, Edit2, Save, X, MapPin } from 'lucide-react';
import Button from '@/components/Button';
import api from '@/lib/api';

function getRoleLabel(user) {
  if (!user) return '';
  if (user.role === 'receiver') return 'NGO / Receiver';
  if (user.role === 'donor') return user.donorType || 'Donor';
  return user.role.charAt(0).toUpperCase() + user.role.slice(1);
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
}

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuthContext();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.users.getProfile();
        setProfile(response.user);
        setFormData({
          name: response.user.name || '',
          phone: response.user.phone || '',
          address: response.user.address || '',
          latitude: response.user.latitude || null,
          longitude: response.user.longitude || null,
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
        if (err.message?.includes('token') || err.message?.includes('Unauthorized')) {
          logout();
          router.push('/login');
        }
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, isLoading, router, logout]);

  const handleEdit = () => {
    setEditing(true);
    setError(null);
    setSuccess(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      latitude: profile?.latitude || null,
      longitude: profile?.longitude || null,
    });
    setError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updates = {};
      if (formData.name !== profile.name) updates.name = formData.name;
      if (formData.phone !== (profile.phone || '')) updates.phone = formData.phone;
      if (formData.address !== (profile.address || '')) updates.address = formData.address;
      if (formData.latitude !== profile.latitude) updates.latitude = formData.latitude;
      if (formData.longitude !== profile.longitude) updates.longitude = formData.longitude;

      if (Object.keys(updates).length === 0) {
        setError('No changes to save');
        setSaving(false);
        return;
      }

      const response = await api.users.updateProfile(updates);
      setProfile(response.user);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const roleLabel = getRoleLabel(profile);
  const initials = getInitials(profile.name);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:text-emerald-600" onClick={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
          <p className="text-slate-500 mt-2">Manage your account and view your impact statistics.</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <p className="text-sm text-emerald-700 font-medium">Profile updated successfully!</p>
          </div>
        )}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="relative h-32 bg-emerald-600">
            <div className="absolute -bottom-12 left-8">
              <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center">
                <div className="h-full w-full rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
                  {initials}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Phone (WhatsApp)</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g., +91 98765 43210"
                        className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">Include country code (e.g., 91 for India)</p>
                    </div>
                    {profile.role === 'receiver' && (
                      <div>
                        <div className="relative">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Organization Address</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              className="w-full max-w-md px-3 py-2 pr-24 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              placeholder="Connaught Place, New Delhi"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!navigator.geolocation) {
                                  setError("Geolocation is not supported by your browser.");
                                  return;
                                }
                                
                                setSaving(true); 
                                navigator.geolocation.getCurrentPosition(
                                  async (position) => {
                                    const { latitude, longitude } = position.coords;
                                    setFormData(prev => ({ ...prev, latitude, longitude }));
                                    
                                    try {
                                      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                      const data = await res.json();
                                      if (data && data.display_name) {
                                        setFormData(prev => ({ ...prev, address: data.display_name }));
                                      }
                                      setSuccess(true);
                                    } catch (err) {
                                      console.error("Reverse geocode failed", err);
                                    } finally {
                                      setSaving(false);
                                    }
                                  },
                                  (err) => {
                                    console.error("Geolocation error", err);
                                    setError("Unable to retrieve location.");
                                    setSaving(false);
                                  }
                                );
                              }}
                              className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md hover:bg-emerald-100 transition-colors flex items-center gap-1"
                            >
                              <MapPin size={12} /> Detect
                            </button>
                          </div>
                           {formData.latitude && (
                              <p className="text-[10px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                                <CheckCircle size={10} /> GPS Coordinates Captured
                              </p>
                           )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                    <p className="text-emerald-600 font-medium">{roleLabel}</p>
                    {profile.phone && (
                      <div className="flex items-center gap-2 mt-2 text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{profile.phone}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving} size="sm">
                      {saving ? 'Saving...' : <><Save className="h-4 w-4 mr-1" /> Save</>}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                )}
                <Button onClick={logout} variant="secondary" size="sm" className="border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200">
                  Sign Out
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Contact Information</h3>
                <div className="flex items-center gap-3 text-slate-600 p-3 rounded-xl bg-slate-50">
                  <Mail className="h-5 w-5 text-emerald-500" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 p-3 rounded-xl bg-slate-50">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <span>Role: {profile.role}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-3 text-slate-600 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <Phone className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium">{profile.phone}</span>
                  </div>
                )}
                {!profile.phone && !editing && (
                  <div className="flex items-center gap-3 text-slate-400 p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300">
                    <Phone className="h-5 w-5" />
                    <span className="text-sm italic">No phone number added</span>
                  </div>
                )}
                {profile.role === 'receiver' && (
                  <div className="flex items-center gap-3 text-slate-600 p-3 rounded-xl bg-slate-50">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                    <span>{profile.address || 'No address provided'}</span>
                  </div>
                )}
              </div>

              {/* Stats (If available) */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Performance Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Award className="h-4 w-4" />
                      <span className="text-xs font-medium">Reliability</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {profile.reliability_score ?? 100}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {profile.role === 'donor' ? 'Donations' : 'Claims'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-700">
                      {profile.successful_pickups ?? 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <XCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">No-Shows</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-700">
                      {profile.no_shows ?? 0}
                    </p>
                  </div>
                  {profile.role === 'donor' && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center gap-2 text-emerald-600 mb-1">
                        <Award className="h-4 w-4" />
                        <span className="text-xs font-medium">Impact</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-700">
                        {((profile.successful_pickups ?? 0) * 2.5).toFixed(1)} kg
                      </p>
                    </div>
                  )}
                  {profile.role === 'receiver' && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <User className="h-4 w-4" />
                        <span className="text-xs font-medium">People Fed</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-700">
                        {((profile.successful_pickups ?? 0) * 15)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-red-100 bg-red-50/50">
            <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Danger Zone
            </h3>
          </div>
          <div className="px-8 py-6">
             <p className="text-slate-600 mb-4 text-sm">
               Once you delete your account, there is no going back. Please be certain.
               All your personal data, donation history, and active listings will be permanently removed.
             </p>
             <Button 
               variant="outline" 
               className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 w-full sm:w-auto"
               onClick={() => {
                 if (confirm("Are you ABSOLUTELY sure? This action cannot be undone.")) {
                    api.auth.deleteAccount().then(() => {
                      logout();
                      router.push('/login');
                    }).catch(err => {
                      setError(err.message || "Failed to delete account");
                    });
                 }
               }}
             >
               Delete Account
             </Button>
          </div>
        </div>

        <div className="text-center text-sm text-slate-400">
          Member since {profile.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear()} • GreenChain Platform
        </div>
      </div>
    </div>
  );
}
