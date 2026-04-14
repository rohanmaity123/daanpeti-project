import { Outlet } from "react-router-dom";
import { AppFooter } from "../../components/AppFooter";
import { AppHeader } from "../../components/HomeHeader";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { BottomNav } from "../../components/BottomNav";
import { OnboardingScreen } from "../../components/OnboardingScreen";

// const location = useLocation()

const MainLayout = ({ children }) => {
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
        {children}
        <AppFooter />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
