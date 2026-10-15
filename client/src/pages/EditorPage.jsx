import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';

export default function EditorPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();

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
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to save post.');
      showToast(err.message || 'Failed to save post', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <ArticleSkeleton />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/80">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors gap-1.5 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          {isEditing ? 'Editing Publication' : 'New Publication'}
        </span>
      </div>

      {/* Accessible Error Summary */}
      {error && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex="-1"
          className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-bold">Please resolve the error to continue:</p>
            <p className="mt-0.5 text-xs text-rose-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
            Publication Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Designing Fault-Tolerant Distributed Storage, or Weekly Engineering Notes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-lg sm:text-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-card placeholder:text-slate-400 placeholder:font-normal transition-all"
          />
        </div>

        {/* Tags & Visibility Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tags Input */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              Taxonomy Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="tech, devlog, architecture, notes"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-card"
            />
          </div>

          {/* Visibility Selector */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
              Visibility Status
            </label>
            <div className="grid grid-cols-2 gap-3 h-[42px]">
              <label
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all ${
                  status === 'public'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="public"
                  checked={status === 'public'}
                  onChange={() => setStatus('public')}
                  className="sr-only"
                />
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>Public Live</span>
              </label>

              <label
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all ${
                  status === 'private'
                    ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="private"
                  checked={status === 'private'}
                  onChange={() => setStatus('private')}
                  className="sr-only"
                />
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Private Draft</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content Body Editor */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
            Article Content & Code Snippets
          </label>
          <RichTextEditor
            value={body}
            onChange={setBody}
            placeholder="Draft your story, insert code snippets, document system behaviors..."
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200/80">
          <Link to="/dashboard">
            <Button variant="secondary" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={saving}
            icon={Save}
          >
            {isEditing ? 'Save Changes' : 'Publish Publication'}
          </Button>
        </div>
      </form>
    </div>
  );
}
