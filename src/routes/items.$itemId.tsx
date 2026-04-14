import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { sampleItems, categoryLabels, categoryColors } from '@/lib/sample-data';
import { MapPin, Clock, ArrowLeft, MessageCircle, CheckCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useItemsClaimed, isItemClaimed, markAsClaimed, isMyItem } from '@/lib/items-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export const Route = createFileRoute('/items/$itemId')({
  head: () => ({
    meta: [
      { title: 'Item Detail — DaanPeti' },
      { name: 'description', content: 'View item details and contact the donor on WhatsApp.' },
    ],
  }),
  component: ItemDetailPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <p className="text-lg font-bold text-foreground">Item nahi mila 😔</p>
        <Link to="/" className="mt-3 inline-block text-sm text-primary font-semibold">← Back to Home</Link>
      </div>
    </div>
  ),
});

function ItemDetailPage() {
  const { itemId } = Route.useParams();
  const item = sampleItems.find((i) => i.id === itemId);
  const claimedMap = useItemsClaimed();
  const isClaimed = item ? isItemClaimed(item.id) : false;
  const isDonor = item ? isMyItem(item.id) : false;
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">Item nahi mila 😔</p>
          <Link to="/" className="mt-3 inline-block text-sm text-primary font-semibold">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${item.whatsappNumber}?text=${encodeURIComponent(
    `Hi! Maine DaanPeti pe "${item.name}" dekha. Kya ye abhi available hai?`
  )}`;

  const handleConfirmClaim = () => {
    markAsClaimed(item.id);
    setConfirmOpen(false);
  };

  const renderCTA = () => {
    if (isClaimed) {
      return (
        <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-muted py-3.5 text-sm font-bold text-muted-foreground">
          ✅ Yeh item kisi ko mil chuka hai — Claimed
        </div>
      );
    }
    return (
      <div className="flex gap-3 w-full">
        {!isDonor && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl whatsapp-gradient py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-5 w-5" />
            Contact Donor
          </a>
        )}
        {isDonor && (
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <CheckCircle className="h-5 w-5" />
            Mark as Claimed
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="pb-24 lg:pb-8">
      {/* Back button */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border lg:static lg:bg-transparent lg:border-0">
        <div className="mx-auto max-w-3xl flex items-center px-4 py-3">
          <Link to="/" className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl lg:mt-4 lg:flex lg:gap-8">
        {/* Image */}
        <div className="aspect-square lg:aspect-auto lg:w-1/2 lg:h-[400px] lg:rounded-2xl overflow-hidden lg:shrink-0">
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        </div>

        {/* Details */}
        <div className="mx-4 lg:mx-0 mt-4 lg:mt-0 space-y-4 flex-1">
          <div>
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[item.category]}`}>
              {categoryLabels[item.category]}
            </span>
            <h1 className="mt-2 text-xl lg:text-2xl font-extrabold text-foreground">{item.name}</h1>
            <span className="inline-block mt-1.5 text-xs font-bold text-primary bg-secondary px-2.5 py-1 rounded-full">
              🆓 Bilkul FREE
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {item.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {item.timePosted}
            </span>
          </div>

          <div>
            <h2 className="text-sm font-bold text-foreground mb-1">Description</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
          </div>

          <div className="rounded-xl bg-cream p-3">
            <p className="text-xs text-muted-foreground font-medium">Donated by</p>
            <p className="text-sm font-bold text-foreground">{item.donorName}</p>
            <p className="text-xs text-muted-foreground">📍 {item.location} • {item.pincode}</p>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:block pt-2">
            {renderCTA()}
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-16 left-0 right-0 z-40 p-4 bg-card/80 backdrop-blur-lg border-t border-border lg:hidden">
        <div className="mx-auto max-w-lg">
          {renderCTA()}
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base">Has this item been picked up?</DialogTitle>
            <DialogDescription className="text-sm">
              Kya yeh item kisi ne le liya? Once marked, it will show as claimed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <button
              onClick={() => setConfirmOpen(false)}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClaim}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Yes, mark as claimed
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
