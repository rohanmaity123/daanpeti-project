// LoginPage.jsx
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function LoginPage({ onLoggedIn }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) return toast.error('Login failed: ' + error.message);
        toast.success('Logged in successfully.');
        onLoggedIn?.(data.session);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 flex items-center justify-center px-4 py-10">

            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#20d8ff]/20 blur-3xl" />
                <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#ff7cc0]/20 blur-3xl" />
                <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#8a5cff]/10 blur-3xl" />

                {/* subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            {/* Login card */}
            <div className="relative z-10 w-full max-w-md">

                {/* Logo / Brand */}
                <div className="mb-7 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#20d8ff,#8a5cff_50%,#ff7cc0)] shadow-[0_0_40px_rgba(32,216,255,0.25)]">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="1.8"
                            className="h-8 w-8"
                        >
                            <path d="M3 10.5 12 5l9 5.5-9 5-9-5Z" />
                            <path d="M6 12.5V17c3.5 2.5 8.5 2.5 12 0v-4.5" />
                            <path d="M21 10.5V16" />
                        </svg>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-white">
                        School Portal
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Certificate Management System
                    </p>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleLogin}
                    className="rounded-3xl border border-white/10 bg-white/[0.07] p-7 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-9"
                >
                    {/* Card heading */}
                    <div className="mb-7">
                        <h2 className="text-xl font-bold text-white">
                            Welcome back 👋
                        </h2>

                        <p className="mt-1.5 text-sm leading-6 text-slate-400">
                            Sign in to manage your school's certificates.
                        </p>
                    </div>

                    <div className="space-y-5">

                        {/* Email */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                School Email
                            </label>

                            <div className="relative">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                                >
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>

                                <input
                                    type="email"
                                    required
                                    placeholder="school@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition-all duration-200 focus:border-[#20d8ff]/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-[#20d8ff]/10"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-300">
                                Password
                            </label>

                            <div className="relative">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                                >
                                    <rect width="18" height="11" x="3" y="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>

                                <input
                                    type="password"
                                    required
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600 transition-all duration-200 focus:border-[#8a5cff]/60 focus:bg-white/[0.09] focus:ring-4 focus:ring-[#8a5cff]/10"
                                />
                            </div>
                        </div>

                        {/* Login button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative mt-2 flex h-13 w-full items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(100deg,#20d8ff,#8a5cff_50%,#ff7cc0)] text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.015] hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {/* shine animation */}
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                            <span className="relative flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <svg
                                            className="h-4 w-4 animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="9"
                                                className="opacity-30"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M21 12a9 9 0 0 0-9-9"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                                        >
                                            <path d="M5 12h14" />
                                            <path d="m13 6 6 6-6 6" />
                                        </svg>
                                    </>
                                )}
                            </span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-3.5 w-3.5"
                        >
                            <rect width="18" height="11" x="3" y="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Secure school authentication
                    </div>
                </form>

                {/* Bottom branding */}
                <p className="mt-6 text-center text-xs text-slate-600">
                    © {new Date().getFullYear()} School Certificate Management
                </p>
            </div>
        </div>
    );
}