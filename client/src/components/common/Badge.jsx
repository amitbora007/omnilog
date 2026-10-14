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
    default: 'bg-slate-100 text-slate-700 border border-slate-200/60',
    primary: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    public: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    private: 'bg-amber-50 text-amber-700 border border-amber-200/60',
    tag: 'bg-slate-100/90 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-mono border border-slate-200/80 hover:border-indigo-200 transition-colors',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/60',
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
