import { useEffect, useState, useRef } from 'react';
import {
    Droplets, MapPin, Phone, Clock, Search, Filter,
    LocateFixed, ChevronDown, RefreshCw, AlertCircle,
    CheckCircle2, X, User, Loader2, ArrowLeft, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { Helmet } from 'react-helmet';

/* ── Constants ─────────────────────────────────────────────────────────── */
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const WEEKDAY_LABELS = {
    mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu',
    fri: 'Fri', sat: 'Sat', sun: 'Sun',
};

const BG_COLORS = {
    'A+': { bg: '#fff0f0', color: '#E24B4A', border: '#fbc5c5' },
    'A-': { bg: '#fff5f5', color: '#c0392b', border: '#f5b0ae' },
    'B+': { bg: '#fff8ed', color: '#e67e22', border: '#f5d5aa' },
    'B-': { bg: '#fffaef', color: '#d35400', border: '#f0c99a' },
    'AB+': { bg: '#edf5ff', color: '#2980b9', border: '#aacfee' },
    'AB-': { bg: '#f0f6ff', color: '#1a6fa8', border: '#9bbde5' },
    'O+': { bg: '#edfff4', color: '#138808', border: '#a8ddb8' },
    'O-': { bg: '#f0fff5', color: '#0e6e06', border: '#90cfa0' },
};

/* ── Donor Card ─────────────────────────────────────────────────────────── */
function DonorCard({ donor, index }) {
    const [expanded, setExpanded] = useState(false);
    const bgCfg = BG_COLORS[donor.blood_group] || BG_COLORS['O+'];
    const days = (donor.available_days || []).map(d => WEEKDAY_LABELS[d] || d).join(' · ');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="rounded-2xl overflow-hidden"
            style={{
                // background: '#fff',
                border: `1.5px solid ${bgCfg.border}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}
        >
            {/* Card header */}
            <div className="flex items-center gap-3 p-4">
                {/* Blood group badge */}
                <div className="h-14 w-14 shrink-0 rounded-2xl flex flex-col items-center justify-center font-black text-lg leading-none"
                    style={{ background: bgCfg.bg, color: bgCfg.color, border: `2px solid ${bgCfg.border}` }}>
                    <Droplets className="h-3 w-3 mb-0.5" style={{ color: bgCfg.color }} />
                    {donor.blood_group}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-white-900 truncate text-base">{donor.full_name}</p>
                    <p className="text-xs text-white-500 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {donor.location}
                        {donor.pincode && <span className="font-semibold text-white-400"> · {donor.pincode}</span>}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {/* Availability pill */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(19,136,8,0.08)', color: '#138808' }}>
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Available
                        </span>
                        {donor.city && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: '#f3f4f6', color: '#6b7280' }}>
                                {donor.city}
                            </span>
                        )}
                    </div>
                </div>

                {/* Expand button */}
                <button
                    onClick={() => setExpanded(e => !e)}
                    className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all hover:bg-white-100"
                    style={{ color: bgCfg.color }}
                >
                    <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4" />
                    </motion.div>
                </button>
            </div>

            {/* Time + days strip */}
            <div className="px-4 pb-3 flex items-center gap-3 flex-wrap border-t" style={{ borderColor: bgCfg.border + '80' }}>
                <div className="flex items-center gap-1.5 pt-2.5">
                    <Clock className="h-3.5 w-3.5" style={{ color: bgCfg.color }} />
                    <span className="text-xs font-semibold text-white-600">
                        {donor.start_time} – {donor.end_time}
                    </span>
                </div>
                {days && (
                    <div className="pt-2.5 text-xs text-white-400 font-medium">{days}</div>
                )}
            </div>

            {/* Expanded contact section */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden', borderTop: `1.5px solid ${bgCfg.border}80` }}
                    >
                        <div className="p-4 space-y-2.5" >
                            {/* Contact info */}
                            <a href={`tel:+91${donor.phone}`}
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all hover:opacity-80 active:scale-98"
                                style={{ background: bgCfg.color, color: '#fff' }}>
                                <Phone className="h-4 w-4" />
                                +91 {donor.phone}
                                <span className="ml-auto text-xs font-bold opacity-80">Tap to Call</span>
                            </a>

                            {donor.alt_phone && (
                                <a href={`tel:+91${donor.alt_phone}`}
                                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold border transition-all hover:opacity-80"
                                    style={{ color: bgCfg.color, borderColor: bgCfg.border }}>
                                    <Phone className="h-4 w-4" />
                                    +91 {donor.alt_phone}
                                    <span className="ml-auto text-xs opacity-60">Alt. Number</span>
                                </a>
                            )}

                            <a href={`mailto:${donor.email}`}
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium border transition-all hover:opacity-80"
                                style={{ color: '#fff', borderColor: bgCfg.border }}>
                                <Mail className="h-4 w-4" style={{ color: bgCfg.color }} />
                                {donor.email}
                            </a>

                            {donor.notes && (
                                <div className="rounded-xl px-3 py-2.5 text-xs text-white-600 border"
                                    style={{ borderColor: bgCfg.border }}>
                                    <span className="font-bold text-white-800">Note: </span>{donor.notes}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ── Empty state ────────────────────────────────────────────────────────── */
function EmptyState({ pincode, bloodGroup }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="h-20 w-20 rounded-3xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(226,75,74,0.08)' }}>
                <Droplets className="h-10 w-10" style={{ color: '#E24B4A', opacity: 0.4 }} />
            </div>
            <h3 className="text-lg font-extrabold text-white-800 mb-2">No Donors Found</h3>
            <p className="text-sm text-white-500 leading-relaxed max-w-xs">
                {pincode
                    ? `No ${bloodGroup !== 'All' ? bloodGroup : ''} donors found in pincode ${pincode}. Try a different pincode or blood group.`
                    : 'Enter a pincode or use your location to find donors near you.'}
            </p>
            <Link to="/digital-blood-bank"
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                <Droplets className="h-4 w-4" /> Register as Donor
            </Link>
        </motion.div>
    );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function FindDonorsPage() {
    const [donors, setDonors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [pincode, setPincode] = useState('');
    const [inputPincode, setInputPincode] = useState('');
    const [selectedBG, setSelectedBG] = useState('All');
    const [locationName, setLocationName] = useState('');
    const [locationError, setLocationError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    /* ── Reverse geocode to get pincode from lat/lng ── */
    const getPincodeFromCoords = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            );
            const data = await res.json();
            if (data.results?.length) {
                const result = data.results[0];
                // Get pincode
                const pcComp = result.address_components?.find(c => c.types.includes('postal_code'));
                const cityComp = result.address_components?.find(c => c.types.includes('locality'));
                const stateComp = result.address_components?.find(c => c.types.includes('administrative_area_level_1'));
                const pc = pcComp?.long_name || '';
                const city = cityComp?.long_name || stateComp?.long_name || 'your location';
                return { pincode: pc, locationName: city };
            }
        } catch { /* ignore */ }
        return { pincode: '', locationName: '' };
    };

    /* ── Use device location ── */
    const useMyLocation = () => {
        setLocationError('');
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                const { pincode: pc, locationName: name } = await getPincodeFromCoords(latitude, longitude);
                setLocating(false);
                if (pc) {
                    setPincode(pc);
                    setInputPincode(pc);
                    setLocationName(name);
                    fetchDonors(pc, selectedBG);
                } else {
                    setLocationError('Could not detect pincode. Enter manually.');
                }
            },
            () => {
                setLocating(false);
                setLocationError('Location denied. Please enter pincode manually.');
            },
            { timeout: 10000 }
        );
    };

    /* ── Fetch donors ── */
    const fetchDonors = async (pc, bg) => {
        if (!pc || pc.length !== 6) return;
        setLoading(true);
        setHasSearched(true);

        let query = supabase
            .from('blood_donors')
            .select('id, full_name, blood_group, phone, alt_phone, email, location, pincode, city, state, available_days, start_time, end_time, notes, is_available')
            .eq('pincode', pc)
            .eq('is_available', true)
            .order('full_name');

        if (bg && bg !== 'All') {
            query = query.eq('blood_group', bg);
        }

        const { data, error } = await query;
        setLoading(false);
        if (!error) setDonors(data || []);
    };

    const handleSearch = () => {
        if (inputPincode.length !== 6) return;
        setPincode(inputPincode);
        fetchDonors(inputPincode, selectedBG);
    };

    const handleBGChange = (bg) => {
        setSelectedBG(bg);
        if (pincode) fetchDonors(pincode, bg);
    };

    return (
        <>
            <Helmet>
                <title>Find Blood Donors Near You — Digital Blood Bank | DaanGuru</title>
                <meta name="description" content="Find verified blood donors near you on DaanGuru's Digital Blood Bank. Search by pincode and blood group." />
                <link rel="canonical" href="https://www.daanguru.in/digital-blood-bank/find" />
            </Helmet>

            <div className="mx-auto max-w-3xl px-4 pt-5 pb-28 lg:pb-10">
                <Link to="/" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Home
                </Link>

                {/* ── Hero banner ── */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className={`glass-card p-6 lg:p-8 mb-5 relative overflow-hidden ${mounted ? '' : 'opacity-0'}`}
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E24B4A] via-[#ff8a80] to-[#E24B4A]" />

                    {/* Decorative drop */}
                    <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-5"
                        style={{ background: '#E24B4A' }} />

                    <div className="flex items-center gap-3 mb-5">
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                            <Droplets className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">Digital Blood Bank 🩸</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Find verified donors near you, instantly.</p>
                        </div>
                    </div>

                    {/* Search row */}
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center rounded-xl border border-input bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                            <MapPin className="h-4 w-4 ml-3 shrink-0 text-muted-foreground" />
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="Enter 6-digit pincode..."
                                value={inputPincode}
                                onChange={e => setInputPincode(e.target.value.replace(/\D/g, ''))}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className="flex-1 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
                            />
                            {inputPincode && (
                                <button onClick={() => { setInputPincode(''); setPincode(''); setDonors([]); setHasSearched(false); }}
                                    className="mr-2 text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Search button */}
                        <button onClick={handleSearch} disabled={inputPincode.length !== 6 || loading}
                            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Find
                        </button>

                        {/* My Location button */}
                        <button onClick={useMyLocation} disabled={locating}
                            title="Use my location"
                            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                            style={{ background: 'rgba(226,75,74,0.1)', color: '#E24B4A', border: '1px solid rgba(226,75,74,0.2)' }}>
                            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                            <span className="hidden sm:inline">My Location</span>
                        </button>
                    </div>

                    {/* Location name tag */}
                    {locationName && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                            style={{ background: 'rgba(19,136,8,0.08)', color: '#138808' }}>
                            <CheckCircle2 className="h-3 w-3" /> Detected: {locationName} – {pincode}
                        </motion.div>
                    )}

                    {locationError && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="mt-2 text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {locationError}
                        </motion.p>
                    )}
                </motion.div>

                {/* ── Blood group filter chips ── */}
                <div className="mb-5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Filter by Blood Group</p>
                    <div className="flex gap-2 flex-wrap">
                        {['All', ...BLOOD_GROUPS].map(bg => {
                            const cfg = BG_COLORS[bg];
                            const active = selectedBG === bg;
                            return (
                                <button key={bg} onClick={() => handleBGChange(bg)}
                                    className="rounded-xl px-3.5 py-1.5 text-sm font-bold transition-all active:scale-95"
                                    style={{
                                        background: active ? (cfg ? cfg.color : '#E24B4A') : (cfg ? cfg.bg : 'rgba(226,75,74,0.06)'),
                                        color: active ? '#fff' : (cfg ? cfg.color : '#E24B4A'),
                                        border: active ? 'none' : `1px solid ${cfg ? cfg.border : 'rgba(226,75,74,0.2)'}`,
                                    }}>
                                    {bg === 'All' ? '🩸 All' : bg}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Results ── */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#E24B4A' }} />
                        <p className="text-sm text-muted-foreground font-medium">Searching donors in {pincode}…</p>
                    </div>
                ) : hasSearched && donors.length === 0 ? (
                    <EmptyState pincode={pincode} bloodGroup={selectedBG} />
                ) : donors.length > 0 ? (
                    <div>
                        {/* Result header */}
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-extrabold text-foreground">
                                    {donors.length} Donor{donors.length !== 1 ? 's' : ''} Found
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Pincode: <strong>{pincode}</strong>
                                    {selectedBG !== 'All' && <> · Blood Group: <strong>{selectedBG}</strong></>}
                                </p>
                            </div>
                            <button onClick={() => fetchDonors(pincode, selectedBG)}
                                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                                <RefreshCw className="h-3.5 w-3.5" /> Refresh
                            </button>
                        </div>

                        <div className="space-y-3">
                            {donors.map((donor, i) => (
                                <DonorCard key={donor.id} donor={donor} index={i} />
                            ))}
                        </div>
                    </div>
                ) : !hasSearched ? (
                    /* Initial state */
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}
                        className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <div className="h-20 w-20 rounded-3xl flex items-center justify-center mb-5"
                            style={{ background: 'rgba(226,75,74,0.08)' }}>
                            <LocateFixed className="h-10 w-10" style={{ color: '#E24B4A', opacity: 0.5 }} />
                        </div>
                        <h3 className="text-lg font-extrabold text-white-800 mb-2">Find Donors Near You</h3>
                        <p className="text-sm text-white-500 leading-relaxed max-w-xs">
                            Enter your 6-digit pincode or tap "My Location" to instantly find verified blood donors near you.
                        </p>
                    </motion.div>
                ) : null}

                {/* ── Register CTA at bottom ── */}
                {/* {hasSearched && ( */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-8 rounded-2xl p-5 flex items-center justify-between gap-4"
                    style={{ background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.15)' }}>
                    <div>
                        <p className="text-sm font-extrabold text-white-800">🩸 Are you a donor?</p>
                        <p className="text-xs text-white-500 mt-0.5">Register to help people in your area find you.</p>
                    </div>
                    <Link to="/digital-blood-bank"
                        className="shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold text-white whitespace-nowrap"
                        style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                        Register Now
                    </Link>
                </motion.div>
                {/* )} */}
            </div>
        </>
    );
}
