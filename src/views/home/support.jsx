import { Users } from 'lucide-react';
import { IndianRupee } from 'lucide-react';
import { Copy, Check } from 'lucide-react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import Qrcode from '../../assets/images/daanguruqr.png';

const amounts = [
  { label: '₹10', value: 10 },
  { label: '₹20', value: 20 },
  { label: '₹50', value: 50 },
  { label: '₹100', value: 100 },
];


const SAMPLE_DONORS = [
  { name: 'Ritam Maity', transactionId: 'TXN123456', amount: 500, bank: 'State Bank of India', date: '2026-04-12' },
  { name: 'Priya Sharma', transactionId: 'TXN123457', amount: 200, bank: 'HDFC Bank', date: '2026-04-11' },
  { name: 'Amit Kumar', transactionId: 'TXN123458', amount: 1000, bank: 'ICICI Bank', date: '2026-04-10' },
  { name: 'Sneha Das', transactionId: 'TXN123459', amount: 100, bank: 'Axis Bank', date: '2026-04-09' },
  { name: 'Rahul Verma', transactionId: 'TXN123460', amount: 50, bank: 'Punjab National Bank', date: '2026-04-08' },
  { name: 'Ananya Gupta', transactionId: 'TXN123461', amount: 300, bank: 'Bank of Baroda', date: '2026-04-07' },
  { name: 'Vikram Singh', transactionId: 'TXN123462', amount: 150, bank: 'Kotak Mahindra', date: '2026-04-06' },
  { name: 'Meera Joshi', transactionId: 'TXN123463', amount: 750, bank: 'Yes Bank', date: '2026-04-05' },
  { name: 'Arjun Patel', transactionId: 'TXN123464', amount: 250, bank: 'Union Bank', date: '2026-04-04' },
  { name: 'Kavita Reddy', transactionId: 'TXN123465', amount: 400, bank: 'Canara Bank', date: '2026-04-03' },
];
function SuperchatTicker() {
  const scrollRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || paused) return;

    const interval = setInterval(() => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight) {
        el.scrollTop = 0;
      } else {
        el.scrollTop += 1;
      }
    }, 30);

    return () => clearInterval(interval);
  }, [paused]);

  const totalAmount = SAMPLE_DONORS.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="mb-5">
      <div className="text-center mb-3">
        <h2 className="text-lg font-extrabold text-foreground">Our Supporters ❤️</h2>
        <p className="text-xs text-muted-foreground mt-1">Live donations ticker</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl backdrop-blur-xl border  p-3 text-center shadow-sm">
          <IndianRupee className="h-4 w-4 mx-auto text-primary mb-0.5" />
          <p className="text-base font-extrabold text-foreground">₹{totalAmount.toLocaleString('en-IN')}</p>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">Total Raised</p>
        </div>
        <div className="rounded-xl backdrop-blur-xl border  p-3 text-center shadow-sm">
          <Users className="h-4 w-4 mx-auto text-primary mb-0.5" />
          <p className="text-base font-extrabold text-foreground">{SAMPLE_DONORS.length}</p>
          <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wide">Donors</p>
        </div>
      </div>

      {/* Auto-scrolling superchat list */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="h-64 overflow-hidden rounded-2xl  backdrop-blur-xl border  shadow-sm"
      >
        <div className="space-y-0">
          {SAMPLE_DONORS.map((d) => (
            <div
              key={d.transactionId}
              className="flex items-center gap-3 px-4 py-3 border-b hover:bg-primary/5 transition-colors"
            >
              {/* Avatar */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-saffron to-primary flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">{d.name.charAt(0)}</span>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{d.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{d.bank}</p>
              </div>
              {/* Amount */}
              <span className="text-sm font-extrabold text-primary whitespace-nowrap">
                ₹{d.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default function SupportPage() {
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText('Q52840401@ybl').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="px-4 pb-8 pt-2">
      {/* Header */}
      <div className="text-center mb-6">
        <img src="/logo.png" alt="DaanGuru" className="mx-auto mb-4 h-20 w-20 object-contain" />
        <h1 className="text-2xl font-extrabold text-foreground">
          Keep DaanGuru Free 💛
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
        <div className="mx-auto h-52 w-52 rounded-xl bg-card card-shadow flex items-center justify-center mb-4">
          <img src={Qrcode} alt="qr-code" className="h-40 w-40 object-contain" />
        </div>

        {/* UPI ID */}
        <button
          onClick={handleCopyUPI}
          className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-sm font-bold text-foreground card-shadow hover:bg-secondary transition-colors"
        >
          Q52840401@ybl
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
              className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${selectedAmount === amt.value
                ? 'bg-saffron text-white'
                : 'bg-card card-shadow text-foreground hover:bg-saffron-light'
                }`}
            >
              {amt.label}
            </button>
          ))}
          <button
            onClick={() => setSelectedAmount('custom')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${selectedAmount === 'custom'
              ? 'bg-saffron text-white'
              : 'bg-card card-shadow text-foreground hover:bg-saffron-light'
              }`}
          >
            Custom
          </button>
        </div>
      </div>
      <SuperchatTicker />
      {/* Gentle note */}
      <div className="rounded-xl bg-card card-shadow p-4 text-center">
        <p className="text-xs text-muted-foreground leading-relaxed">
          🙏 No pressure. Even sharing the app with friends and family helps us grow.
        </p>
      </div>
    </div>
  );
}
