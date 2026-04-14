import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { X, Heart } from 'lucide-react';

export function SupportBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('daanpeti_support_dismissed') === 'true';
    }
    return false;
  });

  if (dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem('daanpeti_support_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <Link to="/support" className="block mx-4 mt-4">
      <div className="flex items-center gap-2.5 rounded-xl bg-saffron-light px-3.5 py-2.5 relative">
        <Heart className="h-4 w-4 text-saffron fill-saffron shrink-0" />
        <p className="flex-1 text-xs font-semibold text-saffron-foreground">
          DaanPeti is free forever. Help us stay online →
        </p>
        <button
          onClick={handleDismiss}
          className="shrink-0 text-saffron-foreground/60 hover:text-saffron-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </Link>
  );
}
