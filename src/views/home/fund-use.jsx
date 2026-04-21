import { motion, useInView } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

/* ─── Data ─── */
const donors = [
    { name: 'Priya M.', amount: 500, city: 'Mumbai', avatar: '🌸', date: 'Apr 2025' },
    { name: 'Rahul K.', amount: 200, city: 'Delhi', avatar: '🦁', date: 'Mar 2025' },
    { name: 'Ananya S.', amount: 1000, city: 'Bangalore', avatar: '🌻', date: 'Mar 2025' },
    { name: 'Vikram T.', amount: 100, city: 'Pune', avatar: '🐯', date: 'Feb 2025' },
    { name: 'Sneha R.', amount: 50, city: 'Chennai', avatar: '🦋', date: 'Feb 2025' },
    { name: 'Arjun D.', amount: 300, city: 'Hyderabad', avatar: '🌊', date: 'Jan 2025' },
    { name: 'Meera P.', amount: 150, city: 'Kolkata', avatar: '🌺', date: 'Jan 2025' },
    { name: 'Karan J.', amount: 75, city: 'Ahmedabad', avatar: '🦊', date: 'Dec 2024' },
];

const tableData = [
    { date: '05 Apr 2026', purpose: 'Tree saplings (30 nos.)', amount: 3000, status: 'Completed' },
    { date: '12 Mar 2026', purpose: 'Cloudflare Workers Pro plan', amount: 2000, status: 'Completed' },
    { date: '20 Feb 2026', purpose: 'Blankets for Purulia families', amount: 5000, status: 'Completed' },
    { date: '03 Jan 2026', purpose: 'UI/UX redesign sprint', amount: 4200, status: 'Completed' },
    { date: '15 Dec 2025', purpose: 'Sapling logistics & planting', amount: 4500, status: 'Completed' },
    { date: '01 Nov 2025', purpose: 'Community food drive', amount: 2400, status: 'Completed' },
    { date: '10 Oct 2025', purpose: 'Domain renewal (2 yrs)', amount: 1500, status: 'Completed' },
];
const totalRaised = donors.reduce((s, d) => s + d.amount, 0);

const usageCategories = [
    {
        id: 'server',
        emoji: '🖥️',
        label: 'Server & Hosting',
        percent: 55,
        amount: Math.round(totalRaised * 0.55),
        color: '#3a9ae3',
        lightColor: 'rgba(58,154,227,0.18)',
        borderColor: 'rgba(58,154,227,0.35)',
        description: 'Keeps DaanGuru online 24/7. Fast servers mean your listings load instantly, even in low-network areas.',
        items: ['Cloud hosting (AWS/Vercel)', 'CDN for images', 'Database storage', 'Backups & security'],
    },
    {
        id: 'trees',
        emoji: '🌳',
        label: 'Tree Plantation',
        percent: 28,
        amount: Math.round(totalRaised * 0.28),
        color: '#1d9e75',
        lightColor: 'rgba(29,158,117,0.18)',
        borderColor: 'rgba(29,158,117,0.35)',
        description: 'For every ₹100 donated, we plant a sapling via our NGO partner network across Maharashtra & UP.',
        items: ['Sapling procurement', 'NGO partnerships', 'Plantation drives', 'Survival monitoring'],
    },
    {
        id: 'ops',
        emoji: '⚙️',
        label: 'Operations',
        percent: 10,
        amount: Math.round(totalRaised * 0.10),
        color: '#ef9f27',
        lightColor: 'rgba(239,159,39,0.18)',
        borderColor: 'rgba(239,159,39,0.35)',
        description: 'Domain renewals, email infra, SMS alerts, and the admin tools that keep the platform running smoothly.',
        items: ['Domain & DNS', 'Email service', 'SMS notifications', 'Analytics tools'],
    },
    {
        id: 'community',
        emoji: '🤝',
        label: 'Community Growth',
        percent: 7,
        amount: Math.round(totalRaised * 0.07),
        color: '#ff6f61',
        lightColor: 'rgba(255,111,97,0.18)',
        borderColor: 'rgba(255,111,97,0.35)',
        description: 'Awareness campaigns, printing pamphlets for rural areas, and coordinating donation drives.',
        items: ['Awareness campaigns', 'Rural outreach', 'Social media', 'Volunteer coordination'],
    },
];

const treesMilestones = [
    { trees: 10, label: 'First Grove', unlocked: true },
    { trees: 50, label: 'Mini Forest', unlocked: true },
    { trees: 100, label: 'Community Park', unlocked: false },
    { trees: 500, label: 'Urban Jungle', unlocked: false },
];
const treesPlanted = 63;

/* ─── Animated counter ─── */
function Counter({ to, prefix = '', suffix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const duration = 1400;
        const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * to));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(to);
        };
        requestAnimationFrame(step);
    }, [inView, to]);

    return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

/* ─── Donut chart SVG ─── */
function DonutChart() {
    const size = 220;
    const cx = size / 2;
    const cy = size / 2;
    const r = 80;
    const stroke = 28;
    const circumference = 2 * Math.PI * r;
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    let offset = 0;
    const segments = usageCategories.map((cat) => {
        const dash = (cat.percent / 100) * circumference;
        const gap = circumference - dash;
        const seg = { ...cat, dashArray: `${dash} ${gap}`, dashOffset: -(offset) };
        offset += dash;
        return seg;
    });

    return (
        <div ref={ref} className="relative flex items-center justify-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                {/* Track */}
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
                {segments.map((seg, i) => (
                    <motion.circle
                        key={seg.id}
                        cx={cx} cy={cy} r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={stroke}
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        strokeLinecap="butt"
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                        style={{ filter: `drop-shadow(0 0 8px ${seg.color}60)` }}
                    />
                ))}
            </svg>
            {/* Center label */}
            <div className="absolute text-center pointer-events-none">
                <p className="text-xs text-white/50 font-semibold">Total Raised</p>
                <p className="text-2xl font-extrabold text-white">
                    ₹<Counter to={totalRaised} />
                </p>
            </div>
        </div>
    );
}

/* ─── Cartoon Tree SVG ─── */
function CartoonTree({ size = 60, color = '#1d9e75', delay = 0, planted = true }) {
    return (
        <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={planted ? { scale: 1, y: 0 } : { scale: 0.4, y: 10, opacity: 0.35 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay }}
            style={{ width: size, height: size }}
            className="inline-flex items-end justify-center"
        >
            <svg viewBox="0 0 60 70" width={size} height={size * 1.17}>
                {/* Shadow */}
                <ellipse cx="30" cy="67" rx="14" ry="4" fill="rgba(0,0,0,0.18)" />
                {/* Trunk */}
                <rect x="25" y="48" width="10" height="18" rx="3" fill="#8B5E3C" />
                {/* Bottom canopy */}
                <ellipse cx="30" cy="44" rx="22" ry="16" fill={color} style={{ filter: `brightness(0.85)` }} />
                {/* Mid canopy */}
                <ellipse cx="30" cy="33" rx="18" ry="14" fill={color} />
                {/* Top canopy */}
                <ellipse cx="30" cy="22" rx="13" ry="12" fill={color} style={{ filter: `brightness(1.1)` }} />
                {/* Highlight */}
                <ellipse cx="24" cy="18" rx="5" ry="4" fill="rgba(255,255,255,0.18)" />
                {/* Fruits / sparkles */}
                {planted && <>
                    <circle cx="20" cy="38" r="3" fill="#ef9f27" />
                    <circle cx="40" cy="34" r="2.5" fill="#ff6f61" />
                    <circle cx="34" cy="44" r="2" fill="#ef9f27" />
                </>}
            </svg>
        </motion.div>
    );
}

/* ─── Main page ─── */
export default function FundUsagePage() {
    const heroRef = useRef(null);
    const [showAll, setShowAll] = useState(false);
    const visibleTable = showAll ? tableData : tableData.slice(0, 4);
    return (
        <>
            <Helmet>
                <title>Fund Usage Transparency - DaanGuru</title>
                <meta name="description" content="See complete transparency on how DaanGuru uses donations. View detailed fund allocation for platform maintenance, community initiatives, and charitable activities." />
                <meta name="keywords" content="transparency, fund usage, allocation, charity funds, daanguru" />
                <meta property="og:title" content="Fund Usage Transparency - DaanGuru" />
                <meta property="og:description" content="See how DaanGuru uses donations transparently. Complete fund allocation details for platform and community initiatives." />
                <meta property="og:image" content="https://www.daanguru.in/images/logo.png" />
                <meta property="og:url" content="https://www.daanguru.in/fund-usage" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://www.daanguru.in/fund-usage" />
            </Helmet>
            <div className="mx-auto max-w-3xl px-4 pt-4 pb-28 lg:pb-10 space-y-10">

            {/* ── Hero ── */}
            <motion.div
                ref={heroRef}
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center pt-2"
            >
                <motion.div
                    animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="text-5xl mb-3"
                >💚</motion.div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                    Aapka Paisa Kahan Gaya?
                </h1>
                <p className="text-sm text-white/60 mt-1.5 max-w-xs mx-auto">
                    100% transparent. Every rupee accounted for.
                </p>
            </motion.div>

            {/* ── Stats row ── */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="grid grid-cols-3 gap-3"
            >
                {[
                    { label: 'Total Raised', value: totalRaised, prefix: '₹', emoji: '💰' },
                    { label: 'Donors', value: donors.length, suffix: '+', emoji: '🙏' },
                    { label: 'Trees Planted', value: treesPlanted, suffix: '', emoji: '🌳' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.08, type: 'spring', stiffness: 220, damping: 20 }}
                        className="rounded-2xl text-center py-4 px-2"
                        style={{
                            background: 'rgba(255,255,255,0.09)',
                            backdropFilter: 'blur(18px)',
                            border: '1px solid rgba(255,255,255,0.14)',
                        }}
                    >
                        <div className="text-2xl mb-1">{stat.emoji}</div>
                        <div className="text-xl font-extrabold text-white">
                            <Counter to={stat.value} prefix={stat.prefix ?? ''} suffix={stat.suffix ?? ''} />
                        </div>
                        <div className="text-[10px] text-white/50 font-semibold mt-0.5">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── Donut + Legend ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="rounded-3xl p-5 lg:p-7"
                style={{
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(22px)',
                    border: '1px solid rgba(255,255,255,0.13)',
                }}
            >
                <h2 className="text-base font-extrabold text-white mb-5 text-center">Paisa Kahan Gaya 📊</h2>
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    <DonutChart />
                    <div className="flex-1 w-full space-y-3">
                        {usageCategories.map((cat, i) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
                                className="flex items-center gap-3"
                            >
                                <div className="text-xl shrink-0">{cat.emoji}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-white/90">{cat.label}</span>
                                        <span className="text-xs font-extrabold" style={{ color: cat.color }}>
                                            {cat.percent}%
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <motion.div
                                            className="h-full rounded-full"
                                            style={{ background: cat.color, boxShadow: `0 0 8px ${cat.color}80` }}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cat.percent}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-white/50 shrink-0 font-semibold">₹{cat.amount}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Category cards ── */}
            <div className="space-y-4">
                <h2 className="text-base font-extrabold text-white">Breakdown in Detail 🔍</h2>
                {usageCategories.map((cat, i) => (
                    <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
                        className="rounded-2xl p-4 lg:p-5"
                        style={{
                            background: cat.lightColor,
                            backdropFilter: 'blur(18px)',
                            border: `1px solid ${cat.borderColor}`,
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="text-3xl shrink-0 rounded-2xl w-14 h-14 flex items-center justify-center"
                                style={{ background: 'rgba(255,255,255,0.10)', border: `1px solid ${cat.borderColor}` }}
                            >
                                {cat.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h3 className="text-sm font-extrabold text-white">{cat.label}</h3>
                                    <span
                                        className="text-xs font-extrabold px-2.5 py-1 rounded-full"
                                        style={{ background: 'rgba(255,255,255,0.12)', color: cat.color }}
                                    >
                                        {cat.percent}% · ₹{cat.amount}
                                    </span>
                                </div>
                                <p className="text-xs text-white/65 mt-1.5 leading-relaxed">{cat.description}</p>
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {cat.items.map((item) => (
                                        <span
                                            key={item}
                                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)' }}
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* ── Tree plantation cartoon section ── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45 }}
                className="rounded-3xl p-5 lg:p-7 overflow-hidden relative"
                style={{
                    background: 'linear-gradient(135deg, rgba(29,158,117,0.22), rgba(15,111,83,0.15))',
                    backdropFilter: 'blur(22px)',
                    border: '1px solid rgba(29,158,117,0.3)',
                }}
            >
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #1d9e75, transparent)' }} />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
                    style={{ background: 'radial-gradient(circle, #3a9ae3, transparent)' }} />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🌳</span>
                        <h2 className="text-base font-extrabold text-white">Our Forest</h2>
                        <span className="ml-auto text-xs font-extrabold px-3 py-1 rounded-full"
                            style={{ background: 'rgba(29,158,117,0.3)', color: '#5dcaa5', border: '1px solid rgba(29,158,117,0.4)' }}>
                            {treesPlanted} planted
                        </span>
                    </div>
                    <p className="text-xs text-white/55 mb-5">
                        Har ₹100 donation = 1 ped. Milke ek jungle banana hai! 🌱
                    </p>

                    {/* Cartoon forest */}
                    <div className="flex items-end justify-center gap-1 flex-wrap mb-6">
                        {Array.from({ length: 20 }).map((_, i) => {
                            const planted = i < Math.round(treesPlanted / 5);
                            const colors = ['#1d9e75', '#0f6f53', '#22bb88', '#16a87e', '#2ed4a0'];
                            const sizes = [42, 50, 38, 54, 44, 46];
                            return (
                                <CartoonTree
                                    key={i}
                                    size={sizes[i % sizes.length]}
                                    color={colors[i % colors.length]}
                                    delay={0.05 * i}
                                    planted={planted}
                                />
                            );
                        })}
                    </div>

                    {/* Milestones */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {treesMilestones.map((m, i) => (
                            <motion.div
                                key={m.trees}
                                initial={{ opacity: 0, scale: 0.85 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * i, type: 'spring', stiffness: 220, damping: 18 }}
                                className="rounded-xl p-3 text-center relative overflow-hidden"
                                style={{
                                    background: m.unlocked ? 'rgba(29,158,117,0.25)' : 'rgba(255,255,255,0.05)',
                                    border: m.unlocked ? '1px solid rgba(29,158,117,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                <div className="text-xl mb-0.5">{m.unlocked ? '🏆' : '🔒'}</div>
                                <div className="text-xs font-extrabold text-white">{m.trees} trees</div>
                                <div className="text-[10px] text-white/50 mt-0.5">{m.label}</div>
                                {m.unlocked && (
                                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-400"
                                        style={{ boxShadow: '0 0 6px #4ade80' }} />
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Progress to next milestone */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-white/60 font-semibold">Progress to Community Park 🌲</span>
                            <span className="text-xs font-extrabold text-green-400">{treesPlanted}/100</span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <motion.div
                                className="h-full rounded-full relative overflow-hidden"
                                style={{ background: 'linear-gradient(90deg, #1d9e75, #22bb88)' }}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${treesPlanted}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                            >
                                {/* Shimmer */}
                                <motion.div
                                    className="absolute inset-y-0 w-8 -skew-x-12"
                                    style={{ background: 'rgba(255,255,255,0.3)' }}
                                    animate={{ x: ['-200%', '600%'] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 1.5 }}
                                />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Donors table ── */}
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl overflow-hidden"
                style={{
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(22px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                }}
            >
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-extrabold text-white">Hamare Heroes 🙏</h2>
                        <p className="text-xs text-white/50 mt-0.5">Log jinki wajah se ye platform zinda hai</p>
                    </div>
                    <span className="text-xs font-extrabold px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(239,159,39,0.18)', color: '#ef9f27', border: '1px solid rgba(239,159,39,0.3)' }}>
                        {donors.length} donors
                    </span>
                </div>

                <div className="divide-y divide-white/[0.06]">
                    {donors.map((donor, i) => (
                        <motion.div
                            key={donor.name}
                            initial={{ opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className="flex items-center gap-3 px-5 py-3.5"
                        >
                            {/* Avatar */}
                            <div
                                className="h-9 w-9 rounded-full flex items-center justify-center text-xl shrink-0"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                            >
                                {donor.avatar}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white leading-none">{donor.name}</p>
                                <p className="text-xs text-white/45 mt-0.5">{donor.city} · {donor.date}</p>
                            </div>

                            <div className="text-right shrink-0">
                                <p className="text-sm font-extrabold" style={{ color: '#ef9f27' }}>₹{donor.amount}</p>
                                {donor.amount >= 500 && (
                                    <span className="text-[10px] font-semibold text-green-400">Super Hero ⭐</span>
                                )}
                                {donor.amount >= 100 && donor.amount < 500 && (
                                    <span className="text-[10px] font-semibold text-blue-300">Hero 💙</span>
                                )}
                                {donor.amount < 100 && (
                                    <span className="text-[10px] font-semibold text-white/40">Kind Soul 🤍</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="p-5 border-t border-white/10 flex items-center justify-between">
                    <p className="text-xs text-white/45">Want to be on this list?</p>
                    <a
                        href="/support"
                        className="text-xs font-extrabold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
                        style={{ background: 'rgba(29,158,117,0.8)', color: 'white' }}
                    >
                        Donate Now 💚
                    </a>
                </div>
            </motion.div>
            {/* Transparency Table */}
            <section className="mt-14">
                <h2 className="text-lg lg:text-xl font-extrabold text-foreground text-center mb-6">
                    Detailed Ledger 📒
                </h2>

                {/* Desktop table */}
                <div className="hidden sm:block rounded-2xl border border-border/50 overflow-hidden bg-card/80 backdrop-blur-md">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-muted/40">
                                <th className="px-4 py-3 text-left font-bold text-muted-foreground text-xs">Date</th>
                                <th className="px-4 py-3 text-left font-bold text-muted-foreground text-xs">Purpose</th>
                                <th className="px-4 py-3 text-right font-bold text-muted-foreground text-xs">Amount</th>
                                <th className="px-4 py-3 text-center font-bold text-muted-foreground text-xs">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleTable.map((row, i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 text-muted-foreground font-medium">{row.date}</td>
                                    <td className="px-4 py-3 font-semibold text-foreground">{row.purpose}</td>
                                    <td className="px-4 py-3 text-right font-bold text-foreground">₹{row.amount.toLocaleString('en-IN')}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                                            <ShieldCheck className="h-3 w-3" /> {row.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                    {visibleTable.map((row, i) => (
                        <div key={i} className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-md p-4 card-shadow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold text-foreground">{row.purpose}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{row.date}</p>
                                </div>
                                <p className="text-sm font-extrabold text-foreground">₹{row.amount.toLocaleString('en-IN')}</p>
                            </div>
                            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                                <ShieldCheck className="h-3 w-3" /> {row.status}
                            </span>
                        </div>
                    ))}
                </div>

                {tableData.length > 4 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="mx-auto mt-4 flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                        {showAll ? 'Show less' : 'View all entries'} <ChevronDown className={`h-3 w-3 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                    </button>
                )}
            </section>
            {/* ── Pledge footer ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="rounded-3xl p-6 text-center"
                style={{
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(22px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                }}
            >
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="text-base font-extrabold text-white">Humara Vaada</h3>
                <p className="text-xs text-white/60 mt-2 max-w-sm mx-auto leading-relaxed">
                    DaanGuru will always be <span className="text-green-400 font-bold">100% non-profit</span>.
                    We publish fund usage every quarter. No salaries, no profit — only purpose.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                    {['Zero Profit 🚫', 'Quarterly Reports 📋', 'Open Source 💻', 'NGO Verified ✅'].map((tag) => (
                        <span key={tag} className="text-[11px] font-semibold px-3 py-1 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.12)' }}>
                            {tag}
                        </span>
                    ))}
                </div>
            </motion.div>

        </div>
        </>
    );
}
