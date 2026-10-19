import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { postsApi } from '../api/posts.js';
import Button from '../components/common/Button.jsx';
import GoogleSignInButton from '../components/common/GoogleSignInButton.jsx';
import PostCard from '../components/post/PostCard.jsx';
import Card3D from '../components/common/Card3D.jsx';
import ParallaxLayer from '../components/common/ParallaxLayer.jsx';
import ContactSection from '../components/common/ContactSection.jsx';
import HeroShowcase from '../components/landing/HeroShowcase.jsx';
import { PostCardSkeleton } from '../components/common/Skeleton.jsx';
import {
  ArrowRight,
  ShieldCheck,
  Tag,
  Terminal,
  Sparkles,
  BookOpen,
  Layers,
  Zap,
  ChevronDown,
  Loader2,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    async function loadInitialFeatured() {
      try {
        const res = await postsApi.getPublicPosts({ page: 1, limit: 3 });
        const initial = res.data || [];
        setFeaturedPosts(initial);
        const total = res.total || 0;
        setTotalCount(total);
        setHasMore(initial.length < total);
      } catch (err) {
        console.error('Failed to load featured posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialFeatured();
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await postsApi.getPublicPosts({ page: nextPage, limit: 3 });
      const newItems = res.data || [];
      setFeaturedPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const filtered = newItems.filter((p) => !existingIds.has(p._id));
        const combined = [...prev, ...filtered];
        setHasMore(combined.length < (res.total || 0));
        return combined;
      });
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-28">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Headline, Copy, Action CTAs & Highlights */}
            <div className="lg:col-span-6 text-left">
              <ParallaxLayer speed={0.04}>
                {/* Release Badge */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-glow-indigo backdrop-blur-md font-mono">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-glow-indigo" />
                  OmniLog 2.0 • 3D Developer Publishing Engine
                </div>

                {/* Main Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.08]">
                  Publish Technical Writing with{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-violet-400">
                    Uncompromising Clarity.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                  The next-generation publishing platform built for software engineers, systems architects, and technical creators. Native monospace taxonomy, spatial 3D reading, and hardened security.
                </p>

                {/* Action CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  {isAuthenticated && (
                    <Link to="/posts/new">
                      <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                        Start Writing
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Floating Live Tech Highlights */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Sub-ms Render
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    DOMPurify Hardened
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Zero Bloat Canvas 3D
                  </span>
                </div>
              </ParallaxLayer>
            </div>

            {/* Right Column: Interactive OmniLog Product Showcase */}
            <div className="lg:col-span-6 w-full">
              <ParallaxLayer speed={0.08} className="w-full">
                <HeroShowcase />
              </ParallaxLayer>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-2">
            Engineered for Creators
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything You Need to Document Systems
          </h2>
        </div>

        <ParallaxLayer speed={0.04}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <Card3D maxTilt={6} className="h-full flex flex-col">
              <div className="glass-card p-8 rounded-3xl h-full flex flex-col flex-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-950/70 text-indigo-400 flex items-center justify-center mb-6 border border-indigo-500/30 shadow-glow-indigo">
                  <Terminal className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5 tracking-tight">
                  Syntax-Highlighted Snippets
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  Monospace pre-formatted code blocks with automated language detection. Document APIs, algorithmic workflows, and terminal outputs effortlessly.
                </p>
              </div>
            </Card3D>

            <Card3D maxTilt={6} className="h-full flex flex-col">
              <div className="glass-card p-8 rounded-3xl h-full flex flex-col flex-1">
                <div className="w-12 h-12 rounded-2xl bg-violet-950/70 text-violet-400 flex items-center justify-center mb-6 border border-violet-500/30 shadow-glow-violet">
                  <Tag className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5 tracking-tight">
                  Multi-Topic Taxonomy
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  Tag and index publications across technical, tutorial, and personal categories. Audiences can instantly filter and bookmark specialized subjects.
                </p>
              </div>
            </Card3D>

            <Card3D maxTilt={6} className="h-full flex flex-col">
              <div className="glass-card p-8 rounded-3xl h-full flex flex-col flex-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5 tracking-tight">
                  Production-Grade Security
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  Protected by DOMPurify XSS sanitization, HTTP-only JWT cookies, Helmet HTTP headers, and strict author-only modification guards.
                </p>
              </div>
            </Card3D>
          </div>
        </ParallaxLayer>
      </section>

      {/* Featured Feed Preview */}
      <section id="publications" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-1">
              <BookOpen className="w-4 h-4" />
              Recent Publications
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              From the Engineering Community
            </h2>
            {totalCount > 0 && (
              <p className="text-xs text-slate-400 font-mono mt-1">
                Displaying <span className="text-indigo-400 font-semibold">{featuredPosts.length}</span> of <span className="text-slate-300 font-semibold">{totalCount}</span> publications
              </p>
            )}
          </div>
          <Link to="/feed">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              Explore Full Feed
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredPosts.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
              {loadingMore &&
                Array.from({ length: 3 }).map((_, i) => (
                  <PostCardSkeleton key={`skeleton-load-more-${i}`} />
                ))}
            </div>

            {/* Progressive Loading Controls */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              {hasMore ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  icon={loadingMore ? Loader2 : ChevronDown}
                  iconPosition="right"
                  className={loadingMore ? 'animate-pulse' : 'shadow-glow-indigo'}
                >
                  {loadingMore ? 'Fetching Next Batch...' : `Load More Publications (${totalCount - featuredPosts.length} remaining)`}
                </Button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300 shadow-card">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span>All {totalCount} recent publications loaded</span>
                  <span className="text-slate-500">•</span>
                  <Link to="/feed" className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-2">
                    Browse all topics in feed &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-white/10 p-8 shadow-card backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/70 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No publications yet</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              Be the first to publish a technical deep-dive, tutorial, or dev log on OmniLog.
            </p>
            {isAuthenticated ? (
              <Link to="/posts/new">
                <Button variant="primary" size="md">
                  Write the First Post
                </Button>
              </Link>
            ) : (
              <GoogleSignInButton
                size="md"
                text="Sign in to Start Writing"
                onClick={loginWithGoogle}
              />
            )}
          </div>
        )}
      </section>

      {/* Direct Dispatch & Editorial Contact */}
      <ContactSection />
    </div>
  );
}
