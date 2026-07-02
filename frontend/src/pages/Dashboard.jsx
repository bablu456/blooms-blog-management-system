import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import {
  Activity,
  FolderTree,
  Image as ImageIcon,
  LayoutPanelTop,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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

const Dashboard = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: '',
    desc: '',
    cUrl: '',
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const categories = useMemo(
    () => (categoriesQuery.data || []).map(normalizeCategory),
    [categoriesQuery.data]
  );

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => api.post(`/category?userId=${currentUser.id}`, payload),
    onSuccess: () => {
      toast.success('Category created');
      setForm({ title: '', desc: '', cUrl: '' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      const message = error?.response?.data || 'Could not create category';
      toast.error(typeof message === 'string' ? message : 'Could not create category');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) => api.delete(`/category/${categoryId}?userId=${currentUser.id}`),
    onSuccess: () => {
      toast.success('Category removed');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      if (error?.response?.status === 403) {
        toast.error('Only admins can delete categories');
        return;
      }
      toast.error('Delete failed');
    },
  });

  const handleCreateCategory = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.desc.trim()) {
      toast.error('Title and description are required');
      return;
    }

    createCategoryMutation.mutate({
      title: form.title.trim(),
      desc: form.desc.trim(),
      cUrl: form.cUrl.trim(),
    });
  };

  const handleDeleteCategory = (categoryId) => {
    if (deleteCategoryMutation.isPending) return;
    const shouldDelete = window.confirm('Delete this category?');
    if (!shouldDelete) return;
    deleteCategoryMutation.mutate(categoryId);
  };

  if (!currentUser) return null;

  if (currentUser.role !== 'ROLE_ADMIN') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-10 text-center">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Admin access required</h1>
          <p className="mt-2 text-slate-600">
            You are logged in, but your current role cannot access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  const statTiles = [
    {
      label: 'Total categories',
      value: categories.length,
      icon: FolderTree,
    },
    {
      label: 'With artwork',
      value: categories.filter((category) => Boolean(category.imageUrl)).length,
      icon: ImageIcon,
    },
    {
      label: 'Visible sections',
      value: categories.length,
      icon: Activity,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-10">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_1fr]">
        <aside className="glass-panel h-fit rounded-3xl p-5 xl:sticky xl:top-24">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">Blooms Admin</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Control Center</h2>
            </div>
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold text-sky-700">
              Live
            </span>
          </div>

          <nav className="space-y-2">
            <button className="flex w-full items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-left text-sm font-medium text-white shadow-lg shadow-slate-900/20">
              <LayoutPanelTop size={18} />
              Categories
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left text-sm font-medium text-slate-600"
              disabled
            >
              <Sparkles size={18} />
              Analytics (soon)
            </button>
          </nav>
        </aside>

        <main className="space-y-6">
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {statTiles.map((tile, index) => (
              <motion.div
                key={tile.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="glass-panel rounded-2xl p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">{tile.label}</p>
                  <tile.icon size={17} className="text-sky-600" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{tile.value}</p>
              </motion.div>
            ))}
          </section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="mesh-card rounded-3xl p-6"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Create Category</h1>
                <p className="text-sm text-slate-600">Add clean taxonomy for better content discovery.</p>
              </div>
            </div>

            <form onSubmit={handleCreateCategory} className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Category name"
                className="input-surface rounded-xl px-4 py-2.5 text-sm"
              />
              <input
                value={form.desc}
                onChange={(event) => setForm((prev) => ({ ...prev, desc: event.target.value }))}
                placeholder="Description"
                className="input-surface rounded-xl px-4 py-2.5 text-sm"
              />
              <input
                value={form.cUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, cUrl: event.target.value }))}
                placeholder="Image URL (optional)"
                className="input-surface rounded-xl px-4 py-2.5 text-sm"
              />
              <button
                type="submit"
                disabled={createCategoryMutation.isPending}
                className="button-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Plus size={16} />
                {createCategoryMutation.isPending ? 'Saving...' : 'Create'}
              </button>
            </form>
          </motion.section>

          <section className="glass-panel rounded-3xl p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Existing Categories</h2>
              <p className="text-sm text-slate-500">{categories.length} total</p>
            </div>

            {categoriesQuery.isLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
                    <Skeleton height={110} borderRadius={12} />
                    <div className="mt-3 space-y-2">
                      <Skeleton height={20} width="70%" />
                      <Skeleton count={2} />
                    </div>
                  </div>
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                  <motion.article
                    key={category.id}
                    layout
                    whileHover={{ y: -4 }}
                    className="group overflow-hidden rounded-2xl border border-slate-200/75 bg-white/75"
                  >
                    <div className="relative h-32 bg-slate-100">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/90 text-rose-600 opacity-0 transition hover:bg-rose-600 hover:text-white group-hover:opacity-100"
                        disabled={deleteCategoryMutation.isPending}
                        aria-label="Delete category"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="space-y-1.5 p-4">
                      <h3 className="text-sm font-semibold text-slate-900">{category.name}</h3>
                      <p className="text-xs leading-relaxed text-slate-600">
                        {category.description || 'No description'}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/60 p-10 text-center text-slate-500">
                No categories yet. Add your first one from the form above.
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;