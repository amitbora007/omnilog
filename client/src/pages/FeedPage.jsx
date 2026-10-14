import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postsApi } from '../api/posts.js';
import PostCard from '../components/post/PostCard.jsx';
import TagFilter from '../components/post/TagFilter.jsx';
import { PostCardSkeleton } from '../components/common/Skeleton.jsx';
import Button from '../components/common/Button.jsx';
import { Search, Compass, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTag = searchParams.get('tag') || 'all';
  const currentSearch = searchParams.get('search') || '';

  const [posts, setPosts] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadPopularTags();
  }, []);

  useEffect(() => {
    setSearchQuery(currentSearch);
    loadPosts();
  }, [currentTag, currentSearch, page]);

  const loadPopularTags = async () => {
    try {
      const tags = await postsApi.getPopularTags();
      setPopularTags(tags.map((t) => t.tag));
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await postsApi.getPublicPosts({
        tag: currentTag,
        search: currentSearch,
        page,
        limit: 9,
      });
      setPosts(res.data || []);
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = (tag) => {
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (tag === 'all') {
      newParams.delete('tag');
    } else {
      newParams.set('tag', tag);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-indigo-600 text-xs font-mono font-bold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4" />
          Community Stream
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Explore Technical Publications
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Discover deep-dives on distributed systems, backend engineering, cloud architectures, and developer stories.
        </p>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="space-y-4 mb-8 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
        <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, tag, or topic (e.g., redis, jwt, docker)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-28 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md"
              aria-label="Clear search input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100">
          <TagFilter
            selectedTag={currentTag}
            onSelectTag={handleTagSelect}
            availableTags={popularTags}
          />
        </div>
      </div>

      {/* Results Meta Header */}
      {!loading && posts.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 mb-6 font-mono">
          <span>
            Showing {posts.length} of {totalCount} {totalCount === 1 ? 'publication' : 'publications'}
          </span>
          {(currentTag !== 'all' || currentSearch) && (
            <button
              onClick={resetAllFilters}
              className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
            >
              Reset active filters
            </button>
          )}
        </div>
      )}

      {/* Main Grid or Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-14">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <span className="px-4 text-xs font-mono font-bold text-slate-700">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
                aria-label="Next page"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No publications found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            {currentSearch || currentTag !== 'all' ? (
              <>
                No posts found matching{' '}
                {currentSearch && <span className="font-semibold text-slate-800">"{currentSearch}"</span>}
                {currentTag !== 'all' && (
                  <span>
                    {' '}in tag <span className="font-semibold text-slate-800">#{currentTag}</span>
                  </span>
                )}
                . Try adjusting your query or resetting filters.
              </>
            ) : (
              'There are no public posts available in the stream right now.'
            )}
          </p>
          <Button variant="secondary" size="sm" onClick={resetAllFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
}
