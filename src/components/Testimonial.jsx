import { useEffect, useState, useCallback } from 'react';
import { Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

/* ── Fallback reviews shown before DB has data ── */
const FALLBACK_REVIEWS = [
    { id: 'f1', user_name: 'Priya Sharma', user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', rating: 5, text: 'DaanGuru helped me find free books for my semester. Saved so much money! Amazing community of givers.', created_at: '' },
    { id: 'f2', user_name: 'Rajesh Kumar', user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', rating: 5, text: 'Donated my old furniture when I moved cities. Felt great knowing it went to someone who needed it.', created_at: '' },
    { id: 'f3', user_name: 'Anita Desai', user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', rating: 4, text: "My kids' old toys found a new home within hours! The WhatsApp contact feature makes it so easy.", created_at: '' },
    { id: 'f4', user_name: 'Mohammed Irfan', user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', rating: 5, text: 'I regularly donate old textbooks here. My students also use it to find study material for free.', created_at: '' },
    { id: 'f5', user_name: 'Sneha Patel', user_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', rating: 5, text: 'Love the concept — no money involved, just pure giving. India needs more platforms like DaanGuru.', created_at: '' },
    { id: 'f6', user_name: 'Vikram Singh', user_avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face', rating: 4, text: 'Gave away my old electronics and clothes. The process is simple and the response was instant!', created_at: '' },
];

/* ── Star display ── */
function StarRating({ rating }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
            ))}
        </div>
    );
}

/* ── Avatar ── */
function Avatar({ src, name }) {
    const [imgError, setImgError] = useState(false);
    const initial = name.charAt(0).toUpperCase();

    if (!src || imgError) return (
        <div className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
            {initial}
        </div>
    );

    return (
        <img src={src} alt={name} onError={() => setImgError(true)}
            className="h-11 w-11 rounded-full object-cover ring-2 shrink-0"
            style={{ ringColor: 'rgba(29,158,117,0.2)' }} />
    );
}

/* ── Single card ── */
function ReviewCard({ review, index }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
            className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-5 transition-all duration-300 hover:scale-[1.02] hover:card-shadow-hover flex flex-col gap-3"
        >
            <div className="flex items-center gap-3">
                <Avatar src={review.user_avatar} name={review.user_name} />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{review.user_name}</p>
                    {review.created_at && (
                        <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </p>
                    )}
                </div>
            </div>
            <StarRating rating={review.rating} />
            <p className={`text-sm text-foreground/80 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
                "{review.text}"
            </p>
            {review.text.length > 150 && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors text-left"
                >
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}
        </motion.div>
    );
}

/* ── Main section ── */
export function TestimonialSection() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    /* Fetch from Supabase — fallback to static if empty */
    useEffect(() => {
        const fetch = async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('id, user_name, user_avatar, rating, text, created_at')
                .order('created_at', { ascending: false })
                .limit(20);

            if (!error && data && data.length > 0) {
                setReviews(data);
            } else {
                setReviews(FALLBACK_REVIEWS);
            }
            setLoading(false);
        };
        fetch();
    }, []);

    /* Auto-advance desktop slider */
    const visibleCount = 3;
    const maxIndex = Math.max(0, reviews.length - visibleCount);

    const next = useCallback(() => setActiveIndex(i => i >= maxIndex ? 0 : i + 1), [maxIndex]);
    const prev = () => setActiveIndex(i => i <= 0 ? maxIndex : i - 1);

    useEffect(() => {
        if (reviews.length <= visibleCount) return;
        const t = setInterval(next, 4500);
        return () => clearInterval(t);
    }, [next, reviews.length]);

    if (loading) return (
        <section className="mx-4 lg:mx-0 mt-8 mb-4 flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </section>
    );

    if (reviews.length === 0) return null;

    /* Average rating */
    const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

    return (
        <section className="mx-4 lg:mx-0 mt-10 mb-4">

            {/* Heading */}
            <div className="text-center mb-6">
                <h2 className="text-xl lg:text-2xl font-extrabold text-foreground">
                    What Our Users Say 💬
                </h2>
                <p className="mt-1 text-sm text-muted-foreground font-medium">
                    Real stories from the DaanGuru community
                </p>
                {/* Stats row */}
                <div className="mt-3 inline-flex items-center gap-3 rounded-full px-4 py-2"
                    style={{ background: 'rgba(19,136,8,0.08)', border: '1px solid rgba(19,136,8,0.15)' }}>
                    <span className="flex items-center gap-1 text-sm font-extrabold" style={{ color: '#138808' }}>
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />{avg}
                    </span>
                    <span className="text-xs text-muted-foreground">{reviews.length} reviews</span>
                </div>
            </div>

            {/* Mobile — horizontal scroll */}
            <div className="flex gap-4 overflow-x-auto pb-2 lg:hidden" style={{ scrollbarWidth: 'none' }}>
                {reviews.map((r, i) => (
                    <div key={r.id} className="w-[280px] shrink-0">
                        <ReviewCard review={r} index={i} />
                    </div>
                ))}
            </div>

            {/* Desktop — animated slider */}
            <div className="hidden lg:block relative">
                <div className="overflow-hidden">
                    <motion.div
                        className="flex gap-5"
                        animate={{ x: `-${activeIndex * (100 / visibleCount)}%` }}
                        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                    >
                        {reviews.map((r, i) => (
                            <div key={r.id} className="shrink-0" style={{ width: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 20 / visibleCount}px)` }}>
                                <ReviewCard review={r} index={i} />
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Prev / Next arrows */}
                {reviews.length > visibleCount && (
                    <>
                        <button onClick={prev}
                            className="absolute -left-5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card card-shadow flex items-center justify-center hover:bg-secondary transition-colors z-10">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button onClick={next}
                            className="absolute -right-5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card card-shadow flex items-center justify-center hover:bg-secondary transition-colors z-10">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                )}

                {/* Dots */}
                {reviews.length > visibleCount && (
                    <div className="flex justify-center gap-2 mt-5">
                        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                            <button key={i} onClick={() => setActiveIndex(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                                    }`} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
