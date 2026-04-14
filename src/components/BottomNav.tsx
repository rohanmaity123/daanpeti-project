import { Link, useLocation } from '@tanstack/react-router';
import { Home, PlusCircle, Package, User } from 'lucide-react';

const navItems = [
  { to: '/' as const, icon: Home, label: 'Home', labelHi: 'होम' },
  { to: '/post-item' as const, icon: PlusCircle, label: 'Donate', labelHi: 'दान करो' },
  { to: '/my-items' as const, icon: Package, label: 'My Items', labelHi: 'मेरा सामान' },
  { to: '/profile' as const, icon: User, label: 'Profile', labelHi: 'प्रोफ़ाइल' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card bottom-nav-shadow border-t border-border lg:hidden">
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
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
