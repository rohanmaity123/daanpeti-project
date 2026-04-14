import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const slides = [
  {
    key: 'give',
    title: 'Daan Karo',
    subtitle: "Give what you don't need",
    hindi: 'Jo zaroori nahi, woh de do',
  },
  {
    key: 'connect',
    title: 'Paas Mein Milao',
    subtitle: 'Someone nearby will love it',
    hindi: 'Seedha WhatsApp pe connect karo',
  },
  {
    key: 'free',
    title: 'Hamesha Muft',
    subtitle: '100% free, always and forever',
    hindi: 'Koi charge nahi, koi hidden fees nahi',
  },
];

function GiveIllustration() {
  return (
    <div className="relative flex h-[300px] w-full items-center justify-center overflow-hidden">
      <div className="onboarding-orbit onboarding-orbit-lg">
        <span className="onboarding-orbit-item onboarding-orbit-item-1">👕</span>
        <span className="onboarding-orbit-item onboarding-orbit-item-2">📚</span>
        <span className="onboarding-orbit-item onboarding-orbit-item-3">🪑</span>
      </div>
      <div className="glass-card relative z-10 flex h-[210px] w-[210px] items-center justify-center rounded-[34px] border-white/20 bg-white/12 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="absolute inset-x-7 top-5 h-4 rounded-full bg-white/10" />
        <span className="text-[80px] leading-none">🎁</span>
      </div>
    </div>
  );
}

function ConnectIllustration() {
  return (
    <div className="relative flex h-[300px] w-full items-center justify-center">
      <div className="glass-card relative h-[280px] w-[170px] rounded-[36px] border-white/20 bg-white/10 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-white/20" />
        <div className="space-y-3">
          <div className="glass-card rounded-2xl border-white/12 bg-white/8 p-3">
            <div className="h-16 rounded-xl bg-white/8" />
            <div className="mt-2 h-3 w-2/3 rounded-full bg-white/18" />
            <div className="mt-1 h-2 w-1/2 rounded-full bg-white/10" />
          </div>
          <div className="glass-card ml-5 rounded-2xl border-white/12 bg-white/8 p-3">
            <div className="h-14 rounded-xl bg-white/8" />
            <div className="mt-2 h-3 w-1/2 rounded-full bg-white/18" />
          </div>
          <div className="rounded-2xl bg-[#25D366]/90 px-4 py-3 text-center text-sm font-bold text-white shadow-[0_0_30px_rgba(37,211,102,0.28)]">
            WhatsApp Connect
          </div>
        </div>
      </div>
    </div>
  );
}

function FreeIllustration() {
  return (
    <div className="relative flex h-[300px] w-full items-center justify-center">
      <div className="glass-card relative flex h-[220px] w-[220px] items-center justify-center rounded-full border-[#1D9E75]/35 bg-white/6">
        <div className="onboarding-rupee-glow flex h-36 w-36 items-center justify-center rounded-full bg-[#1D9E75]/10">
          <span className="relative text-[110px] font-extrabold leading-none text-[#7BFFD0]">
            ₹
            <span className="absolute left-1/2 top-1/2 h-1 w-28 -translate-x-1/2 -translate-y-1/2 rotate-[-28deg] rounded-full bg-[#1D9E75]" />
          </span>
        </div>
      </div>
      <span className="onboarding-sparkle onboarding-sparkle-1">✦</span>
      <span className="onboarding-sparkle onboarding-sparkle-2">✦</span>
      <span className="onboarding-sparkle onboarding-sparkle-3">✦</span>
      <span className="onboarding-sparkle onboarding-sparkle-4">✦</span>
    </div>
  );
}

function SlideIllustration({ slideKey }) {
  if (slideKey === 'give') return <GiveIllustration />;
  if (slideKey === 'connect') return <ConnectIllustration />;
  return <FreeIllustration />;
}

export function OnboardingScreen({ onComplete }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [ripple, setRipple] = useState(null);
  const touchStartX = useRef(0);

  const slide = slides[currentSlide];
  const slideClass = `onboarding-slide ${direction > 0 ? 'onboarding-slide-forward' : 'onboarding-slide-backward'}`;

  const advance = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const retreat = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const handleButtonClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setRipple({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      id: Date.now(),
    });
    advance();
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    const delta = event.changedTouches[0].clientX - touchStartX.current;

    if (delta < -50) {
      advance();
    } else if (delta > 50) {
      retreat();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f4c35_0%,#1a6b4a_25%,#0d3d5c_75%,#1a2d4a_100%)]" />
      <div className="onboarding-bg-circle left-[-70px] top-[-40px] h-[300px] w-[300px] bg-[#1D9E75]/15" />
      <div className="onboarding-bg-circle onboarding-bg-circle-reverse bottom-[-40px] right-[-50px] h-[250px] w-[250px] bg-[#EF9F27]/10" />
      <div className="onboarding-bg-circle right-[8%] top-[26%] h-[200px] w-[200px] bg-[#378ADD]/12" />

      <button
        onClick={onComplete}
        className="absolute right-6 top-6 z-20 text-sm font-semibold text-white/40 transition-colors hover:text-white/70"
      >
        Skip
      </button>

      <div
        className="relative z-10 flex min-h-screen flex-col px-6 pb-10 pt-20 sm:px-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <div className="flex-1 overflow-hidden">
            <div key={slide.key} className={slideClass}>
              <SlideIllustration slideKey={slide.key} />
              <div className="mt-4 text-center">
                <h2 className="text-[36px] font-extrabold leading-tight text-white">{slide.title}</h2>
                <p className="mt-3 text-base text-white/70">{slide.subtitle}</p>
                <p className="mt-3 text-lg italic text-[#1D9E75]">{slide.hindi}</p>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div className="mb-6 flex items-center justify-center gap-2">
              {slides.map((item, index) => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (index === currentSlide) return;
                    setDirection(index > currentSlide ? 1 : -1);
                    setCurrentSlide(index);
                  }}
                  className={`onboarding-progress-pill ${index === currentSlide ? 'onboarding-progress-pill-active' : ''}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleButtonClick}
              className={`onboarding-next-button relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[22px] py-4 text-base font-bold text-white ${currentSlide === slides.length - 1 ? 'onboarding-next-button-final' : ''}`}
            >
              {ripple && (
                <span
                  key={ripple.id}
                  className="onboarding-ripple"
                  style={{ left: ripple.x, top: ripple.y }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {currentSlide < slides.length - 1 ? 'Aage Badho' : 'Shuru Karein! 🚀'}
                <ArrowRight className="h-5 w-5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
