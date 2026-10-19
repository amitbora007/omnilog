import React, { useEffect, useRef } from 'react';

/**
 * High-performance 3D Constellation & Particle Mesh Canvas
 * Features:
 * - 3D simulated depth (z-parallax, variable scale & opacity)
 * - Reactive cursor gravitational field
 * - Connected constellation lines with proximity fade
 * - Zero bundle overhead (Pure HTML5 Canvas)
 * - Battery & CPU friendly: auto-pauses on background tab & prefers-reduced-motion
 */
export default function InteractiveBackground() {
  const canvasRef = useRef(null);
  const glowRef1 = useRef(null);
  const glowRef2 = useRef(null);
  const glowRef3 = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Respect user motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect mobile screens & touch capability
    let isMobile = width < 768 || ('ontouchstart' in window);

    // Particle pool (lightweight 18 particles on mobile, rich 75 on desktop)
    const particleCount = isMobile
      ? Math.min(Math.max(Math.floor((width * height) / 24000), 12), 18)
      : Math.min(Math.floor((width * height) / 14000), 75);
    const particles = [];
    const mouse = { x: -1000, y: -1000, radius: 160 };

    // Scroll parallax tracking
    let lastScrollY = window.scrollY;
    let scrollDelta = 0;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2, // 3D depth multiplier
        vx: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.35),
        vy: (Math.random() - 0.5) * (isMobile ? 0.25 : 0.35),
        baseRadius: Math.random() * 1.6 + 0.8,
        color: i % 4 === 0 ? '#818cf8' : i % 3 === 0 ? '#38bdf8' : '#c084fc',
      });
    }

    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      isMobile = width < 768 || ('ontouchstart' in window);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Clamp particles within new viewport boundaries
      particles.forEach((p) => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
      });
    };

    const handleMouseMove = (e) => {
      if (isMobile) return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Parallax translation for ambient glow orbs
      if (!prefersReducedMotion) {
        if (glowRef1.current) {
          glowRef1.current.style.transform = `translate3d(0, ${(-currentScrollY * 0.15).toFixed(1)}px, 0)`;
        }
        if (glowRef2.current) {
          glowRef2.current.style.transform = `translate3d(0, ${(currentScrollY * 0.1).toFixed(1)}px, 0)`;
        }
        if (glowRef3.current) {
          glowRef3.current.style.transform = `translate3d(0, ${(-currentScrollY * 0.08).toFixed(1)}px, 0)`;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render connected lines (tightened distance threshold on mobile)
      const baseDistance = isMobile ? 80 : 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          const maxDist = baseDistance * ((particles[i].z + particles[j].z) / 2);
          const maxDistSq = maxDist * maxDist;
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDist) * 0.18 * ((particles[i].z + particles[j].z) / 2);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx * p.z;
          p.y += p.vy * p.z;

          // Celestial scroll parallax: higher z particles move faster
          if (Math.abs(scrollDelta) > 0.05) {
            p.y -= scrollDelta * p.z * 0.45;
          }

          // Screen wrap-around
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;

          // Interactive cursor gravity / repulsion (desktop only)
          if (!isMobile) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const distSq = dx * dx + dy * dy;
            const radiusSq = mouse.radius * mouse.radius;
            if (distSq < radiusSq && distSq > 0) {
              const dist = Math.sqrt(distSq);
              const force = (1 - dist / mouse.radius) * 1.5;
              p.x -= (dx / dist) * force;
              p.y -= (dy / dist) * force;
            }
          }
        }

        // Draw particle (omit expensive shadowBlur on mobile GPU to preserve battery & high FPS)
        const radius = p.baseRadius * p.z;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = (isMobile ? 0.65 : 0.5) * p.z;
        if (!isMobile) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6 * p.z;
        }
        ctx.fill();
        if (!isMobile) {
          ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
      }

      // Smooth scroll delta decay
      scrollDelta *= 0.88;

      if (!prefersReducedMotion && !document.hidden) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    // Pause animation when tab is inactive to save battery
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial trigger
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Ambient Radial Lights with Smooth Parallax */}
      <div
        ref={glowRef1}
        className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none will-change-transform"
      />
      <div
        ref={glowRef2}
        className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none will-change-transform"
      />
      <div
        ref={glowRef3}
        className="absolute -bottom-40 left-1/3 w-[32rem] h-[32rem] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none will-change-transform"
      />

      {/* Subtle Grid Lines Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 3D Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
