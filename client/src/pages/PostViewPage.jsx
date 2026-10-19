import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsApi } from '../api/posts.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import Card3D from '../components/common/Card3D.jsx';
import ParallaxLayer from '../components/common/ParallaxLayer.jsx';
import { ArticleSkeleton } from '../components/common/Skeleton.jsx';
import { sanitizeHtml } from '../utils/sanitize.js';
import { formatDate } from '../utils/formatters.js';
import {
  Clock,
  Calendar,
  ArrowLeft,
  Edit3,
  Trash2,
  Share2,
  AlertTriangle,
  Check,
  Shield,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import hljs from '../utils/highlight.js';
import 'highlight.js/styles/github-dark.css';

export default function PostViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    loadPost();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, progress)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (post) {
      document.querySelectorAll('.post-content pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }, [post]);

  const loadPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsApi.getPostById(id);
      setPost(data);
    } catch (err) {
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = user && post && post.author && (user.id === post.author._id || user._id === post.author._id);
  const isAdmin = user && user.role === 'admin';
  const canManage = isOwner || isAdmin;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await postsApi.deletePost(post._id);
      showToast('Publication was deleted successfully', 'success');
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to delete post', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Publication link copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) return <ArticleSkeleton />;

  if (error || !post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-white mb-2">Publication Not Available</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {error || 'This article could not be found or has been removed.'}
        </p>
        <Link to="/feed">
          <Button variant="primary">Return to Feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Cinematic Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-violet-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* Top Bar: Back & Action Controls */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            to="/feed"
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg p-1"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>All Publications</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={copied ? Check : Share2}
              onClick={handleShare}
              title="Copy link to clipboard"
            >
              {copied ? 'Copied' : 'Share'}
            </Button>

            {isAdmin && !isOwner && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60 shadow-glow-indigo">
                <Shield className="w-3.5 h-3.5" />
                ADMIN OVERRIDE
              </span>
            )}

            {canManage && (
              <>
                <Link to={`/posts/edit/${post._id}`}>
                  <Button variant="secondary" size="sm" icon={Edit3}>
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Reading Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Content Column (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Article Header (Parallax Scroll) */}
            <ParallaxLayer speed={0.06}>
              <header className="pb-8 border-b border-white/10">
                {/* Tags & Visibility Pill */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {post.tags &&
                    post.tags.map((tag) => (
                      <Link key={tag} to={`/feed?tag=${tag}`}>
                        <Badge variant="tag" size="sm">
                          #{tag}
                        </Badge>
                      </Link>
                    ))}
                  {post.status === 'private' && (
                    <Badge variant="private" size="sm">
                      Private Draft
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">
                  {post.title}
                </h1>

                {/* Metadata & Author Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={post.author?.image}
                      name={post.author?.displayName}
                      size="lg"
                    />
                    <div>
                      <p className="font-bold text-white text-sm">
                        {post.author?.displayName || 'Anonymous Author'}
                      </p>
                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {formatDate(post.createdAt)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          {post.readingTime || 1} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </header>
            </ParallaxLayer>

            {/* Article Body (Sanitized HTML) */}
            <article
              className="post-content glass-panel p-7 sm:p-12 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.body) }}
            />

            {/* Author Card Footer */}
            <Card3D maxTilt={5}>
              <div className="glass-card border border-white/10 shadow-2xl rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <Avatar
                  src={post.author?.image}
                  name={post.author?.displayName}
                  size="xl"
                  shape="square"
                />
                <div className="text-center sm:text-left flex-1">
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center justify-center sm:justify-start gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Published by Author
                  </p>
                  <h3 className="font-extrabold text-white text-lg">
                    {post.author?.displayName || 'Author'}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    {post.author?.bio || 'Author and engineering contributor on OmniLog.'}
                  </p>
                  <div className="mt-4">
                    <Link
                      to={`/feed?search=${post.author?.displayName || ''}`}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                    >
                      Browse all publications from this author →
                    </Link>
                  </div>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Right Sticky Companion Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 hidden lg:block">
            {/* Reading Companion Card */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-glass space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Reading Status
                </span>
                <span className="text-xs font-mono font-bold text-indigo-300">
                  {Math.round(scrollProgress)}%
                </span>
              </div>

              {/* Progress bar visual */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/10">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-150"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Read Time</span>
                  <span className="text-white font-bold">{post.readingTime || 1} min</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
                  <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                  <span className="text-emerald-400 font-bold capitalize">{post.status || 'Public'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center"
                  icon={copied ? Check : Share2}
                  onClick={handleShare}
                >
                  {copied ? 'Link Copied!' : 'Share Publication'}
                </Button>
                {canManage && (
                  <Link to={`/posts/edit/${post._id}`} className="block">
                    <Button variant="secondary" size="sm" className="w-full justify-center" icon={Edit3}>
                      Edit Publication
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Author Sidebar Spotlight */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-glass space-y-4">
              <div className="flex items-center gap-3">
                <Avatar
                  src={post.author?.image}
                  name={post.author?.displayName}
                  size="md"
                />
                <div className="overflow-hidden">
                  <h4 className="font-bold text-white text-sm truncate">
                    {post.author?.displayName || 'Author'}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {post.author?.email || 'Contributor'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {post.author?.bio || 'Active engineer sharing architecture notes and code patterns on Omnilog.'}
              </p>
            </div>

            {/* Security & Verification Card */}
            <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-glass space-y-2.5 font-mono text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10 font-bold text-slate-300 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Security & Sanitization
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>DOMPurify Sanitized HTML</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Highlight.js Code Shading</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>WCAG 2.1 AA Contrast</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Publication"
        >
          <div className="flex items-start gap-3.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Are you sure you want to delete this publication?
              </p>
              <p className="text-xs text-slate-400 mt-1">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-white/10">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
              Confirm Delete
            </Button>
          </div>
        </Modal>
      </div>
    </>
  );
}
