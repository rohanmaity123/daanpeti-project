import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Droplet, Stethoscope, Users, Gift, GraduationCap,
    ArrowUpRight, ArrowRight, MapPin, Calendar, ChevronDown,
} from "lucide-react";
import { BlogWidget } from "../../components/blog/BlogWidget";
import { TestimonialSection } from "../../components/Testimonial";
import { Facebook, LinkedIn, YouTube, Instagram } from "@mui/icons-material";
import "../../scss/landing.scss";
import CustomCursor from "../../components/Ui/Customcursor";
import Hero3D from "../../components/Ui/HeroSection";
import logo from "../../assets/images/logo.png";

// Staggered scroll-in for the services grid — each card separates from the
// group with its own delay, echoing the objects "settling" out of the hero orb.
const servicesContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
};
const serviceCardVariants = {
    hidden: { opacity: 0, y: 36, scale: 0.94, rotateX: 8 },
    visible: {
        opacity: 1, y: 0, scale: 1, rotateX: 0,
        transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] },
    },
};

// ─── DATA (unchanged) ───────────────────────────────────────────────────────
const SERVICES = [
    {
        id: "blood",
        to: "/digital-blood-bank/find",
        icon: Droplet,
        color: "#ef4444",
        tag: "🩸 Life-saving",
        title: "Digital Blood Bank",
        desc: "Find a donor in your city right now, or register so someone can find you when it matters.",
        stat: "1,240+ donors listed",
        featured: true,
    },
    {
        id: "health",
        to: "/find-doctor",
        icon: Stethoscope,
        color: "#8b5cf6",
        tag: "🩺 Guidance",
        title: "AI Health Assistant",
        desc: "Describe how you're feeling and get pointed to the right kind of doctor nearby.",
        stat: "Available 24×7",
    },
    {
        id: "community",
        to: "/community",
        icon: Users,
        color: "#1D9E75",
        tag: "🏘️ Mohalla",
        title: "Neighbourhood Feed",
        desc: "Alerts, events, questions, lost & found — everything happening around your street.",
        stat: "342 neighbours active",
    },
    {
        id: "products",
        to: "/products",
        icon: Gift,
        color: "#eab308",
        tag: "🎁 Free",
        title: "DaanGuru Marketplace",
        desc: "Give away what you don't need. Pick up what you do. Muft mein do, muft mein lo.",
        stat: "3,800+ items given",
    },
    {
        id: "certificate",
        to: "/school-leaving-certificate",
        icon: GraduationCap,
        color: "#6366f1",
        tag: "🎓 Documents",
        title: "Certificate Generator",
        desc: "Fill in a few details and download a school leaving certificate, ready to print.",
        stat: "Takes under 2 minutes",
    },
];

const MARQUEE_ITEMS = [
    "Blood on demand", "AI health guidance", "Hyperlocal community",
    "Free marketplace", "Instant certificates", "Built by Maity's Tech Lab",
];

const BLOGS = [
    {
        emoji: "🩸",
        color: "#ef4444",
        tag: "Blood Bank",
        date: "Aug 2026",
        title: "Why a donor network beats a hospital call sheet",
        excerpt: "Most emergency blood requests are won or lost in the first 30 minutes. Here's how a live, searchable donor list closes that gap.",
    },
    {
        emoji: "🤖",
        color: "#8b5cf6",
        tag: "AI Health",
        date: "Jul 2026",
        title: "Rural healthcare's real bottleneck isn't doctors — it's discovery",
        excerpt: "There are more clinics nearby than most people realise. The hard part is knowing which one to call. That's the gap our assistant closes.",
    },
    {
        emoji: "🎓",
        color: "#6366f1",
        tag: "Documents",
        date: "Jun 2026",
        title: "The hidden cost of a two-week-long school certificate",
        excerpt: "Every delayed certificate is a delayed admission. We rebuilt the process so it takes minutes, not visits to the office.",
    },
];

const FAQS = [
    {
        q: "Is Maity's Tech Lab one app or five separate ones?",
        a: "One account, five tools. Sign in once and move between the blood bank, health assistant, community feed, marketplace and certificate generator without logging in again.",
    },
    {
        q: "Do I have to pay for any of these services?",
        a: "No. Every service on this page is free to use — no subscription, no per-use fee, no hidden charges.",
    },
    {
        q: "Which areas do you currently cover?",
        a: "We started in Jhargram and Midnapore and have since expanded across West Bengal, with donors and listings now appearing in Kolkata, Kharagpur, Bankura and Purulia too.",
    },
    {
        q: "How is my data used when I register as a blood donor?",
        a: "Your contact details are only shown to people actively searching for your blood group in your area — never sold, never used for marketing.",
    },
    {
        q: "Can a business or clinic list itself on the AI Health Assistant?",
        a: "Yes — verified clinics and doctors can be added so the assistant can recommend them. Reach out through the Support page to get listed.",
    },
];

const FOOTER_SERVICE_LINKS = SERVICES.map(s => ({ to: s.to, label: s.title }));
const FOOTER_COMPANY_LINKS = [
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/terms", label: "Terms" },
];

const HERO_STATS = [
    ["1,240+", "Blood donors"],
    ["3,800+", "Items donated"],
    ["342", "Active neighbours"],
];

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
function Reveal({ children, delay = 0 }) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
            { threshold: 0.15 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`tl3d-reveal ${visible ? "tl3d-reveal-visible" : ""}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
function Marquee() {
    const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
    return (
        <div className="tl3d-marquee">
            <div className="tl3d-marquee-track">
                {items.map((item, i) => (
                    <span key={i} className="tl3d-marquee-item">{item}</span>
                ))}
            </div>
        </div>
    );
}

// ─── SERVICE CARD ────────────────────────────────────────────────────────────
function ServiceCard({ service }) {
    const Icon = service.icon;
    return (
        <motion.div
            variants={serviceCardVariants}
            className={service.featured ? "tl3d-card-featured" : ""}
            style={{ "--card-color": service.color }}
        >
            <Link
                to={service.to}
                className={`tl3d-card tl3d-viewable ${service.featured ? "tl3d-card-featured" : ""}`}
                style={{ "--card-color": service.color }}
            >
                <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <span className="tl3d-card-icon">
                            <Icon size={19} color={service.color} strokeWidth={2.2} />
                        </span>
                        <span className="tl3d-card-tag">{service.tag}</span>
                    </div>
                    <h3 className="tl3d-card-title">{service.title}</h3>
                    <p className="tl3d-card-desc">{service.desc}</p>
                </div>
                <div className="tl3d-card-foot">
                    <span className="tl3d-card-stat">{service.stat}</span>
                    <span className="tl3d-card-arrow">
                        <ArrowUpRight size={15} color="rgba(255,255,255,0.7)" strokeWidth={2.5} />
                    </span>
                </div>
            </Link>
        </motion.div>
    );
}

// ─── BLOG CARD ───────────────────────────────────────────────────────────────
function BlogCard({ post, featured }) {
    return (
        <article className={`tl3d-blog-card tl3d-viewable ${featured ? "tl3d-blog-featured" : ""}`}>
            <div className="tl3d-blog-meta">
                <Calendar size={12} /> {post.date}
            </div>
            <span className="tl3d-blog-tag" style={{ color: post.color }}>{post.tag}</span>
            <h3 className="tl3d-blog-title">{post.title}</h3>
            <p className="tl3d-blog-excerpt">{post.excerpt}</p>
            <span className="tl3d-blog-read">
                Read more <ArrowRight size={13} />
            </span>
        </article>
    );
}

// ─── FAQ ACCORDION ──────────────────────────────────────────────────────────
function FaqRow({ index, q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="tl3d-faq-row" data-open={open}>
            <button className="tl3d-faq-btn tl3d-viewable" onClick={() => setOpen(v => !v)}>
                <span className="tl3d-faq-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="tl3d-faq-q">{q}</span>
                <ChevronDown
                    size={16}
                    className="tl3d-faq-chevron"
                    color={open ? "#1D9E75" : "rgba(245,245,240,0.4)"}
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>
            <div className="tl3d-faq-answer" style={{ maxHeight: open ? 260 : 0 }}>
                <p>{a}</p>
            </div>
        </div>
    );
}

// ─── SECTION HEADER ─────────────────────────────────────────────────────────
function SectionHeader({ eyebrow, title, sub }) {
    return (
        <Reveal>
            <div style={{ marginBottom: 32 }}>
                <span className="tl3d-eyebrow">{eyebrow}</span>
                <h2 className="tl3d-heading">{title}</h2>
                {sub && <p className="tl3d-subtext">{sub}</p>}
            </div>
        </Reveal>
    );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function LandingFooter() {
    const socials = [
        { Icon: Instagram, href: "https://www.instagram.com/_the_developer_guy_/" },
        { Icon: Facebook, href: "https://www.facebook.com/rohan.maity.393" },
        { Icon: LinkedIn, href: "https://www.linkedin.com/in/rohan-maity-32575a111" },
        { Icon: YouTube, href: "https://www.youtube.com/@lalpaharirdeshofficial" },
    ];

    return (
        <footer className="tl3d-footer">
            <div className="tl3d-footer-statement">
                <h2>Build useful. Build local.<br />Build for <span>people</span>.</h2>
                <div className="tl3d-footer-brand"><img src={logo} alt="Maity's Tech Lab" className="tl3d-footer-logo" /></div>
            </div>

            <div className="tl3d-footer-grid">
                <div>
                    <p style={{ fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.7, maxWidth: 280, margin: "0 0 16px" }}>
                        Five free tools built for one neighbourhood at a time — blood, health, community, giving and paperwork.
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                        {socials.map(({ Icon, href }, i) => (
                            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="tl3d-footer-social tl3d-viewable">
                                <Icon fontSize="small" />
                            </a>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="tl3d-footer-heading">Services</h4>
                    {FOOTER_SERVICE_LINKS.map(link => (
                        <Link key={link.to + link.label} to={link.to} className="tl3d-footer-link tl3d-viewable">
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div>
                    <h4 className="tl3d-footer-heading">Company</h4>
                    {FOOTER_COMPANY_LINKS.map(link => (
                        <Link key={link.to} to={link.to} className="tl3d-footer-link tl3d-viewable">
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div>
                    <h4 className="tl3d-footer-heading">Get in touch</h4>
                    <p style={{ fontSize: 13.5, color: "var(--ink-dim)", lineHeight: 1.8, margin: 0 }}>
                        Jhargram, West Bengal<br />
                        <a href="mailto:maityrohan420@gmail.com" className="tl3d-footer-link tl3d-viewable">
                            maityrohan420@gmail.com
                        </a>
                    </p>
                </div>
            </div>

            <div className="tl3d-footer-bottom">
                <span>© 2026 Maity's Tech Lab. All rights reserved.</span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={12} /> Built in West Bengal, India
                </span>
            </div>
        </footer>
    );
}

// ─── LANDING PAGE ────────────────────────────────────────────────────────────
export default function ServicesLanding() {
    const [featuredPost, ...restPosts] = BLOGS;

    return (
        <div className="tl3d-page">
            <div className="tl3d-ambient" aria-hidden="true">
                <div className="tl3d-ambient-grid" />
                <div className="tl3d-ambient-glow tl3d-ambient-glow-a" />
                <div className="tl3d-ambient-glow tl3d-ambient-glow-b" />
                <div className="tl3d-ambient-noise" />
            </div>

            <CustomCursor />
            <Hero3D services={SERVICES} stats={HERO_STATS} />
            <Marquee />

            {/* ── SERVICES ─────────────────────────────────────────────── */}
            <section className="tl3d-section" id="services">
                <SectionHeader
                    eyebrow="What we've built"
                    title="Five tools, each solving one real problem"
                    sub="Pick a service to jump straight in — every one of them is free."
                />
                <motion.div
                    className="tl3d-services-grid"
                    variants={servicesContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.25 }}
                >
                    {SERVICES.map(service => <ServiceCard key={service.id} service={service} />)}
                </motion.div>
            </section>

            {/* ── BLOG (in-page highlights, editorial layout) ──────────── */}
            <section className="tl3d-section">
                <SectionHeader
                    eyebrow="From the lab"
                    title="Notes on what we're building and why"
                    sub="Short write-ups on the problems behind each service."
                />
                <Reveal delay={100}>
                    <div className="tl3d-blog-grid">
                        <BlogCard post={featuredPost} featured />
                        <div className="tl3d-blog-side">
                            {restPosts.map(post => <BlogCard key={post.title} post={post} />)}
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ── REVIEWS ──────────────────────────────────────────────── */}
            <section className="tl3d-section">
                <Reveal>
                    <div className="tl3d-testimonial-wrap">
                        <TestimonialSection />
                    </div>
                </Reveal>
            </section>

            {/* ── FULL BLOG WIDGET ─────────────────────────────────────── */}
            <section className="tl3d-section">
                <Reveal>
                    <BlogWidget limit={3} />
                </Reveal>
            </section>

            {/* ── FAQ ──────────────────────────────────────────────────── */}
            <section className="tl3d-section" style={{ maxWidth: 800 }}>
                <SectionHeader eyebrow="Questions" title="Common questions about Maity's Tech Lab" />
                <Reveal delay={100}>
                    <div>
                        {FAQS.map((faq, i) => <FaqRow key={faq.q} index={i} q={faq.q} a={faq.a} />)}
                    </div>
                </Reveal>
            </section>

            {/* ── FOOTER ───────────────────────────────────────────────── */}
            <LandingFooter />
        </div>
    );
}