import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { myGivenItems, myReceivedItems } from '@/lib/sample-data';
import { ItemCard } from '@/components/ItemCard';
import { Gift, HandHeart } from 'lucide-react';

export const Route = createFileRoute('/my-items')({
  head: () => ({
    meta: [
      { title: 'My Items — DaanPeti' },
    ],
  }),
  component: MyItemsPage,
});

function MyItemsPage() {
  const [activeTab, setActiveTab] = useState<'gave' | 'received'>('gave');

  const items = activeTab === 'gave' ? myGivenItems : myReceivedItems;

  return (
    <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
      <h1 className="text-xl font-extrabold text-foreground">Mera Samaan 📦</h1>
      <p className="text-sm text-muted-foreground mt-0.5">Your donation history</p>

      {/* Tabs */}
      <div className="mt-4 flex rounded-xl bg-muted p-1">
        <button
          onClick={() => setActiveTab('gave')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition-colors ${
            activeTab === 'gave'
              ? 'bg-card card-shadow text-foreground'
              : 'text-muted-foreground'
          }`}
        >
          <Gift className="h-4 w-4" />
          I Gave ({myGivenItems.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-bold transition-colors ${
            activeTab === 'received'
              ? 'bg-card card-shadow text-foreground'
              : 'text-muted-foreground'
          }`}
        >
          <HandHeart className="h-4 w-4" />
          I Received ({myReceivedItems.length})
        </button>
      </div>

      {/* Items */}
      {items.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} showStatus />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center text-center">
          <p className="text-3xl">{activeTab === 'gave' ? '🎁' : '📭'}</p>
          <p className="mt-3 text-sm font-bold text-foreground">
            {activeTab === 'gave' ? 'Abhi kuch nahi diya' : 'Abhi kuch nahi liya'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {activeTab === 'gave'
              ? 'Apna pehla item donate karein!'
              : 'Browse items on the home feed'}
          </p>
          <Link
            to={activeTab === 'gave' ? '/post-item' : '/'}
            className="mt-4 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {activeTab === 'gave' ? '+ Donate Item' : 'Browse Items'}
          </Link>
        </div>
      )}
    </div>
  );
}
