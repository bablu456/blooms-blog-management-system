import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock3, UserRound, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const stripHtml = (value = '') => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const formatDate = (value) => {
  if (!value) return 'Fresh today';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Fresh today';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getReadTime = (text = '') => {
  const words = stripHtml(text).split(' ').filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return `${minutes} min read`;
};

const BlogCard = ({ blog, categoryLabelMap = {} }) => {
  const createdAt = blog.createdAt || blog.createdTime || blog.createdDTTM;
  const primaryCategoryId = blog.categoryMappings?.[0]?.categoryId;

  const previewText = useMemo(() => {
    const source = blog.description || stripHtml(blog.content || '');
    if (!source) return 'No summary available for this story yet.';
    if (source.length <= 170) return source;
    return `${source.slice(0, 170).trim()}...`;
  }, [blog.content, blog.description]);

  const categoryLabel =
    categoryLabelMap[primaryCategoryId] || primaryCategoryId || 'General';

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/blog/${blog.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.title || 'Blooms story',
          text: blog.description || 'Check out this story on Blooms.',
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

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="mesh-card group relative h-full overflow-hidden rounded-3xl"
    >
      <div className="absolute -left-16 -top-16 h-36 w-36 rounded-full bg-sky-300/20 blur-2xl transition duration-500 group-hover:scale-125" />
      <div className="relative flex h-full flex-col gap-5 p-6 md:p-7">
        {blog.imageUrl ? (
          <Link to={`/blog/${blog.id}`} className="overflow-hidden rounded-2xl">
            <img
              src={blog.imageUrl}
              alt={blog.title || 'Blog cover'}
              className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </Link>
        ) : null}

        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="rounded-full border border-sky-300/40 bg-sky-50/80 px-3 py-1 font-semibold text-sky-700">
            {categoryLabel}
          </span>
          <span className="text-slate-500">{formatDate(createdAt)}</span>
        </div>

        <div className="space-y-3">
          <Link to={`/blog/${blog.id}`} className="block">
            <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-sky-700">
              {blog.title || 'Untitled story'}
            </h3>
          </Link>
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{previewText}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-slate-200/70 pt-4 text-sm text-slate-600">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <UserRound size={15} />
            </span>
            {blog.authorId ? (
              <Link
                to={`/author/${blog.authorId}`}
                className="truncate font-medium text-slate-700 transition hover:text-sky-700"
              >
                {blog.authorName || 'Author'}
              </Link>
            ) : (
              <span className="truncate font-medium text-slate-700">
                {blog.authorName || 'Author'}
              </span>
            )}
          </div>

          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Clock3 size={13} />
            {getReadTime(blog.content || blog.description || '')}
          </span>
        </div>

        <div className="absolute right-5 top-5 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/75 bg-white/90 text-slate-500 backdrop-blur transition hover:text-sky-700"
            aria-label="Share story"
          >
            <Share2 size={15} />
          </button>
          <Link
            to={`/blog/${blog.id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/75 bg-white/90 text-slate-500 backdrop-blur transition hover:text-sky-700"
            aria-label="Read story"
          >
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;
