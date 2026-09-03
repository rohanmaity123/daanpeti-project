import { useRef } from "react";
import { Link } from "react-router-dom";
import {
    motion, useMotionValue, useSpring, useTransform, useScroll, useReducedMotion,
} from "framer-motion";

// Fixed, hand-placed offsets so the five service objects never collide with
// the orb or each other — no trigonometry, no runtime collision checks needed.
// [dx, dy, depth(translateZ), floatDuration]
const NODE_LAYOUT = {
    blood: [-250, -130, 60, "6.4s"],
    health: [230, -175, 95, "7.8s"],
    community: [265, 115, 70, "7.1s"],
    products: [-235, 165, 50, "6.9s"],
    certificate: [15, 245, 85, "8.4s"],
};

export default function Hero3D({ services, stats }) {
    const heroRef = useRef(null);
    const reducedMotion = useReducedMotion();

    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const springX = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.6 });
    const springY = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.6 });
    const rotateY = useTransform(springX, [-1, 1], [-9, 9]);
    const rotateX = useTransform(springY, [-1, 1], [7, -7]);

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const sceneScale = useTransform(scrollYProgress, [0, 1], [1, 0.62]);
    const sceneY = useTransform(scrollYProgress, [0, 1], [0, -70]);
    const sceneRotate = useTransform(scrollYProgress, [0, 1], [0, 22]);
    const cueOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

    const handlePointerMove = (e) => {
        if (reducedMotion) return;
        const { innerWidth, innerHeight } = window;
        rawX.set((e.clientX / innerWidth - 0.5) * 2);
        rawY.set((e.clientY / innerHeight - 0.5) * 2);
    };

    const scrollToServices = () => {
        document.getElementById("services")?.scrollIntoView({
            behavior: reducedMotion ? "auto" : "smooth",
            block: "start",
        });
    };

    return (
        <section className="hero3d" ref={heroRef} onPointerMove={handlePointerMove}>
            <div className="hero3d-inner">
                <div className="hero3d-copy">
                    <div className="hero3d-brand">
                        <span>MAITY'S</span>
                        <span className="hero3d-brand-accent">TECH LAB</span>
                    </div>

                    <div className="hero3d-status">
                        <span className="hero3d-status-dot" />
                        Five services. One neighbourhood.
                    </div>

                    <h1 className="hero3d-title">
                        TECHNOLOGY<br />
                        THAT SOLVES<br />
                        REAL <em>PROBLEMS.</em>
                    </h1>

                    <p className="hero3d-sub">
                        Blood on demand, a doctor's advice, a chat with your neighbours,
                        free things to give or take, and paperwork sorted — five tools,
                        built by one small team, used across West Bengal.
                    </p>

                    <div className="hero3d-cta-row">
                        <button type="button" className="hero3d-cta-primary tl3d-viewable" onClick={scrollToServices}>
                            Explore what we've built <span aria-hidden="true">→</span>
                        </button>
                        <Link to="/about" className="hero3d-cta-secondary tl3d-viewable">
                            Meet Maity's Tech Lab
                        </Link>
                    </div>

                    <div className="hero3d-stats">
                        {stats.map(([num, label]) => (
                            <div key={label} className="hero3d-stat">
                                <span className="hero3d-stat-num">{num}</span>
                                <span className="hero3d-stat-label">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hero3d-stage">
                    <motion.div
                        className="hero3d-scene"
                        style={{
                            rotateX: reducedMotion ? 0 : rotateX,
                            rotateY: reducedMotion ? 0 : rotateY,
                            scale: reducedMotion ? 1 : sceneScale,
                            y: reducedMotion ? 0 : sceneY,
                            rotate: reducedMotion ? 0 : sceneRotate,
                        }}
                    >
                        <div className="hero3d-orb" aria-hidden="true">
                            <div className="hero3d-orb-core" />
                            <div className="hero3d-orb-ring hero3d-orb-ring-1" />
                            <div className="hero3d-orb-ring hero3d-orb-ring-2" />
                        </div>

                        {services.map((s) => {
                            const [dx, dy, depth, dur] = NODE_LAYOUT[s.id] || [0, 0, 40, "7s"];
                            const Icon = s.icon;
                            return (
                                <div
                                    key={s.id}
                                    className="hero3d-node-anchor"
                                    style={{ "--ox": `${dx}px`, "--oy": `${dy}px`, "--depth": `${depth}px` }}
                                >
                                    <div className="hero3d-node-float" style={{ animationDuration: dur }}>
                                        <Link to={s.to} className="hero3d-node tl3d-viewable" style={{ "--color": s.color }} aria-label={s.title}>
                                            <span className="hero3d-node-inner">
                                                <Icon size={20} color={s.color} strokeWidth={2.2} />
                                            </span>
                                            <span className="hero3d-node-label">{s.title}</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>

            <motion.div className="hero3d-scrollcue" style={{ opacity: reducedMotion ? 1 : cueOpacity }} aria-hidden="true">
                <span className="hero3d-scrollcue-label">Scroll to explore</span>
                <span className="hero3d-scrollcue-line" />
            </motion.div>
        </section>
    );
}