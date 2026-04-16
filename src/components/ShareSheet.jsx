import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Link2, Check, Share2,
  MessageCircle
} from 'lucide-react';
import { Instagram } from '@mui/icons-material';
import { Facebook } from '@mui/icons-material';
import { Twitter } from '@mui/icons-material';
import { LinkedIn } from '@mui/icons-material';

/* ── helpers ─────────────────────────────────────── */
const buildShareUrl = (item) => {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/items/${item.id}`;
};

const buildShareText = (item) =>
  `🎁 "${item.name}" is available FREE on DaanPeti!\n📍 ${item.location} • ${item.pincode}\n👤 Donated by ${item.donor_name}\n\nKisi ko chahiye? DaanPeti pe dekho 👇`;

/* ── Story canvas generator ──────────────────────── */
const generateStoryCanvas = (item) =>
  new Promise((resolve) => {
    const W = 1080, H = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    /* gradient bg */
    const grd = ctx.createLinearGradient(0, 0, W, H);
    grd.addColorStop(0, '#0f4c35');
    grd.addColorStop(0.5, '#1a6b4a');
    grd.addColorStop(1, '#0d3d5c');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    /* brand header */
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    roundRect(ctx, 60, 60, W - 120, 110, 28); ctx.fill();
    ctx.fillStyle = '#1d9e75';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText('💚 DaanPeti', 100, 130);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '32px sans-serif';
    ctx.fillText('Muft mein do, muft mein lo', 100, 168);

    /* item image (if available) */
    const drawRest = () => {
      /* FREE badge */
      ctx.fillStyle = 'rgba(29,158,117,0.85)';
      roundRect(ctx, 60, 220, 230, 72, 36); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 38px sans-serif';
      ctx.fillText('🆓  BILKUL FREE', 90, 268);

      /* item name */
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 76px sans-serif';
      wrapText(ctx, item.name, 60, 400, W - 120, 88);

      /* donor card */
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      roundRect(ctx, 60, H - 520, W - 120, 240, 28); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '34px sans-serif';
      ctx.fillText('Donated by', 100, H - 455);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 52px sans-serif';
      ctx.fillText(item.donor_name, 100, H - 390);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '36px sans-serif';
      ctx.fillText(`📍 ${item.location} • ${item.pincode}`, 100, H - 330);

      /* CTA footer */
      ctx.fillStyle = '#1d9e75';
      ctx.fillRect(0, H - 240, W, 240);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 52px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('daanpeti.netlify.app', W / 2, H - 110);
      ctx.font = '36px sans-serif'; ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Claim this item for free →', W / 2, H - 55);
      ctx.textAlign = 'left';

      canvas.toBlob((blob) => resolve(blob), 'image/png');
    };

    if (item.image_url) {
      const img = new Image(); img.crossOrigin = 'anonymous';
      img.onload = () => {
        const imgH = 680, imgY = 820;
        ctx.save();
        roundRect(ctx, 60, imgY, W - 120, imgH, 32); ctx.clip();
        /* letterbox */
        const scale = Math.max((W - 120) / img.width, imgH / img.height);
        const iw = img.width * scale, ih = img.height * scale;
        ctx.drawImage(img, 60 + ((W - 120) - iw) / 2, imgY + (imgH - ih) / 2, iw, ih);
        ctx.restore();
        /* dim overlay */
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        roundRect(ctx, 60, imgY, W - 120, imgH, 32); ctx.fill();
        drawRest();
      };
      img.onerror = drawRest;
      img.src = item.image_url;
    } else { drawRest(); }
  });

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(' '); let line = '';
  for (let n = 0; n < words.length; n++) {
    const test = line + words[n] + ' ';
    if (ctx.measureText(test).width > maxW && n > 0) {
      ctx.fillText(line, x, y); line = words[n] + ' '; y += lineH;
    } else { line = test; }
  }
  ctx.fillText(line, x, y);
}

/* ── Main component ──────────────────────────────── */
export default function ShareSheet({ item, open, onClose }) {
  const [copied, setCopied] = useState(false);
  const [storyState, setStoryState] = useState('idle'); // idle | generating | done | error
  const sheetRef = useRef(null);
  const url = buildShareUrl(item);
  const text = buildShareText(item);

  /* close on outside tap */
  useEffect(() => {
    const handler = (e) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const shareVia = (platform) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    const links = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      instagram: null, // handled separately
    };
    if (links[platform]) window.open(links[platform], '_blank', 'noopener,noreferrer');
  };

  const handleInstagramStory = async () => {
    setStoryState('generating');
    try {
      const blob = await generateStoryCanvas(item);
      const file = new File([blob], 'daanpeti-story.png', { type: 'image/png' });

      /* Web Share API (mobile) */
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'DaanPeti Story', text });
        setStoryState('done');
        return;
      }

      /* Desktop fallback — download image */
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl; a.download = 'daanpeti-story.png'; a.click();
      URL.revokeObjectURL(blobUrl);

      /* open instagram.com after short delay */
      setTimeout(() => window.open('https://www.instagram.com/', '_blank', 'noopener'), 600);
      setStoryState('done');
    } catch (err) {
      console.error(err);
      setStoryState('error');
    }
    setTimeout(() => setStoryState('idle'), 3000);
  };

  /* ── Primary share actions ── */
  const primaryActions = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'rgba(37,211,102,0.18)',
      border: 'rgba(37,211,102,0.35)',
      text: '#25d366',
      onClick: () => shareVia('whatsapp'),
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: <Instagram className="h-5 w-5" />,
      color: 'rgba(214,68,155,0.18)',
      border: 'rgba(214,68,155,0.35)',
      text: '#d6449b',
      onClick: () => shareVia('instagram'),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      color: 'rgba(66,103,178,0.18)',
      border: 'rgba(66,103,178,0.35)',
      text: '#4267B2',
      onClick: () => shareVia('facebook'),
    },
    {
      id: 'twitter',
      label: 'Twitter / X',
      icon: <Twitter className="h-5 w-5" />,
      color: 'rgba(255,255,255,0.08)',
      border: 'rgba(255,255,255,0.18)',
      text: 'rgba(255,255,255,0.9)',
      onClick: () => shareVia('twitter'),
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: <LinkedIn className="h-5 w-5" />,
      color: 'rgba(0,119,181,0.18)',
      border: 'rgba(0,119,181,0.35)',
      text: '#0077B5',
      onClick: () => shareVia('linkedin'),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/50"
            style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-[90] mx-auto max-w-lg"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            <div
              className="rounded-t-[32px] px-5 pt-3 pb-8"
              style={{
                background: 'linear-gradient(180deg, rgba(18,32,24,0.97) 0%, rgba(10,18,18,0.99) 100%)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderBottom: 'none',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.4)',
              }}
            >
              {/* Handle */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

              {/* Header */}
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <h2 className="text-base font-extrabold text-white">Share Item</h2>
                  <p className="mt-0.5 text-xs text-white/45 truncate">
                    "{item.name}" — {item.location}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors"
                  style={{ background: 'rgba(255,255,255,0.10)' }}
                >
                  <X className="h-4 w-4 text-white/70" />
                </button>
              </div>

              {/* Donor preview strip */}
              <div
                className="mb-5 flex items-center gap-3 rounded-2xl px-3.5 py-3"
                style={{ background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.22)' }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
                  style={{ background: 'rgba(29,158,117,0.25)' }}
                >
                  👤
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Donated by</p>
                  <p className="text-sm font-bold text-white truncate">{item.donor_name}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: 'rgba(29,158,117,0.25)', color: '#5dcaa5', border: '1px solid rgba(29,158,117,0.3)' }}
                >
                  🆓 FREE
                </span>
              </div>

              {/* Primary share row */}
              <div className="mb-4 grid grid-cols-5 gap-2">
                {primaryActions.map((action, i) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={action.onClick}
                    className="flex flex-col items-center gap-1.5 rounded-2xl py-3 px-1 transition-opacity hover:opacity-80"
                    style={{ background: action.color, border: `1px solid ${action.border}` }}
                  >
                    <span style={{ color: action.text }}>{action.icon}</span>
                    <span className="text-[9px] font-semibold text-white/60 leading-none">{action.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Instagram Story special button */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.25 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleInstagramStory}
                disabled={storyState === 'generating'}
                className="mb-3 w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, rgba(214,68,155,0.7) 0%, rgba(253,107,44,0.7) 50%, rgba(255,200,55,0.6) 100%)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              >
                {storyState === 'generating' && (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Creating story image...
                  </span>
                )}
                {storyState === 'done' && '✅ Story image ready!'}
                {storyState === 'error' && '⚠️ Try again'}
                {storyState === 'idle' && (
                  <span className="flex items-center justify-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Add to Instagram Story
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">with donor card</span>
                  </span>
                )}
              </motion.button>

              {/* Copy link */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.25 }}
                whileTap={{ scale: 0.98 }}
                onClick={copyLink}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: copied ? 'rgba(29,158,117,0.3)' : 'rgba(255,255,255,0.10)' }}
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                        <Check className="h-4 w-4 text-green-400" />
                      </motion.span>
                    ) : (
                      <motion.span key="link" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                        <Link2 className="h-4 w-4 text-white/70" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-bold text-white">{copied ? 'Link Copied!' : 'Copy Link'}</p>
                  <p className="text-[10px] text-white/35 truncate">{url}</p>
                </div>
                {copied && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    className="text-xs font-semibold text-green-400"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
