import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { postsApi } from '../api/posts.js';
import Button from '../components/common/Button.jsx';
import GoogleSignInButton from '../components/common/GoogleSignInButton.jsx';
import PostCard from '../components/post/PostCard.jsx';
import { PostCardSkeleton } from '../components/common/Skeleton.jsx';
import {
  ArrowRight,
  ShieldCheck,
  Tag,
  Terminal,
  Compass,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await postsApi.getPublicPosts({ limit: 6 });
        setFeaturedPosts(res.data || []);
      } catch (err) {
        console.error('Failed to load featured posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-12 border-b border-slate-200/60 bg-gradient-to-b from-slate-100/60 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold mb-6 shadow-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            OmniLog 2.0 • Developer Publishing Engine
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Publish Technical Writing with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
              Uncompromising Clarity.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The modern publishing platform built for software engineers, architects, and technical bloggers. Native code blocks, markdown taxonomy, and hardened security.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            {isAuthenticated ? (
              <Link to="/posts/new">
                <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
                  Start Writing
                </Button>
              </Link>
            ) : (
              <GoogleSignInButton
                size="lg"
                text="Sign in with Google"
                onClick={loginWithGoogle}
              />
            )}

            <Link to="/feed">
              <Button variant="secondary" size="lg" icon={Compass}>
                Explore Public Feed
              </Button>
            </Link>
          </div>

          {/* Interactive Code Preview Hero Card */}
          <div className="mt-14 max-w-3xl mx-auto text-left rounded-3xl bg-[#0b0f19] border border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-semibold text-slate-300">distributed-consensus.md</span>
              </div>
              <span className="text-[11px] text-slate-500">Node.js • Raft Protocol</span>
            </div>
            <pre className="text-xs sm:text-[13px] font-mono leading-relaxed overflow-x-auto text-slate-300">
              <code>
                <span className="text-indigo-400">async function</span>{' '}
                <span className="text-emerald-400">replicateLogEntries</span>(cluster, log) &#123;{'\n'}
                {'  '}<span className="text-slate-500">// Broadcast entry to quorum nodes</span>{'\n'}
                {'  '}<span className="text-indigo-400">const</span> quorum = Math.floor(cluster.nodes.length / 2) + 1;{'\n'}
                {'  '}<span className="text-indigo-400">const</span> acks = <span className="text-indigo-400">await</span> Promise.allSettled(cluster.broadcast(log));{'\n'}
                {'  '}<span className="text-indigo-400">return</span> acks.filter(r =&gt; r.status === <span className="text-amber-300">'fulfilled'</span>).length &gt;= quorum;{'\n'}
                &#125;
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 mb-2">
            Engineered for Creators
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Document Systems
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 border border-indigo-100">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2.5 tracking-tight">
              Syntax-Highlighted Snippets
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Monospace pre-formatted code blocks with automated language detection. Document APIs, algorithmic workflows, and terminal outputs effortlessly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6 border border-violet-100">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2.5 tracking-tight">
              Multi-Topic Taxonomy
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tag and index publications across technical, tutorial, and personal categories. Audiences can instantly filter and bookmark specialized subjects.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2.5 tracking-tight">
              Production-Grade Security
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Protected by DOMPurify XSS sanitization, HTTP-only JWT cookies, Helmet HTTP headers, and strict author-only modification guards.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Feed Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 mb-1">
              <BookOpen className="w-4 h-4" />
              Recent Publications
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              From the Engineering Community
            </h2>
          </div>
          <Link to="/feed">
            <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
              View All Publications
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-card">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No publications yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
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
    </div>
  );
}
