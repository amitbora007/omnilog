import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { postsApi } from '../api/posts.js';
import { usersApi } from '../api/users.js';
import Avatar from '../components/common/Avatar.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import { TableRowSkeleton } from '../components/common/Skeleton.jsx';
import { formatDate } from '../../src/utils/formatters.js';
import {
  Shield,
  ShieldCheck,
  FileText,
  Users,
  UserPlus,
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Globe,
  Lock,
  Check,
  X,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function AdminPage({ defaultTab }) {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state derived from URL ?tab=posts | ?tab=users
  const activeTab = searchParams.get('tab')
    ? searchParams.get('tab')
    : defaultTab || 'posts';

  const setTab = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // ----------------------------------------------------
  // POSTS STATE
  // ----------------------------------------------------
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsSearch, setPostsSearch] = useState('');
  const [adminScope, setAdminScope] = useState('all'); // 'all' | 'mine'
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // ----------------------------------------------------
  // USERS STATE
  // ----------------------------------------------------
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userStats, setUserStats] = useState({ totalUsers: 0, adminCount: 0, userCount: 0 });
  const [usersSearch, setUsersSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // User Modals State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [userFormData, setUserFormData] = useState({
    displayName: '',
    email: '',
    role: 'user',
    status: 'active',
    bio: '',
  });

  // ----------------------------------------------------
  // DATA LOADERS
  // ----------------------------------------------------
  useEffect(() => {
    loadPosts();
  }, [adminScope]);

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  const loadPosts = async (scopeToLoad = adminScope) => {
    try {
      setPostsLoading(true);
      const res = await postsApi.getMyPosts({ scope: scopeToLoad });
      setPosts(res.data || []);
    } catch (err) {
      console.error('Failed to load posts:', err);
      showToast(err.message || 'Failed to load publications', 'error');
    } finally {
      setPostsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await usersApi.getUsers({
        role: roleFilter,
        status: statusFilter,
        limit: 100,
      });
      setUsers(res.data || []);
      setUserStats(res.stats || { totalUsers: 0, adminCount: 0, userCount: 0 });
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast(err.message || 'Failed to load user accounts', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  // ----------------------------------------------------
  // COMPUTED POSTS & METRICS
  // ----------------------------------------------------
  const postStats = useMemo(() => {
    let result = posts;
    if (adminScope === 'mine' && currentAdmin) {
      result = result.filter((p) => {
        const authorId = p.author?._id || p.author?.id || p.author;
        const myId = currentAdmin._id || currentAdmin.id;
        return authorId && myId && authorId.toString() === myId.toString();
      });
    }
    const total = result.length;
    const pub = result.filter((p) => p.status === 'public').length;
    const priv = result.filter((p) => p.status === 'private').length;
    return { total, public: pub, private: priv };
  }, [posts, adminScope, currentAdmin]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (adminScope === 'mine' && currentAdmin) {
      result = result.filter((p) => {
        const authorId = p.author?._id || p.author?.id || p.author;
        const myId = currentAdmin._id || currentAdmin.id;
        return authorId && myId && authorId.toString() === myId.toString();
      });
    }
    if (!postsSearch.trim()) return result;
    const q = postsSearch.toLowerCase();
    return result.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.author?.displayName?.toLowerCase().includes(q)
    );
  }, [posts, postsSearch, adminScope, currentAdmin]);

  // ----------------------------------------------------
  // COMPUTED USERS & METRICS
  // ----------------------------------------------------
  const filteredUsers = useMemo(() => {
    if (!usersSearch.trim()) return users;
    const q = usersSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [users, usersSearch]);

  const suspendedUsersCount = useMemo(() => {
    return users.filter((u) => u.status === 'suspended').length;
  }, [users]);

  // ----------------------------------------------------
  // POST ACTIONS
  // ----------------------------------------------------
  const confirmDeletePost = async () => {
    if (!postToDelete) return;
    try {
      setIsDeletingPost(true);
      await postsApi.deletePost(postToDelete._id);
      setPosts((prev) => prev.filter((p) => p._id !== postToDelete._id));
      showToast('Publication successfully deleted', 'success');
      setPostToDelete(null);
    } catch (err) {
      console.error('Failed to delete post:', err);
      showToast(err.message || 'Failed to delete publication', 'error');
    } finally {
      setIsDeletingPost(false);
    }
  };

  // ----------------------------------------------------
  // USER ACTIONS
  // ----------------------------------------------------
  const openCreateUserModal = () => {
    setUserFormData({
      displayName: '',
      email: '',
      role: 'user',
      status: 'active',
      bio: '',
    });
    setCreateModalOpen(true);
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingUser(true);
      const res = await usersApi.createUser(userFormData);
      showToast('User provisioned successfully', 'success');
      setCreateModalOpen(false);
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const openEditUserModal = (targetUser) => {
    setEditingUser(targetUser);
    setUserFormData({
      displayName: targetUser.displayName || '',
      email: targetUser.email || '',
      role: targetUser.role || 'user',
      status: targetUser.status || 'active',
      bio: targetUser.bio || '',
    });
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setIsSubmittingUser(true);
      await usersApi.updateUser(editingUser._id, userFormData);
      showToast('User profile updated successfully', 'success');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsSubmittingUser(true);
      const res = await usersApi.deleteUser(userToDelete._id);
      showToast(res.message || 'User deleted successfully', 'success');
      setUserToDelete(null);
      loadUsers();
      loadPosts(); // refresh posts as cascade may have removed some
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* ---------------------------------------------------- */}
      {/* CONSOLE HEADER & CONTEXTUAL CTAS */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              Super Admin Console
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs">
              <Shield className="w-3.5 h-3.5" />
              SUPER ADMIN
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Centralized control center to monitor and manage all platform publications, author content, and user accounts.
          </p>
        </div>

        {/* Dynamic Contextual Action Button */}
        <div className="flex items-center gap-3">
          {activeTab === 'posts' ? (
            <Link to="/posts/new">
              <Button variant="primary" size="md" icon={Plus}>
                New Publication
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="md" icon={UserPlus} onClick={openCreateUserModal}>
              Create User
            </Button>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PRIMARY TAB NAVIGATION SWITCHER */}
      {/* ---------------------------------------------------- */}
      <div className="flex items-center gap-2 mt-6 border-b border-slate-200">
        <button
          onClick={() => setTab('posts')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'posts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Publications Management</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
              activeTab === 'posts'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {posts.length}
          </span>
        </button>

        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-2.5 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
              activeTab === 'users'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {userStats.totalUsers || users.length}
          </span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: PUBLICATIONS (POSTS) VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'posts' && (
        <div className="space-y-6 mt-6 animate-in fade-in duration-150">
          {/* Posts KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  {adminScope === 'all' ? 'All System Publications' : 'My Publications'}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 font-mono">
                  {postStats.total}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Public Live
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 font-mono">
                  {postStats.public}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Private Drafts
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 font-mono">
                  {postStats.private}
                </p>
              </div>
            </div>
          </div>

          {/* Posts Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Scope Toggle: All Posts vs My Posts */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
              <button
                onClick={() => {
                  setAdminScope('all');
                  loadPosts('all');
                }}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminScope === 'all'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All System Posts
              </button>
              <button
                onClick={() => {
                  setAdminScope('mine');
                  loadPosts('mine');
                }}
                className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminScope === 'mine'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Posts Only
              </button>
            </div>

            {/* Search Input & Refresh Button */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={postsSearch}
                  onChange={(e) => setPostsSearch(e.target.value)}
                  placeholder="Search by title, tag, or author..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                loading={postsLoading}
                onClick={() => loadPosts(adminScope)}
                title="Refresh publications"
                className="!min-h-[38px] text-xs font-semibold shrink-0"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Posts Data Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Publication
                    </th>
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Author
                    </th>
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Date
                    </th>
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {postsLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRowSkeleton key={i} columns={5} />
                    ))
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-base font-bold text-slate-800">No publications found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {postsSearch
                            ? 'No posts matched your search filters.'
                            : 'No posts are currently stored in the system.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => {
                      const authorId = post.author?._id || post.author?.id || post.author;
                      const myId = currentAdmin?._id || currentAdmin?.id;
                      const isOwner = Boolean(authorId && myId && authorId.toString() === myId.toString());
                      return (
                        <tr key={post._id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-4 px-6 max-w-md">
                            <Link
                              to={`/posts/${post._id}`}
                              className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-sm"
                            >
                              {post.title}
                            </Link>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {post.excerpt || 'No summary preview'}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2.5">
                              <Avatar
                                src={post.author?.image}
                                name={post.author?.displayName || 'Author'}
                                size="sm"
                              />
                              <div>
                                <span className="text-xs font-bold text-slate-800 block truncate max-w-[140px]">
                                  {post.author?.displayName || 'Unknown'}
                                </span>
                                {isOwner && (
                                  <span className="text-[10px] font-mono text-indigo-600 font-bold">
                                    (You)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={post.status === 'public' ? 'success' : 'default'} size="sm">
                              {post.status === 'public' ? 'Public Live' : 'Private Draft'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                            {formatDate(post.createdAt)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/posts/${post._id}`}
                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                title="View Publication"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/posts/edit/${post._id}`}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Edit Publication (Admin Override)"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => setPostToDelete(post)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Publication"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: USER MANAGEMENT VIEW */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="space-y-6 mt-6 animate-in fade-in duration-150">
          {/* User KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Total Users
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 font-mono">
                  {userStats.totalUsers}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/60">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Active Admins
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 font-mono">
                  {userStats.adminCount}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Standard Users
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 font-mono">
                  {userStats.userCount}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Suspended Accounts
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 font-mono">
                  {suspendedUsersCount}
                </p>
              </div>
            </div>
          </div>

          {/* User Filters & Search */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Role Filter Pills */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
              {[
                { label: 'All Users', val: 'all' },
                { label: 'Admins', val: 'admin' },
                { label: 'Standard Users', val: 'user' },
              ].map((tab) => (
                <button
                  key={tab.val}
                  onClick={() => setRoleFilter(tab.val)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    roleFilter === tab.val
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input & Refresh Button */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                loading={usersLoading}
                onClick={() => loadUsers()}
                title="Refresh users"
                className="!min-h-[38px] text-xs font-semibold shrink-0"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* User Data Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      User Profile
                    </th>
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Role
                    </th>
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Publications
                    </th>
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Joined
                    </th>
                    <th className="py-4 px-6 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRowSkeleton key={i} columns={6} />
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-base font-bold text-slate-800">No users found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          No registered accounts matched the specified search criteria.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = u._id === currentAdmin?._id;
                      return (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar src={u.image} name={u.displayName} size="md" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">
                                    {u.displayName}
                                  </span>
                                  {isSelf && (
                                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-400 font-mono block">
                                  {u.email}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold ${
                                u.role === 'admin'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {u.role === 'admin' ? (
                                <Shield className="w-3.5 h-3.5" />
                              ) : (
                                <Users className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              {u.role?.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant={u.status === 'active' ? 'success' : 'danger'}
                              size="sm"
                            >
                              {u.status === 'active' ? 'Active' : 'Suspended'}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-xs font-mono font-bold text-slate-800">
                              {u.postsCount || 0}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditUserModal(u)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit User (Role / Status)"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setUserToDelete(u)}
                                disabled={isSelf}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isSelf
                                    ? 'text-slate-200 cursor-not-allowed'
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                                }`}
                                title={isSelf ? 'Cannot delete your own account' : 'Delete User'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: DELETE POST CONFIRMATION */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        title="Delete Publication"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Are you sure you want to permanently delete this publication?</span>
          </div>
          <p className="text-sm font-semibold text-slate-800">
            "{postToDelete?.title}"
          </p>
          <p className="text-xs text-slate-500">
            Authored by: <span className="font-bold">{postToDelete?.author?.displayName || 'Unknown'}</span>
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" size="md" onClick={() => setPostToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={isDeletingPost}
              onClick={confirmDeletePost}
            >
              Delete Publication
            </Button>
          </div>
        </div>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: CREATE USER */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision New User"
      >
        <form onSubmit={handleCreateUserSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Display Name *
            </label>
            <input
              type="text"
              required
              value={userFormData.displayName}
              onChange={(e) =>
                setUserFormData({ ...userFormData, displayName: e.target.value })
              }
              placeholder="e.g. Jane Doe"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={userFormData.email}
              onChange={(e) =>
                setUserFormData({ ...userFormData, email: e.target.value })
              }
              placeholder="jane@example.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 font-mono transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                value={userFormData.role}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, role: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 transition-colors"
              >
                <option value="user">Standard User</option>
                <option value="admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={userFormData.status}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, status: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 transition-colors"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={isSubmittingUser}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: EDIT USER (ROLE / STATUS) */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User Profile & Permissions"
      >
        <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={userFormData.displayName}
              onChange={(e) =>
                setUserFormData({ ...userFormData, displayName: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={userFormData.email}
              onChange={(e) =>
                setUserFormData({ ...userFormData, email: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 font-mono transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                value={userFormData.role}
                disabled={editingUser?._id === currentAdmin?._id}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, role: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 transition-colors disabled:opacity-50"
              >
                <option value="user">Standard User</option>
                <option value="admin">Super Admin</option>
              </select>
              {editingUser?._id === currentAdmin?._id && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Cannot demote your own account.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={userFormData.status}
                disabled={editingUser?._id === currentAdmin?._id}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, status: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-indigo-500 transition-colors disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              {editingUser?._id === currentAdmin?._id && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Cannot suspend your own account.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit" loading={isSubmittingUser}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: DELETE USER CONFIRMATION */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Delete User Account"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>This action will permanently delete this user and cascade delete all their authored publications.</span>
          </div>
          <p className="text-sm font-semibold text-slate-800">
            "{userToDelete?.displayName}" ({userToDelete?.email})
          </p>
          <p className="text-xs text-slate-500">
            Publications to cascade delete: <span className="font-bold text-rose-600">{userToDelete?.postsCount || 0}</span>
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setUserToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={isSubmittingUser}
              onClick={confirmDeleteUser}
            >
              Delete User & Publications
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
