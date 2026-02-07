'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Leaf, Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [tempPassword, setTempPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.auth.forgotPassword(email);
            if (response.tempPassword) {
                setTempPassword(response.tempPassword);
            }
            setSubmitted(true);
        } catch (err) {
            setError(err.message || "Failed to send reset link");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden font-sans text-gray-800">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-green-100 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100 relative z-10">

                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 mb-4">
                        <Leaf size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                    <p className="text-gray-500 text-sm mt-2">
                        Enter your email to receive recovery instructions.
                    </p>
                </div>

                {submitted ? (
                    <div className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h3>

                        {tempPassword && (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
                                <p className="text-sm text-yellow-800 mb-1">Your temporary password is:</p>
                                <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider select-all">{tempPassword}</p>
                                <p className="text-xs text-yellow-700 mt-2">Please login and change it immediately.</p>
                            </div>
                        )}

                        <p className="text-gray-600 mb-6">
                            Your password has been reset successfully.
                        </p>

                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700 ml-1" htmlFor="email">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="riya@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all transform active:scale-[0.98] shadow-lg shadow-emerald-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Send Reset Link"}
                        </button>

                        <div className="text-center pt-2">
                            <Link href="/login" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors gap-1">
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
