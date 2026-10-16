import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
  onClick,
}) {
  const baseStyles =
    'inline-flex items-center font-medium rounded-full transition-colors select-none';

  const variants = {
    default: 'bg-slate-800/80 text-slate-300 border border-white/10 backdrop-blur-sm',
    primary: 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 backdrop-blur-sm',
    public: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm',
    private: 'bg-amber-950/60 text-amber-300 border border-amber-500/30 backdrop-blur-sm',
    tag: 'bg-slate-900/80 hover:bg-indigo-950/70 text-slate-300 hover:text-indigo-200 font-mono border border-white/10 hover:border-indigo-500/40 transition-all backdrop-blur-sm',
    danger: 'bg-rose-950/60 text-rose-300 border border-rose-500/30 backdrop-blur-sm',
  };

  const dots = {
    public: 'bg-emerald-500 animate-pulse',
    private: 'bg-amber-500',
    primary: 'bg-indigo-500',
    danger: 'bg-rose-500',
    default: 'bg-slate-400',
    tag: 'bg-indigo-400',
  };

  const sizes = {
    xs: 'text-[11px] px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-sm px-3 py-1 gap-2',
  };

  const clickableStyles = onClick
    ? 'cursor-pointer active:scale-95 hover:shadow-xs'
    : '';

  return (
    <span
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.sm} ${clickableStyles} ${className}`}
    >
      {(dot || variant === 'public' || variant === 'private') && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[variant] || dots.default}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}
