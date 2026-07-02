import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import BlogCard from '../components/BlogCard';
import { User, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthorProfile = () => {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [author, setAuthor] = useState(null);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [followData, setFollowData] = useState({
        following: false,
        followersCount: 0,
        followingCount: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [userRes, blogsRes, followRes] = await Promise.all([
                    api.get(`/user/${id}`),
                    api.get(`/blog/author/${id}`),
                    api.get(`/follow/stats/${id}`, {
                        params: currentUser?.id ? { viewerId: currentUser.id } : {},
                    }),
                ]);
                setAuthor(userRes.data);
                setBlogs(blogsRes.data);
                setFollowData(
                    followRes.data || {
                        following: false,
                        followersCount: 0,
                        followingCount: 0,
                    }
                );
            } catch (error) {
                console.error("Failed to fetch author data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, currentUser?.id]);

    const handleToggleFollow = async () => {
        if (!currentUser) {
            toast.error('Please login to follow authors');
            return;
        }

        if (currentUser.id === id) {
            toast.error('You cannot follow yourself');
            return;
        }

        setFollowLoading(true);
        try {
            const res = await api.post('/follow/toggle', null, {
                params: {
                    followerId: currentUser.id,
                    followingId: id,
                },
            });
            setFollowData(
                res.data || {
                    following: false,
                    followersCount: 0,
                    followingCount: 0,
                }
            );
            toast.success(res.data?.following ? 'Author followed' : 'Unfollowed author');
        } catch (error) {
            const message = error?.response?.data;
            toast.error(typeof message === 'string' ? message : 'Follow action failed');
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!author) return <div className="min-h-screen flex items-center justify-center">Author not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Author Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-12 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
                    <div className="flex-shrink-0">
                        {author.profileUrl ? (
                            <img
                                src={author.profileUrl}
                                alt={author.name}
                                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-50"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{author.name}</h1>
                        <p className="text-gray-500 mb-4">@{author.username}</p>
                        {author.bio && (
                            <p className="text-gray-700 leading-relaxed max-w-2xl mb-6">
                                {author.bio}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <MapPin size={16} /> Member since {new Date().getFullYear()}
                            </span>
                            <span>{followData.followersCount} followers</span>
                            <span>{followData.followingCount} following</span>
                        </div>
                        {currentUser?.id !== id && (
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={handleToggleFollow}
                                    disabled={followLoading}
                                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                                        followData.following
                                            ? 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                            : 'button-primary'
                                    }`}
                                >
                                    {followLoading ? 'Updating...' : followData.following ? 'Following' : 'Follow'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Author's Blogs */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
                        Posts by {author.name.split(' ')[0]} ({blogs.length})
                    </h2>

                    {blogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogs.map(blog => (
                                <BlogCard key={blog.id} blog={blog} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                            <p>No posts yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthorProfile;
