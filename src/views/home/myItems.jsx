import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Gift, HandHeart, Loader2, ArrowUpRight,
    ShoppingBasket, CheckCircle2, MessageCircle,
    MapPin, Clock, LogIn, Lock, Pencil, Trash2,
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import { categoryLabels } from '../../lib/sample-data';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { usePickup } from '../../hooks/usePickup';
import { DeleteItemDialog } from '../../components/DeleteItemDialog';
import { Helmet } from 'react-helmet';

/* ── Animated counter ── */
function AnimatedCounter({ target }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = (ts) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / 1000, 1);
            setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target]);
    return <span className="tabular-nums">{count}</span>;
}

/* ── Single item card ── */
function ItemCard({ item, index, onMarkClaimed, onDeleted }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isOwner = user?.id === item?.user_id;
    const isClaimed = item?.status === 'claimed';
    const [confirming, setConfirming] = useState(false);
    const [marking, setMarking] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { initiatePickup, buildWhatsappUrl, clearMessages } = usePickup(item, user);

    const handleContactDonor = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        clearMessages();
        const code = await initiatePickup();
        if (code) window.open(buildWhatsappUrl(code), '_blank', 'noopener,noreferrer');
    };

    const handleClaim = () => navigate(`/items/${item.id}`);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: index * 0.06, duration: 0.4, ease: 'easeOut' }}
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(18px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                }}
            >
                {/* Status gradient top bar */}
                <div className="h-1 w-full shrink-0" style={{
                    background: isClaimed
                        ? 'linear-gradient(90deg,#EF9F27,#D85A30)'
                        : 'linear-gradient(90deg,#138808,#1D9E75)',
                }} />

                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-muted shrink-0">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-4xl opacity-50">📦</div>
                    )}
                    {isClaimed && (
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                            <span className="flex items-center gap-1 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                <CheckCircle2 className="h-3 w-3" />Claimed
                            </span>
                        </div>
                    )}

                    {/* Edit / Delete overlay — only for owner + unclaimed */}
                    {isOwner && !isClaimed && (
                        <div className="absolute top-2 right-2 flex gap-1.5">
                            <Link
                                to={`/edit/${item.id}`}
                                onClick={e => e.stopPropagation()}
                                className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:scale-110"
                                style={{ background: 'rgba(239,159,39,0.85)', backdropFilter: 'blur(8px)' }}
                                title="Edit item"
                            >
                                <Pencil className="h-3.5 w-3.5 text-white" />
                            </Link>
                            <button
                                onClick={(e) => { e.stopPropagation(); setDeleteOpen(true); }}
                                className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:scale-110"
                                style={{ background: 'rgba(255,92,92,0.85)', backdropFilter: 'blur(8px)' }}
                                title="Delete item"
                            >
                                <Trash2 className="h-3.5 w-3.5 text-white" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1 gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-white leading-tight line-clamp-2 flex-1">{item.name}</h3>
                        <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.7)' }}>
                            {categoryLabels[item?.category] ?? item.category}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {item.location.split(',')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1 self-start text-[11px] font-bold px-2.5 py-1 rounded-full ${isClaimed
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-green-500/15 text-green-400'
                        }`}>
                        {isClaimed ? '✅ Claimed' : '🟢 Available'}
                    </span>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-1">
                        {!isClaimed && !isOwner && (
                            <a href="#" onClick={handleContactDonor}
                                className="flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-bold text-white hover:opacity-90 transition-opacity"
                                style={{ background: 'linear-gradient(135deg,#25D366,#1DA851)' }}>
                                <MessageCircle className="h-3 w-3" />Contact
                            </a>
                        )}
                        {!isClaimed && isOwner && !confirming && (
                            <button onClick={() => setConfirming(true)}
                                className="flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-bold text-white hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                                <CheckCircle2 className="h-3 w-3" />Mark Claimed
                            </button>
                        )}
                        {confirming && (
                            <div className="flex-1 flex gap-1">
                                <button onClick={handleClaim} disabled={marking}
                                    className="flex-1 flex items-center justify-center rounded-lg py-2 text-[10px] font-bold text-white"
                                    style={{ background: '#138808' }}>
                                    {marking ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Haan ✓'}
                                </button>
                                <button onClick={() => setConfirming(false)}
                                    className="flex-1 rounded-lg py-2 text-[10px] font-bold text-white/70"
                                    style={{ background: 'rgba(255,255,255,0.08)' }}>
                                    Nahi
                                </button>
                            </div>
                        )}
                        {/* View detail link */}
                        <Link to={`/items/${item.id}`}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/15"
                            style={{ background: 'rgba(255,255,255,0.08)' }}
                            title="View details">
                            <ArrowUpRight className="h-3.5 w-3.5 text-white/60" />
                        </Link>
                    </div>
                </div>
            </motion.div>

            {/* Delete confirmation dialog */}
            <DeleteItemDialog
                item={item}
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onDeleted={onDeleted}
            />
        </>
    );
}

/* ── Login wall ── */
function LoginWall() {
    const [loading, setLoading] = useState(false);
    const handleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) { console.log(error.message); setLoading(false); }
    };
    return (
        <div className="mx-auto max-w-sm px-4 pt-10 pb-28 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }} className="rounded-2xl bg-card card-shadow p-8">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                    <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-extrabold text-foreground">Login Karein 🙏</h2>
                <p className="mt-2 text-sm text-muted-foreground">Apne items dekhne ke liye login karein.</p>
                <motion.button onClick={handleLogin} disabled={loading} whileTap={{ scale: 0.97 }}
                    className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Redirecting...</> : <><LogIn className="h-4 w-4" />Sign in with Google</>}
                </motion.button>
            </motion.div>
        </div>
    );
}

/* ── Main page ── */
export default function MyItemsPage() {
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('gave');
    const [givenItems, setGivenItems] = useState([]);
    const [receivedItems, setReceivedItems] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) { setDataLoading(false); return; }
        const fetchItems = async () => {
            setDataLoading(true);
            setError('');
            try {
                const { data: posted, error: e1 } = await supabase
                    .from('donation_items')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (e1) throw e1;

                const { data: claimed, error: e2 } = await supabase
                    .from('donation_items')
                    .select('*')
                    .eq('receiver_id', user.id)
                    .order('created_at', { ascending: false });

                setGivenItems(posted ?? []);
                setReceivedItems(e2 ? [] : (claimed ?? []));
            } catch (err) {
                setError(err.message ?? 'Could not load items. Please try again.');
            } finally {
                setDataLoading(false);
            }
        };
        fetchItems();
    }, [user]);

    const handleMarkClaimed = (id) =>
        setGivenItems(prev => prev.map(item => item.id === id ? { ...item, status: 'claimed' } : item));

    /* Remove deleted item from list instantly */
    const handleDeleted = (id) =>
        setGivenItems(prev => prev.filter(item => item.id !== id));

    if (authLoading) return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
    if (!user) return <LoginWall />;

    const items = activeTab === 'gave' ? givenItems : receivedItems;
    const claimedCount = givenItems.filter(i => i.status === 'claimed').length;
    const pendingCount = givenItems.filter(i => i.status !== 'claimed').length;

    return (
        <>
            <Helmet>
                <title>My Items — DaanGuru | Your Donation History</title>
                <meta name="description" content="View and manage your donated and claimed items on DaanGuru." />
                <link rel="canonical" href="https://www.daanguru.in/my-items" />
            </Helmet>

            <div className="mx-auto max-w-[1200px] px-4 lg:px-6 pt-5 pb-28 lg:pb-10">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">Mera Samaan 📦</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Your donation history</p>
                        </div>
                        {/* Quick post button */}
                        <Link to="/post-item"
                            className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-85"
                            style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                            + New Item
                        </Link>
                    </div>
                </motion.div>

                {/* Stats bar */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
                    className="mt-4 rounded-2xl p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    style={{ background: 'linear-gradient(135deg,#085041,#1D9E75)' }}>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Impact</p>
                        <p className="mt-1 text-xl lg:text-2xl font-extrabold text-white">
                            Aapne <AnimatedCounter target={claimedCount} /> logo ki madad ki 🙏
                        </p>
                    </div>
                    <div className="flex gap-4 lg:gap-6">
                        {[
                            { label: 'Diye', val: givenItems.length },
                            { label: 'Liye', val: receivedItems.length },
                            { label: 'Claimed', val: claimedCount },
                            { label: 'Pending', val: pendingCount },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className="text-xs text-white/50 uppercase tracking-wide">{s.label}</p>
                                <p className="text-xl font-extrabold text-white">{s.val}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Edit/Delete hint — only if user has pending items */}
                {/* {pendingCount > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                        className="mt-3 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white/55"
                        style={{ background: 'rgba(239,159,39,0.08)', border: '1px solid rgba(239,159,39,0.15)' }}>
                        <Pencil className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                        <span>Unclaimed items pe <span className="text-yellow-400">✏️ edit</span> ya <span className="text-red-400">🗑 delete</span> button dikhega</span>
                    </motion.div>
                )} */}

                {/* Tabs */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className="mt-5 relative grid grid-cols-2 rounded-2xl p-1"
                    style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <motion.span layout
                        className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl pointer-events-none"
                        style={{
                            background: 'linear-gradient(135deg,#138808,#1D9E75)',
                            left: activeTab === 'gave' ? 4 : 'calc(50%)',
                        }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                    {[
                        { id: 'gave', Icon: Gift, label: 'Maine Diya', count: givenItems.length },
                        { id: 'received', Icon: HandHeart, label: 'Maine Liya', count: receivedItems.length },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`relative z-10 flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-colors ${activeTab === tab.id ? 'text-white' : 'text-muted-foreground'
                                }`}>
                            <tab.Icon className="h-4 w-4" />
                            <span className="truncate">{tab.label}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                                }`}>{tab.count}</span>
                        </button>
                    ))}
                </motion.div>

                {/* Content */}
                <div className="mt-5">
                    {dataLoading ? (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : error ? (
                        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
                            <p className="text-sm font-semibold text-destructive">{error}</p>
                            <button onClick={() => window.location.reload()}
                                className="text-xs font-semibold text-primary hover:underline">Retry</button>
                        </div>
                    ) : items.length > 0 ? (
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab}
                                initial={{ opacity: 0, x: activeTab === 'gave' ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                                {items.map((item, i) => (
                                    <ItemCard
                                        key={item.id}
                                        item={item}
                                        index={i}
                                        onMarkClaimed={handleMarkClaimed}
                                        onDeleted={handleDeleted}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex min-h-[40vh] flex-col items-center justify-center text-center px-6">
                            <div className="text-6xl mb-4" style={{ animation: 'float 3s ease-in-out infinite' }}>
                                {activeTab === 'gave' ? '🎁' : '📭'}
                            </div>
                            <p className="text-xl font-extrabold text-foreground">
                                {activeTab === 'gave' ? 'Abhi koi item nahi diya' : 'Abhi koi item nahi liya'}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {activeTab === 'gave' ? 'Apna pehla item donate karein!' : 'Browse items on the home feed'}
                            </p>
                            <Link to={activeTab === 'gave' ? '/post-item' : '/'}
                                className="mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white"
                                style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                                {activeTab === 'gave' ? '+ Donate Item' : 'Browse Items'}
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                            {activeTab === 'gave' && (
                                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <ShoppingBasket className="h-3.5 w-3.5" />Post Item button se shuru karo
                                </p>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}
