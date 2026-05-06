import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

/* ─── City-specific SEO data ─────────────────────────────────────────────────
   Add more cities here as you expand. For unknown cities, fallback data is used.
   "district" and "nearby" help Google understand the geographic context.
────────────────────────────────────────────────────────────────────────────── */
const CITY_DATA = {
    jhargram: {
        district: "Jhargram District",
        state: "West Bengal",
        geo: { lat: "22.4478", lng: "86.9939" },
        donors: 143,
        nearby: ["Belpahari", "Gopiballavpur", "Nayagram", "Jamboni", "Binpur"],
        hospital: "Jhargram District Hospital",
        bengali: "ঝাড়গ্রাম",
        description:
            "Find verified blood donors in Jhargram instantly. Connect with O+, B+, A+, AB+ donors across Jhargram District, West Bengal — completely free.",
        keywords:
            "blood donor Jhargram, রক্তদাতা ঝাড়গ্রাম, blood donor near me Jhargram, O positive donor Jhargram, emergency blood Jhargram, blood donor Jhargram District",
    },
    midnapore: {
        district: "Paschim Medinipur",
        state: "West Bengal",
        geo: { lat: "22.4230", lng: "87.3230" },
        donors: 98,
        nearby: ["Kharagpur", "Ghatal", "Chandrakona", "Daspur", "Debra"],
        hospital: "Midnapore Medical College & Hospital",
        bengali: "মিদনাপুর",
        description:
            "Find verified blood donors in Midnapore, Paschim Medinipur. Connect with O+, B+, A+ donors near you in minutes — free service by Daanguru.",
        keywords:
            "blood donor Midnapore, blood donor Paschim Medinipur, রক্তদাতা মিদনাপুর, emergency blood Midnapore, O positive blood donor Midnapore",
    },
    kolkata: {
        district: "Kolkata",
        state: "West Bengal",
        geo: { lat: "22.5726", lng: "88.3639" },
        donors: 210,
        nearby: ["Howrah", "Salt Lake", "Dum Dum", "Barasat", "Barrackpore"],
        hospital: "SSKM Hospital / PG Hospital",
        bengali: "কলকাতা",
        description:
            "Find blood donors in Kolkata instantly. 210+ verified donors across Kolkata, Howrah and nearby areas. Emergency blood connection in minutes — free.",
        keywords:
            "blood donor Kolkata, রক্তদাতা কলকাতা, blood donor near me Kolkata, emergency blood Kolkata, O positive blood Kolkata, free blood donor Kolkata",
    },
    kharagpur: {
        district: "Paschim Medinipur",
        state: "West Bengal",
        geo: { lat: "22.3460", lng: "87.2320" },
        donors: 67,
        nearby: ["Medinipur", "Jhargram", "Belda", "Dantan", "Narayangarh"],
        hospital: "IIT Kharagpur Medical Centre",
        bengali: "খড়গপুর",
        description:
            "Find blood donors in Kharagpur, West Bengal. Connect with verified O+, B+, A+ donors in Kharagpur and Paschim Medinipur — completely free.",
        keywords:
            "blood donor Kharagpur, রক্তদাতা খড়গপুর, blood donor near me Kharagpur, emergency blood Kharagpur, free blood donor Kharagpur",
    },
    bankura: {
        district: "Bankura District",
        state: "West Bengal",
        geo: { lat: "23.2324", lng: "87.0753" },
        donors: 45,
        nearby: ["Bishnupur", "Sonamukhi", "Khatra", "Raipur", "Indpur"],
        hospital: "Bankura Sammilani Medical College",
        bengali: "বাঁকুড়া",
        description:
            "Find blood donors in Bankura, West Bengal. Connect with verified donors across Bankura District for emergency blood needs — free service.",
        keywords:
            "blood donor Bankura, রক্তদাতা বাঁকুড়া, blood donor near me Bankura, emergency blood Bankura, free blood donor Bankura District",
    },
    purulia: {
        district: "Purulia District",
        state: "West Bengal",
        geo: { lat: "23.3323", lng: "86.3638" },
        donors: 38,
        nearby: ["Raghunathpur", "Jhalda", "Manbazar", "Bagmundi", "Para"],
        hospital: "Purulia Government Medical College",
        bengali: "পুরুলিয়া",
        description:
            "Find blood donors in Purulia, West Bengal. Connect with verified donors across Purulia District for urgent blood needs — completely free.",
        keywords:
            "blood donor Purulia, রক্তদাতা পুরুলিয়া, blood donor near me Purulia, emergency blood Purulia, free blood donor Purulia",
    },
};

const BLOOD_GROUPS = ["O+", "O−", "A+", "A−", "B+", "B−", "AB+", "AB−"];

const FAQS = (city, district, bengali) => [
    {
        q: `How to find blood donor near me in ${city}?`,
        a: `Visit Daanguru and click "Find a Donor Now". Select your blood group and ${city} as your location. You'll instantly see verified donors in ${city} and ${district}. Contact them directly — completely free.`,
    },
    {
        q: `${bengali}তে রক্তদাতা কিভাবে পাবো?`,
        a: `Daanguru.in-এ যান এবং "Find a Donor Now" ক্লিক করুন। আপনার রক্তের গ্রুপ এবং ${bengali} বেছে নিন। ${district}-এর কাছাকাছি রক্তদাতাদের তালিকা দেখুন এবং সরাসরি যোগাযোগ করুন। সম্পূর্ণ বিনামূল্যে।`,
    },
    {
        q: `Is blood donor search free in ${city}?`,
        a: `Yes — 100% free. Daanguru never charges donors or recipients. The platform is a free community service for people across ${district} and all of West Bengal.`,
    },
    {
        q: `How do I register as a blood donor in ${city}?`,
        a: `Click "Register as Donor" on Daanguru.in, fill in your blood group, ${city} as your location and your contact info. Your profile goes live immediately and people in ${district} can find you.`,
    },
    {
        q: `Which blood groups are available in ${city}?`,
        a: `Daanguru has registered donors for all blood groups in ${city}: A+, A−, B+, B−, O+, O−, AB+, AB−. O+ and B+ are the most common groups available in ${district}.`,
    },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className="border-b border-white/10 last:border-0"
        >
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-white hover:text-red-400 transition-colors"
            >
                <span>{q}</span>
                <span
                    className={`text-red-400 text-lg flex-shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""
                        }`}
                >
                    +
                </span>
            </button>
            {open && (
                <p className="pb-4 text-sm text-white/55 leading-relaxed">{a}</p>
            )}
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
const BloodDonorCityPage = () => {
    const { city } = useParams();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Capitalize city slug → "jhargram" → "Jhargram"
    const capitalizedCity = city
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    // Pull city-specific data, fallback gracefully
    const data = CITY_DATA[city.toLowerCase()] || {
        district: "West Bengal",
        state: "West Bengal",
        geo: { lat: "22.5726", lng: "88.3639" },
        donors: 50,
        nearby: [],
        hospital: "Local Hospital",
        bengali: capitalizedCity,
        description: `Find verified blood donors in ${capitalizedCity}, West Bengal. Connect with O+, B+, A+, AB+ donors near you instantly — completely free service by Daanguru.`,
        keywords: `blood donor ${capitalizedCity}, blood donor near me ${capitalizedCity}, emergency blood ${capitalizedCity}, free blood donor West Bengal`,
    };

    const faqs = FAQS(capitalizedCity, data.district, data.bengali);

    // Schema.org structured data
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "MedicalOrganization",
                name: `Daanguru Blood Donor Network — ${capitalizedCity}`,
                url: `https://www.daanguru.in/blood-donor/${city}/`,
                description: data.description,
                areaServed: [
                    { "@type": "City", name: capitalizedCity },
                    { "@type": "AdministrativeArea", name: data.district },
                    { "@type": "State", name: data.state },
                ],
                serviceType: "Blood Donation Matching",
                medicalSpecialty: "Blood Donation",
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.daanguru.in/" },
                    { "@type": "ListItem", position: 2, name: "Blood Donor", item: "https://www.daanguru.in/blood-donor/" },
                    { "@type": "ListItem", position: 3, name: capitalizedCity, item: `https://www.daanguru.in/blood-donor/${city}/` },
                ],
            },
            {
                "@type": "FAQPage",
                mainEntity: faqs.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
            },
        ],
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <Helmet>
                <title>
                    Blood Donor in {capitalizedCity}, {data.district} | Daanguru
                </title>
                <meta name="description" content={data.description} />
                <meta name="keywords" content={data.keywords} />
                <meta name="robots" content="index, follow" />
                <meta name="geo.region" content="IN-WB" />
                <meta name="geo.placename" content={`${capitalizedCity}, ${data.district}, India`} />
                <meta name="geo.position" content={`${data.geo.lat};${data.geo.lng}`} />
                <meta name="ICBM" content={`${data.geo.lat}, ${data.geo.lng}`} />
                <link rel="canonical" href={`https://www.daanguru.in/blood-donor/${city}/`} />
                <meta property="og:title" content={`Blood Donor in ${capitalizedCity} | Daanguru`} />
                <meta property="og:description" content={data.description} />
                <meta property="og:url" content={`https://www.daanguru.in/blood-donor/${city}/`} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://www.daanguru.in/logo.png" />
                <script type="application/ld+json">{JSON.stringify(schema)}</script>
            </Helmet>

            <div className="max-w-4xl mx-auto">

                {/* ── BREADCRUMB ── */}
                <nav
                    className={`flex items-center gap-2 text-xs text-white/40 mb-8 ${mounted ? "animate-fade-up" : "opacity-0"
                        }`}
                >
                    <Link to="/" className="hover:text-white/70 transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/blood-donor/" className="hover:text-white/70 transition-colors">Blood Donor</Link>
                    <span>/</span>
                    <span className="text-white/70">{capitalizedCity}</span>
                </nav>

                {/* ── HERO ── */}
                <div
                    className={`text-center mb-8 sm:mb-12 ${mounted ? "animate-fade-up" : "opacity-0"
                        }`}
                >
                    {/* Live badge */}
                    <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest mb-6">
                        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        {data.donors}+ Live Donors in {capitalizedCity}
                    </div>

                    <div className="text-6xl sm:text-7xl mb-4 drop-shadow-lg">🩸</div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                        Blood Donors in
                        <br />
                        <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                            {capitalizedCity}
                        </span>
                    </h1>

                    {/* Bengali subtitle — big SEO win */}
                    <p className="text-base text-white/40 mb-3">
                        {data.bengali}তে রক্তদাতা খুঁজুন — বিনামূল্যে
                    </p>

                    <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Find verified blood donors in {capitalizedCity}, {data.district}.
                        Connect with O+, B+, A+, AB+ donors near you in minutes — completely free.
                    </p>

                    {/* CTA buttons — same pattern as CityPage */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                        <Link
                            to="/digital-blood-bank/find"
                            className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white transition-all duration-300 active:scale-95 hover:-translate-y-0.5"
                            style={{ background: "linear-gradient(135deg, #dc2626, #e11d48)", boxShadow: "0 4px 20px rgba(220,38,38,0.4)" }}
                        >
                            🔍 Find a Donor in {capitalizedCity}
                        </Link>
                        <Link
                            to="/digital-blood-bank"
                            className="flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-base font-bold text-white border border-white/20 hover:border-white/40 transition-all duration-300 active:scale-95"
                        >
                            Register as Donor →
                        </Link>
                    </div>
                </div>

                {/* ── STATS STRIP ── */}
                <div
                    className={`glass-card rounded-3xl p-5 sm:p-6 border border-white/10 mb-6 ${mounted ? "animate-fade-up delay-100" : "opacity-0"
                        }`}
                >
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl sm:text-3xl font-bold text-red-400">{data.donors}+</div>
                            <div className="text-xs text-white/50 mt-1">Donors in {capitalizedCity}</div>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-bold text-red-400">8</div>
                            <div className="text-xs text-white/50 mt-1">Blood Groups</div>
                        </div>
                        <div>
                            <div className="text-2xl sm:text-3xl font-bold text-red-400">100%</div>
                            <div className="text-xs text-white/50 mt-1">Free Service</div>
                        </div>
                    </div>
                </div>

                {/* ── MAIN CARD ── */}
                <div
                    className={`glass-card rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 backdrop-blur-xl border border-white/10 ${mounted ? "animate-fade-up delay-100" : "opacity-0"
                        }`}
                >
                    {/* Blood groups grid */}
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                        All Blood Groups Available in {capitalizedCity}
                    </h2>
                    <p className="text-sm text-white/50 mb-5">
                        Select a blood group to find matching donors in {capitalizedCity} and {data.district}.
                    </p>
                    <div className="grid grid-cols-4 gap-3 mb-8">
                        {BLOOD_GROUPS.map((bg) => (
                            <Link
                                key={bg}
                                to={`/digital-blood-bank/find?city=${city}&group=${bg.toLowerCase().replace("+", "-positive").replace("−", "-negative")}`}
                                className="bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/40 rounded-2xl py-3 px-2 text-center transition-all duration-200 hover:-translate-y-0.5 group"
                            >
                                <div className="text-base sm:text-lg font-bold text-red-400 group-hover:text-red-300">
                                    {bg}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* How it works */}
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-5">
                        How to Find a Donor in {capitalizedCity}
                    </h2>
                    <div className="space-y-4">
                        {[
                            {
                                icon: "🔍",
                                title: `Search in ${capitalizedCity}`,
                                desc: `Enter your pincode or select ${capitalizedCity} and choose your required blood group.`,
                            },
                            {
                                icon: "👤",
                                title: "Browse Verified Donors",
                                desc: `See real, available donors in ${capitalizedCity} and nearby areas of ${data.district}.`,
                            },
                            {
                                icon: "📞",
                                title: "Connect Directly",
                                desc: `Call or WhatsApp the donor directly. No middleman, no fees, no delay.`,
                            },
                        ].map((s, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-4 bg-white/5 rounded-2xl p-4 border border-white/10"
                            >
                                <span className="text-2xl flex-shrink-0">{s.icon}</span>
                                <div>
                                    <div className="text-sm font-bold text-white mb-1">{s.title}</div>
                                    <div className="text-xs text-white/50 leading-relaxed">{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── NEARBY AREAS ── (key for local SEO) */}
                {data.nearby.length > 0 && (
                    <div
                        className={`glass-card rounded-3xl p-6 sm:p-8 mb-6 border border-white/10 ${mounted ? "animate-fade-up delay-150" : "opacity-0"
                            }`}
                    >
                        <h2 className="text-lg font-bold text-white mb-2">
                            Also Covering Areas Near {capitalizedCity}
                        </h2>
                        <p className="text-xs text-white/40 mb-4">
                            Daanguru blood donors also serve these areas in {data.district}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {data.nearby.map((area) => (
                                <span
                                    key={area}
                                    className="bg-white/5 border border-white/10 text-white/60 text-xs font-medium px-3 py-1.5 rounded-full"
                                >
                                    📍 {area}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── EMERGENCY BANNER ── */}
                <div
                    className={`rounded-3xl p-7 text-center mb-6 relative overflow-hidden ${mounted ? "animate-fade-up delay-150" : "opacity-0"
                        }`}
                    style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
                >
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: "radial-gradient(ellipse 60% 80% at 50% 120%, rgba(0,0,0,0.3), transparent)" }}
                    />
                    <div className="relative z-10">
                        <div className="text-3xl mb-2">🚨</div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                            Emergency Blood Required in {capitalizedCity}?
                        </h2>
                        <p className="text-red-100 text-sm mb-5 max-w-md mx-auto">
                            Post an emergency request. Our network will notify nearby donors in {capitalizedCity} and {data.district} immediately.
                        </p>
                        <Link
                            to="/digital-blood-bank"
                            className="inline-flex items-center gap-2 bg-white text-red-600 rounded-2xl px-7 py-3 font-bold text-sm hover:bg-red-50 transition-all active:scale-95"
                        >
                            Post Emergency Request →
                        </Link>
                    </div>
                </div>

                {/* ── SEO TEXT BLOCK ── (critical for Google) */}
                <div
                    className={`glass-card rounded-3xl p-6 sm:p-8 mb-6 border border-white/10 ${mounted ? "animate-fade-up delay-150" : "opacity-0"
                        }`}
                >
                    <h2 className="text-lg font-bold text-white mb-4">
                        Blood Donor Network in {capitalizedCity}, {data.district}
                    </h2>
                    <p className="text-sm text-white/55 leading-relaxed mb-3">
                        Daanguru connects people who urgently need blood with verified, willing donors across{" "}
                        <strong className="text-white/80">{capitalizedCity}</strong> and all of{" "}
                        <strong className="text-white/80">{data.district}</strong>. Whether you need O positive,
                        B positive, A positive, AB positive or any rare blood group — our platform helps you find
                        a matching donor in {capitalizedCity} within minutes, completely free.
                    </p>
                    <p className="text-sm text-white/55 leading-relaxed mb-3">
                        The nearest major hospital in this area is{" "}
                        <strong className="text-white/80">{data.hospital}</strong>. Daanguru's donor network
                        complements hospital blood banks by connecting recipients with community donors who can
                        donate on short notice.
                    </p>
                    {/* Bengali paragraph — targets Bengali search queries */}
                    <p className="text-sm text-white/50 leading-relaxed">
                        <strong className="text-white/70">রক্তদান জীবন বাঁচায়।</strong>{" "}
                        {data.bengali} এবং {data.district}-এর সমস্ত এলাকায় আমাদের বিনামূল্যে রক্তদাতা
                        নেটওয়ার্কে যোগ দিন। রক্তদাতা হিসেবে নিবন্ধন করুন এবং আপনার কাছের মানুষদের জীবন বাঁচান।
                    </p>
                </div>

                {/* ── FAQ ── */}
                <div
                    className={`glass-card rounded-3xl p-6 sm:p-8 mb-6 border border-white/10 ${mounted ? "animate-fade-up delay-200" : "opacity-0"
                        }`}
                >
                    <h2 className="text-lg font-bold text-white mb-1">
                        Frequently Asked Questions — {capitalizedCity}
                    </h2>
                    <p className="text-xs text-white/40 mb-5">
                        Common questions about finding blood donors in {capitalizedCity} and {data.district}
                    </p>
                    <div>
                        {faqs.map((f, i) => (
                            <FaqItem key={i} q={f.q} a={f.a} />
                        ))}
                    </div>
                </div>

                {/* ── OTHER CITIES ── (internal linking for SEO) */}
                <div
                    className={`mb-8 ${mounted ? "animate-fade-up delay-200" : "opacity-0"}`}
                >
                    <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-3">
                        Find Donors in Other Cities
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(CITY_DATA)
                            .filter(([slug]) => slug !== city.toLowerCase())
                            .slice(0, 6)
                            .map(([slug, d]) => (
                                <Link
                                    key={slug}
                                    to={`/blood-donor/${slug}/`}
                                    className="glass-card border border-white/10 hover:border-red-400/50 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 group"
                                >
                                    <div className="text-sm font-bold text-white group-hover:text-red-300 mb-1">
                                        {slug.charAt(0).toUpperCase() + slug.slice(1)}
                                    </div>
                                    <div className="text-xs text-red-400 font-semibold">🩸 {d.donors}+ donors</div>
                                    <div className="text-[11px] text-white/40 mt-0.5">{d.district}</div>
                                </Link>
                            ))}
                    </div>
                </div>

                {/* ── ACTION BUTTONS ── same pattern as original CityPage */}
                <div
                    className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${mounted ? "animate-fade-up delay-200" : "opacity-0"
                        }`}
                >
                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2 rounded-2xl px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-900 bg-white hover:bg-gray-100 transition-all duration-300 active:scale-95"
                    >
                        ← Back to Home
                    </Link>
                    <Link
                        to="/digital-blood-bank/find"
                        className="w-full flex items-center justify-center gap-2 rounded-2xl px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white transition-all duration-300 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #dc2626, #e11d48)" }}
                    >
                        Find Donors in {capitalizedCity} →
                    </Link>
                </div>

                {/* ── FOOTER NOTE ── */}
                <div
                    className={`text-center mt-10 ${mounted ? "animate-fade-up delay-200" : "opacity-0"
                        }`}
                >
                    <p className="text-white/30 text-sm">
                        Serving blood donor needs across {capitalizedCity}, {data.district} and all of West Bengal — free, always.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BloodDonorCityPage;
