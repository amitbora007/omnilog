import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../common/Badge.jsx';
import Avatar from '../common/Avatar.jsx';
import Card3D from '../common/Card3D.jsx';
import { formatDate } from '../../utils/formatters.js';
import { Clock, Edit3, Trash2, ArrowUpRight } from 'lucide-react';

export default function PostCard({ post, isOwner = false, onDelete }) {
  return (
    <Card3D className="h-full">
      <article className="bg-slate-900/60 rounded-2xl border border-white/10 hover:border-indigo-500/40 shadow-card hover:shadow-card-hover backdrop-blur-md flex flex-col h-full overflow-hidden group transition-all duration-300">
        <div className="p-6 flex-1 flex flex-col">
          {/* Header: Tags & Reading Time */}
          <div className="flex items-center justify-between gap-2 mb-3.5">
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {post.tags && post.tags.length > 0 ? (
                post.tags.slice(0, 3).map((tag) => (
                  <Link key={tag} to={`/feed?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="tag" size="xs">
                      #{tag}
                    </Badge>
                  </Link>
                ))
              ) : (
                <Badge variant="default" size="xs">
                  #post
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
              <Clock className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              <span>{post.readingTime || 1}m</span>
            </div>
          </div>

          {/* Post Title */}
          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2.5 tracking-tight leading-snug">
            <Link to={`/posts/${post._id}`} className="focus:outline-none">
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-slate-400 group-hover:text-slate-300 line-clamp-3 mb-5 leading-relaxed flex-1 transition-colors">
            {post.excerpt || 'Explore this article to learn more about architecture, code, and developer insights...'}
          </p>

          {/* Owner Visibility Status Pill */}
          {isOwner && (
            <div className="mb-4">
              <Badge variant={post.status === 'public' ? 'public' : 'private'} size="xs">
                {post.status === 'public' ? 'Public Live' : 'Private Draft'}
              </Badge>
            </div>
          )}

          {/* Author Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                src={post.author?.image}
                name={post.author?.displayName || 'Anonymous'}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {post.author?.displayName || 'Anonymous'}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">{formatDate(post.createdAt)}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isOwner ? (
                <>
                  <Link
                    to={`/posts/edit/${post._id}`}
                    className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400"
                    aria-label="Edit post"
                    title="Edit post"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(post)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
                      aria-label="Delete post"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              ) : (
                <Link
                  to={`/posts/${post._id}`}
                  className="inline-flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors gap-1 group-hover:translate-x-0.5 duration-150"
                >
                  <span>Read</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </article>
    </Card3D>
  );
}
