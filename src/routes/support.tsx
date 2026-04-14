import { createFileRoute } from '@tanstack/react-router';
import { Heart, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/support')({
  head: () => ({
    meta: [
      { title: 'Support DaanPeti — Keep It Free Forever' },
      { name: 'description', content: 'Help DaanPeti stay free. Your small contribution keeps servers running and helps more people donate items.' },
    ],
  }),
  component: SupportPage,
});

const amounts = [
  { label: '₹10', value: 10 },
  { label: '₹20', value: 20 },
  { label: '₹50', value: 50 },
  { label: '₹100', value: 100 },
];

function SupportPage() {
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('daanpeti@upi').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="px-4 pb-8 pt-2">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-saffron-light flex items-center justify-center mb-4">
          <Heart className="h-8 w-8 text-saffron fill-saffron" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">
          Keep DaanPeti Free 💛
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
          We are a non-profit. Your small contribution helps us pay for servers, support, and growth.
        </p>
      </div>

      {/* QR Section */}
      <div className="rounded-2xl bg-saffron-light p-6 text-center mb-5">
        <p className="text-xs font-bold text-saffron-foreground mb-3 uppercase tracking-wide">
          Scan & Pay via UPI
        </p>
        <div className="mx-auto h-48 w-48 rounded-xl bg-card card-shadow flex items-center justify-center mb-4">
          <div className="text-center">
            <p className="text-4xl mb-1">📱</p>
            <p className="text-[10px] text-muted-foreground font-medium">
              QR Code Image
            </p>
            <p className="text-[9px] text-muted-foreground">
              (Upload your UPI QR)
            </p>
          </div>
        </div>

        {/* UPI ID */}
        <button
          onClick={handleCopyUPI}
          className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-sm font-bold text-foreground card-shadow hover:bg-secondary transition-colors"
        >
          daanpeti@upi
          {copied ? (
            <Check className="h-3.5 w-3.5 text-primary" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
        {copied && (
          <p className="text-[10px] text-primary font-semibold mt-1">Copied!</p>
        )}
      </div>

      {/* Amount suggestions */}
      <div className="mb-5">
        <p className="text-xs font-bold text-muted-foreground mb-2.5 text-center">
          Suggested Amount
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          {amounts.map((amt) => (
            <button
              key={amt.value}
              onClick={() => setSelectedAmount(amt.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                selectedAmount === amt.value
                  ? 'bg-saffron text-white'
                  : 'bg-card card-shadow text-foreground hover:bg-saffron-light'
              }`}
            >
              {amt.label}
            </button>
          ))}
          <button
            onClick={() => setSelectedAmount('custom')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              selectedAmount === 'custom'
                ? 'bg-saffron text-white'
                : 'bg-card card-shadow text-foreground hover:bg-saffron-light'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Gentle note */}
      <div className="rounded-xl bg-card card-shadow p-4 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          🙏 No pressure. Even sharing the app with friends and family helps us grow.
        </p>
      </div>
    </div>
  );
}
