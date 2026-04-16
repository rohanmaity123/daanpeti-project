import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function AppFooter() {
  return (
    <footer className="mt-12 border-t border-border">
      {/* Desktop footer */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-8 py-12">
        {/* Column 1: Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
              {/* <Heart className="h-4 w-4 text-primary-foreground fill-primary-foreground" /> */}
              <img src="/logo.svg" alt="DaanPeti" className="h-5 w-5" />
            </div>
            <span className="text-lg font-extrabold text-foreground">
              DaanPeti
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Muft mein do, muft mein lo 💚
            <br />
            India's free item donation platform. Give what you don't need, find
            what you do.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Non-profit · Made with 💚 in India
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">
            Quick Links
          </h4>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/post-item"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Donate an Item
              </Link>
            </li>
            <li>
              <Link
                to="/my-items"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                My Items
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Profile
              </Link>
            </li>
            <li>
              <Link
                to="/support"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Support Us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">Legal</h4>
          <ul className="space-y-2">
            <li>
              <Link
                to="/about"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/fund-usage"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Transparency
              </Link>
            </li>
          </ul>
        </div>
        {/* Column 3: Support */}
        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">
            Support DaanPeti 💛
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            We are a non-profit. Help us keep the platform free for everyone.
          </p>
          <div className="rounded-xl bg-saffron-light p-4 text-center">
            <p className="text-xs font-bold text-saffron-foreground mb-1">
              UPI: daanpeti@upi
            </p>
            <Link
              to="/support"
              className="inline-block mt-2 text-xs font-bold text-saffron hover:underline"
            >
              Donate Now →
            </Link>
          </div>
        </div>
      </div>
      {/* Mobile footer */}
      <div className="lg:hidden py-5 text-center space-y-3">
        <p className="text-xs text-muted-foreground">
          Non-profit · Made with 💚 in India
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            ["/about", "About"],
            ["/privacy", "Privacy"],
            ["/terms", "Terms"],
            ["/contact", "Contact"],
          ].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
