import React, { startTransition, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Calendar, ArrowLeft, Clock, Heart, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const formatDate = (value) => {
  if (!value) return 'Recent';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Recent';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTimestamp = (value) => {
  if (!value) return 'Just now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Just now';
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const toSafeHtml = (value = '') => {
  if (!value) return '<p>No content available.</p>';
  const maybeHtml = /<\/?[a-z][\s\S]*>/i.test(value);
  if (maybeHtml) return value;
  return value
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('');
};

const normalizeBlog = (blog = {}) => {
  const likes = Array.isArray(blog.likes) ? blog.likes.filter(Boolean) : [];
  return {
    ...blog,
    likes,
    likeCount: typeof blog.likeCount === 'number' ? blog.likeCount : likes.length,
  };
};

const normalizeComment = (comment = {}) => ({
  ...comment,
  text: comment.text || comment.content || '',
  commenterName: comment.commenterName || comment.username || 'Unknown User',
});

const BlogDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const fetchBlogAndComments = async () => {
      setLoading(true);
      try {
        const [blogRes, commentsRes] = await Promise.all([
          api.get(`/blog/${id}`),
          api.get(`/comments/blog/${id}`),
        ]);
        startTransition(() => {
          setBlog(normalizeBlog(blogRes.data || {}));
          setComments((commentsRes.data || []).map(normalizeComment));
        });
      } catch (error) {
        console.error(error);
        toast.error('Failed to load blog details');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAndComments();
  }, [id]);

  const createdAt = blog?.createdAt || blog?.createdTime || blog?.createdDTTM;

  const htmlContent = useMemo(() => toSafeHtml(blog?.content || ''), [blog?.content]);
  const likedByCurrentUser = useMemo(() => {
    if (!currentUser?.id || !blog?.likes) return false;
    return blog.likes.includes(currentUser.id);
  }, [blog?.likes, currentUser?.id]);
  const likeCount = blog?.likeCount ?? blog?.likes?.length ?? 0;

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('Please login to comment');
      return;
    }

    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const payload = {
        text: newComment.trim(),
        blogId: id,
        userId: currentUser.id,
      };
      const res = await api.post('/comments', payload);
      startTransition(() => {
        setComments((prev) => [...prev, normalizeComment(res.data)]);
      });
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUser) {
      toast.error('Please login to like this post');
      return;
    }

    if (!blog) return;

    const previousBlog = {
      ...blog,
      likes: [...(blog.likes || [])],
    };
    const nextLiked = !likedByCurrentUser;
    const nextLikes = nextLiked
      ? Array.from(new Set([...(blog.likes || []), currentUser.id]))
      : (blog.likes || []).filter((userId) => userId !== currentUser.id);

    startTransition(() => {
      setBlog((prev) =>
        prev
          ? {
              ...prev,
              likes: nextLikes,
              likeCount: nextLikes.length,
            }
          : prev
      );
    });

    setLikeLoading(true);
    try {
      const res = await api.post(`/blog/${id}/like`, null, {
        params: {
          userId: currentUser.id,
        },
      });
      const updatedLikes = Array.isArray(res.data?.likes) ? res.data.likes : nextLikes;
      const updatedLikeCount =
        typeof res.data?.likeCount === 'number' ? res.data.likeCount : updatedLikes.length;
      startTransition(() => {
        setBlog((prev) =>
          prev
            ? {
                ...prev,
                likes: updatedLikes,
                likeCount: updatedLikeCount,
              }
            : prev
        );
      });
      toast.success(res.data?.liked ? 'Post liked' : 'Like removed');
    } catch (error) {
      startTransition(() => {
        setBlog(previousBlog);
      });
      toast.error('Failed to update like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/blog/${id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog?.title || 'Blooms story',
          text: blog?.description || 'Check out this story on Blooms.',
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
        return;
      }

      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast.success('Link copied to clipboard');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        toast.error('Could not share this blog');
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!blog) return <div className="min-h-screen flex items-center justify-center text-xl">Blog not found</div>;

  return (
    <article className="mx-auto max-w-4xl px-4 py-12">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sky-700 font-medium hover:underline">
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <header className="mb-10 text-center">
        <div className="mb-4 flex justify-center">
          <span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-sky-700">
            {blog.categoryMappings?.[0]?.categoryId || 'General'}
          </span>
        </div>
        <h1 className="mb-6 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">{blog.title}</h1>
        <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
              <User size={16} />
            </div>
            <span className="font-medium text-slate-800">{blog.authorName || 'Unknown Author'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} /> {formatDate(createdAt)}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} /> 5 min read
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={likeLoading}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              likedByCurrentUser
                ? 'border-rose-300 bg-rose-50 text-rose-600'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <Heart size={16} className={likedByCurrentUser ? 'fill-rose-500 text-rose-500' : ''} />
            {likeLoading ? 'Updating...' : `${likeCount} ${likeCount === 1 ? 'Like' : 'Likes'}`}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </header>

      {blog.imageUrl ? (
        <div className="mb-12 h-96 w-full overflow-hidden rounded-3xl shadow-lg">
          <img src={blog.imageUrl} alt={blog.title} className="h-full w-full object-cover" />
        </div>
      ) : null}

      <div className="prose prose-lg prose-slate mx-auto mb-12 rounded-3xl border border-slate-100 bg-white p-8 text-slate-700 shadow-sm md:p-12">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>

      <div className="mx-auto max-w-3xl">
        <h3 className="mb-6 text-2xl font-bold text-slate-900">Comments ({comments.length})</h3>

        {currentUser ? (
          <form onSubmit={handleCommentSubmit} className="mb-10 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add to the discussion..."
              className="mb-3 w-full resize-none rounded-lg border border-slate-200 p-4 outline-none transition focus:ring-2 focus:ring-sky-500"
              rows="3"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={commentLoading}
                className="rounded-full bg-sky-600 px-6 py-2 font-bold text-white transition hover:bg-sky-700 disabled:opacity-50"
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-10 rounded-xl bg-sky-50 p-6 text-center">
            <p className="font-medium text-sky-800">
              Please <Link to="/login" className="font-bold underline">login</Link> to leave a comment.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-slate-50 bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-start justify-between">
                <h4 className="font-bold text-slate-900">{comment.commenterName}</h4>
                <span className="text-xs text-slate-400">{formatTimestamp(comment.createdAt)}</span>
              </div>
              <p className="text-slate-700">{comment.text}</p>
            </div>
          ))}
          {comments.length === 0 ? (
            <p className="text-center italic text-slate-400">No comments yet. Be the first!</p>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default BlogDetails;
