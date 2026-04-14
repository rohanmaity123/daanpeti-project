import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";

import appCss from "../styles.css?url";
import { BottomNav } from "@/components/BottomNav";
import { AppHeader } from "@/components/AppHeader";
import { OnboardingScreen } from "@/components/OnboardingScreen";
import { AppFooter } from "@/components/AppFooter";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DaanPeti — Muft Mein Do, Muft Mein Lo" },
      { name: "description", content: "Free item donation app for India. Give what you don't need." },
      { name: "author", content: "DaanPeti" },
      { property: "og:title", content: "DaanPeti — Muft Mein Do, Muft Mein Lo" },
      { property: "og:description", content: "Free item donation app for India. Give what you don't need." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "DaanPeti — Muft Mein Do, Muft Mein Lo" },
      { name: "twitter:description", content: "Free item donation app for India. Give what you don't need." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const location = useLocation();
  const isItemDetail = location.pathname.startsWith('/items/');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('daanpeti_onboarded');
      if (!seen) setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('daanpeti_onboarded', 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="mx-auto max-w-[1200px] min-h-screen bg-background">
      {showOnboarding && <OnboardingScreen onComplete={handleOnboardingComplete} />}
      {!isItemDetail && <AppHeader />}
      <main className="pb-20 lg:pb-6 lg:px-6">
        <Outlet />
        <AppFooter />
      </main>
      <BottomNav />
    </div>
  );
}
