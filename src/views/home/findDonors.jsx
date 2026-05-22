import { useEffect, useState, useRef } from 'react';
import {
    Droplets, MapPin, Phone, Clock, Search, Filter,
    LocateFixed, ChevronDown, RefreshCw, AlertCircle,
    CheckCircle2, X, User, Loader2, ArrowLeft, Mail,
    ArrowRight, ChevronUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import WestBengalBloodMap from '../../components/DonorMapComp';

/* ── Constants ─────────────────────────────────────────────────────────── */
const DONORS_PER_PAGE = 5; // ← change this to show more/fewer per page

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

const BLOOD_GROUPS = [
    { group: 'O+', label: 'Most Common', href: '/digital-blood-bank/find?group=o-positive' },
    { group: 'O−', label: 'Universal Donor', href: '/digital-blood-bank/find?group=o-negative' },
    { group: 'A+', label: 'Available', href: '/digital-blood-bank/find?group=a-positive' },
    { group: 'A−', label: 'Available', href: '/digital-blood-bank/find?group=a-negative' },
    { group: 'B+', label: 'Available', href: '/digital-blood-bank/find?group=b-positive' },
    { group: 'B−', label: 'Available', href: '/digital-blood-bank/find?group=b-negative' },
    { group: 'AB+', label: 'Available', href: '/digital-blood-bank/find?group=ab-positive' },
    { group: 'AB−', label: 'Rare', href: '/digital-blood-bank/find?group=ab-negative' },
];

const CITIES = [
    { name: 'Jhargram', donors: '143', dist: 'Jhargram District', href: '/digital-blood-bank/find?city=jhargram' },
    { name: 'Midnapore', donors: '98', dist: 'Paschim Medinipur', href: '/digital-blood-bank/find?city=midnapore' },
    { name: 'Kolkata', donors: '210', dist: 'West Bengal', href: '/digital-blood-bank/find?city=kolkata' },
    { name: 'Kharagpur', donors: '67', dist: 'Paschim Medinipur', href: '/digital-blood-bank/find?city=kharagpur' },
    { name: 'Bankura', donors: '45', dist: 'Bankura District', href: '/digital-blood-bank/find?city=bankura' },
    { name: 'Purulia', donors: '38', dist: 'Purulia District', href: '/digital-blood-bank/find?city=purulia' },
    { name: 'All of West Bengal', donors: '4000+', dist: 'Search all districts →', href: '/digital-blood-bank/find' },
];

const STEPS = [
    { num: '01', title: 'Select Blood Group & Location', desc: 'Choose the required blood group (O+, B+, A+, etc.) and your nearest city in West Bengal.' },
    { num: '02', title: 'Browse Verified Donors', desc: 'See a list of real, available donors near you with their distance and availability status.' },
    { num: '03', title: 'Connect Directly', desc: 'Contact the donor via phone or WhatsApp. No middleman, no fees, no delay.' },
];

const FAQS = [
    {
        q: 'How to find blood donor near me in Jhargram?',
        a: "Visit Daanguru and select your blood group and Jhargram as your location. You'll see a list of registered donors in Jhargram and surrounding areas. Contact them directly — the service is completely free.",
    },
    {
        q: 'ঝাড়গ্রামে রক্তদাতা কিভাবে পাবো?',
        a: 'Daanguru.in-এ যান, আপনার রক্তের গ্রুপ এবং অবস্থান (ঝাড়গ্রাম) বেছে নিন। কাছাকাছি রক্তদাতাদের তালিকা দেখুন এবং সরাসরি যোগাযোগ করুন। সম্পূর্ণ বিনামূল্যে।',
    },
    {
        q: 'Is the blood donor service completely free?',
        a: "Yes. Daanguru's blood donor matching is 100% free for both donors and recipients. We never charge for emergency blood connections.",
    },
    {
        q: 'How do I register as a blood donor on Daanguru?',
        a: 'Click "Register as Donor", fill in your blood group, city, and contact info. Your profile goes live immediately and people in need can find you.',
    },
    {
        q: 'Which districts in West Bengal does Daanguru cover?',
        a: 'Daanguru covers all major districts: Jhargram, Paschim Medinipur, Purba Medinipur, Bankura, Purulia, Kolkata, Howrah, Hooghly, North & South 24 Parganas, and more.',
    },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.09)' }}>
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left text-sm font-bold text-white transition-colors hover:text-red-400"
            >
                <span>{q}</span>
                {open
                    ? <ChevronUp className="w-4 h-4 text-red-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
                }
            </button>
            {open && (
                <p className="pb-5 text-sm text-white/55 leading-relaxed">{a}</p>
            )}
        </div>
    );
}

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
            className="rounded-2xl overflow-hidden cursor-pointer"
            style={{ border: `1.5px solid ${bgCfg.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            onClick={() => setExpanded(e => !e)}
        >
            {/* Card header */}
            <div className="flex items-center gap-3 p-4">
                <div className="h-14 w-14 shrink-0 rounded-2xl flex flex-col items-center justify-center font-black text-lg leading-none"
                    style={{ background: bgCfg.bg, color: bgCfg.color, border: `2px solid ${bgCfg.border}` }}>
                    <Droplets className="h-3 w-3 mb-0.5" style={{ color: bgCfg.color }} />
                    {donor.blood_group}
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-white truncate text-base">{donor.full_name}</p>
                    <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {donor.location}
                        {donor.pincode && <span className="font-semibold text-white/40"> · {donor.pincode}</span>}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(19,136,8,0.08)', color: '#138808' }}>
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            Available
                        </span>
                        {donor.city && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>
                                {donor.city}
                            </span>
                        )}
                    </div>
                </div>

                <button className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                    style={{ color: bgCfg.color }}>
                    <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4" />
                    </motion.div>
                </button>
            </div>

            {/* Time + days strip */}
            {days && <div className="px-4 pb-3 flex items-center gap-3 flex-wrap border-t" style={{ borderColor: bgCfg.border + '80' }}>
                <div className="flex items-center gap-1.5 pt-2.5">
                    <Clock className="h-3.5 w-3.5" style={{ color: bgCfg.color }} />
                    <span className="text-xs font-semibold text-white/70">
                        {donor.start_time} – {donor.end_time}
                    </span>
                </div>
                <div className="pt-2.5 text-xs text-white/40 font-medium">{days}</div>
            </div>}

            {/* Expanded contact */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden', borderTop: `1.5px solid ${bgCfg.border}80` }}
                    >
                        <div className="p-4 space-y-2.5">
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
                            {donor.email && <a href={`mailto:${donor.email}`}
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium border transition-all hover:opacity-80"
                                style={{ color: '#fff', borderColor: bgCfg.border }}>
                                <Mail className="h-4 w-4" style={{ color: bgCfg.color }} />
                                {donor.email}
                            </a>}
                            {donor.notes && (
                                <div className="rounded-xl px-3 py-2.5 text-xs text-white/60 border" style={{ borderColor: bgCfg.border }}>
                                    <span className="font-bold text-white/80">Note: </span>{donor.notes}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ── Pagination ─────────────────────────────────────────────────────────── */
function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    // build page number list: always show first, last, current ±1, with ellipsis
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return (
        <div className="flex items-center justify-between gap-2 mt-6 pt-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>

            {/* Prev */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                style={{ color: '#E24B4A', border: '1px solid rgba(226,75,74,0.25)' }}
            >
                <ChevronLeft className="h-3.5 w-3.5" />
                Prev
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1.5">
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className="text-xs text-white/30 px-1">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className="h-8 w-8 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                            style={
                                p === currentPage
                                    ? { background: '#E24B4A', color: '#fff', boxShadow: '0 4px 14px rgba(226,75,74,0.4)' }
                                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }
                            }
                        >
                            {p}
                        </button>
                    )
                )}
            </div>

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10"
                style={{ color: '#E24B4A', border: '1px solid rgba(226,75,74,0.25)' }}
            >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
            </button>
        </div>
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
            <h3 className="text-lg font-extrabold text-white mb-2">No Donors Found</h3>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
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
    const navigate = useNavigate();
    const resultsRef = useRef(null); // ref to scroll back to results on page change

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

    // ── Pagination state ──────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(donors.length / DONORS_PER_PAGE);
    const paginatedDonors = donors.slice(
        (currentPage - 1) * DONORS_PER_PAGE,
        currentPage * DONORS_PER_PAGE
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // smooth scroll back to results header
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    // ─────────────────────────────────────────────────────────────────────

    const SCHEMA = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'MedicalOrganization',
                name: 'Daanguru Blood Donor Network',
                url: 'https://www.daanguru.in/digital-blood-bank/find',
                description: 'Free blood donor matching platform serving Jhargram, Midnapore and West Bengal',
                areaServed: [
                    { '@type': 'City', name: 'Jhargram' },
                    { '@type': 'City', name: 'Midnapore' },
                    { '@type': 'State', name: 'West Bengal' },
                ],
                serviceType: 'Blood Donation Matching',
                medicalSpecialty: 'Blood Donation',
            },
            {
                '@type': 'FAQPage',
                mainEntity: FAQS.map(f => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
            },
        ],
    };

    useEffect(() => { setMounted(true); }, []);

    const getPincodeFromCoords = async (lat, lng) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const address = data.address || {};
            return { pincode: address.postcode || '', locationName: address.city || address.state || 'your location' };
        } catch {
            return { pincode: '', locationName: '' };
        }
    };

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

    const fetchDonors = async (pc, bg) => {
        if (!pc || pc.length !== 6) return;
        setLoading(true);
        setHasSearched(true);
        setCurrentPage(1); // always reset to page 1 on new search

        let query = supabase
            .from('blood_donors')
            .select('id, full_name, blood_group, phone, alt_phone, email, location, pincode, city, state, available_days, start_time, end_time, notes, is_available')
            .eq('pincode', pc)
            .eq('is_available', true)
            .order('full_name');

        if (bg && bg !== 'All') query = query.eq('blood_group', bg);

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

    useEffect(() => { useMyLocation(); }, []);

    return (
        <>
            <Helmet>
                <title>Blood Donor Near Me in Jhargram & West Bengal | Daanguru</title>
                <meta name="description" content="Find verified blood donors near you in Jhargram, Midnapore and all of West Bengal. Emergency blood required? Connect instantly with O+, B+, A+, AB+ donors. Free service by Daanguru." />
                <meta name="keywords" content="blood donor near me, blood donor Jhargram, blood donor Midnapore, blood donor West Bengal, রক্তদাতা ঝাড়গ্রাম, emergency blood West Bengal, O positive blood donor, free blood donor India" />
                <meta name="robots" content="index, follow" />
                <meta name="geo.region" content="IN-WB" />
                <meta name="geo.placename" content="Jhargram, West Bengal, India" />
                <meta property="og:title" content="Blood Donor Near Me — Jhargram & West Bengal | Daanguru" />
                <meta property="og:description" content="Find verified blood donors in Jhargram, Midnapore, West Bengal. Emergency blood connection in minutes. Free service." />
                <meta property="og:url" content="https://www.daanguru.in/digital-blood-bank/find" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://www.daanguru.in/images/logo.png" />
                <link rel="canonical" href="https://www.daanguru.in/digital-blood-bank/find" />
                <script type="application/ld+json">{JSON.stringify(SCHEMA)}</script>
            </Helmet>

            <div className="min-h-screen pb-16">

                {/* ── HERO ── */}
                <div className="mx-4 mt-4 lg:mx-auto lg:max-w-[1100px]">
                    <section className="glass-card relative overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14 text-center"
                        style={{ background: 'linear-gradient(135deg,rgba(13,0,5,0.85) 0%,rgba(60,5,15,0.85) 60%,rgba(80,10,20,0.8) 100%)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <div className="absolute inset-0 pointer-events-none"
                            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 100%,rgba(230,57,70,0.22) 0%,transparent 70%)' }} />
                        {['🩸', '❤️', '💉', '🏥'].map((e, i) => (
                            <span key={i} className="absolute text-2xl opacity-10 pointer-events-none select-none"
                                style={{ top: `${[12, 68, 18, 72][i]}%`, [i % 2 ? 'right' : 'left']: `${[7, 5, 82, 78][i]}%`, animation: `float ${[6, 7.5, 5.5, 8][i]}s ease-in-out infinite alternate` }}>
                                {e}
                            </span>
                        ))}
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-xs font-bold uppercase tracking-widest text-red-300"
                                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                Live Donors Available
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
                                Find <span className="text-red-400">Blood Donors</span><br />Near You in West Bengal
                            </h1>
                            <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto mb-2 leading-relaxed">
                                Connect with verified, willing blood donors in Jhargram, Midnapore and across West Bengal — in minutes. Completely free.
                            </p>
                            <p className="text-base text-white/35 mb-8" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                                ঝাড়গ্রাম ও পশ্চিমবঙ্গে রক্তদাতা খুঁজুন — বিনামূল্যে
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <button onClick={() => navigate('/digital-blood-bank/find')}
                                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                                    style={{ background: '#E63946', boxShadow: '0 4px 20px rgba(230,57,70,0.4)' }}>
                                    🔍 Find a Donor Now
                                </button>
                                <button onClick={() => navigate('/digital-blood-bank')}
                                    className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white/80 transition-all hover:text-white hover:-translate-y-0.5"
                                    style={{ border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.06)' }}>
                                    Register as Donor
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── STATS ── */}
                <div className="mx-4 mt-4 lg:mx-auto lg:max-w-[1100px]">
                    <div className="rounded-2xl px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center" style={{ background: '#E63946' }}>
                        {[{ num: '4000+', label: 'Registered Donors' }, { num: '12+', label: 'Districts Covered' }, { num: '8', label: 'Blood Groups' }, { num: '100%', label: 'Free Service' }].map((s, i) => (
                            <div key={i}>
                                <div className="text-3xl font-extrabold text-white leading-none">{s.num}</div>
                                <div className="text-xs text-white/75 mt-1 font-medium">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── BLOOD GROUPS ── */}
                <div className="mx-4 mt-10 lg:mx-auto lg:max-w-[1100px]">
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Find by Blood Group</p>
                    <h2 className="text-2xl font-extrabold text-white mb-1">All Blood Groups Available</h2>
                    <p className="text-sm text-white/50 mb-6 max-w-lg">Select your required blood group to instantly see available donors near you in West Bengal.</p>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                        {BLOOD_GROUPS.map((bg) => (
                            <Link key={bg.group} to={bg.href}
                                className="glass-card flex flex-col items-center justify-center rounded-2xl py-4 px-2 text-center transition-all hover:-translate-y-1 group"
                                style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                                <span className="text-xl font-extrabold text-red-400 group-hover:text-red-300 transition-colors">{bg.group}</span>
                                <span className="text-[10px] text-white/40 mt-1 leading-tight">{bg.label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
                {/* ══════════════════════════════════════════════════════════════
                    SEARCH + RESULTS PANEL
                ══════════════════════════════════════════════════════════════ */}
                <div className="mx-auto max-w-3xl px-4 pt-5 lg:pb-10">

                    {/* ── Search card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className={`glass-card p-6 lg:p-8 mb-5 relative overflow-hidden ${mounted ? '' : 'opacity-0'}`}
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E24B4A] via-[#ff8a80] to-[#E24B4A]" />
                        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-5" style={{ background: '#E24B4A' }} />

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
                                    <button onClick={() => { setInputPincode(''); setPincode(''); setDonors([]); setHasSearched(false); setCurrentPage(1); }}
                                        className="mr-2 text-muted-foreground hover:text-foreground">
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <button onClick={handleSearch} disabled={inputPincode.length !== 6 || loading}
                                className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                Find
                            </button>
                            <button onClick={useMyLocation} disabled={locating} title="Use my location"
                                className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                                style={{ background: 'rgba(226,75,74,0.1)', color: '#E24B4A', border: '1px solid rgba(226,75,74,0.2)' }}>
                                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                                <span className="hidden sm:inline">My Location</span>
                            </button>
                        </div>

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
                            {['All', ...BLOOD_GROUPS.map(bg => bg.group)].map(bg => {
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

                    {/* ══════════════════════════════════════════
                        RESULTS SECTION (with pagination)
                    ══════════════════════════════════════════ */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#E24B4A' }} />
                            <p className="text-sm text-muted-foreground font-medium">Searching donors in {pincode}…</p>
                        </div>

                    ) : hasSearched && donors.length === 0 ? (
                        <EmptyState pincode={pincode} bloodGroup={selectedBG} />

                    ) : donors.length > 0 ? (
                        <div ref={resultsRef}>
                            {/* ── Result header ── */}
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-extrabold text-foreground">
                                        {donors.length} Donor{donors.length !== 1 ? 's' : ''} Found
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Pincode: <strong>{pincode}</strong>
                                        {selectedBG !== 'All' && <> · Blood Group: <strong>{selectedBG}</strong></>}
                                        {totalPages > 1 && (
                                            <span className="ml-2 text-white/40">
                                                · Page {currentPage} of {totalPages}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <button onClick={() => fetchDonors(pincode, selectedBG)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                                </button>
                            </div>

                            {/* ── Donor cards (current page only) ── */}
                            <div className="space-y-3">
                                {paginatedDonors.map((donor, i) => (
                                    <DonorCard key={donor.id} donor={donor} index={i} />
                                ))}
                            </div>

                            {/* ── Pagination controls ── */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />

                            {/* ── Page summary below pagination ── */}
                            {totalPages > 1 && (
                                <p className="text-center text-xs text-white/30 mt-3">
                                    Showing {(currentPage - 1) * DONORS_PER_PAGE + 1}–{Math.min(currentPage * DONORS_PER_PAGE, donors.length)} of {donors.length} donors
                                </p>
                            )}
                        </div>

                    ) : !hasSearched ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}
                            className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <div className="h-20 w-20 rounded-3xl flex items-center justify-center mb-5"
                                style={{ background: 'rgba(226,75,74,0.08)' }}>
                                <LocateFixed className="h-10 w-10" style={{ color: '#E24B4A', opacity: 0.5 }} />
                            </div>
                            <h3 className="text-lg font-extrabold text-white mb-2">Find Donors Near You</h3>
                            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
                                Enter your 6-digit pincode or tap "My Location" to instantly find verified blood donors near you.
                            </p>
                        </motion.div>
                    ) : null}

                    {/* ── Register CTA ── */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="mt-8 rounded-2xl p-5 flex items-center justify-between gap-4"
                        style={{ background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.15)' }}>
                        <div>
                            <p className="text-sm font-extrabold text-white">🩸 Are you a donor?</p>
                            <p className="text-xs text-white/50 mt-0.5">Register to help people in your area find you.</p>
                        </div>
                        <Link to="/digital-blood-bank"
                            className="shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold text-white whitespace-nowrap"
                            style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                            Register Now
                        </Link>
                    </motion.div>
                </div>
                {/* <WestBengalBloodMap /> */}

                {/* ── CITIES ── */}
                {/* <div className="mx-4 mt-12 lg:mx-auto lg:max-w-[1100px]"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2.5rem' }}>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Find by Location</p>
                    <h2 className="text-2xl font-extrabold text-white mb-1">Blood Donors by City</h2>
                    <p className="text-sm text-white/50 mb-6 max-w-lg">We cover Jhargram, Midnapore and major cities across West Bengal. Click your nearest city.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {CITIES.map((city) => (
                            <Link key={city.name} to={city.href}
                                className="glass-card rounded-2xl p-4 flex flex-col gap-1.5 transition-all hover:-translate-y-1 group"
                                style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
                                <span className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">{city.name}</span>
                                <span className="text-xs font-semibold text-red-400">🩸 {city.donors} donors</span>
                                <span className="text-[11px] text-white/40">{city.dist}</span>
                            </Link>
                        ))}
                    </div>
                </div> */}

                {/* ── HOW IT WORKS ── */}
                <div className="mx-4 mt-12 lg:mx-auto lg:max-w-[1100px]">
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">How It Works</p>
                    <h2 className="text-2xl font-extrabold text-white mb-1">Connect with a Donor in 3 Steps</h2>
                    <p className="text-sm text-white/50 mb-6 max-w-lg">No registration needed for recipients. Find a matching donor near you instantly.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {STEPS.map((step) => (
                            <div key={step.num} className="glass-card rounded-2xl p-6"
                                style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
                                <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">Step {step.num}</p>
                                <h3 className="text-sm font-extrabold text-white mb-2 leading-snug">{step.title}</h3>
                                <p className="text-xs text-white/50 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── EMERGENCY BANNER ── */}
                <div className="mx-4 mt-8 lg:mx-auto lg:max-w-[1100px]">
                    <div className="rounded-2xl p-8 text-center relative overflow-hidden" style={{ background: '#E63946' }}>
                        <div className="absolute inset-0 pointer-events-none"
                            style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 120%,rgba(0,0,0,0.3),transparent)' }} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-white animate-pulse" />
                                <h2 className="text-xl font-extrabold text-white">Emergency Blood Required?</h2>
                            </div>
                            <p className="text-sm text-white/80 mb-6 max-w-md mx-auto leading-relaxed">
                                Don't waste time searching. Post an emergency request and our network will notify nearby donors immediately.
                            </p>
                            <button onClick={() => navigate('/digital-blood-bank')}
                                className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-extrabold text-red-600 bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl">
                                Post Emergency Request <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── FAQ ── */}
                <div className="mx-4 mt-12 lg:mx-auto lg:max-w-[1100px]"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2.5rem' }}>
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">FAQ</p>
                    <h2 className="text-2xl font-extrabold text-white mb-1">Frequently Asked Questions</h2>
                    <p className="text-sm text-white/50 mb-6 max-w-lg">Everything you need to know about finding blood donors near you in West Bengal.</p>
                    <div className="glass-card rounded-2xl px-5 py-2" style={{ border: '1px solid rgba(239,68,68,0.12)' }}>
                        {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
                    </div>
                </div>

                {/* ── SEO CONTENT ── */}
                <div className="mx-4 mt-12 lg:mx-auto lg:max-w-[1100px]">
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">About This Service</p>
                    <h2 className="text-2xl font-extrabold text-white mb-4">Blood Donor Network in West Bengal</h2>
                    <div className="glass-card rounded-2xl p-6 text-sm text-white/55 leading-8 space-y-4"
                        style={{ border: '1px solid rgba(239,68,68,0.12)' }}>
                        <p>
                            Daanguru is West Bengal's free blood donor finder platform. We connect people who urgently need blood with willing, verified donors across <strong className="text-white/80">Jhargram, Midnapore, Kharagpur, Bankura, Purulia, Kolkata</strong> and all districts of West Bengal. Whether you need O positive, B positive, A positive, AB positive or any rare blood group — our platform helps you find a matching donor nearby within minutes.
                        </p>
                        <p>
                            Registered blood donors on Daanguru receive emergency alerts when someone in their area needs their blood group. Our platform is recognized as one of the fastest-growing blood donor networks in rural West Bengal, particularly serving the <strong className="text-white/80">Jhargram and Paschim Medinipur</strong> districts.
                        </p>
                        <p className="text-white/70 font-semibold">
                            রক্তদান জীবন বাঁচায়। ঝাড়গ্রাম, মিদনাপুর এবং পশ্চিমবঙ্গের সমস্ত জেলায় আমাদের বিনামূল্যে রক্তদাতা নেটওয়ার্কে যোগ দিন।
                        </p>
                    </div>
                </div>

                {/* ── REGISTER CTA ── */}
                <div className="mx-4 mt-8 mb-4 lg:mx-auto lg:max-w-[1100px]">
                    <div className="glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                        style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)' }}>
                        <div>
                            <p className="text-base font-extrabold text-white mb-1">Be a Hero — Register as a Blood Donor</p>
                            <p className="text-xs text-white/50">Your one donation can save up to 3 lives. Join 4000+ donors across West Bengal.</p>
                        </div>
                        <button onClick={() => navigate('/digital-blood-bank')}
                            className="shrink-0 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                            style={{ background: '#E63946', boxShadow: '0 4px 16px rgba(230,57,70,0.35)' }}>
                            Register Now <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}
