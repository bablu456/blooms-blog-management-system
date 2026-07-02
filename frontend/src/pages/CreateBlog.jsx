import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TiptapUnderline from '@tiptap/extension-underline';
import Skeleton from 'react-loading-skeleton';
import {
  Bold,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  UploadCloud,
  Save,
  Sparkles,
  PlusCircle,
  XCircle,
  Trash2,
  Underline as UnderlineIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const fetchCategories = async () => {
  const response = await api.get('/category/all');
  return response.data || [];
};

const fetchBlogById = async (blogId) => {
  const response = await api.get(`/blog/${blogId}`);
  return response.data || null;
};

const normalizeCategory = (category) => ({
  id: category.id,
  name: category.name || category.title || 'Untitled',
});

const countWords = (text = '') => text.split(/\s+/).filter(Boolean).length;
const MAX_COVER_IMAGE_SIZE_MB = 5;
const MAX_COVER_IMAGE_SIZE_BYTES = MAX_COVER_IMAGE_SIZE_MB * 1024 * 1024;

const ToolButton = ({ active = false, label, onClick, children, disabled = false }) => (
  <button
    type="button"
    title={label}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-slate-600 transition ${
      active
        ? 'border-sky-300 bg-sky-50 text-sky-700'
        : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:text-slate-800'
    } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
  >
    {children}
  </button>
);

const CreateBlog = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const editBlogId = searchParams.get('edit');
  const isEditMode = Boolean(editBlogId);
  const hydratedBlogRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    content: '',
    imageUrl: '',
  });
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    desc: '',
    cUrl: '',
  });
  const fileInputRef = useRef(null);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const editBlogQuery = useQuery({
    queryKey: ['blog-editor', editBlogId],
    queryFn: () => fetchBlogById(editBlogId),
    enabled: isEditMode,
  });

  const categories = useMemo(
    () => (categoriesQuery.data || []).map(normalizeCategory),
    [categoriesQuery.data]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      TiptapUnderline,
      TiptapLink.configure({
        autolink: true,
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start with your hook, add headings, and make it scannable.',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'tiptap px-4 py-4',
      },
    },
    onUpdate: ({ editor: tiptapEditor }) => {
      setForm((prev) => ({ ...prev, content: tiptapEditor.getHTML() }));
    },
  });

  useEffect(() => {
    if (!isEditMode || !editBlogQuery.data || !editor) {
      return;
    }

    if (hydratedBlogRef.current === editBlogId) {
      return;
    }

    const blog = editBlogQuery.data;
    const isOwner = currentUser?.id && blog?.authorId === currentUser.id;
    const isAdmin = currentUser?.role === 'ROLE_ADMIN';

    if (currentUser && !isOwner && !isAdmin) {
      toast.error('You can only edit your own stories');
      navigate('/profile?tab=my-blogs', { replace: true });
      return;
    }

    setForm({
      title: blog?.title || '',
      description: blog?.description || '',
      categoryId: blog?.categoryMappings?.[0]?.categoryId || '',
      content: blog?.content || '',
      imageUrl: blog?.imageUrl || '',
    });
    editor.commands.setContent(blog?.content || '');
    hydratedBlogRef.current = editBlogId;
  }, [currentUser, editBlogId, editBlogQuery.data, editor, isEditMode, navigate]);

  const saveBlogMutation = useMutation({
    mutationFn: (payload) =>
      isEditMode ? api.put(`/blog/${editBlogId}`, payload) : api.post('/blog', payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['blog-feed'] });
      queryClient.invalidateQueries({ queryKey: ['profile-my-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['profile-liked-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog-editor', editBlogId] });
      toast.success(isEditMode ? 'Story updated' : 'Story published');
      navigate('/profile?tab=my-blogs');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || error?.response?.data || 'Could not save story';
      toast.error(typeof message === 'string' ? message : 'Could not save story');
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => api.post(`/category?userId=${currentUser.id}`, payload),
    onSuccess: (response) => {
      const createdCategory = response?.data;
      toast.success('Category created');
      setCategoryForm({ title: '', desc: '', cUrl: '' });
      setShowCategoryCreator(false);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      if (createdCategory?.id) {
        setForm((prev) => ({ ...prev, categoryId: createdCategory.id }));
      }
    },
    onError: (error) => {
      const message = error?.response?.data || 'Could not create category';
      toast.error(typeof message === 'string' ? message : 'Could not create category');
    },
  });

  const uploadCoverImageMutation = useMutation({
    mutationFn: async (file) => {
      if (!file) {
        throw new Error('Please select an image file');
      }
      if (!file.type?.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      if (file.size > MAX_COVER_IMAGE_SIZE_BYTES) {
        throw new Error(`Image must be smaller than ${MAX_COVER_IMAGE_SIZE_MB}MB`);
      }

      const signResponse = await api.post('/media/cloudinary/sign', {
        fileName: file.name,
      });
      const signData = signResponse?.data;
      if (!signData?.cloudName || !signData?.apiKey || !signData?.signature) {
        throw new Error('Invalid Cloudinary signature response');
      }

      const payload = new FormData();
      payload.append('file', file);
      payload.append('api_key', signData.apiKey);
      payload.append('timestamp', String(signData.timestamp));
      payload.append('signature', signData.signature);
      if (signData.folder) {
        payload.append('folder', signData.folder);
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`;
      const uploadResponse = await axios.post(uploadUrl, payload, {
        onUploadProgress: (event) => {
          if (!event.total) return;
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(Math.min(progress, 99));
        },
      });

      const secureUrl = uploadResponse?.data?.secure_url;
      if (!secureUrl) {
        throw new Error('Upload completed but no secure URL was returned');
      }

      return secureUrl;
    },
    onMutate: () => {
      setUploadProgress(0);
    },
    onSuccess: (secureUrl) => {
      setForm((prev) => ({ ...prev, imageUrl: secureUrl }));
      setUploadProgress(100);
      toast.success('Cover image uploaded');
      window.setTimeout(() => setUploadProgress(0), 500);
    },
    onError: (error) => {
      const message =
        (typeof error?.response?.data === 'string' && error.response.data) ||
        error?.response?.data?.message ||
        error?.message ||
        'Image upload failed';
      toast.error(message);
      setUploadProgress(0);
    },
  });

  const textPreview = editor?.getText() || '';
  const wordCount = countWords(textPreview);
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 220));

  const setEditorLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || 'https://';
    const linkUrl = window.prompt('Enter URL', previousUrl);
    if (linkUrl === null) return;

    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
  };

  const handlePublish = (event) => {
    event.preventDefault();

    if (!currentUser?.id) {
      toast.error('Please login before publishing');
      navigate('/login');
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    if (!textPreview.trim()) {
      toast.error('Content cannot be empty');
      return;
    }

    if (uploadCoverImageMutation.isPending) {
      toast.error('Please wait for image upload to finish');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      content: form.content,
      imageUrl: form.imageUrl.trim(),
      authorId: currentUser.id,
      categoryMappings: form.categoryId
        ? [
            {
              categoryId: form.categoryId,
              subCategoryIds: [],
            },
          ]
        : [],
    };

    saveBlogMutation.mutate(payload);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = (file) => {
    if (!file) return;
    uploadCoverImageMutation.mutate(file);
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    uploadFile(file);
    event.target.value = '';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!uploadCoverImageMutation.isPending) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    if (uploadCoverImageMutation.isPending) return;
    const file = event.dataTransfer.files?.[0];
    uploadFile(file);
  };

  const handleCreateCategory = (event) => {
    event.preventDefault();

    if (!currentUser?.id) {
      toast.error('Please login first');
      return;
    }

    if (!categoryForm.title.trim() || !categoryForm.desc.trim()) {
      toast.error('Category title and description are required');
      return;
    }

    createCategoryMutation.mutate({
      title: categoryForm.title.trim(),
      desc: categoryForm.desc.trim(),
      cUrl: categoryForm.cUrl.trim(),
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-10">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="mesh-card rounded-3xl p-6 md:p-7"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                {isEditMode ? 'Edit Story' : 'Create a New Story'}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {isEditMode
                  ? 'Refine your existing story with fresh copy, better structure, or a new cover.'
                  : 'Use headings, lists, and links to craft a polished post.'}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              <Sparkles size={14} />
              {isEditMode ? 'Editing mode' : 'Rich editor enabled'}
            </span>
          </div>

          {isEditMode && editBlogQuery.isLoading ? (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
              <Skeleton height={24} width="45%" />
              <div className="mt-3 space-y-2">
                <Skeleton height={18} />
                <Skeleton height={18} width="85%" />
              </div>
            </div>
          ) : null}

          <form onSubmit={handlePublish} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Story title"
                className="input-surface rounded-xl px-4 py-3 text-base font-medium"
                required
              />
              <input
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Short summary"
                className="input-surface rounded-xl px-4 py-3 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                {categoriesQuery.isLoading ? (
                  <Skeleton height={46} borderRadius={12} />
                ) : (
                  <select
                    value={form.categoryId}
                    onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
                    className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => setShowCategoryCreator((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                >
                  {showCategoryCreator ? <XCircle size={14} /> : <PlusCircle size={14} />}
                  {showCategoryCreator ? 'Close category creator' : 'Create new category'}
                </button>
              </div>

              <div className="relative">
                <ImageIcon
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={form.imageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  placeholder="Cover image URL (optional)"
                  className="input-surface w-full rounded-xl py-3 pl-9 pr-4 text-sm"
                />
              </div>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-2xl border border-dashed p-4 transition ${
                dragActive
                  ? 'border-sky-400 bg-sky-50/60'
                  : 'border-slate-300 bg-white/55'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">Cover Image Upload</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Drag and drop an image, or choose a file. Max {MAX_COVER_IMAGE_SIZE_MB}MB.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  disabled={uploadCoverImageMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UploadCloud size={14} />
                  {uploadCoverImageMutation.isPending ? 'Uploading...' : 'Choose image'}
                </button>
              </div>

              {uploadCoverImageMutation.isPending || uploadProgress > 0 ? (
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[11px] font-semibold text-slate-600">{uploadProgress}%</p>
                </div>
              ) : null}

              {form.imageUrl ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white/80">
                  <img
                    src={form.imageUrl}
                    alt="Cover preview"
                    className="h-48 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            {showCategoryCreator ? (
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Quick Category Creator</h3>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    value={categoryForm.title}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    placeholder="Category title"
                    className="input-surface rounded-xl px-3 py-2.5 text-sm"
                  />
                  <input
                    value={categoryForm.desc}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({ ...prev, desc: event.target.value }))
                    }
                    placeholder="Description"
                    className="input-surface rounded-xl px-3 py-2.5 text-sm"
                  />
                  <input
                    value={categoryForm.cUrl}
                    onChange={(event) =>
                      setCategoryForm((prev) => ({ ...prev, cUrl: event.target.value }))
                    }
                    placeholder="Image URL (optional)"
                    className="input-surface rounded-xl px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={createCategoryMutation.isPending}
                    className="button-primary rounded-xl px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70">
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 bg-slate-50/70 p-3">
                <ToolButton
                  label="Bold"
                  active={editor?.isActive('bold')}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  disabled={!editor}
                >
                  <Bold size={15} />
                </ToolButton>
                <ToolButton
                  label="Italic"
                  active={editor?.isActive('italic')}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  disabled={!editor}
                >
                  <Italic size={15} />
                </ToolButton>
                <ToolButton
                  label="Underline"
                  active={editor?.isActive('underline')}
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                  disabled={!editor}
                >
                  <UnderlineIcon size={15} />
                </ToolButton>
                <ToolButton
                  label="Heading"
                  active={editor?.isActive('heading', { level: 2 })}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  disabled={!editor}
                >
                  <Heading2 size={15} />
                </ToolButton>
                <ToolButton
                  label="Bullet list"
                  active={editor?.isActive('bulletList')}
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  disabled={!editor}
                >
                  <List size={15} />
                </ToolButton>
                <ToolButton
                  label="Numbered list"
                  active={editor?.isActive('orderedList')}
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  disabled={!editor}
                >
                  <ListOrdered size={15} />
                </ToolButton>
                <ToolButton
                  label="Quote"
                  active={editor?.isActive('blockquote')}
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  disabled={!editor}
                >
                  <Quote size={15} />
                </ToolButton>
                <ToolButton label="Link" onClick={setEditorLink} disabled={!editor}>
                  <Link2 size={15} />
                </ToolButton>
                <ToolButton
                  label="Clear formatting"
                  onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
                  disabled={!editor}
                >
                  <Trash2 size={15} />
                </ToolButton>
              </div>

              <div className="editor-shell min-h-[340px] bg-white/75">
                {editor ? (
                  <EditorContent editor={editor} />
                ) : (
                  <div className="p-4">
                    <Skeleton count={7} />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-white/75 px-3 py-1">{wordCount} words</span>
                <span className="rounded-full bg-white/75 px-3 py-1">{readingMinutes} min read</span>
              </div>

              <button
                type="submit"
                disabled={saveBlogMutation.isPending || uploadCoverImageMutation.isPending || editBlogQuery.isLoading}
                className="button-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={16} />
                {saveBlogMutation.isPending
                  ? isEditMode
                    ? 'Saving changes...'
                    : 'Publishing...'
                  : uploadCoverImageMutation.isPending
                  ? 'Waiting for image upload...'
                  : isEditMode
                  ? 'Save Changes'
                  : 'Publish Story'}
              </button>
            </div>
          </form>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="glass-panel h-fit rounded-3xl p-5 xl:sticky xl:top-24"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Publishing Notes</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="rounded-xl border border-slate-200/80 bg-white/70 p-3">
              Keep introductions under 3 short paragraphs for better retention.
            </li>
            <li className="rounded-xl border border-slate-200/80 bg-white/70 p-3">
              Use one H2 every 250-350 words to improve scanning.
            </li>
            <li className="rounded-xl border border-slate-200/80 bg-white/70 p-3">
              Upload cover images securely via Cloudinary or paste a direct image URL.
            </li>
          </ul>
        </motion.aside>
      </div>
    </div>
  );
};

export default CreateBlog;
