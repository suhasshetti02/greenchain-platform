'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle, 
  Eye, 
  EyeOff, 
  Heart, 
  Truck,
  Phone,
  Gift,
  Leaf
} from 'lucide-react';

import { useAuthContext } from '@/contexts/AuthProvider';

// --- UI Components ---

const InputField = ({ label, type, placeholder, icon: Icon, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#0F766E] transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <input
          required
          type={inputType}
          className="block w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all duration-200 sm:text-sm shadow-sm"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
};

const RoleSelector = ({ selectedRole, setSelectedRole }) => {
  const roles = [
    { id: 'donor', label: 'Donor', icon: Gift, desc: 'I have food to give.' },
    { id: 'receiver', label: 'Receiver', icon: Heart, desc: 'I need food assistance.' },
    { id: 'volunteer', label: 'Volunteer', icon: Truck, desc: 'I can deliver food.' },
  ];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">I am joining as a...</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          const Icon = role.icon;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              className={`relative flex flex-col items-start p-3 border rounded-xl transition-all duration-200 text-left h-full ${
                isSelected 
                  ? 'border-[#0F766E] bg-teal-50 ring-1 ring-[#0F766E]' 
                  : 'border-slate-200 bg-white hover:border-[#0F766E]/50 hover:bg-slate-50'
              }`}
            >
              <div className={`p-1.5 rounded-lg mb-2 ${isSelected ? 'bg-[#0F766E] text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-sm font-semibold ${isSelected ? 'text-[#0F766E]' : 'text-slate-900'}`}>{role.label}</span>
              <span className={`text-xs mt-1 leading-tight ${isSelected ? 'text-teal-700' : 'text-slate-500'}`}>{role.desc}</span>
              
              {isSelected && (
                <div className="absolute top-2 right-2 text-[#0F766E]">
                  <CheckCircle className="w-4 h-4" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Register Page ---

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, authenticating } = useAuthContext();

  const [role, setRole] = useState('donor');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  
  const [notification, setNotification] = useState(null);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (user) {
      router.replace(user.role === 'donor' ? '/dashboard/donor' : '/dashboard/receiver');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);

    // Basic Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
      setNotification({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setNotification({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    try {
      const newUser = await register({
        email: formData.email,
        password: formData.password,
        name: formData.fullName,
        role,
      });
      setNotification({ type: 'success', message: 'Account created! Redirecting...' });
      router.push(newUser.role === 'donor' ? '/dashboard/donor' : '/dashboard/receiver');
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Something went wrong.' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] font-sans text-slate-900 selection:bg-teal-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-50 to-transparent pointer-events-none"></div>

      {/* Centered Form Card */}
      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-slate-100 relative z-10">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shadow-lg shadow-teal-700/20">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-[#0F766E]">GreenChain</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create an account</h2>
            <p className="mt-2 text-slate-500 text-sm">
              Join the movement to reduce food waste.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <InputField 
              label="Full Name" 
              type="text" 
              placeholder="Jane Doe" 
              icon={User}
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
            />

            <InputField 
              label="Email Address" 
              type="email" 
              placeholder="jane@example.com" 
              icon={Mail}
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
            />

            <InputField 
              label="Phone Number" 
              type="tel" 
              placeholder="+1 (555) 000-0000" 
              icon={Phone}
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />

            <RoleSelector selectedRole={role} setSelectedRole={setRole} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                icon={Lock}
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
              />
              <InputField 
                label="Confirm Password" 
                type="password" 
                placeholder="••••••••" 
                icon={Lock}
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
              />
            </div>

            <div className="flex items-center pt-2">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-[#0F766E] border-slate-300 rounded focus:ring-[#0F766E]"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-600">
                I agree to the <a href="#" className="text-[#0F766E] hover:underline font-medium">Terms</a> and <a href="#" className="text-[#0F766E] hover:underline font-medium">Privacy Policy</a>.
              </label>
            </div>

            {notification && (
              <div className={`mt-2 rounded-lg border px-3 py-3 text-sm flex items-center gap-2 ${
                notification.type === 'error' 
                  ? 'border-red-200 bg-red-50 text-red-700' 
                  : 'border-green-200 bg-green-50 text-green-700'
              }`}>
                {notification.type === 'error' ? <CheckCircle className="h-4 w-4 rotate-45" /> : <CheckCircle className="h-4 w-4" />}
                {notification.message}
              </div>
            )}

            <button
              type="submit"
              disabled={authenticating}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-teal-700/20 text-sm font-bold text-white bg-[#0F766E] hover:bg-teal-800 disabled:bg-teal-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] transition-all transform active:scale-[0.98] mt-4"
            >
              {authenticating ? 'Creating account...' : 'Create Account'}
              {!authenticating && <ArrowRight className="ml-2 -mr-1 h-4 w-4" />}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <a href="/login" className="font-bold text-[#0F766E] hover:text-teal-800 hover:underline">
              Log in
            </a>
          </p>
      </div>
    </div>
  );
}