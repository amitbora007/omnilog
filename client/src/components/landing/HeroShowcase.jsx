import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card3D from '../common/Card3D.jsx';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import {
  BookOpen,
  Edit3,
  Cpu,
  Heart,
  Bookmark,
  Share2,
  Check,
  Copy,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Eye,
  Terminal,
  Sparkles,
} from 'lucide-react';

export default function HeroShowcase() {
  const [activeTab, setActiveTab] = useState('reader'); // 'reader' | 'editor' | 'telemetry'
  const [likes, setLikes] = useState(142);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const sampleSnippet = `// Rebalance consumer groups with zero backpressure
func (s *EventStream) CommitWithQuorum(ctx context.Context) error {
    select {
    case <-ctx.Done():
        return ctx.Err()
    default:
        return s.quorum.Broadcast(ctx, s.uncommittedOffsets)
    }
}`;

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleBookmark = () => {
    setIsSaved((prev) => !prev);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/feed');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <Card3D maxTilt={5} className="w-full">
      <div className="rounded-3xl bg-slate-950/90 border border-white/15 shadow-2xl backdrop-blur-2xl overflow-hidden text-slate-200 transition-all">
        {/* Top Browser / Window Frame */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-6 py-3.5 border-b border-white/10 bg-slate-900/70">
          {/* Traffic Lights & Simulated Path */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-[11px] font-mono text-slate-400 truncate max-w-[200px] sm:max-w-xs">
              <span className="text-emerald-400 font-bold">https://</span>
              <span className="text-slate-300">omnilog.io/</span>
              <span className="text-indigo-400 truncate">
                {activeTab === 'reader'
                  ? 'p/event-sourcing-at-scale'
                  : activeTab === 'editor'
                  ? 'studio/editor'
                  : 'engine/telemetry'}
              </span>
            </div>
          </div>

          {/* Action Tools: Bookmark, Share, Likes */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                hasLiked
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-glow-rose'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              }`}
              title="React to publication"
              aria-label="Like publication"
            >
              <Heart
                className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-400 text-rose-400' : ''}`}
              />
              <span>{likes}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                isSaved
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              }`}
              title={isSaved ? 'Saved to library' : 'Save to library'}
              aria-label="Bookmark publication"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${isSaved ? 'fill-indigo-400 text-indigo-400' : ''}`}
              />
            </button>

            {/* Share / Copy URL Button */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-all cursor-pointer"
              title="Share link"
              aria-label="Share link"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Interactive Mode Segmented Tabs */}
        <div className="flex items-center border-b border-white/10 bg-slate-950/50 px-4 sm:px-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('reader')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reader'
                ? 'border-indigo-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reader View</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'editor'
                ? 'border-indigo-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Author Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-mono font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'border-indigo-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Telemetry</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="p-5 sm:p-7 min-h-[360px] flex flex-col justify-between">
          {/* ========================================= */}
          {/* TAB 1: READER VIEW (DEFAULT) */}
          {/* ========================================= */}
          {activeTab === 'reader' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Author Byline */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name="Alex Johnson" size="md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white leading-tight">
                        Alex Johnson
                      </span>
                      <ShieldCheck
                        className="w-3.5 h-3.5 text-indigo-400 shrink-0"
                        title="Verified Technical Creator"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block">
                      Staff Systems Architect
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> 4 min
                  </span>
                  <span className="hidden sm:inline text-slate-600">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3 h-3 text-slate-500" /> 2.4k
                  </span>
                </div>
              </div>

              {/* Publication Title */}
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
                  Architecting Zero-Downtime Event Sourcing at Scale
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                  When scaling partition consumption to 500k events/sec, network socket saturation
                  and backpressure cascades become the primary bottleneck. Here is our
                  non-blocking commit loop:
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="relative rounded-2xl bg-slate-900/90 border border-white/10 p-3.5 font-mono text-[11px] sm:text-xs text-indigo-200 overflow-x-auto shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-slate-400 pb-2 mb-2 border-b border-white/10">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-indigo-400" />
                    consumer_stream.go • Go Quorum
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy snippet"
                    aria-label="Copy code snippet"
                  >
                    {copiedCode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <pre className="overflow-x-auto leading-relaxed">
                  <code>{sampleSnippet}</code>
                </pre>
              </div>

              {/* Tags & Action Footer */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="tag" size="xs">#Kafka</Badge>
                  <Badge variant="tag" size="xs">#DistributedSystems</Badge>
                  <Badge variant="tag" size="xs">#Go</Badge>
                </div>

                <Link
                  to="/feed"
                  className="inline-flex items-center gap-1 text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <span>Explore Deep-Dives</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB 2: AUTHOR STUDIO */}
          {/* ========================================= */}
          {activeTab === 'editor' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Studio Editor Header */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Drafting Mode: Live Markdown AST
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                  Autosaved
                </span>
              </div>

              {/* Simulated Editor Input Area */}
              <div className="space-y-2.5">
                <div className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
                  Publication Title
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-indigo-500/30 text-white text-xs sm:text-sm font-bold font-mono">
                  Designing Resilient Multi-Region Postgres Replicas
                </div>

                {/* Editor Markdown Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs font-mono text-slate-400">
                  <span className="px-2 py-1 rounded bg-white/10 text-white font-bold">B</span>
                  <span className="px-2 py-1 rounded hover:bg-white/5 cursor-pointer italic">I</span>
                  <span className="px-2 py-1 rounded hover:bg-white/5 cursor-pointer">H2</span>
                  <span className="px-2 py-1 rounded hover:bg-white/5 cursor-pointer">&lt;code&gt;</span>
                  <span className="px-2 py-1 rounded hover:bg-white/5 cursor-pointer">&ldquo;quote&rdquo;</span>
                  <span className="ml-auto text-[10px] text-indigo-400 hidden sm:inline">
                    DOMPurify Active
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/40 border border-white/10 text-xs font-mono text-slate-300 leading-relaxed">
                  <span className="text-indigo-400">## High-Availability Invariants</span>
                  <br />
                  To eliminate single points of failure across AWS availability zones,
                  synchronous quorum replication must be coupled with deterministic leader election...
                </div>
              </div>

              {/* Author Telemetry Counters & Action */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>Words: <strong className="text-white">1,420</strong></span>
                  <span>•</span>
                  <span>Read: <strong className="text-white">5 min</strong></span>
                </div>

                <Link to="/posts/new">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-glow-indigo transition-all cursor-pointer">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch Author Studio</span>
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB 3: ENGINE TELEMETRY */}
          {/* ========================================= */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/10">
                <span className="text-xs font-mono font-bold text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Live Platform Health &amp; Benchmarks
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Optimal
                </span>
              </div>

              {/* Telemetry Metric Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-[11px] font-mono text-slate-400">First Contentful Paint</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                    &lt; 50ms
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Instant in-HTML app shell
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-[11px] font-mono text-slate-400">XSS Security Layer</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-indigo-400 font-mono mt-1">
                    100%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    DOMPurify AST sanitized
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-[11px] font-mono text-slate-400">Core JS Chunk</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono mt-1">
                    28 kB
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Rollup manualChunks split
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10">
                  <div className="text-[11px] font-mono text-slate-400">API Test Coverage</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-violet-400 font-mono mt-1">
                    53 / 53
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    All test suites passing
                  </div>
                </div>
              </div>

              {/* Telemetry Status Line */}
              <div className="pt-2 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-white/10">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Hardened Engine 2.0
                </span>
                <span className="text-slate-500">Node v22 • Vite • React 18</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card3D>
  );
}
