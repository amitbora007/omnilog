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
import { PostCardSkeleton } from '../components/common/Skeleton.jsx';
import {
  ArrowRight,
  ShieldCheck,
  Tag,
  Terminal,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Layers,
  Zap,
} from 'lucide-react';

const CODE_SNIPPETS = {
  js: {
    filename: 'raft-consensus.js',
    lang: 'JavaScript • Raft Quorum',
    code: `async function replicateLogEntries(cluster, logEntry) {
  // Broadcast proposed state entry to quorum nodes
  const quorum = Math.floor(cluster.nodes.length / 2) + 1;
  const acks = await Promise.allSettled(cluster.broadcast(logEntry));

  const committed = acks.filter(r => r.status === 'fulfilled').length >= quorum;
  if (!committed) throw new ConsensusError('Quorum acknowledge timeout');

  await cluster.commit(logEntry.index);
  return { committed: true, index: logEntry.index };
}`,
  },
  rs: {
    filename: 'distributed_queue.rs',
    lang: 'Rust • Lock-free Ring',
    code: `pub struct RingBuffer<T, const CAP: usize> {
    head: AtomicUsize,
    tail: AtomicUsize,
    buffer: [UnsafeCell<MaybeUninit<T>>; CAP],
}

impl<T, const CAP: usize> RingBuffer<T, CAP> {
    pub fn push(&self, value: T) -> Result<(), QueueFull> {
        let current_tail = self.tail.load(Ordering::Relaxed);
        let next_tail = (current_tail + 1) % CAP;
        // Atomic compare-and-swap ensuring zero lock contention
        self.tail.compare_exchange_weak(current_tail, next_tail, Ordering::Release, Ordering::Relaxed)?;
        Ok(())
    }
}`,
  },
  sql: {
    filename: 'schema.sql',
    lang: 'PostgreSQL • Partitioned Engine',
    code: `CREATE TABLE publication_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    event_type VARCHAR(32) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
) PARTITION BY RANGE (created_at);

CREATE INDEX idx_publication_events_stream
ON publication_events (post_id, created_at DESC);`,
  },
};

export default function LandingPage() {
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSnippetKey, setActiveSnippetKey] = useState('js');
  const [copied, setCopied] = useState(false);

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(CODE_SNIPPETS[activeSnippetKey].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

            {/* Right Column: Interactive 3D Code Hero Terminal */}
            <div className="lg:col-span-6 w-full">
              <ParallaxLayer speed={0.08} className="w-full">
                <Card3D maxTilt={6}>
                  <div className="rounded-3xl bg-slate-950/90 border border-white/15 shadow-2xl backdrop-blur-2xl overflow-hidden text-slate-200">
                    {/* Window Bar & Tabs */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/60 text-xs font-mono">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                        </div>

                        {/* Language Tabs */}
                        <div className="flex items-center gap-1 ml-2">
                          {Object.keys(CODE_SNIPPETS).map((key) => {
                            const snippet = CODE_SNIPPETS[key];
                            const active = activeSnippetKey === key;
                            return (
                              <button
                                key={key}
                                onClick={() => setActiveSnippetKey(key)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                                  active
                                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-xs'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                }`}
                              >
                                {snippet.filename}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 hidden sm:inline">
                          {CODE_SNIPPETS[activeSnippetKey].lang}
                        </span>
                        <button
                          onClick={handleCopyCode}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="Copy code"
                          aria-label="Copy code to clipboard"
                        >
                          {copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Code Window Body */}
                    <div className="p-5 sm:p-6 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed text-slate-300 max-h-[380px]">
                      <pre>
                        <code>{CODE_SNIPPETS[activeSnippetKey].code}</code>
                      </pre>
                    </div>
                  </div>
                </Card3D>
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-1">
              <BookOpen className="w-4 h-4" />
              Recent Publications
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
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
