import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsApi } from '../api/posts.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import RichTextEditor from '../components/editor/RichTextEditor.jsx';
import Button from '../components/common/Button.jsx';
import { ArticleSkeleton } from '../components/common/Skeleton.jsx';
import {
  ArrowLeft,
  Save,
  Globe,
  Lock,
  Tag,
  AlertCircle,
  Sparkles,
  Code,
} from 'lucide-react';

export default function EditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'admin';
  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('tech, architecture');
  const [status, setStatus] = useState('public');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const errorRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/feed');
      return;
    }

    if (isEditing) {
      loadPostForEdit();
    }
  }, [id, isAuthenticated, authLoading]);

  const loadPostForEdit = async () => {
    try {
      setLoading(true);
      const post = await postsApi.getPostById(id);
      setTitle(post.title || '');
      setBody(post.body || '');
      setTagsInput(post.tags ? post.tags.join(', ') : '');
      setStatus(post.status || 'public');
    } catch (err) {
      setError(err.message || 'Failed to load post for editing');
    } finally {
      setLoading(false);
    }
  };

  // Word count and estimated read time calculated on the fly
  const { wordCount, readTime } = useMemo(() => {
    const text = body.replace(/<[^>]*>?/gm, ' ').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const time = Math.max(1, Math.ceil(words / 200));
    return { wordCount: words, readTime: time };
  }, [body]);

  const handleAddTag = (tag) => {
    const existing = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    if (!existing.includes(tag.toLowerCase())) {
      const updated = existing.length > 0 ? `${tagsInput.trim()}, ${tag}` : tag;
      setTagsInput(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a publication title.');
      errorRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!body || body === '<p><br></p>' || body.trim() === '') {
      setError('Please write content in the post body before saving.');
      errorRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const payload = {
      title: title.trim(),
      body,
      status,
      tags: tagsInput,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await postsApi.updatePost(id, payload);
        showToast('Publication updated successfully', 'success');
      } else {
        await postsApi.createPost(payload);
        showToast('Publication published successfully', 'success');
      }
      navigate(dashboardPath);
    } catch (err) {
      setError(err.message || 'Failed to save post.');
      showToast(err.message || 'Failed to save post', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <ArticleSkeleton />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
        <Link
          to={dashboardPath}
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl px-3 py-1.5 bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-glass"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-400" />
          <span>{isAdmin ? 'Back to Admin Dashboard' : 'Back to Dashboard'}</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 shadow-glow-indigo">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            {isEditing ? 'Studio: Editing Publication' : 'Studio: Authoring Publication'}
          </span>
        </div>
      </div>

      {/* Accessible Error Summary */}
      {error && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex="-1"
          className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm flex items-start gap-3 shadow-glow-rose backdrop-blur-md"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <p className="font-bold text-rose-300">Please resolve the error to continue:</p>
            <p className="mt-0.5 text-xs text-rose-200/90">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 2-Column Authoring Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Writing Canvas (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title Input Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-glass space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Publication Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Designing Fault-Tolerant Distributed Storage, or Microservice Patterns"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-2xl text-lg sm:text-xl font-bold text-white focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 focus:outline-none shadow-inner placeholder:text-slate-500 placeholder:font-normal transition-all"
              />
            </div>

            {/* Rich Text Editor Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-glass space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Article Body & Code Canvas
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Markdown & Rich Formatting Supported
                </span>
              </div>
              <RichTextEditor
                value={body}
                onChange={setBody}
                placeholder="Draft your story, insert syntax-highlighted code blocks, document engineering architectures..."
              />
            </div>
          </div>

          {/* Right Sticky Publishing Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Publish Actions Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-glass space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                  Publish Controls
                </span>
                <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  status === 'public'
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                }`}>
                  {status === 'public' ? 'Public' : 'Draft'}
                </span>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                loading={saving}
                icon={Save}
                className="w-full justify-center py-3 text-sm shadow-glow-indigo"
              >
                {isEditing ? 'Save Publication' : 'Publish to Stream'}
              </Button>

              <Link to={dashboardPath} className="block">
                <Button variant="secondary" size="sm" className="w-full justify-center">
                  Discard & Exit
                </Button>
              </Link>
            </div>

            {/* Visibility Selector Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-glass space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Visibility Setting
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setStatus('public')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                    status === 'public'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-glow-cyan'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-5 h-5 mb-1.5 text-emerald-400" />
                  <span>Public Live</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('private')}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                    status === 'private'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-glow-indigo'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Lock className="w-5 h-5 mb-1.5 text-amber-400" />
                  <span>Private Draft</span>
                </button>
              </div>
            </div>

            {/* Taxonomy Tags Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-glass space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                Taxonomy Tags
              </label>
              <input
                type="text"
                placeholder="tech, devlog, architecture, redis"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs font-mono text-indigo-300 focus:ring-1 focus:ring-indigo-400 focus:outline-none transition-all placeholder:text-slate-500"
              />
              <div className="pt-2">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1.5">
                  Suggested tags:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['architecture', 'backend', 'cloud', 'devlog', 'docker', 'redis'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAddTag(t)}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950/60 hover:bg-indigo-950/60 border border-white/10 text-slate-400 hover:text-indigo-300 transition-colors"
                    >
                      +{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Writing Telemetry Card */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-glass space-y-2 font-mono text-xs">
              <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 text-slate-300 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Live Writing Telemetry
              </div>
              <div className="flex items-center justify-between text-slate-400 py-1 border-b border-white/5">
                <span>Total Words</span>
                <span className="text-white font-bold">{wordCount}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 py-1 border-b border-white/5">
                <span>Estimated Read</span>
                <span className="text-indigo-300 font-bold">{readTime} min read</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 py-1">
                <span>Sanitization</span>
                <span className="text-emerald-400 font-bold">Active DOMPurify</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
