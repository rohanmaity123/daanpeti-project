import { Home, PlusCircle, Package, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', icon: Home, label: 'Home', labelHi: 'होम' },
  { to: '/post-item', icon: PlusCircle, label: 'Donate', labelHi: 'दान करो' },
  { to: '/my-items', icon: Package, label: 'My Items', labelHi: 'मेरा सामान' },
  { to: '/profile', icon: User, label: 'Profile', labelHi: 'प्रोफ़ाइल' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="backdrop-blur-md supports-[backdrop-filter]:bg-black/30 fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`bottom-nav-item flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 transition-colors ${isActive ? 'bottom-nav-item-active' : 'hover:text-white/90'}`}
            >
              <Icon className={`bottom-nav-icon h-5 w-5 transition-transform ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-semibold">{item.label}</span>
              {isActive && <span className="bottom-nav-dot" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
