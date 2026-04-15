import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

const desktopNavItems = [
  { to: '/', label: 'Home' },
  { to: '/post-item', label: 'Donate Item' },
  { to: '/support', label: 'Support Us' },
];

export function AppHeader() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`glass-nav sticky top-0 z-40 ${scrolled ? 'scrolled' : ''}`}>
      <div className="mx-auto max-w-[1200px] flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="brand-heart flex h-9 w-9 items-center justify-center rounded-full bg-[#1D9E75]/18 ring-1 ring-white/15">
            {/* <Heart className="h-4 w-4 fill-[#1D9E75] text-[#1D9E75]" /> */}
            <img src="/logo.svg" alt="DaanPeti" className="h-10 w-auto" />
          </div>
          <div className="leading-none">
            <div className="brand-mark flex items-baseline gap-0.5 text-[1.4rem] leading-none">
              <span className="text-white">Daan</span>
              <span className="text-[#1D9E75]">Peti</span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-white/55">
              Muft mein do, muft mein lo 💚
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {desktopNavItems.map((item) => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`desktop-nav-link text-sm font-semibold ${isActive ? 'desktop-nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/post-item"
          className="hidden lg:inline-flex items-center gap-1.5 rounded-full bg-[#1D9E75] px-4 py-2 text-sm font-bold text-white shadow-[0_0_24px_rgba(29,158,117,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_34px_rgba(29,158,117,0.44)]"
        >
          🎁 Post Item
        </Link>
      </div>
    </header>
  );
}
