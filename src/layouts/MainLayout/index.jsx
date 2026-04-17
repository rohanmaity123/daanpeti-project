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
      const seen = localStorage.getItem('daanguru_onboarded');
      if (!seen) setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('daanguru_onboarded', 'true');
    setShowOnboarding(false);
  };
  return (
    <div className="app-shell min-h-screen">
      {showOnboarding && <OnboardingScreen onComplete={handleOnboardingComplete} />}
      {!isItemDetail && <AppHeader />}
      <main className="pb-20 lg:pb-6 lg:px-6">
        {children}
        <AppFooter />
      </main>
      {!isItemDetail && <BottomNav />}
    </div>
  );
};

export default MainLayout;
