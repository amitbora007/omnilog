import React, { useRef, useState, useEffect } from 'react';

/**
 * 3D Spatial Tilt & Specular Spotlight Card Wrapper
 * Features:
 * - Direct transform manipulation for 120 FPS smooth tracking
 * - Dynamic radial specular light following mouse coordinates
 * - Subtle elevation scaling on hover
 * - Full reduced-motion fallback
 */
export default function Card3D({
  children,
  className = '',
  maxTilt = 7,
  perspective = 1000,
  spotlightColor = 'rgba(99, 102, 241, 0.12)',
  ...props
}) {
  const cardRef = useRef(null);
  const spotlightRef = useRef(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion.current || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    cardRef.current.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(6px)`;

    if (spotlightRef.current) {
      spotlightRef.current.style.background = `radial-gradient(350px circle at ${x}px ${y}px, ${spotlightColor}, transparent 80%)`;
      spotlightRef.current.style.opacity = '1';
    }
  };

  const handleMouseEnter = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease-out';
    }
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.5s ease-out, box-shadow 0.5s ease-out';
      cardRef.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    }
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative preserve-3d will-change-transform ${className}`}
      {...props}
    >
      {/* Specular Spotlight Overlay */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-10 opacity-0"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
