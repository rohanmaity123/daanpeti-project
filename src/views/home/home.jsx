import { useEffect, useMemo, useState } from 'react';
import { filterCategories } from '../../lib/sample-data';
import { ItemCard } from '../../components/ItemCard';
import { SupportBanner } from '../../components/SupportBanner';
import { ArrowRight, Search } from 'lucide-react';
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
import { AppRegistration } from '@mui/icons-material';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const heroEmojis = [
    { emoji: '📚', top: '12%', left: '10%', duration: '5.5s' },
    { emoji: '👕', top: '68%', left: '12%', duration: '7.2s' },
    { emoji: '🪑', top: '22%', right: '16%', duration: '6.3s' },
    { emoji: '🧸', top: '65%', right: '12%', duration: '8.1s' },
    { emoji: '📦', top: '40%', right: '30%', duration: '6.8s' },
];

export default function HomePage() {
    const { user } = useAuth();
    const navigator = useNavigate()
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

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery, locationQuery, claimedMap]);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);

            const { data, error } = await supabase
                .from("donation_items")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error(error.message);
            } else {
                setItems(data);
            }
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
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search items..."
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/45 outline-none"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-xs text-white/45 hover:text-white">✕</button>
                        )}
                    </div>
                </div>

                <div className="glass-card home-sidebar-panel home-sidebar-panel-delay-2 p-4">
                    <h4 className="mb-3 text-sm font-bold text-white">📂 Categories</h4>
                    <div className="space-y-1">
                        {filterCategories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setActiveCategory(cat.value)}
                                className={`home-category-button w-full text-left rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${activeCategory === cat.value
                                    ? 'bg-[#1D9E75]/88 text-white shadow-[0_0_24px_rgba(29,158,117,0.28)] ring-1 ring-[#8EF0CC]/45'
                                    : 'text-white/80 hover:text-white'
                                    }`}
                            >
                                <span className="flex items-center justify-between gap-3">
                                    <span>{cat.label}</span>
                                    {activeCategory === cat.value && (
                                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.7)]" />
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card home-sidebar-panel home-sidebar-panel-delay-3 p-4">
                    <h4 className="mb-3 text-sm font-bold text-white">📍 Location</h4>
                    <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        placeholder="Search location or pincode..."
                        className="home-search-input w-full rounded-2xl px-3 py-3 text-sm text-white placeholder:text-white/45 outline-none"
                    />
                </div>
            </div>
        </aside>
    );

    return (
        <>
            <Helmet>
                <title>DaanGuru - Free Donations, AI Doctor Finder & Blood Bank | Jhargram, West Bengal</title>
                <meta name="description" content="DaanGuru: Donate & claim free items, find nearby doctors with AI symptom checker, and connect with blood donors in Jhargram, West Bengal. Free community platform." />
                <meta name="keywords" content="donate items free, AI doctor finder Jhargram, blood donation West Bengal, free items near me, doctor near me Jhargram, blood donor Jhargram, community help India" />
                <meta property="og:title" content="DaanGuru - Free Donations, AI Doctor & Blood Bank | Jhargram" />
                <meta property="og:description" content="Donate items, find AI-matched nearby doctors, and connect with blood donors. Free community platform in Jhargram, West Bengal." />
                <meta property="og:image" content="https://www.daanguru.in/images/logo.png" />
                <meta property="og:url" content="https://www.daanguru.in/" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="DaanGuru - AI Doctor Finder & Blood Bank | Jhargram" />
                <meta name="twitter:description" content="Free platform: donate items, find doctors, connect with blood donors in West Bengal." />
                <meta name="twitter:image" content="https://www.daanguru.in/images/logo.png" />
                <link rel="canonical" href="https://www.daanguru.in/" />
                {/* Structured data for Google */}
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": "DaanGuru",
                    "url": "https://www.daanguru.in",
                    "description": "Free community platform for donations, AI doctor finder, and blood bank in Jhargram, West Bengal",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": "https://www.daanguru.in/?search={search_term_string}",
                        "query-input": "required name=search_term_string"
                    }
                })}</script>
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": "DaanGuru",
                    "url": "https://www.daanguru.in",
                    "areaServed": ["Jhargram", "West Bengal", "India"],
                    "serviceType": ["Donation Platform", "AI Doctor Finder", "Blood Bank", "Community Help"],
                    "description": "Free community platform helping people donate items, find nearby doctors, and connect with blood donors"
                })}</script>
            </Helmet>
            <HomeScreenModal isOpen={showModal} onClose={() => setShowModal(false)} />
            <div className="pb-4">
                <SupportBanner />
                {/* ── FEATURE BANNERS ─────────────────────────────────────── */}
                <div className="mx-4 mt-4 lg:mx-auto lg:max-w-[1200px]">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                        {/* AI Doctor Banner */}
                        <div
                            onClick={() => navigator('/find-doctor')}
                            className="glass-card relative overflow-hidden rounded-2xl px-5 py-4 cursor-pointer group transition-all hover:-translate-y-1"
                            style={{ border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)' }}
                        >
                            {/* Glow blob */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl"
                                style={{ background: 'radial-gradient(circle,#6366f1,transparent)' }} />
                            <div className="relative z-10 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                                    style={{ background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)' }}>
                                    🤖
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Free Service</p>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                            style={{ background: 'rgba(99,102,241,0.25)', color: '#a5b4fc' }}>NEW</span>
                                    </div>
                                    <h3 className="text-sm font-extrabold text-white leading-tight mb-1">
                                        AI Doctor Finder
                                    </h3>
                                    <p className="text-xs text-white/55 leading-relaxed">
                                        Apne symptoms batao — Hindi, Bengali, English mein. Nearby verified doctors milenge with phone & timings.
                                    </p>
                                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:gap-2.5 transition-all">
                                        Abhi Try Karo <ArrowRight className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Blood Donation Banner */}
                        <div
                            onClick={() => navigator('/digital-blood-bank/find')}
                            className="glass-card relative overflow-hidden rounded-2xl px-5 py-4 cursor-pointer group transition-all hover:-translate-y-1"
                            style={{ border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)' }}
                        >
                            {/* Glow blob */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl"
                                style={{ background: 'radial-gradient(circle,#ef4444,transparent)' }} />
                            <div className="relative z-10 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                                    style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
                                    🩸
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-xs font-bold uppercase tracking-wider text-red-400">Emergency Ready</p>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                                            style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>LIVE</span>
                                    </div>
                                    <h3 className="text-sm font-extrabold text-white leading-tight mb-1">
                                        Digital Blood Bank
                                    </h3>
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
                <div className="mx-4 mt-4 lg:mx-auto lg:max-w-[1200px]">
                    <section className="glass-card home-hero relative overflow-hidden px-5 py-5 sm:px-6 lg:px-7 lg:py-7">
                        {heroEmojis.map((item) => (
                            <span
                                key={`${item.emoji}-${item.top || item.left || item.right}`}
                                className="home-hero-emoji"
                                style={{ top: item.top, left: item.left, right: item.right, animationDuration: item.duration }}
                                aria-hidden="true"
                            >
                                {item.emoji}
                            </span>
                        ))}

                        <div className="relative z-10 max-w-2xl">
                            <p className="mb-3 inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                                Community Giving, Nearby
                            </p>
                            <h2 className="text-[2rem] font-extrabold leading-tight tracking-tight text-white sm:text-[2.5rem]">
                                <span className="home-hero-title">Apna Samaan</span>{' '}
                                <span className="text-[#1D9E75]">Baato!</span>
                            </h2>
                            <p className="mt-2 text-sm font-medium text-[#8EF0CC] italic">
                                “दातव्यमिति यद्दानं दीयतेऽनुपकारिणे।” ~ Bhagavad Gita
                            </p>
                            <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                                Ghar ka extra samaan kisi aur ke kaam laao. Nearby logon se connect karo, bina kisi fee ke.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25d366cc]/80 px-4 py-2 text-sm font-bold text-white shadow-[0_0_26px_rgba(29,158,117,0.25)]"
                                    onClick={() => navigator('/find-doctor')}
                                >
                                    Free helth consultation with verified doctors
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                                <div className="glass-surface rounded-full px-4 py-2 text-sm font-semibold text-white/80">
                                    WhatsApp direct connect
                                </div>
                            </div>
                            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25d366cc]/80 px-4 py-2 text-sm font-bold text-white shadow-[0_0_26px_rgba(29,158,117,0.25)]"
                                onClick={() => navigator('/digital-blood-bank/find')}
                            >
                                Digital Blood Bank
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </section>
                </div>

                <div className="mx-4 mt-4 lg:hidden">
                    <div className="home-search-input flex items-center gap-2 rounded-2xl px-3.5 py-3">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Kya dhundh rahe ho? Search items..."
                            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/45 outline-none"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-xs text-white/45 hover:text-white">✕</button>
                        )}
                    </div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden" style={{ scrollbarWidth: 'none' }}>
                    {filterCategories.map((cat, index) => (
                        <button
                            key={cat.value}
                            onClick={() => setActiveCategory(cat.value)}
                            className={`home-category-chip shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${activeCategory === cat.value
                                ? 'home-category-chip-active text-white'
                                : 'text-white/78 hover:text-white'
                                }`}
                            style={{ animationDelay: `${index * 70}ms` }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="mx-auto mt-5 max-w-[1200px] lg:flex lg:gap-6">
                    {sidebar}

                    <div className="flex-1 min-w-0">
                        <div className="mx-4 lg:mx-0 mb-3 flex items-center justify-between">
                            <h3 className="text-base font-bold text-white">
                                Aapke Paas Available 🎁
                            </h3>
                            <span className="text-xs text-white/55 font-medium">
                                {filteredItems.length} items
                            </span>
                        </div>
                        {
                            loading ? (
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
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="glass-surface rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            {Array.from({ length: pageCount }, (_, index) => {
                                                const page = index + 1;
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${currentPage === page ? 'bg-[#1D9E75]/80 text-white shadow-[0_0_24px_rgba(29,158,117,0.25)]' : 'glass-surface text-white hover:bg-white/14'}`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
                                                disabled={currentPage === pageCount}
                                                className="glass-surface rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
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


                {/* Testimonials */}
                <TestimonialSection />
                {/* Our Partners */}
                <PartnersSection />

                <CertificatesHomeWidget />
                <BlogWidget limit={3} />

            </div>
            {!showModal && <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-20 right-6 z-50 flex items-center gap-2 rounded-full bg-[#1D9E75] px-5 py-3.5 text-sm font-bold text-white shadow-[0_4px_24px_rgba(29,158,117,0.45)] transition-all hover:scale-105 hover:bg-[#17875f] active:scale-95"
                aria-label="Open modal"
            >
                <Plus className="h-4 w-4" />
            </button>}
        </>
    );
}
