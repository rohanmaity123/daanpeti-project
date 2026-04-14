import { useState } from 'react';
import { categoryLabels, categoryColors } from '../lib/sample-data';
import { MapPin, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { isItemClaimed, markAsClaimed, isMyItem } from '../lib/items-store';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';

export function ItemCard({ item, showStatus = false }) {
  const isClaimed = isItemClaimed(item.id);
  const isDonor = isMyItem(item.id);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${item.whatsappNumber}?text=${encodeURIComponent(
    `Hi! Maine DaanPeti pe "${item.name}" dekha. Kya ye abhi available hai?`
  )}`;

  const handleMarkClaimed = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmClaim = () => {
    markAsClaimed(item.id);
    setConfirmOpen(false);
  };

  return (
    <>
      <Link
        to={`/items/${item.id}`}
        className={`block rounded-2xl bg-card card-shadow hover:card-shadow-hover transition-all duration-200 overflow-hidden group lg:hover:scale-[1.02] ${isClaimed ? 'opacity-60 grayscale-[40%]' : ''
          }`}
      >
        <div className="aspect-[4/3] lg:h-[250px] lg:aspect-auto overflow-hidden relative">
          <img
            src={item.image}
            alt={item.name}
            className={`h-full w-full object-cover transition-transform duration-300 ${isClaimed ? '' : 'group-hover:scale-105'
              }`}
            loading="lazy"
          />
          {isClaimed && (
            <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
              <span className="flex items-center gap-1 bg-foreground/80 text-background text-xs font-bold px-3 py-1.5 rounded-full">
                <CheckCircle className="h-3.5 w-3.5" />
                Claimed
              </span>
            </div>
          )}
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">
              {item.name}
            </h3>
            <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${categoryColors[item.category]}`}>
              {categoryLabels[item.category]}
            </span>
          </div>
          <p className="hidden lg:block text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.description}
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1 text-xs">
              <MapPin className="h-3 w-3" />
              {item.location.split(',')[0]}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {item.timePosted}
            </span>
          </div>
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            {isClaimed ? (
              <span className="inline-block text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                ✅ Kisi ko mil gaya
              </span>
            ) : (
              <span className="inline-block text-xs font-bold text-primary bg-secondary px-2.5 py-1 rounded-full">
                🆓 Muft / FREE
              </span>
            )}
            {showStatus && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isClaimed ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'
                }`}>
                {isClaimed ? 'Done' : 'Active'}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-1 flex gap-2">
            {!isClaimed && !isDonor && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg whatsapp-gradient py-2 text-[11px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-3 w-3" />
                Contact Donor
              </a>
            )}
            {!isClaimed && isDonor && (
              <button
                onClick={handleMarkClaimed}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary py-2 text-[11px] font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <CheckCircle className="h-3 w-3" />
                Mark as Claimed
              </button>
            )}
          </div>
        </div>
      </Link>

      {/* Confirm dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          className: 'rounded-2xl',
          style: { boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }
        }}
      >
        <DialogTitle className="text-lg font-bold text-foreground pb-2">Has this item been picked up?</DialogTitle>
        <DialogContent className="pt-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kya yeh item kisi ne le liya? Once marked, it will show as claimed.
          </p>
        </DialogContent>
        <DialogActions className="gap-2 p-4 pt-0">
          <button
            onClick={() => setConfirmOpen(false)}
            className="flex-1 rounded-xl border border-border py-2.5 px-4 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClaim}
            className="flex-1 rounded-xl bg-primary py-2.5 px-4 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Yes, mark as claimed
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}
