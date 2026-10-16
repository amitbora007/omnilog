import React from 'react';

const DEFAULT_TAGS = ['all', 'tech', 'devlog', 'tutorial', 'personal', 'architecture', 'notes'];

export default function TagFilter({ selectedTag = 'all', onSelectTag, availableTags = [] }) {
  // Merge default tags with dynamic tags from the database
  const mergedTags = ['all', ...new Set([...DEFAULT_TAGS.slice(1), ...availableTags])];

  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {mergedTags.map((tag) => {
        const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag(tag)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 active:scale-95 select-none ${
              isSelected
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow-indigo border border-indigo-400/40 font-mono'
                : 'bg-slate-900/70 text-slate-400 border border-white/10 hover:border-white/20 hover:text-white hover:bg-slate-800/80 font-mono backdrop-blur-sm'
            }`}
          >
            {tag === 'all' ? 'All Publications' : `#${tag}`}
          </button>
        );
      })}
    </div>
  );
}
