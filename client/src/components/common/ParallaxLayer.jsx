import React, { useEffect, useRef } from 'react';

/**
 * High-performance GPU-composited Parallax Layer
 * 
 * Features:
 * - Uses hardware-accelerated transform: translate3d(0, y, 0)
 * - Directly updates element style via RAF without React re-renders (120 FPS)
 * - Configurable speed multiplier (positive = moves slower than scroll / floats, negative = counter-movement)
 * - Honors prefers-reduced-motion: reduce
 * - Non-intrusive (zero scroll-jacking, purely passive listener)
 */
export default function ParallaxLayer({
  speed = 0.1,
  className = '',
  style = {},
  children,
  as: Component = 'div',
  ...props
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check for user reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let ticking = false;
    let initialTop = 0;

    const calculateInitial = () => {
      const rect = el.getBoundingClientRect();
      initialTop = rect.top + window.scrollY;
    };
    calculateInitial();

    const updatePosition = () => {
      const scrollY = window.scrollY;
      const relativeScroll = scrollY - initialTop;
      const offset = relativeScroll * speed;

      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updatePosition);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateInitial, { passive: true });

    // Initial update
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateInitial);
      if (el) {
        el.style.transform = '';
      }
    };
  }, [speed]);

  return (
    <Component
      ref={ref}
      className={className}
      style={{ willChange: 'transform', ...style }}
      {...props}
    >
      {children}
    </Component>
  );
}
