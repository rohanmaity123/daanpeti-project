import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { sampleItems, filterCategories } from '@/lib/sample-data';
import type { Category } from '@/lib/sample-data';
import { ItemCard } from '@/components/ItemCard';
import { SupportBanner } from '@/components/SupportBanner';
import { Search } from 'lucide-react';
import { useItemsClaimed, isItemClaimed } from '@/lib/items-store';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'DaanPeti — Muft Mein Do, Muft Mein Lo' },
      { name: 'description', content: 'Donate items you no longer need, completely free. Find free items near you in India.' },
      { property: 'og:title', content: 'DaanPeti — Free Item Donation App' },
      { property: 'og:description', content: 'Give away items for free. Find free items near you.' },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const claimedMap = useItemsClaimed();

  const filteredItems = useMemo(() => {
    return sampleItems.filter((item) => {
      if (isItemClaimed(item.id)) return false; // hide claimed from feed
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch = searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, claimedMap]);

  const sidebar = (
    <aside className="hidden lg:block w-[280px] shrink-0">
      <div className="sticky top-[73px] space-y-5">
        {/* Search */}
        <div className="rounded-2xl bg-card card-shadow p-4">
          <h4 className="text-sm font-bold text-foreground mb-2">🔍 Search</h4>
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
            )}
          </div>
        </div>

        {/* Category filters */}
        <div className="rounded-2xl bg-card card-shadow p-4">
          <h4 className="text-sm font-bold text-foreground mb-2">📂 Categories</h4>
          <div className="space-y-1">
            {filterCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`w-full text-left rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                  activeCategory === cat.value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-secondary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location filter placeholder */}
        <div className="rounded-2xl bg-card card-shadow p-4">
          <h4 className="text-sm font-bold text-foreground mb-2">📍 Location</h4>
          <input
            type="text"
            placeholder="Enter pincode..."
            className="w-full rounded-xl bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      </div>
    </aside>
  );

  return (
    <div className="pb-4">
      {/* Support banner */}
      <SupportBanner />

      {/* Hero banner */}
      <div className="mx-4 lg:mx-0 mt-4 rounded-2xl bg-primary p-5 lg:p-8 text-primary-foreground">
        <h2 className="text-xl lg:text-2xl font-extrabold leading-tight">
          Apna purana samaan,
          <br />
          kisi ka naya khazana ✨
        </h2>
        <p className="mt-1.5 text-sm lg:text-base opacity-90 font-medium">
          Your old stuff is someone's new treasure
        </p>
      </div>

      {/* Mobile search bar */}
      <div className="mx-4 mt-4 lg:hidden">
        <div className="flex items-center gap-2 rounded-xl bg-card card-shadow px-3.5 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Kya dhundh rahe ho? Search items..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          )}
        </div>
      </div>

      {/* Mobile category chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden" style={{ scrollbarWidth: 'none' }}>
        {filterCategories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === cat.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-card card-shadow text-foreground hover:bg-secondary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Desktop: sidebar + grid layout */}
      <div className="mt-5 lg:flex lg:gap-6">
        {sidebar}

        <div className="flex-1 min-w-0">
          {/* Section heading */}
          <div className="mx-4 lg:mx-0 mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">
              Aapke Paas Available 🎁
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              {filteredItems.length} items
            </span>
          </div>

          {/* Items grid */}
          {filteredItems.length > 0 ? (
            <div className="mx-4 lg:mx-0 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mx-4 lg:mx-0 mt-8 text-center">
              <p className="text-3xl">🔍</p>
              <p className="mt-2 text-sm font-bold text-foreground">Kuch nahi mila</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a different search or category</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
