import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import {
  ArrowUpRight,
  BadgeCheck,
  BookHeart,
  BookOpenText,
  Camera,
  Github,
  Globe,
  Heart,
  ImagePlus,
  Linkedin,
  PenSquare,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Twitter,
  UserRound,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../context/AuthContext';
import { updateStoredUser } from '../services/session';

const TABS = {
  personal: 'personal',
  blogs: 'blogs',
  likes: 'likes',
};

const DEFAULT_SOCIAL_LINKS = {
  twitter: '',
  linkedIn: '',
  gitHub: '',
};

const MAX_AVATAR_FILE_SIZE_MB = 8;

const fetchCurrentUser = async () => {
  const response = await api.get('/user/me');
  return response.data || null;
};

const fetchCategories = async () => {
  const response = await api.get('/category/all');
  return response.data || [];
};

const fetchBlogsByAuthor = async (userId) => {
  const response = await api.get(`/blog/author/${userId}`);
  return response.data || [];
};

const fetchLikedBlogs = async () => {
  const response = await api.get('/user/me/liked-blogs');
  return response.data || [];
};

const normalizeUser = (user = {}) => ({
  ...user,
  bio: user.bio || '',
  website: user.website || '',
  profileUrl: user.profileUrl || '',
  socialLinks: {
    ...DEFAULT_SOCIAL_LINKS,
    ...(user.socialLinks || {}),
  },
});

const normalizeBlog = (blog = {}) => ({
  ...blog,
  createdAt: blog.createdAt || blog.createdTime || blog.createdDTTM || null,
  likeCount:
    typeof blog.likeCount === 'number'
      ? blog.likeCount
      : Array.isArray(blog.likes)
      ? blog.likes.length
      : 0,
});

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

const getTabFromParams = (searchParams) => {
  const requestedTab = searchParams.get('tab');
  return Object.values(TABS).includes(requestedTab) ? requestedTab : TABS.personal;
};

const getUserInitials = (name, username) => {
  const source = name?.trim() || username?.trim() || 'User';
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result?.toString() || ''));
    reader.addEventListener('error', () => reject(new Error('Could not read the selected image')));
    reader.readAsDataURL(file);
  });

const createImage = (imageSrc) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Could not load the selected image')));
    image.src = imageSrc;
  });

const getCroppedAvatarFile = async (imageSrc, croppedAreaPixels, originalFileName) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas is not available in this browser');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not prepare the cropped avatar'));
          return;
        }

        const safeBaseName = (originalFileName || 'blooms-avatar').replace(/\.[^/.]+$/, '');
        resolve(
          new File([blob], `${safeBaseName}-cropped.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
        );
      },
      'image/jpeg',
      0.92
    );
  });
};

const ProfileSettings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => getTabFromParams(searchParams));
  const [formData, setFormData] = useState(() =>
    normalizeUser({
      name: '',
      bio: '',
      profileUrl: '',
      website: '',
      socialLinks: DEFAULT_SOCIAL_LINKS,
    })
  );
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [avatarSource, setAvatarSource] = useState('');
  const [avatarCrop, setAvatarCrop] = useState({ x: 0, y: 0 });
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarCroppedAreaPixels, setAvatarCroppedAreaPixels] = useState(null);
  const [avatarFileName, setAvatarFileName] = useState('');
  const [croppedAvatarFile, setCroppedAvatarFile] = useState(null);
  const [croppedAvatarPreviewUrl, setCroppedAvatarPreviewUrl] = useState('');
  const [isPreparingAvatar, setIsPreparingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    const nextTab = getTabFromParams(searchParams);
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [activeTab, searchParams]);

  useEffect(() => {
    return () => {
      if (croppedAvatarPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(croppedAvatarPreviewUrl);
      }
    };
  }, [croppedAvatarPreviewUrl]);

  const profileQuery = useQuery({
    queryKey: ['user-me'],
    queryFn: fetchCurrentUser,
    enabled: Boolean(currentUser?.id),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const myBlogsQuery = useQuery({
    queryKey: ['profile-my-blogs', currentUser?.id],
    queryFn: () => fetchBlogsByAuthor(currentUser.id),
    enabled: Boolean(currentUser?.id),
  });

  const likedBlogsQuery = useQuery({
    queryKey: ['profile-liked-blogs'],
    queryFn: fetchLikedBlogs,
    enabled: Boolean(currentUser?.id),
  });

  useEffect(() => {
    const source = normalizeUser(profileQuery.data || currentUser || {});
    setFormData(source);
  }, [currentUser, profileQuery.data]);

  const avatarPreviewUrl = croppedAvatarPreviewUrl || formData.profileUrl || '';
  const avatarInitials = useMemo(
    () => getUserInitials(formData.name || currentUser?.name, currentUser?.username),
    [currentUser?.name, currentUser?.username, formData.name]
  );

  const categoryLabelMap = useMemo(
    () =>
      Object.fromEntries(
        (categoriesQuery.data || []).map((category) => [category.id, category.name || category.title || 'General'])
      ),
    [categoriesQuery.data]
  );

  const myBlogs = useMemo(() => (myBlogsQuery.data || []).map(normalizeBlog), [myBlogsQuery.data]);

  const likedBlogs = useMemo(() => (likedBlogsQuery.data || []).map(normalizeBlog), [likedBlogsQuery.data]);

  const profileCompleteness = useMemo(() => {
    const completedFields = [
      formData.name,
      formData.bio,
      avatarPreviewUrl ? 'avatar-ready' : '',
      formData.website,
      formData.socialLinks.twitter,
      formData.socialLinks.linkedIn,
      formData.socialLinks.gitHub,
    ].filter((value) => value && value.trim().length > 0).length;
    return Math.round((completedFields / 7) * 100);
  }, [avatarPreviewUrl, formData]);

  const saveProfileMutation = useMutation({
    mutationFn: (payload) => api.put(`/user/${currentUser.id}`, payload),
    onSuccess: (response) => {
      const updatedUser = normalizeUser(response.data || {});
      updateStoredUser(updatedUser);
      queryClient.setQueryData(['user-me'], updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (blogId) => api.delete(`/blog/${blogId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-my-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['profile-liked-blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blog-feed'] });
      toast.success('Story deleted');
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Could not delete story';
      toast.error(message);
    },
  });

  const resetCropperState = () => {
    setIsCropModalOpen(false);
    setAvatarSource('');
    setAvatarCrop({ x: 0, y: 0 });
    setAvatarZoom(1);
    setAvatarCroppedAreaPixels(null);
    setAvatarFileName('');
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams, { replace: true });
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: value,
      },
    }));
  };

  const openAvatarPicker = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarFileSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`Please select an image smaller than ${MAX_AVATAR_FILE_SIZE_MB}MB.`);
      event.target.value = '';
      return;
    }

    try {
      const nextAvatarSource = await readFileAsDataUrl(file);
      setAvatarSource(nextAvatarSource);
      setAvatarFileName(file.name);
      setAvatarCrop({ x: 0, y: 0 });
      setAvatarZoom(1);
      setAvatarCroppedAreaPixels(null);
      setIsCropModalOpen(true);
    } catch (error) {
      toast.error(error.message || 'Could not open the selected image.');
      event.target.value = '';
    }
  };

  const handleAvatarCropSave = async () => {
    if (!avatarSource || !avatarCroppedAreaPixels) {
      toast.error('Adjust the crop before saving.');
      return;
    }

    setIsPreparingAvatar(true);
    try {
      const nextAvatarFile = await getCroppedAvatarFile(
        avatarSource,
        avatarCroppedAreaPixels,
        avatarFileName
      );
      const nextPreviewUrl = URL.createObjectURL(nextAvatarFile);

      if (croppedAvatarPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(croppedAvatarPreviewUrl);
      }

      setCroppedAvatarFile(nextAvatarFile);
      setCroppedAvatarPreviewUrl(nextPreviewUrl);
      resetCropperState();
      toast.success('Cropped avatar is ready for the upload phase.');
    } catch (error) {
      toast.error(error.message || 'Could not prepare the cropped avatar.');
    } finally {
      setIsPreparingAvatar(false);
    }
  };

  const clearPendingAvatar = () => {
    if (croppedAvatarPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(croppedAvatarPreviewUrl);
    }
    setCroppedAvatarPreviewUrl('');
    setCroppedAvatarFile(null);
    toast.success('Local avatar draft removed.');
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();
    saveProfileMutation.mutate({
      name: formData.name,
      bio: formData.bio,
      profileUrl: formData.profileUrl,
      website: formData.website,
      socialLinks: formData.socialLinks,
    });
  };

  const handleDeleteBlog = (blog) => {
    const confirmed = window.confirm(`Delete "${blog.title || 'this story'}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }
    deleteBlogMutation.mutate(blog.id);
  };

  const tabItems = [
    { id: TABS.personal, label: 'Personal Info', icon: UserRound },
    { id: TABS.blogs, label: 'My Blogs', icon: PenSquare },
    { id: TABS.likes, label: 'Liked Blogs', icon: BookHeart },
  ];

  const topStats = [
    {
      label: 'Published Stories',
      value: myBlogs.length,
      icon: BookOpenText,
      tone: 'from-sky-500/20 to-cyan-400/10 text-sky-700',
    },
    {
      label: 'Liked Stories',
      value: likedBlogs.length,
      icon: Heart,
      tone: 'from-rose-500/20 to-orange-300/10 text-rose-700',
    },
    {
      label: 'Profile Strength',
      value: `${profileCompleteness}%`,
      icon: ShieldCheck,
      tone: 'from-emerald-500/20 to-teal-400/10 text-emerald-700',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 md:py-10">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className="mesh-card relative overflow-hidden rounded-[2rem] p-6 md:p-8"
      >
        <div className="absolute -left-20 top-0 h-52 w-52 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-teal-300/15 blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              <Sparkles size={13} />
              Pro Profile Command Center
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="shrink-0">
                {avatarPreviewUrl ? (
                  <img
                    src={avatarPreviewUrl}
                    alt={formData.name || 'Profile'}
                    className="h-24 w-24 rounded-[1.5rem] border border-white/70 object-cover shadow-xl shadow-sky-500/10"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-white/70 bg-white/80 text-slate-500 shadow-xl shadow-sky-500/10">
                    <span className="text-xl font-semibold text-slate-700">{avatarInitials}</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                  {formData.name || currentUser?.name || 'Your Profile HQ'}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
                  Manage your identity, published work, and the stories that inspired you, all from one premium dashboard.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="rounded-full bg-white/75 px-3 py-1">@{currentUser?.username || 'writer'}</span>
                  <span className="rounded-full bg-white/75 px-3 py-1">{currentUser?.role || 'ROLE_USER'}</span>
                  {croppedAvatarFile ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                      Avatar draft ready
                    </span>
                  ) : null}
                  {formData.website ? (
                    <a
                      href={formData.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-white/75 px-3 py-1 text-sky-700 transition hover:bg-white"
                    >
                      <Globe size={13} />
                      Website
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            {topStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`rounded-2xl border border-white/60 bg-gradient-to-br ${stat.tone} bg-white/80 p-4 shadow-lg shadow-slate-900/5 backdrop-blur`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {stat.label}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">{stat.value}</p>
                    </div>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 bg-white/75">
                      <Icon size={18} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="glass-panel h-fit rounded-[1.75rem] p-4">
          <div className="mb-4 flex items-center gap-2 px-1">
            <BadgeCheck size={16} className="text-sky-600" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</h2>
          </div>

          <div className="space-y-2">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/15'
                      : 'bg-white/70 text-slate-700 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <span className="inline-flex items-center gap-3 text-sm font-semibold">
                    <Icon size={17} />
                    {tab.label}
                  </span>
                  <ArrowUpRight size={15} className={isActive ? 'opacity-100' : 'opacity-40'} />
                </button>
              );
            })}
          </div>
        </aside>

        <section className="min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === TABS.personal ? (
              <motion.div
                key={TABS.personal}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
              >
                <form onSubmit={handleSaveProfile} className="glass-panel rounded-[1.75rem] p-6 md:p-7">
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-slate-900">Personal Identity</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Update how readers and collaborators experience your professional profile.
                    </p>
                  </div>

                  <div className="mb-6 rounded-[1.5rem] border border-white/70 bg-white/72 p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={openAvatarPicker}
                          className="group relative overflow-hidden rounded-[1.75rem] border border-white/70 shadow-xl shadow-sky-500/10 transition hover:-translate-y-0.5"
                        >
                          {avatarPreviewUrl ? (
                            <img
                              src={avatarPreviewUrl}
                              alt={formData.name || 'Profile avatar'}
                              className="h-24 w-24 object-cover"
                            />
                          ) : (
                            <div className="flex h-24 w-24 items-center justify-center bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-400 text-xl font-semibold text-white">
                              {avatarInitials}
                            </div>
                          )}

                          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-slate-950/70 to-transparent p-2 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                            Change photo
                          </div>
                        </button>

                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Profile Photo
                          </h4>
                          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                            Click your avatar to upload from your device, crop it into a clean profile shot, and stage it for the next backend upload phase.
                          </p>
                          {croppedAvatarFile ? (
                            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                              <Camera size={13} />
                              {croppedAvatarFile.name}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarFileSelection}
                        />

                        <button
                          type="button"
                          onClick={openAvatarPicker}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/85 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                        >
                          <ImagePlus size={16} />
                          Choose Image
                        </button>

                        {croppedAvatarFile ? (
                          <button
                            type="button"
                            onClick={clearPendingAvatar}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <X size={16} />
                            Clear Draft
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleFieldChange}
                        className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                        placeholder="Your full display name"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Website</label>
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleFieldChange}
                        className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                        placeholder="https://your-site.com"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleFieldChange}
                      rows="5"
                      className="input-surface w-full rounded-2xl px-4 py-3 text-sm"
                      placeholder="Describe your expertise, voice, and what you publish about."
                    />
                  </div>

                  <div className="mt-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Globe size={16} className="text-sky-600" />
                      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Social Links
                      </h4>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Twitter size={15} className="text-sky-500" />
                          Twitter
                        </label>
                        <input
                          type="text"
                          value={formData.socialLinks.twitter}
                          onChange={(event) => handleSocialChange('twitter', event.target.value)}
                          className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                          placeholder="https://x.com/username"
                        />
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Linkedin size={15} className="text-sky-700" />
                          LinkedIn
                        </label>
                        <input
                          type="text"
                          value={formData.socialLinks.linkedIn}
                          onChange={(event) => handleSocialChange('linkedIn', event.target.value)}
                          className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Github size={15} className="text-slate-700" />
                          GitHub
                        </label>
                        <input
                          type="text"
                          value={formData.socialLinks.gitHub}
                          onChange={(event) => handleSocialChange('gitHub', event.target.value)}
                          className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                          placeholder="https://github.com/username"
                        />
                      </div>
                    </div>
                  </div>

                  {croppedAvatarFile ? (
                    <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/85 px-4 py-3 text-sm text-emerald-800">
                      Cropped avatar prepared as a local <code className="font-semibold">File</code> object. We will send this to the backend upload endpoint in the next phase.
                    </div>
                  ) : null}

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={saveProfileMutation.isPending}
                      className="button-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Save size={16} />
                      {saveProfileMutation.isPending ? 'Saving profile...' : 'Save Changes'}
                    </button>
                  </div>
                </form>

                <div className="space-y-6">
                  <div className="glass-panel rounded-[1.75rem] p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Live Preview
                    </h3>

                    <div className="mt-4 rounded-[1.5rem] border border-slate-200/70 bg-white/75 p-5">
                      <div className="flex items-center gap-4">
                        {avatarPreviewUrl ? (
                          <img
                            src={avatarPreviewUrl}
                            alt={formData.name || 'Profile preview'}
                            className="h-16 w-16 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-lg font-semibold text-slate-700">
                            {avatarInitials}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold text-slate-900">
                            {formData.name || 'Your name'}
                          </p>
                          <p className="truncate text-sm text-slate-500">@{currentUser?.username || 'username'}</p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-slate-600">
                        {formData.bio || 'Add a crisp bio to tell readers what you write about and what makes your perspective valuable.'}
                      </p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-[1.75rem] p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Connection Points
                    </h3>

                    <div className="mt-4 space-y-3">
                      {[
                        { label: 'Website', value: formData.website, icon: Globe },
                        { label: 'Twitter', value: formData.socialLinks.twitter, icon: Twitter },
                        { label: 'LinkedIn', value: formData.socialLinks.linkedIn, icon: Linkedin },
                        { label: 'GitHub', value: formData.socialLinks.gitHub, icon: Github },
                      ].map((item) => {
                        const Icon = item.icon;
                        const hasValue = Boolean(item.value);
                        return hasValue ? (
                          <a
                            key={item.label}
                            href={item.value}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                          >
                            <span className="inline-flex items-center gap-3">
                              <Icon size={16} />
                              {item.label}
                            </span>
                            <ArrowUpRight size={15} />
                          </a>
                        ) : (
                          <div
                            key={item.label}
                            className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-white/55 px-4 py-3 text-sm text-slate-400"
                          >
                            <span className="inline-flex items-center gap-3">
                              <Icon size={16} />
                              {item.label}
                            </span>
                            Not added
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {activeTab === TABS.blogs ? (
              <motion.div
                key={TABS.blogs}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="space-y-5"
              >
                <div className="glass-panel rounded-[1.75rem] p-5 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900">My Stories</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Review, refine, and manage everything you have published.
                      </p>
                    </div>

                    <Link
                      to="/create-blog"
                      className="button-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                    >
                      <PenSquare size={16} />
                      New Story
                    </Link>
                  </div>
                </div>

                {myBlogsQuery.isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="glass-panel rounded-[1.75rem] p-5">
                        <Skeleton height={180} borderRadius={18} />
                        <div className="mt-4 space-y-3">
                          <Skeleton height={24} width="70%" />
                          <Skeleton count={3} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : myBlogs.length > 0 ? (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {myBlogs.map((blog) => {
                      const categoryId = blog.categoryMappings?.[0]?.categoryId;
                      const categoryLabel = categoryLabelMap[categoryId] || categoryId || 'General';
                      return (
                        <article key={blog.id} className="glass-panel rounded-[1.75rem] p-5">
                          {blog.imageUrl ? (
                            <img
                              src={blog.imageUrl}
                              alt={blog.title || 'Story cover'}
                              className="h-48 w-full rounded-[1.25rem] object-cover"
                            />
                          ) : null}

                          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">{categoryLabel}</span>
                            <span className="rounded-full bg-white/75 px-3 py-1">{formatDate(blog.createdAt)}</span>
                          </div>

                          <h4 className="mt-4 text-xl font-semibold text-slate-900">{blog.title || 'Untitled story'}</h4>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                            {blog.description || 'No summary available for this story yet.'}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1">
                              <Heart size={14} className="text-rose-500" />
                              {blog.likeCount} {blog.likeCount === 1 ? 'like' : 'likes'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1">
                              <BookOpenText size={14} className="text-sky-600" />
                              Story ready
                            </span>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => navigate(`/create-blog?edit=${blog.id}`)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                            >
                              <PenSquare size={15} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBlog(blog)}
                              disabled={deleteBlogMutation.isPending}
                              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                            <Link
                              to={`/blog/${blog.id}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                            >
                              <ArrowUpRight size={15} />
                              View
                            </Link>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="glass-panel rounded-[1.75rem] p-10 text-center">
                    <p className="text-lg font-semibold text-slate-800">No published stories yet</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Your writing portfolio will appear here once you publish your first post.
                    </p>
                    <Link
                      to="/create-blog"
                      className="button-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                    >
                      <PenSquare size={16} />
                      Write Your First Story
                    </Link>
                  </div>
                )}
              </motion.div>
            ) : null}

            {activeTab === TABS.likes ? (
              <motion.div
                key={TABS.likes}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.22 }}
                className="space-y-5"
              >
                <div className="glass-panel rounded-[1.75rem] p-5 md:p-6">
                  <h3 className="text-2xl font-semibold text-slate-900">Liked Stories</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Keep close to the stories you have endorsed and may want to revisit.
                  </p>
                </div>

                {likedBlogsQuery.isLoading ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="glass-panel rounded-[1.75rem] p-5">
                        <Skeleton height={190} borderRadius={18} />
                        <div className="mt-4 space-y-3">
                          <Skeleton height={24} width="75%" />
                          <Skeleton count={2} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : likedBlogs.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {likedBlogs.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} categoryLabelMap={categoryLabelMap} />
                    ))}
                  </div>
                ) : (
                  <div className="glass-panel rounded-[1.75rem] p-10 text-center">
                    <p className="text-lg font-semibold text-slate-800">No liked stories yet</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Explore the feed and tap the heart icon to build your inspiration list.
                    </p>
                    <Link
                      to="/"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
                    >
                      <ArrowUpRight size={16} />
                      Browse Stories
                    </Link>
                  </div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </div>

      <AnimatePresence>
        {isCropModalOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950 text-white shadow-[0_32px_90px_rgba(2,6,23,0.55)]"
            >
              <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="relative h-[380px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_42%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),_transparent_40%),linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.96))] sm:h-[440px]">
                  <Cropper
                    image={avatarSource}
                    crop={avatarCrop}
                    zoom={avatarZoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setAvatarCrop}
                    onZoomChange={setAvatarZoom}
                    onCropComplete={(_, croppedPixels) => setAvatarCroppedAreaPixels(croppedPixels)}
                  />
                </div>

                <div className="flex flex-col gap-5 border-t border-white/10 p-6 lg:border-l lg:border-t-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
                        Avatar Cropper
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">Frame your new profile image</h3>
                    </div>

                    <button
                      type="button"
                      onClick={resetCropperState}
                      className="rounded-full border border-white/15 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-medium text-slate-100">{avatarFileName || 'Selected image'}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">
                      Drag the photo to reposition it, then use zoom for a tighter crop. Saving will create a cropped <code className="font-semibold text-slate-200">File</code> object for the next backend step.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-200">
                      <span>Zoom</span>
                      <span>{avatarZoom.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.05}
                      value={avatarZoom}
                      onChange={(event) => setAvatarZoom(Number(event.target.value))}
                      className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-sky-400"
                    />
                  </div>

                  <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-relaxed text-emerald-100">
                    This phase is frontend-only. The cropped image will stay local in state until we wire the upload endpoint.
                  </div>

                  <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={resetCropperState}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAvatarCropSave}
                      disabled={isPreparingAvatar}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isPreparingAvatar ? 'Preparing...' : 'Save Crop'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ProfileSettings;
