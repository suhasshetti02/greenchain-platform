'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Leaf, Lock, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await api.auth.resetPassword(token, password);
            setSuccess(true);
            // Optional: Redirect after delay
            setTimeout(() => router.push('/login'), 3000);
        } catch (err) {
            setError(err.message || "Failed to reset password. Link may be expired.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 inline-flex items-center gap-2">
                    <AlertCircle size={20} /> Invalid Link
                </div>
                <p className="text-gray-600 mb-6">This password reset link is invalid or missing.</p>
                <Link href="/login" className="text-emerald-600 font-bold hover:underline">Return to Login</Link>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 mb-4">
                    <Leaf size={24} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
                <p className="text-gray-500 text-sm mt-2">
                    Choose a strong password for your account.
                </p>
            </div>

            {success ? (
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h3>
                    <p className="text-gray-600 mb-6">
                        Your password has been successfully updated. Redirecting to login...
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                    >
                        Login Now
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1" htmlFor="password">New Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="At least 6 chars"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 ml-1" htmlFor="confirmPassword">Confirm Password</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Repeat password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Reset Password"}
                    </button>
                </form>
            )}
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden font-sans text-gray-800">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100 relative z-10">
                <Suspense fallback={<div className="text-center p-10"><Loader2 className="animate-spin mx-auto text-emerald-600" /></div>}>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
