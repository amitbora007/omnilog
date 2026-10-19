import React, { useState } from 'react';

// Generates a deterministic, pleasing background color for user initials
const getInitialsGradient = (name = '') => {
  const gradients = [
    'from-indigo-100 to-indigo-200 text-indigo-700',
    'from-violet-100 to-violet-200 text-violet-700',
    'from-blue-100 to-blue-200 text-blue-700',
    'from-emerald-100 to-emerald-200 text-emerald-700',
    'from-amber-100 to-amber-200 text-amber-700',
    'from-rose-100 to-rose-200 text-rose-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
};

export default function Avatar({
  src,
  name = 'Anonymous',
  alt,
  size = 'md',
  className = '',
  shape = 'circle',
}) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-lg',
    '2xl': 'w-16 h-16 text-xl',
  };

  const pixelDimensions = {
    xs: 24,
    sm: 28,
    md: 32,
    lg: 40,
    xl: 56,
    '2xl': 64,
  };

  const rounded = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const initial = name && name.trim() ? name.trim()[0].toUpperCase() : 'U';
  const gradient = getInitialsGradient(name);
  const dimension = pixelDimensions[size] || 32;

  // Optimize Google user content avatars for thumbnail dimensions
  let optimizedSrc = src;
  if (src && typeof src === 'string' && src.includes('googleusercontent.com') && (size === 'xs' || size === 'sm')) {
    optimizedSrc = src.replace(/=s\d+(-c)?/, '=s64-c');
  }

  // If no source is provided or image loading failed, render initials fallback
  if (!optimizedSrc || imageError) {
    return (
      <div
        className={`${sizes[size] || sizes.md} ${rounded} bg-gradient-to-br ${gradient} flex items-center justify-center font-bold font-mono border border-slate-200/80 shrink-0 select-none ${className}`}
        aria-label={name}
        title={name}
      >
        {initial}
      </div>
    );
  }

  // Preserve explicit empty string alt="" for decorative avatars, or provide fallback
  const resolvedAlt = alt !== undefined ? alt : (name ? `${name}'s avatar` : 'Profile image');

  return (
    <img
      src={optimizedSrc}
      alt={resolvedAlt}
      width={dimension}
      height={dimension}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setImageError(true)}
      className={`${sizes[size] || sizes.md} ${rounded} object-cover border border-slate-200/80 shrink-0 ${className}`}
    />
  );
}
