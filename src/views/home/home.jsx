import { useEffect, useMemo, useState } from 'react';
import { filterCategories } from '../../lib/sample-data';
import { ItemCard } from '../../components/ItemCard';
import { SupportBanner } from '../../components/SupportBanner';
import { ArrowRight, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useItemsClaimed, isItemClaimed } from '../../lib/items-store';
import { TestimonialSection } from '../../components/Testimonial';
import { supabase } from '../../utils/supabaseClient';
import { Loader2 } from 'lucide-react';
import { PartnersSection } from '../../components/PartnerSection';
import { useAuth } from '../../hooks/useAuth';
import { Helmet } from 'react-helmet';
import CertificatesHomeWidget from '../../components/CertificateComponent';
import { BlogWidget } from '../../components/blog/BlogWidget';
import HomeScreenModal from '../../components/Modals/HomeScreenModal';
import { Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

// ─── DATA ────────────────────────────────────────────────────────────────────

const heroEmojis = [
    { emoji: '📚', top: '12%', left: '10%', duration: '5.5s' },
    { emoji: '👕', top: '68%', left: '12%', duration: '7.2s' },
    { emoji: '🪑', top: '22%', right: '16%', duration: '6.3s' },
    { emoji: '🧸', top: '65%', right: '12%', duration: '8.1s' },
    { emoji: '📦', top: '40%', right: '30%', duration: '6.8s' },
];

const TICKER_ITEMS = [
    'Wooden Almirah — Jhargram', 'School Books Grade 8 — Midnapore',
    'Baby Clothes — Kharagpur', 'Study Table — Bankura',
    'Electric Fan — Purulia', 'Sarees — Kolkata',
    'Wooden Almirah — Jhargram', 'School Books Grade 8 — Midnapore',
    'Baby Clothes — Kharagpur', 'Study Table — Bankura',
    'Electric Fan — Purulia', 'Sarees — Kolkata',
];

const CATEGORIES = [
    { icon: '🪑', name: 'Furniture', count: '124 items', slug: 'furniture' },
    { icon: '👕', name: 'Clothes', count: '312 items', slug: 'clothes' },
    { icon: '📚', name: 'Books', count: '98 items', slug: 'books' },
    { icon: '📱', name: 'Electronics', count: '67 items', slug: 'electronics' },
    { icon: '🧸', name: 'Toys', count: '45 items', slug: 'toys' },
    { icon: '🍳', name: 'Utensils', count: '83 items', slug: 'utensils' },
    { icon: '🍚', name: 'Food', count: '29 items', slug: 'food' },
    { icon: '📦', name: 'Other', count: '200+ items', slug: 'other' },
];

const RECENT_LISTINGS = [
    { emoji: '🪑', category: 'Furniture', title: 'Wooden Chair (Good Condition)', loc: 'Jhargram, 2.1 km away' },
    { emoji: '📚', category: 'Books', title: 'Class 10 WBBSE Books (Full Set)', loc: 'Midnapore, 8.4 km away' },
    { emoji: '👕', category: 'Clothes', title: "Children's Clothes Bundle (5–8 yrs)", loc: 'Kharagpur, 22 km away' },
];

const HOW_STEPS = [
    { icon: '🔍', title: 'Browse Free Items', desc: 'Search by category or location. See what\'s available near you in West Bengal today.' },
    { icon: '💬', title: 'Contact the Donor', desc: 'Send a request to the donor directly. No registration required to browse.' },
    { icon: '🤝', title: 'Pick Up for Free', desc: 'Arrange a pickup time with the donor and collect the item. Zero cost, zero drama.' },
];

const CITIES = [
    { name: 'Jhargram', items: '142 free items', slug: 'jhargram' },
    { name: 'Midnapore', items: '98 free items', slug: 'midnapore' },
    { name: 'Kolkata', items: '450 free items', slug: 'kolkata' },
    { name: 'Kharagpur', items: '67 free items', slug: 'kharagpur' },
    { name: 'Bankura', items: '54 free items', slug: 'bankura' },
    { name: 'Purulia', items: '38 free items', slug: 'purulia' },
];

const FAQS = [
    {
        q: 'How to get free items near me in West Bengal?',
        a: 'Go to Daanguru.in, browse items by category or city, and contact the donor. No payment, no signup needed to browse. All items are donated for free by people in your area.',
    },
    {
        q: 'বিনামূল্যে জিনিস কিভাবে পাবো? (How to get free items in Bengali?)',
        a: 'Daanguru.in-এ যান, আপনার পছন্দের জিনিস বেছে নিন এবং দাতার সাথে সরাসরি যোগাযোগ করুন। কোনো পেমেন্ট লাগবে না।',
    },
    {
        q: 'How do I donate old clothes, furniture or books in Jhargram?',
        a: 'Click "+" to post a donation, take a quick photo, add a short description and your location. People nearby who need it will contact you directly. It takes under 2 minutes.',
    },
    {
        q: 'Is Daanguru really 100% free? No hidden charges?',
        a: "Yes — completely free. No delivery charges, no platform fees, no subscription. Daanguru's mission is to connect donors and recipients without any barriers.",
    },
];

const SCHEMA = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Service",
            "name": "Daanguru Free Products",
            "url": "https://www.daanguru.in/",
            "description": "Free product donation and exchange platform for West Bengal.",
            "provider": { "@type": "Organization", "name": "Daanguru", "url": "https://www.daanguru.in/" },
            "areaServed": [
                { "@type": "City", "name": "Jhargram" },
                { "@type": "City", "name": "Midnapore" },
                { "@type": "State", "name": "West Bengal" }
            ],
            "serviceType": "Free Product Donation",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
        },
        {
            "@type": "WebSite",
            "name": "DaanGuru",
            "url": "https://www.daanguru.in",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.daanguru.in/?search={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        },
        {
            "@type": "LocalBusiness",
            "name": "DaanGuru",
            "url": "https://www.daanguru.in",
            "areaServed": ["Jhargram", "West Bengal", "India"],
            "serviceType": ["Donation Platform", "AI Doctor Finder", "Blood Bank", "Community Help"],
            "description": "Free community platform helping people donate items, find nearby doctors, and connect with blood donors"
        },
        {
            "@type": "FAQPage",
            "mainEntity": FAQS.map(f => ({
                "@type": "Question",
                "name": f.q,
                "acceptedAnswer": { "@type": "Answer", "text": f.a }
            }))
        }
    ]
};

// ─── FAQ ITEM ────────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left text-sm font-bold text-white transition-colors hover:text-[#8EF0CC]"
            >
                <span>{q}</span>
                {open
                    ? <ChevronUp className="w-4 h-4 text-[#1D9E75] shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
                }
            </button>
            {open && <p className="pb-5 text-sm text-white/55 leading-relaxed">{a}</p>}
        </div>
    );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function HomePage() {
    const { user } = useAuth();
    const navigator = useNavigate();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const claimedMap = useItemsClaimed();

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            if (claimedMap[item.id] || isItemClaimed(item.id)) return false;
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            const matchesSearch = searchQuery === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLocation = locationQuery === '' ||
                item.pincode?.toString().includes(locationQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(locationQuery.toLowerCase());
            return matchesCategory && matchesSearch && matchesLocation;
        });
    }, [activeCategory, searchQuery, locationQuery, claimedMap, items]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => { setCurrentPage(1); }, [activeCategory, searchQuery, locationQuery, claimedMap]);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("donation_items")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) console.error(error.message);
            else setItems(data);
            setLoading(false);
        };
        fetchItems();
    }, []);

    const sidebar = (
        <aside className="hidden lg:block w-[260px] shrink-0">
            <div className="sticky top-[92px] space-y-5">
                <div className="glass-card home-sidebar-panel home-sidebar-panel-delay-1 p-4">
                    <h4 className="mb-3 text-sm font-bold text-white">🔍 Search</h4>
                    <div className="home-search-input flex items-center gap-2 rounded-2xl px-3 py-3">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search items..."
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/45 outline-none" />
                        {searchQuery && <button onClick={() => setSearchQuery('')} className="text-xs text-white/45 hover:text-white">✕</button>}
                    </div>
                </div>
                <div className="glass-card home-sidebar-panel home-sidebar-panel-delay-2 p-4">
                    <h4 className="mb-3 text-sm font-bold text-white">📂 Categories</h4>
                    <div className="space-y-1">
                        {filterCategories.map((cat) => (
                            <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                                className={`home-category-button w-full text-left rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${activeCategory === cat.value ? 'bg-[#1D9E75]/88 text-white shadow-[0_0_24px_rgba(29,158,117,0.28)] ring-1 ring-[#8EF0CC]/45' : 'text-white/80 hover:text-white'}`}>
                                <span className="flex items-center justify-between gap-3">
                                    <span>{cat.label}</span>
                                    {activeCategory === cat.value && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.7)]" />}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="glass-card home-sidebar-panel home-sidebar-panel-delay-3 p-4">
                    <h4 className="mb-3 text-sm font-bold text-white">📍 Location</h4>
                    <input type="text" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)}
                        placeholder="Search location or pincode..."
                        className="home-search-input w-full rounded-2xl px-3 py-3 text-sm text-white placeholder:text-white/45 outline-none" />
                </div>
            </div>
        </aside>
    );

    return (
        <>
            <Helmet>
                <title>Free Items Near Me in Jhargram & West Bengal | DaanGuru</title>
                <meta name="description" content="Get free donated items near you in Jhargram, Midnapore and West Bengal. Furniture, clothes, books, electronics — all free. AI Doctor finder & Blood Bank. India's free donation platform." />
                <meta name="keywords" content="free items near me India, free products Jhargram, donate old clothes West Bengal, free furniture donation India, AI doctor finder Jhargram, blood donor West Bengal, বিনামূল্যে পণ্য ঝাড়গ্রাম" />
                <meta name="robots" content="index, follow" />
                <meta name="geo.region" content="IN-WB" />
                <meta name="geo.placename" content="Jhargram, West Bengal, India" />
                <meta name="geo.position" content="22.4478;86.9939" />
                <meta name="ICBM" content="22.4478, 86.9939" />
                <meta property="og:title" content="DaanGuru - Free Items, AI Doctor & Blood Bank | Jhargram, West Bengal" />
                <meta property="og:description" content="Donate & claim free items, find nearby doctors with AI, connect with blood donors. Free community platform in West Bengal." />
                <meta property="og:image" content="https://www.daanguru.in/images/logo.png" />
                <meta property="og:url" content="https://www.daanguru.in/" />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="DaanGuru" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="DaanGuru - Free Items, AI Doctor & Blood Bank | Jhargram" />
                <meta name="twitter:description" content="Free platform: donate items, find doctors, connect with blood donors in West Bengal." />
                <meta name="twitter:image" content="https://www.daanguru.in/images/logo.png" />
                <link rel="canonical" href="https://www.daanguru.in/" />
                <link rel="alternate" hreflang="bn" href="https://www.daanguru.in/?lang=bn" />
                <link rel="alternate" hreflang="en" href="https://www.daanguru.in/" />
                <script type="application/ld+json">{JSON.stringify(SCHEMA)}</script>
            </Helmet>

            <HomeScreenModal isOpen={showModal} onClose={() => setShowModal(false)} />

            <div className="pb-4">
                <SupportBanner />

                {/* ── HERO ──────────────────────────────────────────────────── */}
                <div className="mx-4 mt-4 lg:mx-auto lg:max-w-[1200px]">
                    <section className="glass-card home-hero relative overflow-hidden px-5 py-5 sm:px-6 lg:px-7 lg:py-7">
                        {heroEmojis.map((item) => (
                            <span key={`${item.emoji}-${item.top || item.left || item.right}`}
                                className="home-hero-emoji"
                                style={{ top: item.top, left: item.left, right: item.right, animationDuration: item.duration }}
                                aria-hidden="true">{item.emoji}</span>
                        ))}
                        <div className="relative z-10 max-w-2xl">
                            <p className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                                📦 India's Free Donation Platform
                            </p>
                            <h1 className="text-[2rem] font-extrabold leading-tight tracking-tight text-white sm:text-[2.5rem]">
                                Get <span className="text-[#1D9E75]">Free Items</span>{' '}
                                <span className="home-hero-title">Near You</span> — Zero Cost
                            </h1>
                            <p className="mt-2 text-sm font-medium text-[#8EF0CC] italic" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                                বিনামূল্যে পণ্য পান — ঝাড়গ্রাম, মিদনাপুর ও পশ্চিমবঙ্গে
                            </p>
                            <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                                Furniture, clothes, books, electronics — donated by people near you in Jhargram, Midnapore and West Bengal. 100% free, always.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <button onClick={() => document.getElementById('items-section')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#1D9E75] px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_26px_rgba(29,158,117,0.3)] hover:bg-[#17875f] transition-all">
                                    🔍 Browse Free Items <ArrowRight className="h-4 w-4" />
                                </button>
                                <button onClick={() => navigator('/post-item')}
                                    className="glass-surface inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white/80 hover:text-white transition-all">
                                    + Donate an Item
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* ── TICKER ────────────────────────────────────────────────── */}
                <div className="mt-4 overflow-hidden" style={{ background: '#1D9E75' }}>
                    <div className="flex gap-12 py-3 whitespace-nowrap" style={{ animation: 'ticker 22s linear infinite', display: 'inline-flex' }}>
                        {TICKER_ITEMS.map((item, i) => (
                            <span key={i} className="text-xs font-semibold text-white shrink-0">
                                ✦ {item}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── FEATURE BANNERS ───────────────────────────────────────── */}
                <div className="mx-4 mt-4 lg:mx-auto lg:max-w-[1200px]">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* AI Doctor */}
                        <div onClick={() => navigator('/find-doctor')}
                            className="glass-card relative overflow-hidden rounded-2xl px-5 py-4 cursor-pointer group transition-all hover:-translate-y-1"
                            style={{ border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)' }}>
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl"
                                style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
                            <div className="relative z-10 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                                    style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)' }}>🤖</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Free Service</p>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                            style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}>NEW</span>
                                    </div>
                                    <h3 className="text-sm font-extrabold text-white leading-tight mb-1">AI Doctor Finder</h3>
                                    <p className="text-xs text-white/55 leading-relaxed">
                                        Apne symptoms batao — Hindi, Bengali, English mein. Nearby verified doctors milenge with phone & timings.
                                    </p>
                                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:gap-2.5 transition-all">
                                        Abhi Try Karo <ArrowRight className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Blood Bank */}
                        <div onClick={() => navigator('/digital-blood-bank/find')}
                            className="glass-card relative overflow-hidden rounded-2xl px-5 py-4 cursor-pointer group transition-all hover:-translate-y-1"
                            style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)' }}>
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl"
                                style={{ background: 'radial-gradient(circle,#ef4444,transparent)' }} />
                            <div className="relative z-10 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                                    style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>🩸</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs font-bold uppercase tracking-wider text-red-400">Emergency Ready</p>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                            style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>LIVE</span>
                                    </div>
                                    <h3 className="text-sm font-extrabold text-white leading-tight mb-1">Digital Blood Bank</h3>
                                    <p className="text-xs text-white/55 leading-relaxed">
                                        Emergency mein turant blood donors dhundho apne area mein. Free, fast & verified donors network.
                                    </p>
                                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-red-400 group-hover:gap-2.5 transition-all">
                                        Donor Dhundho <ArrowRight className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CATEGORIES ────────────────────────────────────────────── */}
                <div className="mx-4 mt-10 lg:mx-auto lg:max-w-[1200px]">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#1D9E75] mb-2">Browse by Category</p>
                    <h2 className="text-2xl font-extrabold text-white mb-1">What Would You Like?</h2>
                    <p className="text-sm text-white/50 mb-6 max-w-lg">Browse free items by category. Everything is donated by real people near you in West Bengal.</p>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                        {CATEGORIES.map((cat) => (
                            <button key={cat.slug}
                                onClick={() => setActiveCategory(cat.slug)}
                                className="glass-card flex flex-col items-center justify-center rounded-2xl py-4 px-2 text-center transition-all hover:-translate-y-1 group"
                                style={{ border: '1px solid rgba(29,158,117,0.2)' }}>
                                <span className="text-2xl mb-1">{cat.icon}</span>
                                <span className="text-xs font-bold text-white group-hover:text-[#8EF0CC] transition-colors">{cat.name}</span>
                                <span className="text-[10px] text-white/40 mt-0.5">{cat.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── MOBILE SEARCH ─────────────────────────────────────────── */}
                <div className="mx-4 mt-4 lg:hidden">
                    <div className="home-search-input flex items-center gap-2 rounded-2xl px-3.5 py-3">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Kya dhundh rahe ho? Search items..."
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/45 outline-none" />
                        {searchQuery && <button onClick={() => setSearchQuery('')} className="text-xs text-white/45 hover:text-white">✕</button>}
                    </div>
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden" style={{ scrollbarWidth: 'none' }}>
                    {filterCategories.map((cat, index) => (
                        <button key={cat.value} onClick={() => setActiveCategory(cat.value)}
                            className={`home-category-chip shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${activeCategory === cat.value ? 'home-category-chip-active text-white' : 'text-white/78 hover:text-white'}`}
                            style={{ animationDelay: `${index * 70}ms` }}>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* ── ITEMS GRID (with sidebar) ──────────────────────────────── */}
                <div id="items-section" className="mx-auto mt-5 max-w-[1200px] lg:flex lg:gap-6">
                    {sidebar}
                    <div className="flex-1 min-w-0">
                        <div className="mx-4 lg:mx-0 mb-3 flex items-center justify-between">
                            <h3 className="text-base font-bold text-white">Aapke Paas Available 🎁</h3>
                            <span className="text-xs text-white/55 font-medium">{filteredItems.length} items</span>
                        </div>
                        {loading ? (
                            <div className="mx-4 lg:mx-0 mt-8 text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-white/70" />
                                <p className="mt-2 text-sm font-medium text-white/70">Loading items...</p>
                            </div>
                        ) : filteredItems.length > 0 ? (
                            <>
                                <div className="mx-4 lg:mx-0 grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
                                    {paginatedItems.map((item, index) => (
                                        <ItemCard key={item.id} item={item} animationIndex={index} user={user} />
                                    ))}
                                </div>
                                {pageCount > 1 && (
                                    <div className="mx-4 lg:mx-0 mt-5 flex flex-wrap items-center justify-center gap-2">
                                        <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                                            className="glass-surface rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-50">
                                            Previous
                                        </button>
                                        {Array.from({ length: pageCount }, (_, index) => {
                                            const page = index + 1;
                                            return (
                                                <button key={page} onClick={() => setCurrentPage(page)}
                                                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${currentPage === page ? 'bg-[#1D9E75]/80 text-white shadow-[0_0_24px_rgba(29,158,117,0.25)]' : 'glass-surface text-white hover:bg-white/14'}`}>
                                                    {page}
                                                </button>
                                            );
                                        })}
                                        <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))} disabled={currentPage === pageCount}
                                            className="glass-surface rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-50">
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="mx-4 lg:mx-0 mt-8 text-center">
                                <p className="text-3xl">🔍</p>
                                <p className="mt-2 text-sm font-bold text-white">Kuch nahi mila</p>
                                <p className="mt-1 text-xs text-white/55">Try a different search or category</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
                <div className="mx-4 mt-12 lg:mx-auto lg:max-w-[1200px]">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#1D9E75] mb-2">How It Works</p>
                    <h2 className="text-2xl font-extrabold text-white mb-6">Give or Receive in 3 Simple Steps</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {HOW_STEPS.map((step, i) => (
                            <div key={i} className="glass-card rounded-2xl p-6" style={{ border: '1px solid rgba(29,158,117,0.15)' }}>
                                <div className="text-2xl mb-3">{step.icon}</div>
                                <h3 className="text-sm font-extrabold text-white mb-2">{step.title}</h3>
                                <p className="text-xs text-white/50 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CITIES ────────────────────────────────────────────────── */}
                <div className="mx-4 mt-10 lg:mx-auto lg:max-w-[1200px]">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#1D9E75] mb-2">Browse by City</p>
                    <h2 className="text-2xl font-extrabold text-white mb-6">Free Items Near Your City</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {CITIES.map((city) => (
                            <button key={city.slug}
                                onClick={() => setLocationQuery(city.name)}
                                className="glass-card rounded-2xl p-4 text-left transition-all hover:-translate-y-1 group"
                                style={{ border: '1px solid rgba(29,158,117,0.15)' }}>
                                <div className="text-sm font-bold text-white group-hover:text-[#8EF0CC] transition-colors">{city.name}</div>
                                <div className="text-xs font-semibold text-[#1D9E75] mt-1">{city.items}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── DONATE CTA ────────────────────────────────────────────── */}
                <div className="mx-4 mt-8 lg:mx-auto lg:max-w-[1200px]">
                    <div className="rounded-2xl p-8 text-center relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg,#15803D,#1D9E75)' }}>
                        <div className="absolute inset-0 pointer-events-none"
                            style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 120%,rgba(0,0,0,0.2),transparent)' }} />
                        <div className="relative z-10">
                            <h2 className="text-xl font-extrabold text-white mb-2">🎁 Have Something to Donate?</h2>
                            <p className="text-sm text-white/80 mb-6 max-w-md mx-auto leading-relaxed">
                                Your unused items can change someone's life. Post them on Daanguru in 2 minutes — completely free.
                            </p>
                            <button onClick={() => setShowModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-extrabold text-[#15803D] bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl">
                                Post a Free Donation <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── FAQ ───────────────────────────────────────────────────── */}
                <div className="mx-4 mt-12 lg:mx-auto lg:max-w-[1200px]"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2.5rem' }}>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#1D9E75] mb-2">FAQ</p>
                    <h2 className="text-2xl font-extrabold text-white mb-6">Common Questions</h2>
                    <div className="glass-card rounded-2xl px-5 py-2" style={{ border: '1px solid rgba(29,158,117,0.12)' }}>
                        {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
                    </div>
                </div>

                {/* ── SEO CONTENT ───────────────────────────────────────────── */}
                <div className="mx-4 mt-12 lg:mx-auto lg:max-w-[1200px]">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#1D9E75] mb-2">About Free Products on Daanguru</p>
                    <h2 className="text-2xl font-extrabold text-white mb-4">West Bengal's Free Donation Platform</h2>
                    <div className="glass-card rounded-2xl p-6 text-sm text-white/55 leading-8 space-y-4"
                        style={{ border: '1px solid rgba(29,158,117,0.12)' }}>
                        <p>
                            Daanguru is one of India's largest free product donation platforms, with a special focus on <strong className="text-white/80">Jhargram, Midnapore, Kharagpur, Bankura, Purulia</strong> and all of West Bengal. Instead of throwing away usable items, thousands of people list them on Daanguru for others to take for free.
                        </p>
                        <p>
                            Whether you are looking for <strong className="text-white/80">free furniture in Jhargram</strong>, free clothes near Midnapore, free school books in West Bengal, or free electronics near you — Daanguru connects you with donors in your area. The platform is especially popular in rural and semi-urban West Bengal where access to affordable goods is limited.
                        </p>
                        <p className="text-white/70 font-semibold">
                            দান করুন, পান বিনামূল্যে। ঝাড়গ্রাম, মিদনাপুর ও পশ্চিমবঙ্গের মানুষদের জন্য সম্পূর্ণ বিনামূল্যে পণ্য বিনিময়ের প্ল্যাটফর্ম।
                        </p>
                    </div>
                </div>

                {/* ── EXISTING SECTIONS ─────────────────────────────────────── */}
                <TestimonialSection />
                <PartnersSection />
                <CertificatesHomeWidget />
                <BlogWidget limit={3} />
            </div>

            {/* ── FAB ───────────────────────────────────────────────────────── */}
            {!showModal && (
                <button onClick={() => setShowModal(true)}
                    className="fixed bottom-20 right-6 z-50 flex items-center gap-2 rounded-full bg-[#1D9E75] px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_24px_rgba(29,158,117,0.45)] transition-all hover:scale-105 hover:bg-[#17875f] active:scale-95"
                    aria-label="Open modal">
                    <Plus className="h-4 w-4" />
                </button>
            )}

            <style>{`
                @keyframes ticker {
                    from { transform: translateX(0); }
                    to   { transform: translateX(-50%); }
                }
            `}</style>
        </>
    );
}