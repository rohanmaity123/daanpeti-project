import { useState, useEffect } from 'react';
import { categoryLabels, categoryColors } from '../../lib/sample-data';
import { MapPin, Clock, ArrowLeft, MessageCircle, CheckCircle, Search, Phone, UserRound, Share2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { supabase } from '../../utils/supabaseClient';
import LoadingScreen from '../../components/LoadingScreen';
import { X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import ShareSheet from '../../components/ShareSheet';
import useGlobalStore from '../../hooks/useGlobalStore';
import { LocationCard } from '../../components/MapPreviewCard';
import { OtpPickupFlow } from '../../components/OtpPickupFlow';

export default function ItemDetailPage() {
    const { itemId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toggleForModal } = useGlobalStore();

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [imageZoomOpen, setImageZoomOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);

    const isClaimed = item?.status === 'claimed';
    const isDonor = item?.user_id === user?.id;

    /* ── Fetch / refetch item ── */
    const fetchItem = async () => {
        const { data, error } = await supabase
            .from('donation_items')
            .select('*')
            .eq('id', itemId)
            .single();
        if (error) console.error(error.message);
        else setItem(data);
        setLoading(false);
    };

    useEffect(() => { fetchItem(); }, [itemId]);

    /* ── Donor: legacy "mark as claimed" (no OTP) ─────────────────
       Still kept for donors who want to close an item manually
       without waiting for OTP flow (e.g. item given to someone
       they know offline).
    ────────────────────────────────────────────────────────────── */
    const handleConfirmClaim = async () => {
        const { error } = await supabase
            .from('donation_items')
            .update({ status: 'claimed' })
            .eq('id', item?.id)
            .select();
        if (!error) {
            setConfirmOpen(false);
            fetchItem();
        }
    };

    if (loading) return <LoadingScreen />;

    if (!item) {
        return (
            <div className="gradient-page flex min-h-screen items-center justify-center p-4">
                <div className="glass-card text-center p-8">
                    <p className="text-lg font-bold text-white">Item nahi mila 😔</p>
                    <Link to="/" className="mt-3 inline-block text-sm font-semibold text-[#8EF0CC]">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="gradient-page pb-28 lg:pb-10">

            {/* ── Sticky header ── */}
            <div className="sticky top-0 z-40 border-b border-white/10 bg-black/20 backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
                    <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-white/88">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <button
                        onClick={() => setShareOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                        aria-label="Share"
                    >
                        <Share2 className="h-4 w-4 text-white/80" />
                    </button>
                </div>
            </div>

            {/* ── Main grid ── */}
            <div className="mx-auto max-w-6xl px-4 pt-4 lg:px-6">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-8">

                    {/* ── LEFT: image + description ── */}
                    <div className="space-y-4">

                        {/* Image card */}
                        <button
                            type="button"
                            onClick={() => setImageZoomOpen(true)}
                            className="glass-card item-detail-image-card group relative block w-full overflow-hidden rounded-[28px] p-2 text-left"
                        >
                            <div className="relative overflow-hidden rounded-[22px]">
                                <img
                                    src={item?.image_url}
                                    alt={item?.name}
                                    className="h-[320px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] sm:h-[420px] lg:h-[560px]"
                                />
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/55 to-transparent p-4">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/28 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                                        <Search className="h-3.5 w-3.5" />Tap to zoom
                                    </span>
                                    {isClaimed && (
                                        <span className="glass-surface rounded-full px-3 py-1.5 text-xs font-bold text-white">
                                            Claimed
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>

                        {/* Item info card */}
                        <div className="glass-card rounded-[28px] p-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${categoryColors[item.category]}`}>
                                    {categoryLabels[item.category]}
                                </span>
                                {!isClaimed && (
                                    <span className="feed-free-badge inline-block rounded-full px-2.5 py-1 text-xs font-bold text-white">
                                        🆓 Bilkul FREE
                                    </span>
                                )}
                            </div>
                            <h1 className="mt-3 text-2xl font-extrabold text-white lg:text-3xl">{item?.name}</h1>
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />{item?.location}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    {item.created_at
                                        ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                        : 'Unknown'}
                                </span>
                            </div>
                            <div className="mt-6 border-t border-white/10 pt-5">
                                <h2 className="mb-2 text-sm font-bold text-white">Description</h2>
                                <p className="text-sm leading-relaxed text-white/70">{item?.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: donor details + OTP action + map ── */}
                    <div className="space-y-4">

                        {/* Donor details card */}
                        <div className="glass-card rounded-[28px] p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-extrabold text-white">Donor Details</h2>
                                {/* Share shortcut */}
                                <button
                                    onClick={() => setShareOpen(true)}
                                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white transition-colors"
                                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
                                >
                                    <Share2 className="h-3.5 w-3.5" /> Share
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div className="item-detail-donor-row">
                                    <span className="item-detail-donor-icon"><UserRound className="h-4 w-4" /></span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Donated by</p>
                                        <p className="mt-1 truncate text-sm font-bold text-white">{item.donor_name}</p>
                                    </div>
                                </div>
                                <div className="item-detail-donor-row">
                                    <span className="item-detail-donor-icon"><MapPin className="h-4 w-4" /></span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Location</p>
                                        <p className="mt-1 text-sm font-semibold text-white/80">{item?.location}</p>
                                        <p className="text-xs text-white/55">Pincode: {item?.pincode}</p>
                                    </div>
                                </div>
                                <div className="item-detail-donor-row">
                                    <span className="item-detail-donor-icon"><Phone className="h-4 w-4" /></span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Contact</p>
                                        <p className="mt-1 text-sm font-semibold text-white/80">
                                            {isDonor ? item.whatsapp_number : 'WhatsApp se direct connect karein'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop OTP / action card */}
                        <div className="hidden rounded-[28px] p-5 lg:block glass-card">
                            <h3 className="text-base font-extrabold text-white mb-1">
                                {isClaimed ? 'Item Claimed' : isDonor ? 'Verify Pickup' : 'Get This Item'}
                            </h3>
                            <p className="mb-4 text-sm text-white/50">
                                {isClaimed
                                    ? 'Yeh item already claimed ho chuka hai.'
                                    : isDonor
                                        ? 'Receiver ka 6-digit code enter karein to confirm handover.'
                                        : 'WhatsApp karo, apna code share karo, aur item lo!'}
                            </p>
                            <OtpPickupFlow
                                item={item}
                                user={user}
                                isDonor={isDonor}
                                isClaimed={isClaimed}
                                onClaimed={fetchItem}
                                onLoginRequired={() => toggleForModal('TOGGLE_LOGIN_ALERT_MODAL')}
                            />

                            {/* Donor: also keep the manual "Mark as Claimed" escape hatch */}
                            {isDonor && !isClaimed && (
                                <button
                                    onClick={() => setConfirmOpen(true)}
                                    className="mt-3 w-full rounded-xl py-2.5 text-xs font-semibold text-white/40 hover:text-white/70 transition-colors"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                                >
                                    Or mark as claimed manually (no OTP)
                                </button>
                            )}
                        </div>

                        {/* Map preview */}

                    </div>
                    <LocationCard location={item.location} pincode={item.pincode} />
                </div>
            </div>

            {/* ── Mobile sticky CTA ── */}
            <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/30 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
                <div className="mx-auto max-w-lg">
                    <OtpPickupFlow
                        item={item}
                        user={user}
                        isDonor={isDonor}
                        isClaimed={isClaimed}
                        onClaimed={fetchItem}
                        onLoginRequired={() => toggleForModal('TOGGLE_LOGIN_ALERT_MODAL')}
                    />
                </div>
            </div>

            {/* ── Share Sheet ── */}
            <ShareSheet item={item} open={shareOpen} onClose={() => setShareOpen(false)} />

            {/* ── Manual claim confirm dialog (donor escape hatch) ── */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                fullWidth maxWidth="xs"
                BackdropProps={{ sx: { backgroundColor: 'rgba(5,10,20,0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' } }}
                PaperProps={{
                    className: 'glass-dialog-paper rounded-[38px]',
                    style: {
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
                        backdropFilter: 'blur(22px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                        border: '1px solid rgba(255,255,255,0.16)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.38)',
                        color: 'rgba(255,255,255,0.96)',
                        margin: '16px',
                        width: 'calc(100% - 32px)',
                        maxWidth: '420px',
                    }
                }}
            >
                <DialogTitle sx={{ color: 'rgba(255,255,255,0.98)', fontWeight: 700 }} className="px-6 pt-6 text-base">
                    Has this item been picked up?
                </DialogTitle>
                <DialogContent className="px-6 pb-5">
                    <DialogContentText sx={{ color: 'rgba(255,255,255,0.78) !important' }}>
                        Kya yeh item kisi ne le liya? Once marked, it will show as claimed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="flex flex-col gap-3 px-6 pb-6 sm:flex-row sm:gap-2">
                    <button
                        onClick={() => setConfirmOpen(false)}
                        className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 sm:flex-1"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmClaim}
                        className="my-items-claim-button w-full rounded-2xl px-4 py-3 text-sm font-bold text-white hover:opacity-90 sm:flex-1"
                    >
                        Yes, mark as claimed
                    </button>
                </DialogActions>
            </Dialog>

            {/* ── Image zoom dialog ── */}
            <Dialog
                open={imageZoomOpen}
                onClose={() => setImageZoomOpen(false)}
                maxWidth="lg"
                BackdropProps={{ sx: { backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.4)' } }}
                PaperProps={{
                    className: 'rounded-[28px]',
                    style: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 20px 70px rgba(0,0,0,0.35)' }
                }}
            >
                <DialogContent className="p-2 sm:p-3">
                    <button
                        onClick={() => setImageZoomOpen(false)}
                        className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md"
                    >
                        <X className="h-5 w-5 text-white" />
                    </button>
                    <img
                        src={item?.image_url}
                        alt={item?.name}
                        className="max-h-[82vh] w-full rounded-[22px] object-contain"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
