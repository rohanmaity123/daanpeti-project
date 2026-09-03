import { useEffect, useRef, useState } from "react";

// Subtle circular cursor that expands over anything tagged .tl3d-viewable.
// Skipped entirely on touch devices and when the user prefers reduced motion.
export default function CustomCursor() {
    const ref = useRef(null);
    const [enabled, setEnabled] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [active, setActive] = useState(false);

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const isTouch = window.matchMedia("(hover: none)").matches;
        setEnabled(!reduced && !isTouch);
    }, []);

    useEffect(() => {
        if (!enabled) return undefined;

        const move = (e) => {
            setActive(true);
            const el = ref.current;
            if (el) el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            const target = e.target.closest?.(".tl3d-viewable");
            setHovering(Boolean(target));
        };
        const leave = () => setActive(false);

        window.addEventListener("pointermove", move);
        window.addEventListener("pointerleave", leave);
        return () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerleave", leave);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div
            ref={ref}
            className={`tl3d-cursor ${active ? "tl3d-cursor-active" : ""} ${hovering ? "tl3d-cursor-hover" : ""}`}
            aria-hidden="true"
        >
            {hovering ? "VIEW" : ""}
        </div>
    );
}