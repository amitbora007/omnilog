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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95 select-none ${
              isSelected
                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-100 font-mono'
                : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 font-mono'
            }`}
          >
            {tag === 'all' ? 'All Publications' : `#${tag}`}
          </button>
        );
      })}
    </div>
  );
}
