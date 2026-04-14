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
  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="mx-auto max-w-[1200px] flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
            <Heart className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-foreground leading-none tracking-tight">
              DaanPeti
            </h1>
            <p className="text-[10px] text-muted-foreground font-medium -mt-0.5">
              Muft mein do, muft mein lo 💚
            </p>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-6">
          {desktopNavItems.map((item) => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-semibold transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <Link
          to="/post-item"
          className="hidden lg:inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          🎁 Post Item
        </Link>
      </div>
    </header>
  );
}
