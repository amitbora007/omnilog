import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsApi } from '../api/posts.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
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
} from 'lucide-react';
import hljs from 'highlight.js';
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

  useEffect(() => {
    loadPost();
  }, [id]);

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
      navigate('/dashboard');
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
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Publication Not Available</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {error || 'This article could not be found or has been removed.'}
        </p>
        <Link to="/feed">
          <Button variant="primary">Return to Feed</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
      {/* Top Bar: Back & Action Controls */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link
          to="/feed"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          <ArrowLeft className="w-4 h-4" />
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
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
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

      {/* Article Header */}
      <header className="mb-10 pb-8 border-b border-slate-200/80">
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
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
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
              <p className="font-bold text-slate-900 text-sm">
                {post.author?.displayName || 'Anonymous Author'}
              </p>
              <div className="flex items-center gap-3 text-xs font-mono text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(post.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {post.readingTime || 1} min read
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Body (Sanitized HTML) */}
      <article
        className="post-content bg-white p-7 sm:p-12 rounded-3xl border border-slate-200/80 shadow-card"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.body) }}
      />

      {/* Author Card Footer */}
      <div className="mt-12 bg-white border border-slate-200/80 shadow-card rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <Avatar
          src={post.author?.image}
          name={post.author?.displayName}
          size="xl"
          shape="square"
        />
        <div className="text-center sm:text-left flex-1">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 mb-0.5">
            Published by
          </p>
          <h3 className="font-extrabold text-slate-900 text-base">
            {post.author?.displayName || 'Author'}
          </h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {post.author?.bio || 'Author and engineering contributor on OmniLog.'}
          </p>
          <div className="mt-3">
            <Link
              to={`/feed?search=${post.author?.displayName || ''}`}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
            >
              Browse all publications from this author →
            </Link>
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
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Are you sure you want to delete this publication?
            </p>
            <p className="text-xs text-slate-500 mt-1">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={isDeleting}>
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
