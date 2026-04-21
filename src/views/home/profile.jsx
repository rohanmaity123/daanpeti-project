import { useState, useEffect } from 'react';
import {
    LogIn, Star, Send, CheckCircle2, Loader2,
    AlertCircle, Lock, User, Package, Heart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../utils/supabaseClient';
import { useAuth, signInWithGoogle } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { set } from 'react-hook-form';
import { Helmet } from 'react-helmet';
import { Trophy } from 'lucide-react';


/* ── Star picker ── */
function StarPicker({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        className={`h-7 w-7 transition-colors ${star <= (hovered || value)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

/* ── Review form ── */
function ReviewForm({ user }) {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [state, setState] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [hasReviewed, setHasReviewed] = useState(false);
    const [checking, setChecking] = useState(true);
    /* Check if user already left a review */
    useEffect(() => {
        const check = async () => {
            const { data } = await supabase
                .from('reviews')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();
            setHasReviewed(!!data);
            setChecking(false);
        };
        check();
    }, [user.id]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { setErrorMsg('Please select a rating'); return; }
        if (text.trim().length < 10) { setErrorMsg('Review must be at least 10 characters'); return; }

        setState('loading');
        setErrorMsg('');

        const { error } = await supabase.from('reviews').insert({
            user_id: user.id,
            user_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Anonymous',
            user_avatar: user.user_metadata?.avatar_url ?? null,
            rating,
            text: text.trim(),
        });

        if (error) {
            /* unique constraint = already reviewed */
            if (error.code === '23505') {
                setHasReviewed(true);
                setState('idle');
            } else {
                setState('error');
                setErrorMsg(error.message);
            }
        } else {
            setState('success');
            setHasReviewed(true);
        }
    };

    if (checking) return (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
    );

    if (state === 'success' || hasReviewed) return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-8 gap-3">
            <CheckCircle2 className="h-12 w-12" style={{ color: '#138808' }} />
            <h3 className="text-base font-extrabold text-foreground">Shukriya! 🙏</h3>
            <p className="text-sm text-muted-foreground">
                {state === 'success'
                    ? 'Aapka review submit ho gaya! It will appear on the home page.'
                    : 'Aapne pehle hi review de diya hai. Shukriya!'}
            </p>
        </motion.div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-bold text-foreground block mb-2">Rating *</label>
                <StarPicker value={rating} onChange={(v) => { setRating(v); setErrorMsg(''); }} />
            </div>

            <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">Your Review *</label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    placeholder="DaanGuru ke baare mein apna anubhav share karein..."
                    className="w-full rounded-xl border border-input bg-muted/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none transition-shadow"
                />
                <p className="text-xs text-muted-foreground mt-1">{text.length} / 300 characters</p>
            </div>

            <AnimatePresence>
                {errorMsg && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-xs text-destructive font-medium flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 shrink-0" />{errorMsg}
                    </motion.p>
                )}
            </AnimatePresence>

            <motion.button type="submit" disabled={state === 'loading'} whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60 transition-all"
                style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                {state === 'loading'
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>
                    : <><Send className="h-4 w-4" />Submit Review</>}
            </motion.button>
        </form>
    );
}

/* ── Main profile page ── */
export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [loginLoading, setLoginLoading] = useState(false);
    const [stats, setStats] = useState({ donated: 0, claimed: 0 });
    const [reviews, setReviews] = useState([]);

    /* Fetch user's item counts */
    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            const [{ count: donated }, { count: claimed }] = await Promise.all([
                supabase.from('donation_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('donation_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'claimed'),
            ]);
            setStats({ donated: donated ?? 0, claimed: claimed ?? 0 });
        };
        fetchStats();
    }, [user]);

    const handleLogin = async () => {
        setLoginLoading(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Login error:', error);
            setLoginLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };
    useEffect(() => {
        const fetch = async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('id, user_name, user_avatar, rating, text, created_at')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (!error && data && data.length > 0) {
                setReviews(data);
            } else {
                setReviews([]);
            }
        };
        fetch();
    }, [user]);
    if (authLoading) return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <>
            <Helmet>
                <title>My Profile - DaanGuru | Your Donation Profile</title>
                <meta name="description" content="View and manage your DaanGuru profile. Track your donations, earned rewards, and community reviews." />
                <meta name="keywords" content="profile, user profile, donation stats, rewards" />
                <meta property="og:title" content="My Profile - DaanGuru" />
                <meta property="og:description" content="View and manage your DaanGuru profile. Track your donations and earned rewards." />
                <meta property="og:image" content="https://www.daanguru.in/images/logo.png" />
                <meta property="og:url" content="https://www.daanguru.in/profile" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://www.daanguru.in/profile" />
            </Helmet>
            <div className="mx-auto max-w-lg px-4 pt-5 pb-28 lg:pb-10">

                {!user ? (
                    /* ── Not logged in ── */
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 rounded-2xl bg-card card-shadow p-8 text-center">
                        <div className="mx-auto mb-5 h-20 w-20 rounded-full flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                            <User className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-xl font-extrabold text-foreground">DaanGuru mein aapka swagat hai! 🙏</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Login karein aur daan karna shuru karein</p>
                        <motion.button onClick={handleLogin} disabled={loginLoading} whileTap={{ scale: 0.97 }}
                            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
                            style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                            {loginLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Redirecting...</> : <><LogIn className="h-4 w-4" />Sign in with Google</>}
                        </motion.button>
                        <p className="mt-3 text-xs text-muted-foreground">Google account se safe aur secure login</p>
                    </motion.div>

                ) : (
                    /* ── Logged in ── */
                    <div className="space-y-5">

                        {/* User card */}
                        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl bg-card card-shadow p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1"
                                style={{ background: 'linear-gradient(90deg,#FF9933,#ffffff,#138808)' }} />
                            <div className="flex items-center gap-4">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="avatar"
                                        className="h-16 w-16 rounded-full ring-2 object-cover"
                                        style={{ ringColor: '#1D9E75' }} />
                                ) : (
                                    <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                                        style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                                        {(user.user_metadata?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-lg font-extrabold text-foreground truncate">
                                        {user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'}
                                    </h2>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: 'rgba(19,136,8,0.1)', color: '#138808' }}>
                                        ✅ Verified
                                    </span>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Donated', val: stats.donated, icon: '🎁' },
                                    { label: 'Claimed', val: stats.claimed, icon: '✅' },
                                    { label: 'Helped', val: stats.claimed, icon: '🙏' },
                                ].map(s => (
                                    <div key={s.label} className="text-center rounded-xl p-3"
                                        style={{ background: 'rgba(19,136,8,0.06)' }}>
                                        <p className="text-lg font-extrabold text-foreground">{s.val}</p>
                                        <p className="text-xs text-muted-foreground">{s.icon} {s.label}</p>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleSignOut}
                                className="mt-4 w-full rounded-xl border border-border py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
                                Sign out
                            </button>
                        </motion.div>

                        {/* Quick links */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="rounded-2xl bg-card card-shadow p-5">
                            <h3 className="text-sm font-extrabold text-foreground mb-3">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { to: '/post-item', icon: '🎁', label: 'Donate Item' },
                                    { to: '/my-items', icon: '📦', label: 'My Items' },
                                    { to: '/support', icon: '💛', label: 'Support Us' },
                                    { to: '/', icon: '🏠', label: 'Browse Items' },
                                    { to: '/fund-usage', icon: '👤', label: 'Transparency' },
                                    { to: '/rewards', icon: <Trophy />, label: 'Rewards' },
                                ].map(({ to, icon, label }) => (
                                    <Link key={to} to={to}
                                        className="flex items-center gap-2 rounded-xl p-3 hover:bg-muted transition-colors"
                                        style={{ background: 'rgba(29,158,117,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                                        <span className="text-xl">{icon}</span>
                                        <span className="text-sm font-semibold text-foreground">{label}</span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* ── REVIEW SECTION ── */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="rounded-2xl bg-card card-shadow p-5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1"
                                style={{ background: 'linear-gradient(90deg,#EF9F27,#D85A30)' }} />
                            <div className="flex items-center gap-2 mb-1">
                                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                <h3 className="text-base font-extrabold text-foreground">Leave a Review ⭐</h3>
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">
                                DaanGuru kaisa laga? Apna anubhav share karein — it will appear on the home page!
                            </p>
                            <ReviewForm user={user} />
                        </motion.div>
                        {/* Reviews Section */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-foreground">Your Reviews ⭐</h3>
                            <div className="mt-3 space-y-3">
                                {
                                    reviews?.length === 0 ? <p className="text-sm text-muted-foreground">Aapne abhi tak koi review nahi diya hai.</p>
                                        :
                                        reviews?.map((review) => (
                                            <div
                                                key={review?.id}
                                                className="group rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-bold text-foreground">{review?.user_name}</p>
                                                    <div className="flex gap-0.5">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-3.5 w-3.5 ${i < review?.rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-muted-foreground/30'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="mt-1.5 text-sm text-muted-foreground">{review?.text}</p>
                                            </div>
                                        ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
