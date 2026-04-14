import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { myGivenItems, myReceivedItems } from '../../lib/sample-data';
import { ItemCard } from '../../components/ItemCard';
import { ArrowUpRight, Gift, HandHeart, ShoppingBasket } from 'lucide-react';
import { isItemClaimed, useItemsClaimed } from '../../lib/items-store';

export default function MyItemsPage() {
    const [activeTab, setActiveTab] = useState('gave');
    const [displayCount, setDisplayCount] = useState(0);
    useItemsClaimed();

    const items = activeTab === 'gave' ? myGivenItems : myReceivedItems;
    const helpedCount = myGivenItems.filter((item) => isItemClaimed(item.id)).length;

    useEffect(() => {
        let frameId = 0;
        const start = performance.now();
        const duration = 1000;

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setDisplayCount(Math.round(helpedCount * progress));

            if (progress < 1) {
                frameId = window.requestAnimationFrame(tick);
            }
        };

        frameId = window.requestAnimationFrame(tick);
        return () => window.cancelAnimationFrame(frameId);
    }, [helpedCount]);

    const tabs = [
        {
            id: 'gave',
            label: 'Maine Diya',
            icon: Gift,
            count: myGivenItems.length,
            description: 'Jo cheezein aapne donate ki hain',
        },
        {
            id: 'received',
            label: 'Maine Liya',
            icon: HandHeart,
            count: myReceivedItems.length,
            description: 'Jo cheezein aapko mili hain',
        },
    ];

    return (
        <div className="gradient-page my-items-shell px-4 pb-28 pt-5 lg:px-6 lg:pb-10">
            <div className="mx-auto max-w-[1200px]">
                <section className="my-items-header animate-[fadeUpBlur_0.5s_ease_forwards]">
                    <h1 className="text-[28px] font-extrabold text-white">Mera Samaan 📦</h1>
                    <div className="my-items-stats-card mt-4 flex flex-col gap-4 rounded-[24px] px-4 py-4 sm:px-5 sm:py-5 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8EF0CC]">Impact</p>
                            <p className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                                Aapne <span className="tabular-nums">{displayCount}</span> logo ki madad ki
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                            <div className="my-items-mini-stat">
                                <span className="block text-[11px] uppercase tracking-[0.14em] text-white/50">Diye</span>
                                <span className="mt-1 block text-lg font-extrabold text-white">{myGivenItems.length}</span>
                            </div>
                            <div className="my-items-mini-stat">
                                <span className="block text-[11px] uppercase tracking-[0.14em] text-white/50">Liye</span>
                                <span className="mt-1 block text-lg font-extrabold text-white">{myReceivedItems.length}</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-5">
                    <div className="my-items-tabs relative grid grid-cols-2 rounded-2xl p-1">
                        <span
                            className="my-items-tab-indicator"
                            style={{ transform: `translateX(${activeTab === 'gave' ? '0%' : '100%'})` }}
                            aria-hidden="true"
                        />
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative z-10 flex flex-1 items-center justify-center gap-2 rounded-[14px] px-3 py-3 text-sm font-bold transition-colors ${isActive ? 'text-white' : 'text-white/50'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="truncate">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-5">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                            <h2 className="text-2xl font-extrabold text-white">
                                {activeTab === 'gave' ? 'Aapke donated items' : 'Aapke claimed items'}
                            </h2>
                            <p className="mt-1 text-sm text-white/60">
                                {activeTab === 'gave'
                                    ? 'Available aur claimed dono items ke saath realtime status.'
                                    : 'Jo items aap tak pahunch chuke hain unka quick view.'}
                            </p>
                        </div>
                        <div className="glass-surface inline-flex max-w-full rounded-full px-4 py-2 text-sm font-semibold text-white/80">
                            {items.length} total items
                        </div>
                    </div>

                    <div key={activeTab} className="tab-content-fade">
                        {items.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                                {items.map((item, index) => (
                                    <ItemCard key={item.id} item={item} showStatus animationIndex={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card mt-2 flex min-h-[340px] flex-col items-center justify-center px-6 text-center">
                                <div className="animate-[float_3.4s_ease-in-out_infinite] text-[80px] leading-none">📦</div>
                                <p className="mt-5 text-2xl font-extrabold text-white">Abhi koi item nahi hai</p>
                                <p className="mt-2 text-sm text-white/65">Kuch donate karo!</p>
                                <Link
                                    to="/post-item"
                                    className="glass-surface mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#1D9E75]/75 px-5 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(29,158,117,0.24)] transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    Post Item
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                                <div className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/55">
                                    <ShoppingBasket className="h-4 w-4" />
                                    Post Item button se shuru karo
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
