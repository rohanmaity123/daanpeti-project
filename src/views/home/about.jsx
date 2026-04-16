
import { useEffect, useState } from 'react';
import { Heart, Target, Users, Gift, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';


const stats = [
  { emoji: '🎁', value: '1,000+', label: 'Items Donated' },
  { emoji: '👥', value: '500+', label: 'Happy Users' },
  { emoji: '🏙️', value: '10+', label: 'Cities' },
  { emoji: '💚', value: '100%', label: 'Free Forever' },
];

const missions = [
  { icon: Target, emoji: '🎯', title: 'Zero Waste', desc: 'Every usable item deserves a second life instead of a landfill.' },
  { icon: Users, emoji: '💚', title: 'Community First', desc: 'Built for India, by India. Local giving, local receiving.' },
  { icon: Gift, emoji: '🆓', title: 'Always Free', desc: 'DaanPeti will always be 100% free for everyone, forever.' },
];

export default function About() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 lg:px-6 pt-6 pb-28 lg:pb-12">

      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6">
        ← Back to Home
      </Link>

      {/* Hero */}
      <div className={`glass-card text-center p-8 lg:p-12 mb-6 relative overflow-hidden ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
        <div className="text-6xl mb-4 animate-bounce-icon">🎁</div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-foreground">About DaanPeti</h1>
        <p className="mt-2 text-base text-muted-foreground">India's free item donation platform</p>
        <p className="mt-1 text-sm font-semibold" style={{ color: '#138808' }}>Muft Mein Do, Muft Mein Lo 💚</p>
      </div>

      {/* Our Story */}
      <div className={`glass-card p-6 lg:p-8 mb-6 ${mounted ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 rounded-full" style={{ background: '#138808' }} />
          <h2 className="text-xl font-extrabold text-foreground">Hamari Kahani 📖</h2>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>DaanPeti was born from a simple idea — every Indian home has things it no longer needs, and every neighbourhood has people who could use them.</p>
          <p>We built DaanPeti to bridge that gap. No money. No middlemen. Just neighbours helping neighbours — exactly the way India has always worked.</p>
          <p>Started in <strong className="text-foreground">Jhargram, West Bengal</strong>, DaanPeti is now growing across India, one donation at a time. We believe that giving is not charity — it's community.</p>
        </div>
      </div>

      {/* Mission cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 ${mounted ? 'animate-fade-up delay-150' : 'opacity-0'}`}>
        {missions.map((m, i) => (
          <div key={i} className="glass-card p-5 text-center" style={{ animationDelay: `${150 + i * 80}ms` }}>
            <div className="text-3xl mb-3">{m.emoji}</div>
            <h3 className="text-sm font-extrabold text-foreground mb-1">{m.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className={`glass-card p-6 mb-6 ${mounted ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 rounded-full" style={{ background: '#FF9933' }} />
          <h2 className="text-xl font-extrabold text-foreground">DaanPeti by Numbers 📊</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="text-center p-4 rounded-2xl" style={{ background: 'rgba(19,136,8,0.08)', border: '1px solid rgba(19,136,8,0.15)' }}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-2xl font-extrabold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Belief */}
      <div className={`glass-card p-6 lg:p-8 mb-6 ${mounted ? 'animate-fade-up delay-250' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 rounded-full" style={{ background: '#FF9933' }} />
          <h2 className="text-xl font-extrabold text-foreground">Hamara Vishwas 🙏</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          In India, giving has always been a way of life — <strong className="text-foreground">'Daana'</strong> is one of the highest virtues in our culture. DaanPeti is simply a modern platform for this ancient tradition. Whether it is a pair of old shoes or a working television, if someone else can use it, it should reach them — not a dump yard.
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          We are inspired by the Indian spirit of <em className="text-foreground">seva</em> — selfless service. Every item donated on DaanPeti is an act of that spirit.
        </p>
      </div>

      {/* Team */}
      <div className={`glass-card p-6 lg:p-8 mb-8 ${mounted ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 rounded-full" style={{ background: '#138808' }} />
          <h2 className="text-xl font-extrabold text-foreground">Banaya Kisne? 👨‍💻</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          DaanPeti is built and maintained by a small passionate team that believes technology should serve communities, not just corporations. We are a non-profit community project — no investors, no ads, no agenda. Just people who want to make India a little more generous.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Non-profit', 'Community Project', 'Made in India 🇮🇳', 'Open Source'].map(tag => (
            <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(19,136,8,0.1)', color: '#ef9f27' }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className={`text-center ${mounted ? 'animate-fade-up delay-400' : 'opacity-0'}`}>
        <Link to="/post-item" className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95" style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
          Start Donating Today <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-xs text-muted-foreground">100% free · No registration required to browse</p>
      </div>
    </div>
  );
}
