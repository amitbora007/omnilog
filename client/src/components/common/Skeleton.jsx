import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-shimmer rounded-xl bg-slate-800/60 ${className}`}
      aria-hidden="true"
    />
  );
}

export function PostCardSkeleton() {
  return (
    <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-6 flex flex-col h-full shadow-card animate-pulse">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-16 rounded" />
      </div>

      <Skeleton className="h-6 w-4/5 rounded-lg mb-2" />
      <Skeleton className="h-6 w-3/5 rounded-lg mb-4" />

      <Skeleton className="h-4 w-full rounded mb-2" />
      <Skeleton className="h-4 w-5/6 rounded mb-2" />
      <Skeleton className="h-4 w-2/3 rounded mb-6 flex-1" />

      <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-2.5 w-14 rounded" />
          </div>
        </div>
        <Skeleton className="h-4 w-12 rounded" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 5 }) {
  if (columns === 6) {
    return (
      <tr className="animate-pulse border-b border-white/5">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-44 rounded" />
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <Skeleton className="h-5 w-16 rounded-full" />
        </td>
        <td className="px-6 py-4">
          <Skeleton className="h-5 w-16 rounded-full" />
        </td>
        <td className="px-6 py-4">
          <Skeleton className="h-4 w-8 rounded font-mono" />
        </td>
        <td className="px-6 py-4">
          <Skeleton className="h-4 w-24 rounded font-mono" />
        </td>
        <td className="px-6 py-4 text-right">
          <div className="inline-flex gap-2 justify-end">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <Skeleton className="w-7 h-7 rounded-lg" />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="animate-pulse border-b border-white/5">
      <td className="px-6 py-4">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-3 w-64 rounded" />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-7 h-7 rounded-full shrink-0" />
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-24 rounded font-mono" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="inline-flex gap-2 justify-end">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 animate-pulse">
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>

      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <Skeleton className="h-10 w-4/5 rounded-xl mb-3" />
      <Skeleton className="h-10 w-3/5 rounded-xl mb-6" />

      <div className="flex items-center gap-3 pb-8 border-b border-white/10 mb-8">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-3 w-40 rounded" />
        </div>
      </div>

      <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 space-y-4 backdrop-blur-md">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-32 w-full rounded-2xl my-6" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>
    </div>
  );
}
