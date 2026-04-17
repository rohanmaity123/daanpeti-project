import { useState } from 'react';
import { categoryLabels, categoryColors } from '../lib/sample-data';
import { MapPin, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import { supabase } from '../utils/supabaseClient';

export function ItemCard({ item, showStatus = false, animationIndex = 0, className = '', user }) {
  const isClaimed = item?.status === 'claimed' ? true : false;
  const isDonor = item?.user_id === user?.id;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isFeedCard = !showStatus;

  const whatsappUrl = `https://wa.me/${item.whatsapp_number}?text=${encodeURIComponent(
    `Hi! Maine DaanGuru pe "${item.name}" dekha. Kya ye abhi available hai?`
  )}`;

  const handleMarkClaimed = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const handleConfirmClaim = async () => {
    const { error } = await supabase
      .from('donation_items')
      .update({ status: 'claimed' })
      .eq('id', item?.id)
      .select(); // 👈 important for debugging

    if (!error) setConfirmOpen(false);;

  };

  return (
    <>
      <Link
        to={`/items/${item.id}`}
        className={`item-card block overflow-hidden rounded-[28px] transition-all duration-300 group ${showStatus ? 'my-items-card' : 'feed-item-card'} ${isClaimed ? 'opacity-75' : ''
          } ${className}`}
        style={{ animationDelay: `${animationIndex * (showStatus ? 100 : 60)}ms` }}
      >
        {showStatus && (
          <div className={`item-card-accent ${isClaimed ? 'item-card-accent-claimed' : 'item-card-accent-available'}`} />
        )}
        <div className={`overflow-hidden relative ${isFeedCard ? 'aspect-[1.1/1] md:aspect-[1.15/0.9]' : 'h-[180px]'}`}>
          <img
            src={item.image_url || '/placeholder-item.png'}
            alt={item.name}
            className={`h-full w-full object-cover transition-transform duration-300 ${isClaimed ? '' : 'group-hover:scale-105'
              }`}
            loading="lazy"
          />
          {isClaimed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/28 backdrop-blur-[2px]">
              <span className="glass-surface flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-white">
                <CheckCircle className="h-3.5 w-3.5" />
                Claimed
              </span>
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-sm text-white leading-tight line-clamp-2 sm:text-base">
              {item.name}
            </h3>
            <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isFeedCard ? 'border border-white/14 bg-white/10 text-white/88' : categoryColors[item.category]}`}>
              {categoryLabels[item.category]}
            </span>
          </div>
          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed sm:text-sm">
            {item.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-white/55">
            <span className="flex items-center gap-1 text-xs sm:text-sm">
              <MapPin className="h-3 w-3" />
              {item.location.split(',')[0]}
            </span>
            <span className="flex items-center gap-1 text-xs sm:text-sm">
              <Clock className="h-3 w-3" />
              {item.created_at ? new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Unknown'}
            </span>
          </div>
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            {isClaimed ? (
              <span className="glass-surface inline-block rounded-full px-2.5 py-1 text-xs font-bold text-white/75">
                ✅ Kisi ko mil gaya
              </span>
            ) : (
              <span className="feed-free-badge inline-block rounded-full px-2.5 py-1 text-xs font-bold text-white">
                🆓 Muft / FREE
              </span>
            )}
            {showStatus && (
              <span className={`status-badge text-[11px] font-semibold px-3 py-1 rounded-full text-white ${isClaimed ? 'status-badge-claimed' : 'status-badge-available-glow'
                }`}>
                {isClaimed ? 'Claimed' : 'Available'}
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
                className="feed-whatsapp-button flex-1 flex items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold text-white transition-all duration-300 hover:opacity-95"
              >
                <MessageCircle className="h-3 w-3" />
                Contact Donor
              </a>
            )}
            {!isClaimed && isDonor && (
              <button
                onClick={handleMarkClaimed}
                className="my-items-claim-button flex-1 flex items-center justify-center gap-1 rounded-xl py-2.5 text-[11px] font-bold text-white transition-all duration-300 hover:opacity-95"
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
        fullWidth
        maxWidth="xs"
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(5, 10, 20, 0.45)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }
        }}
        PaperProps={{
          className: 'glass-dialog-paper rounded-[38px]',
          style: {
            background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
            backdropFilter: 'blur(22px) saturate(180%)',
            WebkitBackdropFilter: 'blur(22px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.16)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.38)',
            color: 'rgba(255,255,255,0.96)',
            margin: '16px',
            width: 'calc(100% - 32px)',
            maxWidth: '420px'
          }
        }}
      >
        <DialogTitle
          className="px-6 pt-6 text-base text-white"
          sx={{ color: 'rgba(255,255,255,0.98)', fontWeight: 700 }}
        >
          Has this item been picked up?
        </DialogTitle>
        <DialogContent className="max-w-xs rounded-2xl px-6 pb-5">
          <p className="text-sm leading-relaxed text-white/70">
            Kya yeh item kisi ne le liya? Once marked, it will show as claimed.
          </p>
        </DialogContent>
        <DialogActions className="flex flex-col gap-3 px-6 pb-6 sm:flex-row sm:gap-2">
          <button
            onClick={() => setConfirmOpen(false)}
            className="w-full rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClaim}
            className="my-items-claim-button w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 sm:flex-1"
          >
            Yes, mark as claimed
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
}
