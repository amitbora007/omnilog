import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

/**
 * Reusable Data Table Pagination Footer
 *
 * @param {number} currentPage - Active 1-indexed page
 * @param {number} totalItems - Total count of matching items in the filtered set
 * @param {number} pageSize - Number of items shown per page
 * @param {number[]} pageSizeOptions - Selectable limits (default [5, 10, 20, 50])
 * @param {function} onPageChange - Callback when a new page is selected
 * @param {function} onPageSizeChange - Callback when page size changes
 * @param {string} itemLabel - Label for items (default 'items')
 * @param {string} className - Additional CSS classes
 */
export default function DataTablePagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'items',
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safeCurrentPage * pageSize);

  // Generate numbered pills with smart ellipsis for large page counts
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (safeCurrentPage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      '...',
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      '...',
      totalPages,
    ];
  };

  const pageNumbers = getPageNumbers();

  const handlePrev = () => {
    if (safeCurrentPage > 1 && onPageChange) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (safeCurrentPage < totalPages && onPageChange) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  const handleFirst = () => {
    if (safeCurrentPage > 1 && onPageChange) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (safeCurrentPage < totalPages && onPageChange) {
      onPageChange(totalPages);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-white/10 bg-slate-950/60 backdrop-blur-md ${className}`}
    >
      {/* Left: Item Range & Total Indicator */}
      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
        <span>
          Showing <span className="font-bold text-white">{startItem}</span> to{' '}
          <span className="font-bold text-white">{endItem}</span> of{' '}
          <span className="font-bold text-indigo-400">{totalItems}</span> {itemLabel}
        </span>

        {/* Rows per page selector */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
            <span className="hidden md:inline text-[11px] text-slate-500">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = parseInt(e.target.value, 10);
                if (onPageSizeChange) onPageSizeChange(newSize);
              }}
              className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs font-mono font-semibold text-slate-200 focus:outline-none focus:border-indigo-400 cursor-pointer hover:bg-slate-800 transition-colors"
              aria-label={`Rows per page for ${itemLabel}`}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-950 text-slate-200">
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Pagination Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={handleFirst}
          disabled={safeCurrentPage <= 1}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={handlePrev}
          disabled={safeCurrentPage <= 1}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Previous page"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Number Pills */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((num, idx) => {
            if (num === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-xs font-mono text-slate-600 select-none"
                >
                  …
                </span>
              );
            }

            const isActive = num === safeCurrentPage;
            return (
              <button
                key={`page-${num}`}
                onClick={() => onPageChange && onPageChange(num)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-glow-indigo border border-indigo-400/50'
                    : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={handleNext}
          disabled={safeCurrentPage >= totalPages}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Next page"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={handleLast}
          disabled={safeCurrentPage >= totalPages}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
