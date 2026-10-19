import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { postsApi } from '../api/posts.js';
import PostCard from '../components/post/PostCard.jsx';
import TagFilter from '../components/post/TagFilter.jsx';
import ParallaxLayer from '../components/common/ParallaxLayer.jsx';
import Card3D from '../components/common/Card3D.jsx';
import { PostCardSkeleton } from '../components/common/Skeleton.jsx';
import Button from '../components/common/Button.jsx';
import {
  Search,
  Compass,
  ChevronLeft,
  ChevronRight,
  X,
  PenSquare,
  Tag,
  Sparkles,
  Cpu,
  ArrowRight,
  ArrowUp,
  Infinity,
  Layers,
  Loader2,
} from 'lucide-react';

export default function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTag = searchParams.get('tag') || 'all';
  const currentSearch = searchParams.get('search') || '';

  const { isAuthenticated, user } = useAuth();
  const [viewMode, setViewMode] = useState('infinite'); // 'infinite' | 'paginated'
  const [posts, setPosts] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    loadPopularTags();
  }, []);

  const loadPopularTags = async () => {
    try {
      const tags = await postsApi.getPopularTags();
      setPopularTags(tags.map((t) => t.tag));
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const loadPosts = async (targetPage = 1, isFilterChange = false) => {
    if (targetPage === 1 || isFilterChange || viewMode === 'paginated') {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await postsApi.getPublicPosts({
        tag: currentTag,
        search: currentSearch,
        page: targetPage,
        limit: 6,
      });

      const newPosts = res.data || [];
      if (targetPage === 1 || isFilterChange || viewMode === 'paginated') {
        setPosts(newPosts);
      } else {
        setPosts((prev) => {
          const map = new Map(prev.map((p) => [p._id, p]));
          newPosts.forEach((p) => map.set(p._id, p));
          return Array.from(map.values());
        });
      }
      setTotalPages(res.pages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Triggered on tag or search change
  useEffect(() => {
    setSearchQuery(currentSearch);
    setPage(1);
    loadPosts(1, true);
  }, [currentTag, currentSearch]);

  // Triggered on page change (for infinite scroll append or pagination switch)
  useEffect(() => {
    if (page > 1) {
      loadPosts(page, false);
      if (viewMode === 'paginated') {
        window.scrollTo({ top: 180, behavior: 'smooth' });
      }
    }
  }, [page]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (viewMode !== 'infinite') return;
    if (loading || loadingMore || page >= totalPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: '250px' }
    );

    const target = sentinelRef.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [viewMode, loading, loadingMore, page, totalPages]);

  // Back to top scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleViewModeChange = (mode) => {
    if (mode === viewMode) return;
    setViewMode(mode);
    setPage(1);
    loadPosts(1, true);
  };

  const handleTagSelect = (tag) => {
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
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Header Banner spanning full width */}
      <ParallaxLayer speed={0.04}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4" />
              Community Knowledge Stream
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Explore Technical Publications
            </h1>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Curated deep-dives on distributed systems, cloud computing, backend architecture, and developer insights.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/posts/new">
                <Button variant="primary" size="md" icon={PenSquare}>
                  Draft Publication
                </Button>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>{totalCount} Total Publications</span>
              </div>
            )}
          </div>
        </div>
      </ParallaxLayer>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Post Stream & Search Bar (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search & Quick Filter Bar */}
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 shadow-glass space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search publications by title, keyword, or topic (e.g., redis, jwt, docker)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-28 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-sm font-medium text-slate-100 placeholder-slate-500 focus:bg-slate-950 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 rounded-md"
                  aria-label="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-lg transition-all shadow-glow-indigo active:scale-95"
              >
                Search
              </button>
            </form>

            <div className="pt-2 border-t border-white/10">
              <TagFilter
                selectedTag={currentTag}
                onSelectTag={handleTagSelect}
                availableTags={popularTags}
              />
            </div>
          </div>

          {/* Results Meta Header */}
          {!loading && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 font-mono px-1">
              <div className="flex items-center gap-3">
                <span>
                  Showing {posts.length} of {totalCount} {totalCount === 1 ? 'publication' : 'publications'}
                </span>
                {(currentTag !== 'all' || currentSearch) && (
                  <button
                    onClick={resetAllFilters}
                    className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline"
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {/* View Mode Segmented Switch */}
              <div className="inline-flex items-center gap-1 p-1 bg-slate-950/80 border border-white/10 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => handleViewModeChange('infinite')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                    viewMode === 'infinite'
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Continuous stream as you scroll"
                >
                  <Infinity className="w-3.5 h-3.5" />
                  <span>Infinite Stream</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange('paginated')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                    viewMode === 'paginated'
                      ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-xs font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Numbered page-by-page browsing"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Paginated</span>
                </button>
              </div>
            </div>
          )}

          {/* Main Post Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : posts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
                {viewMode === 'infinite' && loadingMore && (
                  Array.from({ length: 2 }).map((_, i) => (
                    <PostCardSkeleton key={`skeleton-feed-more-${i}`} />
                  ))
                )}
              </div>

              {/* Infinite Mode Sentinel & Stream States */}
              {viewMode === 'infinite' && (
                <div className="pt-2">
                  {/* Invisible sentinel monitored by IntersectionObserver */}
                  <div ref={sentinelRef} className="h-6 w-full pointer-events-none" />

                  {loadingMore ? (
                    <div className="py-4 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-500/20 border-t-indigo-400 animate-spin" />
                      <span>Streaming next publications...</span>
                    </div>
                  ) : page >= totalPages ? (
                    <div className="py-6 border-t border-white/10 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>End of technical stream ({totalCount} total publications)</span>
                    </div>
                  ) : (
                    <div className="pt-2 text-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        icon={Loader2}
                      >
                        Load More Publications
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Paginated Mode Controls */}
              {viewMode === 'paginated' && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-white/10 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-card transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <span className="px-4 text-xs font-mono font-bold text-slate-300">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-white/10 bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed shadow-card transition-colors"
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
            <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-white/10 p-8 shadow-card backdrop-blur-md">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/70 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No publications found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                {currentSearch || currentTag !== 'all' ? (
                  <>
                    No posts found matching{' '}
                    {currentSearch && <span className="font-semibold text-slate-200">"{currentSearch}"</span>}
                    {currentTag !== 'all' && (
                      <span>
                        {' '}in tag <span className="font-semibold text-slate-200">#{currentTag}</span>
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

        {/* Right Sticky Sidebar (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          {/* Spotlight & Author CTA Card */}
          <Card3D maxTilt={6}>
            <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 shadow-glass bg-gradient-to-br from-indigo-950/30 via-slate-900/80 to-purple-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                Omnilog Community
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Share Your Architecture Insights
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Have you solved high-throughput caching, zero-downtime migrations, or auth microservices? Write for engineers worldwide.
              </p>
              {isAuthenticated ? (
                <Link to="/posts/new" className="block">
                  <Button variant="primary" size="sm" className="w-full justify-center" icon={PenSquare}>
                    Draft New Publication
                  </Button>
                </Link>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 flex items-center justify-between">
                  <span className="font-medium">Sign in to publish</span>
                  <span className="text-indigo-400 font-bold text-xs flex items-center gap-1">
                    Google OAuth <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          </Card3D>

          {/* Popular Topics Cloud Card */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-glass space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                Featured Topics
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {popularTags.length} active
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {popularTags.length > 0 ? (
                popularTags.slice(0, 12).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all ${
                      currentTag === tag
                        ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-glow-indigo'
                        : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/40'
                    }`}
                  >
                    #{tag}
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-400">Loading topic tags...</span>
              )}
            </div>
          </div>

          {/* Platform Telemetry & Architecture Specs Card */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-glass space-y-3 font-mono">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Engine Specifications
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 py-1 border-b border-white/5">
                <span>Core Rendering</span>
                <span className="text-slate-200 font-semibold">React 18 + Tailwind</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 py-1 border-b border-white/5">
                <span>Sanitization Layer</span>
                <span className="text-emerald-400 font-semibold">DOMPurify (XSS Safe)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 py-1 border-b border-white/5">
                <span>Visual Shaders</span>
                <span className="text-purple-400 font-semibold">3D CSS Perspective</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 py-1">
                <span>Authentication</span>
                <span className="text-indigo-400 font-semibold">OAuth 2.0 + RBAC</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-indigo border border-indigo-400/40 backdrop-blur-xl transition-all active:scale-90"
          aria-label="Scroll back to top"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
