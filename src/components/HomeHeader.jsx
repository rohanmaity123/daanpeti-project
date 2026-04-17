import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export function AppHeader() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // 🔥 Replace with real auth (Supabase later)
  const [user, setUser] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  return (
    <header className={` backdrop-blur-md supports-[backdrop-filter]:bg-black/30 sticky top-0 z-40 ${scrolled ? 'scrolled' : ''}`}>
      <div className="mx-auto max-w-[1200px] flex items-center justify-between px-4 py-3">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <div className="brand-heart flex h-9 w-9 items-center justify-center rounded-full bg-[#1D9E75]/18 ring-1 ring-white/15">
            {/* <Heart className="h-4 w-4 fill-[#1D9E75] text-[#1D9E75]" /> */}
            <img src={'./logo.png'} alt="DaanGuru" className="h-10 w-auto" />
          </div>
          <div className="leading-none">
            <div className="brand-mark flex items-baseline gap-0.5 text-[1.4rem] leading-none">
              <span className="text-white">Daan</span>
              <span className="text-[#1D9E75]">Guru</span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-white/55">
              Muft mein do, muft mein lo 💚
            </p>
          </div>
        </Link>

        {/* NAV */}
        <nav className="hidden lg:flex items-center gap-6">
          {[
            { to: '/', label: 'Home' },
            { to: '/post-item', label: 'Donate Item' },
            { to: '/support', label: 'Support Us' },
            { to: '/fund-usage', label: 'Transparency' },
          ].map((item) => {
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
        {/* RIGHT BUTTONS */}
        <div className="hidden lg:flex items-center gap-3">

          {/* PRIMARY CTA */}
          <Link
            to="/post-item"
            className="rounded-full bg-[#1D9E75] px-4 py-2 text-sm font-bold text-white shadow hover:scale-105 transition"
          >
            🎁 Post Item
          </Link>

          {/* 🔥 AUTH BUTTON LOGIC */}
          {user ? (
            <>
              <Link to="/profile" className="relative group">

                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white/30 hover:border-[#1D9E75] transition-all duration-300">
                  <img
                    src={user?.user_metadata?.avatar_url || "/default-avatar.png"}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-full bg-[#1D9E75]/20 opacity-0 group-hover:opacity-100 blur-md transition"></div>

              </Link>
            </>
          ) : (
            <Link
              to="/profile"
              className="rounded-full border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}