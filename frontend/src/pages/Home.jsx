import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import {
  ArrowUpRight,
  BookOpenText,
  Compass,
  Loader2,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import BlogCard from '../components/BlogCard';

const PAGE_SIZE = 9;

const fetchBlogFeed = async ({ pageParam = 0, queryKey }) => {
  const [, searchQuery, selectedCategory] = queryKey;
  const params = {
    page: pageParam,
    size: PAGE_SIZE,
  };

  if (searchQuery) {
    params.q = searchQuery;
  }
  if (selectedCategory) {
    params.categoryId = selectedCategory;
  }

  const response = await api.get('/blog/feed', { params });
  return (
    response.data || {
      content: [],
      page: pageParam,
      size: PAGE_SIZE,
      totalElements: 0,
      totalPages: 0,
      last: true,
    }
  );
};

const fetchCategories = async () => {
  const response = await api.get('/category/all');
  return response.data || [];
};

const normalizeCategory = (category) => ({
  id: category.id,
  name: category.name || category.title || 'Untitled',
  description: category.description || category.desc || '',
  imageUrl: category.imageUrl || category.cUrl || '',
});

const normalizeBlog = (blog) => ({
  ...blog,
  createdAt: blog.createdAt || blog.createdTime || blog.createdDTTM || null,
  likes: Array.isArray(blog.likes) ? blog.likes : [],
  likeCount:
    typeof blog.likeCount === 'number'
      ? blog.likeCount
      : Array.isArray(blog.likes)
        ? blog.likes.length
        : 0,
});

const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const storyScore = (blog) => {
  const base = stripHtml(blog.content || '').length;
  const summary = (blog.description || '').length;
  return base + summary * 1.5;
};

const formatDate = (value) => {
  if (!value) return 'Just now';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Just now';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Home = () => {
  const [activeTab, setActiveTab] = useState('latest');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim().toLowerCase());
    }, 260);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const feedQuery = useInfiniteQuery({
    queryKey: ['blog-feed', searchQuery, selectedCategory],
    queryFn: fetchBlogFeed,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.last) return undefined;
      return (lastPage?.page || 0) + 1;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const categories = useMemo(
    () => (categoriesQuery.data || []).map(normalizeCategory),
    [categoriesQuery.data]
  );

  const blogs = useMemo(
    () =>
      (feedQuery.data?.pages || [])
        .flatMap((page) => page.content || [])
        .map(normalizeBlog),
    [feedQuery.data?.pages]
  );

  const categoryLabelMap = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  const sortedBlogs = useMemo(() => {
    const source = [...blogs];
    if (activeTab === 'popular') {
      source.sort((left, right) => {
        const likeDelta = (right.likeCount || 0) - (left.likeCount || 0);
        if (likeDelta !== 0) {
          return likeDelta;
        }
        return storyScore(right) - storyScore(left);
      });
      return source;
    }

    source.sort((left, right) => {
      const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightDate - leftDate;
    });
    return source;
  }, [activeTab, blogs]);

  const featuredBlog = sortedBlogs[0] || null;
  const feedBlogs = sortedBlogs.slice(1);
  const trendingBlogs = sortedBlogs.slice(0, 5);
  const isLoading = feedQuery.isLoading || categoriesQuery.isLoading;
  const totalStories = feedQuery.data?.pages?.[0]?.totalElements ?? sortedBlogs.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-10">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mesh-card relative overflow-hidden rounded-3xl p-7 md:p-8 xl:col-span-8"
        >
          <div className="absolute -left-16 -top-20 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="absolute -right-20 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-teal-300/20 blur-3xl" />

          {isLoading ? (
            <div className="relative space-y-4">
              <Skeleton width={130} height={26} borderRadius={999} />
              <Skeleton height={44} width="88%" borderRadius={12} />
              <Skeleton count={3} borderRadius={10} />
              <div className="flex gap-3 pt-2">
                <Skeleton width={140} height={38} borderRadius={12} />
                <Skeleton width={110} height={38} borderRadius={12} />
              </div>
            </div>
          ) : featuredBlog ? (
            <div className="relative space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/45 bg-sky-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700">
                <Sparkles size={14} />
                Featured Story
              </span>
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                {featuredBlog.title || 'Untitled story'}
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
                {featuredBlog.description || stripHtml(featuredBlog.content || '').slice(0, 210) ||
                  'Explore what the community is publishing today.'}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-slate-600">
                <span className="rounded-full bg-white/70 px-3 py-1">
                  {featuredBlog.authorName || 'Unknown author'}
                </span>
                <span className="rounded-full bg-white/70 px-3 py-1">{formatDate(featuredBlog.createdAt)}</span>
                <span className="rounded-full bg-white/70 px-3 py-1">
                  {(categoryLabelMap[featuredBlog.categoryMappings?.[0]?.categoryId] ||
                    featuredBlog.categoryMappings?.[0]?.categoryId ||
                    'General')}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to={`/blog/${featuredBlog.id}`}
                  className="button-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                >
                  Read story
                  <ArrowUpRight size={16} />
                </Link>
                <button
                  onClick={() => setActiveTab('latest')}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/85 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                >
                  <Compass size={15} />
                  Discover more
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-300/70 bg-white/55 text-center">
              <div>
                <p className="text-lg font-semibold text-slate-700">No stories found</p>
                <p className="mt-1 text-sm text-slate-500">Try a different query or topic filter.</p>
              </div>
            </div>
          )}
        </motion.section>

        <div className="grid grid-cols-1 gap-5 xl:col-span-4">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.04 }}
            className="glass-panel rounded-3xl p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Search & Sort</h2>
              <SlidersHorizontal size={16} className="text-slate-500" />
            </div>

            <div className="relative mb-4">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search title, summary, content"
                className="input-surface w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/60 p-1 surface-ring">
              <button
                onClick={() => setActiveTab('latest')}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  activeTab === 'latest'
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setActiveTab('popular')}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  activeTab === 'popular'
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Popular
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.08 }}
            className="glass-panel rounded-3xl p-5"
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Topic Explorer</h2>
            <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === null
                    ? 'bg-sky-600 text-white'
                    : 'border border-slate-200 bg-white/80 text-slate-600 hover:text-slate-900'
                }`}
              >
                All topics
              </button>

              {categoriesQuery.isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} width={88} height={28} borderRadius={999} />
                  ))
                : categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        selectedCategory === category.id
                          ? 'bg-sky-600 text-white'
                          : 'border border-slate-200 bg-white/80 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
            </div>
          </motion.section>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section className="xl:col-span-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
              <BookOpenText size={19} className="text-sky-600" />
              Story Feed
            </h2>
            <p className="text-sm text-slate-500">
              {sortedBlogs.length} loaded of {totalStories} {totalStories === 1 ? 'story' : 'stories'}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="glass-panel rounded-3xl p-5">
                  <Skeleton height={170} borderRadius={16} />
                  <div className="mt-4 space-y-2">
                    <Skeleton width={110} height={24} borderRadius={999} />
                    <Skeleton height={28} borderRadius={10} />
                    <Skeleton count={2} borderRadius={8} />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedBlogs.length > 0 ? (
            <>
              <AnimatePresence mode="popLayout">
                <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {feedBlogs.map((blog) => (
                    <BlogCard key={blog.id} blog={blog} categoryLabelMap={categoryLabelMap} />
                  ))}
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 flex flex-col items-center gap-3">
                {feedQuery.hasNextPage ? (
                  <button
                    type="button"
                    onClick={() => feedQuery.fetchNextPage()}
                    disabled={feedQuery.isFetchingNextPage}
                    className="button-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {feedQuery.isFetchingNextPage ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      'Load More Stories'
                    )}
                  </button>
                ) : (
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    You have reached the end of this feed
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="glass-panel rounded-3xl p-8 text-center">
              <p className="text-lg font-semibold text-slate-700">No stories match your filters</p>
              <p className="mt-2 text-sm text-slate-500">Clear topic or search input to discover more posts.</p>
            </div>
          )}
        </section>

        <aside className="xl:col-span-4">
          <div className="glass-panel sticky top-24 rounded-3xl p-5">
            <h3 className="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
              <TrendingUp size={16} className="text-sky-600" />
              Trending Snapshot
            </h3>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} height={52} borderRadius={10} />
                ))}
              </div>
            ) : trendingBlogs.length > 0 ? (
              <div className="space-y-3">
                {trendingBlogs.map((blog, index) => (
                  <Link
                    key={blog.id}
                    to={`/blog/${blog.id}`}
                    className="group flex items-start gap-3 rounded-2xl border border-slate-200/75 bg-white/70 p-3 transition hover:border-sky-200 hover:bg-white"
                  >
                    <span className="mt-0.5 text-xs font-bold text-sky-600">#{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-sky-700">
                        {blog.title || 'Untitled story'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{blog.authorName || 'Unknown author'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Trending list will appear once stories are available.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
