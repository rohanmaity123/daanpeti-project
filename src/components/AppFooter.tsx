import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AppFooter() {
  return (
    <>
      {/* Mobile footer */}
      <div className="lg:hidden mx-4 mt-6 mb-2 text-center">
        <p className="text-[10px] text-muted-foreground font-medium">
          Non-profit · Made with 💚 in India
        </p>
      </div>

      {/* Desktop footer */}
      <footer className="hidden lg:block border-t border-border bg-card mt-10">
        <div className="mx-auto max-w-[1200px] px-6 py-10 grid grid-cols-3 gap-8">
          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                {/* <Heart className="h-4 w-4 text-primary-foreground fill-primary-foreground" /> */}
                <img src="/logo.svg" alt="DaanPeti" className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold text-foreground">DaanPeti</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Muft mein do, muft mein lo 💚<br />
              India's free item donation platform. Give what you don't need, find what you do.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Non-profit · Made with 💚 in India
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/post-item" className="text-sm text-muted-foreground hover:text-primary transition-colors">Donate an Item</Link></li>
              <li><Link to="/my-items" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Items</Link></li>
              <li><Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">Profile</Link></li>
              <li><Link to="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-3">Support DaanPeti 💛</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              We are a non-profit. Help us keep the platform free for everyone.
            </p>
            <div className="rounded-xl bg-saffron-light p-4 text-center">
              <p className="text-xs font-bold text-saffron-foreground mb-1">UPI: daanpeti@upi</p>
              <Link
                to="/support"
                className="inline-block mt-2 text-xs font-bold text-saffron hover:underline"
              >
                Donate Now →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
