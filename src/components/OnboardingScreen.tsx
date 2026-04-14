import { useState } from 'react';
import { ArrowRight, Heart, MapPin, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    emoji: '🎁',
    icon: Heart,
    title: 'Give what you don\'t need',
    titleHi: 'Jo zaroori nahi, woh de do',
    description: 'Old clothes, books, furniture — someone nearby needs them more than your cupboard does!',
    color: 'bg-primary',
  },
  {
    emoji: '📍',
    icon: MapPin,
    title: 'Someone nearby will love it',
    titleHi: 'Aapke paas hi koi khush hoga',
    description: 'Connect directly with people in your area via WhatsApp. No middlemen, no shipping hassle.',
    color: 'bg-warm-green-dark',
  },
  {
    emoji: '💚',
    icon: Sparkles,
    title: '100% free, always',
    titleHi: 'Hamesha muft, hamesha free',
    description: 'DaanPeti is completely free. No charges, no hidden fees. Just kindness, neighbour to neighbour.',
    color: 'bg-primary',
  },
];

export function OnboardingScreen({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Illustration area */}
        <div className={`h-28 w-28 rounded-3xl ${slide.color} flex items-center justify-center mb-8 shadow-lg`}>
          <span className="text-5xl">{slide.emoji}</span>
        </div>

        <h2 className="text-2xl font-extrabold text-foreground leading-tight">
          {slide.title}
        </h2>
        <p className="mt-1 text-base font-semibold text-primary">
          {slide.titleHi}
        </p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
          {slide.description}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="px-8 pb-12">
        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-6 bg-primary'
                  : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {currentSlide < slides.length - 1 ? (
            <>
              Aage Badho <ArrowRight className="h-4 w-4" />
            </>
          ) : (
            'Shuru Karein! 🚀'
          )}
        </button>

        {currentSlide < slides.length - 1 && (
          <button
            onClick={onComplete}
            className="mt-3 w-full text-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip / छोड़ दो
          </button>
        )}
      </div>
    </div>
  );
}
