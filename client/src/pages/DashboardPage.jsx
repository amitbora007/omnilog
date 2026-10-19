import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { postsApi } from '../api/posts.js';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import DataTablePagination from '../components/common/DataTablePagination.jsx';
import { TableRowSkeleton } from '../components/common/Skeleton.jsx';
import { formatDate } from '../utils/formatters.js';
import {
  PenSquare,
  FileText,
  Globe,
  Lock,
  Edit3,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, public: 0, private: 0 });
  const [loading, setLoading] = useState(true);
  const [tableSearch, setTableSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
      return;
    }
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (isAuthenticated) {
      loadMyPosts();
    }
  }, [isAuthenticated, authLoading, user]);

  const loadMyPosts = async () => {
    try {
      setLoading(true);
      const res = await postsApi.getMyPosts();
      setPosts(res.data || []);
      setStats(res.stats || { total: 0, public: 0, private: 0 });
    } catch (err) {
      console.error('Failed to load posts:', err);
      showToast(err.message || 'Failed to load dashboard posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await postsApi.deletePost(postToDelete._id);
      setPosts((prev) => prev.filter((p) => p._id !== postToDelete._id));
      setStats((prev) => ({
        total: Math.max(0, prev.total - 1),
        public: postToDelete.status === 'public' ? Math.max(0, prev.public - 1) : prev.public,
        private: postToDelete.status === 'private' ? Math.max(0, prev.private - 1) : prev.private,
      }));
      showToast(`"${postToDelete.title}" was deleted`, 'success');
      setPostToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete post', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter posts locally by search keyword and visibility tab
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        tableSearch.trim() === '' ||
        post.title.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (post.author?.displayName &&
          post.author.displayName.toLowerCase().includes(tableSearch.toLowerCase())) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(tableSearch.toLowerCase())));

      const matchesStatus =
        statusFilter === 'all' || post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, tableSearch, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [tableSearch, statusFilter]);

  // Clamp page within bounds
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredPosts.length / perPage));
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredPosts.length, page, perPage]);

  const paginatedPosts = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredPosts.slice(start, start + perPage);
  }, [filteredPosts, page, perPage]);

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-64 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
            <div className="h-28 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!authLoading && isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Author Console
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-slate-200">{user?.displayName}</span>. Manage your publications and drafts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/posts/new">
            <Button variant="primary" size="md" icon={Plus}>
              New Publication
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/70 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shadow-glow-indigo">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Publications
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 font-mono">
              {stats.total}
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Public Live
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 font-mono">
              {stats.public}
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/70 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Private Drafts
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 font-mono">
              {stats.private}
            </p>
          </div>
        </div>
      </div>

      {/* Publications Table Card */}
      <div className="glass-panel rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Table Search & Tab Controls */}
        <div className="p-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by title or tag..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs font-medium text-slate-100 placeholder-slate-500 focus:bg-slate-950 focus:border-indigo-400 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Tabs */}
            <div className="inline-flex bg-slate-950/80 p-1 rounded-xl text-xs font-semibold border border-white/10">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white/10 text-white shadow-xs border border-white/15'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({posts.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('public')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'public'
                    ? 'bg-white/10 text-white shadow-xs border border-white/15'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Public ({stats.public})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('private')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === 'private'
                    ? 'bg-white/10 text-white shadow-xs border border-white/15'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Drafts ({stats.private})
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-white/10 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Tags</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : filteredPosts.length > 0 ? (
                paginatedPosts.map((post) => (
                  <tr key={post._id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="px-6 py-4 font-semibold text-white max-w-sm">
                      <Link
                        to={`/posts/${post._id}`}
                        className="hover:text-indigo-300 transition-colors line-clamp-1"
                        title={post.title}
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {post.tags && post.tags.length > 0 ? (
                          post.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="tag" size="xs">
                              #{tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={post.status === 'public' ? 'public' : 'private'} size="xs">
                        {post.status === 'public' ? 'Live' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 whitespace-nowrap">
                      {formatDate(post.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/posts/${post._id}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400"
                          title="View live post"
                          aria-label="View post"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/posts/edit/${post._id}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400"
                          title="Edit post"
                          aria-label="Edit post"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setPostToDelete(post)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
                          title="Delete post"
                          aria-label="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-16 px-4">
                    <PenSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                    <p className="text-base font-semibold text-slate-200">
                      {tableSearch || statusFilter !== 'all'
                        ? 'No publications match your filter'
                        : "You haven't written any publications yet"}
                    </p>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto mb-6">
                      {tableSearch || statusFilter !== 'all'
                        ? 'Try clearing the search query or switching to all status.'
                        : 'Start publishing technical tutorials, dev logs, or personal notes.'}
                    </p>
                    {tableSearch || statusFilter !== 'all' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setTableSearch('');
                          setStatusFilter('all');
                        }}
                      >
                        Reset Table Filters
                      </Button>
                    ) : (
                      <Link to="/posts/new">
                        <Button variant="primary" size="sm" icon={Plus}>
                          Write First Post
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Author Publications Pagination Footer */}
        {filteredPosts.length > 0 && (
          <DataTablePagination
            currentPage={page}
            totalItems={filteredPosts.length}
            pageSize={perPage}
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPerPage(newSize);
              setPage(1);
            }}
            itemLabel="publications"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        title="Confirm Deletion"
      >
        <div className="flex items-start gap-3.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-rose-950/60 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-white">"{postToDelete?.title}"</span>?
            </p>
            <p className="text-xs text-slate-400 mt-1">
              This action cannot be undone and will remove the post from all public and private feeds.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-white/10">
          <Button variant="secondary" size="md" onClick={() => setPostToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={confirmDelete} loading={isDeleting}>
            Delete Permanently
          </Button>
        </div>
      </Modal>
    </div>
  );
}
