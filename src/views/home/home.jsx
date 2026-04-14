import { useEffect, useMemo, useState } from 'react';
import { sampleItems, filterCategories } from '../../lib/sample-data';
import { ItemCard } from '../../components/ItemCard';
import { SupportBanner } from '../../components/SupportBanner';
import { ArrowRight, Search } from 'lucide-react';
import { useItemsClaimed, isItemClaimed } from '../../lib/items-store';

const heroEmojis = [
    { emoji: '📚', top: '12%', left: '10%', duration: '5.5s' },
    { emoji: '👕', top: '68%', left: '12%', duration: '7.2s' },
    { emoji: '🪑', top: '22%', right: '16%', duration: '6.3s' },
    { emoji: '🧸', top: '65%', right: '12%', duration: '8.1s' },
    { emoji: '📦', top: '40%', right: '30%', duration: '6.8s' },
];

export default function HomePage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const claimedMap = useItemsClaimed();

    const filteredItems = useMemo(() => {
        return sampleItems.filter((item) => {
            if (claimedMap[item.id] || isItemClaimed(item.id)) return false;
            const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
            const matchesSearch = searchQuery === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.location.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery, claimedMap]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;
    const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery, claimedMap]);

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
                        placeholder="Enter pincode..."
                        className="home-search-input w-full rounded-2xl px-3 py-3 text-sm text-white placeholder:text-white/45 outline-none"
                    />
                </div>
            </div>
        </aside>
    );

    return (
        <div className="pb-4">
            <SupportBanner />

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
                        <p className="mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                            Ghar ka extra samaan kisi aur ke kaam laao. Nearby logon se connect karo, bina kisi fee ke.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <div className="glass-surface rounded-full px-4 py-2 text-sm font-semibold text-white/80">
                                Free forever
                            </div>
                            <div className="glass-surface rounded-full px-4 py-2 text-sm font-semibold text-white/80">
                                WhatsApp direct connect
                            </div>
                        </div>
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#1D9E75]/80 px-4 py-2 text-sm font-bold text-white shadow-[0_0_26px_rgba(29,158,117,0.25)]">
                            Explore items
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

                    {filteredItems.length > 0 ? (
                        <>
                            <div className="mx-4 lg:mx-0 grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
                                {paginatedItems.map((item, index) => (
                                    <ItemCard key={item.id} item={item} animationIndex={index} />
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
        </div>
    );
}
