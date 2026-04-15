import { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { Avatar } from '@mui/material';


const testimonials = [
    {
        name: 'Priya Sharma',
        role: 'College Student',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        text: 'DaanPeti helped me find free books for my semester. Saved so much money! Amazing community of givers.',
    },
    {
        name: 'Rajesh Kumar',
        role: 'Software Engineer',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        text: 'Donated my old furniture when I moved cities. Felt great knowing it went to someone who needed it.',
    },
    {
        name: 'Anita Desai',
        role: 'Homemaker',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        rating: 4,
        text: 'My kids\' old toys found a new home within hours! The WhatsApp contact feature makes it so easy.',
    },
    {
        name: 'Mohammed Irfan',
        role: 'Teacher',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        text: 'I regularly donate old textbooks here. My students also use it to find study material for free.',
    },
    {
        name: 'Sneha Patel',
        role: 'Doctor',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        text: 'Love the concept — no money involved, just pure giving. India needs more platforms like DaanPeti.',
    },
    {
        name: 'Vikram Singh',
        role: 'Retired Officer',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
        rating: 4,
        text: 'Gave away my old electronics and clothes. The process is simple and the response was instant!',
    },
];

function StarRating({ rating }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                />
            ))}
        </div>
    );
}

export function TestimonialSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const visibleCount = 3;
    const maxIndex = testimonials.length - visibleCount;

    const next = useCallback(() => {
        setActiveIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, [maxIndex]);

    useEffect(() => {
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <section className="mx-4 lg:mx-0 mt-8 mb-4">
            {/* Heading */}
            <div className="text-center mb-6">
                <h2 className="text-xl lg:text-2xl font-extrabold text-foreground">
                    What Our Users Say 💬
                </h2>
                <p className="mt-1 text-sm text-muted-foreground font-medium">
                    Real stories from the DaanPeti community
                </p>
            </div>

            {/* Cards – mobile: single scroll, desktop: animated slider */}
            <div className="relative overflow-hidden">
                {/* Mobile: horizontal scroll */}
                <div className="flex gap-4 overflow-x-auto pb-2 lg:hidden" style={{ scrollbarWidth: 'none' }}>
                    {testimonials.map((t) => (
                        <TestimonialCard key={t.name} testimonial={t} className="w-[280px] shrink-0" />
                    ))}
                </div>

                {/* Desktop: animated slider */}
                <div className="hidden lg:block">
                    <div
                        className="flex gap-5 transition-transform duration-700 ease-in-out"
                        style={{ transform: `translateX(-${activeIndex * (100 / visibleCount)}%)` }}
                    >
                        {testimonials.map((t) => (
                            <TestimonialCard
                                key={t.name}
                                testimonial={t}
                                className="shrink-0"
                                style={{ width: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 20 / visibleCount}px)` }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Dots */}
            <div className="hidden lg:flex justify-center gap-2 mt-4">
                {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIndex(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}

function TestimonialCard({
    testimonial: t,
    className = '',
    style,
}) {
    return (
        <div
            className={`rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-5 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${className}`}
            style={style}
        >
            <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-11 w-11 ring-2 ring-primary/20" src={t.image} alt={t.name}>
                    <p>{t.name.charAt(0)}</p>
                </Avatar>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
            </div>
            <StarRating rating={t.rating} />
            <p className="mt-3 text-sm text-foreground/80 leading-relaxed line-clamp-3">
                "{t.text}"
            </p>
        </div>
    );
}
