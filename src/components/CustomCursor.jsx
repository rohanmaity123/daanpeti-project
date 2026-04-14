import { useEffect, useRef, useState } from 'react';

const INTERACTIVE_SELECTOR = 'a, button, .item-card, [role="button"]';
const BUTTON_SELECTOR = 'button, [role="button"], input[type="button"], input[type="submit"]';
const CARD_SELECTOR = '.item-card';

export function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const ringRefPosition = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(min-width: 769px) and (pointer: fine)');
    const handleChange = () => {
      const nextEnabled = mediaQuery.matches;
      setEnabled(nextEnabled);
      document.body.classList.toggle('custom-cursor-enabled', nextEnabled);
    };

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      document.body.classList.remove('custom-cursor-enabled');
    };
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!dot || !ring) return undefined;

    const setInteractiveState = (target) => {
      const element = target instanceof Element ? target : null;
      const isButton = Boolean(element?.closest(BUTTON_SELECTOR));
      const isCard = Boolean(element?.closest(CARD_SELECTOR));
      const isInteractive = Boolean(element?.closest(INTERACTIVE_SELECTOR));

      ring.classList.toggle('cursor-ring-active', isInteractive);
      ring.classList.toggle('cursor-ring-card', isCard && !isButton);
      ring.classList.toggle('cursor-ring-button', isButton);
      dot.classList.toggle('cursor-dot-button', isButton);
      dot.classList.toggle('cursor-dot-card', isCard && !isButton);
    };

    const handleMouseMove = (event) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };
      dot.style.left = `${event.clientX}px`;
      dot.style.top = `${event.clientY}px`;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        dot.classList.add('cursor-visible');
        ring.classList.add('cursor-visible');
        ringRefPosition.current = { x: event.clientX, y: event.clientY };
      }
    };

    const handleMouseOver = (event) => {
      setInteractiveState(event.target);
    };

    const handleMouseOut = (event) => {
      if (event.relatedTarget instanceof Element) {
        setInteractiveState(event.relatedTarget);
        return;
      }

      ring.classList.remove('cursor-ring-active', 'cursor-ring-card', 'cursor-ring-button');
      dot.classList.remove('cursor-dot-button', 'cursor-dot-card');
    };

    const handleMouseLeaveWindow = () => {
      isVisibleRef.current = false;
      dot.classList.remove('cursor-visible', 'cursor-dot-button', 'cursor-dot-card');
      ring.classList.remove('cursor-visible', 'cursor-ring-active', 'cursor-ring-card', 'cursor-ring-button');
    };

    const animateRing = () => {
      const nextX = ringRefPosition.current.x + (mouseRef.current.x - ringRefPosition.current.x) * 0.12;
      const nextY = ringRefPosition.current.y + (mouseRef.current.y - ringRefPosition.current.y) * 0.12;

      ringRefPosition.current = { x: nextX, y: nextY };
      ring.style.left = `${nextX}px`;
      ring.style.top = `${nextY}px`;
      frameRef.current = window.requestAnimationFrame(animateRing);
    };

    frameRef.current = window.requestAnimationFrame(animateRing);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseleave', handleMouseLeaveWindow);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.body.classList.remove('custom-cursor-enabled');
    };
  }, [enabled]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const updateModalState = () => {
      const hasOpenDialog = Boolean(
        document.querySelector('.MuiDialog-root, .MuiModal-root, [role="dialog"]')
      );
      setModalOpen(hasOpenDialog);
    };

    updateModalState();

    const observer = new MutationObserver(updateModalState);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['open', 'role', 'class', 'aria-hidden'],
    });

    return () => observer.disconnect();
  }, []);

  if (!enabled || modalOpen) return null;

  return (
    <>
      <div id="cursor-dot" ref={dotRef} />
      <div id="cursor-ring" ref={ringRef} />
    </>
  );
}
