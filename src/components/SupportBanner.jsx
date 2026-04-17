import { useState } from 'react';
import { X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SupportBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('daanguru_support_dismissed') === 'true';
    }
    return false;
  });

  if (dismissed) return null;

  const handleDismiss = (e) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem('daanguru_support_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <Link to="/support" className="block mx-4 mt-4">
      <div className="home-support-banner relative flex items-center gap-2.5 rounded-2xl px-3.5 py-3">
        <Heart className="h-4 w-4 text-[#EF9F27] fill-[#EF9F27] shrink-0" />
        <p className="flex-1 text-xs font-semibold text-white/90">
          DaanGuru is free forever. Help us stay online →
        </p>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-white/45 hover:text-white/80"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </Link>
  );
}
