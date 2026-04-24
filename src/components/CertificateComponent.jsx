import { useEffect, useState, useRef } from 'react';
import { Award, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

// Must match CertificateGenerator.jsx
const typeConfig = {
    participation: { label: 'Participation', emoji: '🤝', color: '#138808', bg: 'rgba(19,136,8,0.1)' },
    appreciation: { label: 'Appreciation', emoji: '🏆', color: '#FF9933', bg: 'rgba(255,153,51,0.1)' },
    completion: { label: 'Completion', emoji: '🎓', color: '#0066CC', bg: 'rgba(0,102,204,0.1)' },
    donation: { label: 'Donation', emoji: '💝', color: '#E24B4A', bg: 'rgba(226,75,74,0.1)' },
    volunteer: { label: 'Volunteering', emoji: '🌟', color: '#9333ea', bg: 'rgba(147,51,234,0.1)' },
    partnership: { label: 'Partnership', emoji: '🤲', color: '#25D366', bg: 'rgba(37,211,102,0.1)' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (val) => { if (!val) return '—'; const d = new Date(val); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

// ── Mini certificate card shown in slider ─────────────────────────────────────
function CertSlideCard({ cert }) {
    const cfg = typeConfig[cert.cert_type] || typeConfig.participation;
    return (
        <Link
            to={`/certificate/verify/${cert.cert_id}`}
            className="group shrink-0 w-60 rounded-2xl p-4 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
                background: '#fff',
                border: `1.5px solid ${cfg.color}33`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
        >
            {/* Tricolor bar */}
            <div style={{ height: 3, background: 'linear-gradient(90deg,#FF9933 33%,#fff 33%,#fff 66%,#138808 66%)', borderRadius: 2 }} />

            {/* Emoji + name */}
            <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl">{cfg.emoji}</span>
                <div className="min-w-0">
                    <p className="text-xs font-extrabold text-gray-900 truncate leading-tight">{cert.recipient_name}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
                </div>
            </div>

            {/* Cert ID badge */}
            <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: cfg.bg, color: cfg.color }}>
                    {cert.cert_id}
                </span>
                <span className="text-xs text-gray-400">{fmtDate(cert.issued_date)}</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: cfg.color + '22' }}>
                <span className="text-xs text-gray-400">Rohan Maity</span>
                <span className="text-xs font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: cfg.color }}>
                    View <ExternalLink className="h-3 w-3" />
                </span>
            </div>
        </Link>
    );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export default function CertificatesHomeWidget() {
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const sliderRef = useRef(null);
    const autoRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        fetchCerts();
    }, []);

    // Auto-scroll every 3 seconds
    useEffect(() => {
        if (!certs.length) return;
        autoRef.current = setInterval(() => {
            setActiveIdx(prev => (prev + 1) % certs.length);
        }, 3000);
        return () => clearInterval(autoRef.current);
    }, [certs.length]);


    const fetchCerts = async () => {
        const { data } = await supabase
            .from('certificates')
            .select('cert_id, recipient_name, cert_type, issued_date')
            .order('created_at', { ascending: false })
            .limit(12);
        setCerts(data || []);
        setLoading(false);
    };

    const prev = () => {
        clearInterval(autoRef.current);
        setActiveIdx(i => (i - 1 + certs.length) % certs.length);
    };

    const next = () => {
        clearInterval(autoRef.current);
        setActiveIdx(i => (i + 1) % certs.length);
    };

    if (loading) return (
        <div className="mx-auto max-w-5xl px-4 lg:px-6 py-6">
            <div className="rounded-2xl p-6 animate-pulse" style={{ background: 'rgba(19,136,8,0.04)' }}>
                <div className="h-4 bg-gray-200 rounded w-48 mb-4" />
                <div className="flex gap-3 overflow-hidden">
                    {[1, 2, 3].map(i => <div key={i} className="h-36 w-60 shrink-0 bg-gray-100 rounded-2xl" />)}
                </div>
            </div>
        </div>
    );

    if (!certs.length) return null;

    return (
        <section className={`mx-auto max-w-5xl px-4 lg:px-6 py-6 ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>

            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(19,136,8,0.1)' }}>
                        <Award className="h-4 w-4" style={{ color: '#138808' }} />
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold text-foreground">Hall of Kindness 🏅</h2>
                        <p className="text-xs text-muted-foreground">Recently awarded certificates</p>
                    </div>
                </div>

                {/* Prev / Next arrows */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={prev}
                        className="h-8 w-8 rounded-full flex items-center justify-center border transition-all hover:bg-muted active:scale-95"
                        style={{ borderColor: '#138808', color: '#138808' }}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={next}
                        className="h-8 w-8 rounded-full flex items-center justify-center border transition-all hover:bg-muted active:scale-95"
                        style={{ borderColor: '#138808', color: '#138808' }}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Slider */}
            <div
                ref={sliderRef}
                className="flex gap-3 overflow-x-auto pb-3 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {certs.map((cert, i) => (
                    <div
                        key={cert.cert_id}
                        style={{
                            transition: 'transform 0.3s ease, opacity 0.3s ease',
                            transform: activeIdx === i ? 'scale(1.04)' : 'scale(1)',
                            opacity: activeIdx === i ? 1 : 0.75,
                        }}
                    >
                        <CertSlideCard cert={cert} />
                    </div>
                ))}
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
                {certs.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => { clearInterval(autoRef.current); setActiveIdx(i); }}
                        style={{
                            width: activeIdx === i ? 20 : 6,
                            height: 6,
                            borderRadius: 3,
                            background: activeIdx === i ? '#138808' : '#d1d5db',
                            transition: 'all 0.3s ease',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    />
                ))}
            </div>

            <style>{`.flex.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
        </section>
    );
}
