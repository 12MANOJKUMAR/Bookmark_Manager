import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus, Search, Filter, Trash2, Edit2, X,
    ExternalLink, Moon, Sun, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api'; // Adjust if needed

function App() {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filters & Search
    const [search, setSearch] = useState('');
    const [tagFilter, setTagFilter] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 9;

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBookmark, setEditingBookmark] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // Form State
    const [formData, setFormData] = useState({
        url: '',
        title: '',
        description: '',
        tags: ''
    });

    // Dark Mode Effect
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Fetch Bookmarks
    const fetchBookmarks = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: LIMIT,
                search,
                tag: tagFilter
            };
            const { data } = await axios.get(`${API_URL}/bookmarks`, { params });
            setBookmarks(data.data);
            setTotalPages(data.meta.totalPages);
        } catch (err) {
            setError('Failed to load bookmarks. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookmarks();
    }, [page, search, tagFilter]);

    // Handlers
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleTagClick = (tag) => {
        setTagFilter(tag === tagFilter ? '' : tag);
        setPage(1);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this bookmark?')) return;
        try {
            await axios.delete(`${API_URL}/bookmarks/${id}`);
            fetchBookmarks();
        } catch (err) {
            alert('Failed to delete bookmark');
        }
    };

    const openModal = (bookmark = null) => {
        setEditingBookmark(bookmark);
        if (bookmark) {
            setFormData({
                url: bookmark.url,
                title: bookmark.title,
                description: bookmark.description || '',
                tags: bookmark.tags.join(', ')
            });
        } else {
            setFormData({ url: '', title: '', description: '', tags: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBookmark(null);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            if (editingBookmark) {
                await axios.put(`${API_URL}/bookmarks/${editingBookmark.id}`, payload);
            } else {
                await axios.post(`${API_URL}/bookmarks`, payload);
            }
            closeModal();
            fetchBookmarks();
        } catch (err) {
            alert('Failed to save bookmark. Check URL format.');
        }
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        BookmarkManager
                    </h1>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <button
                            onClick={() => openModal()}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all transform hover:scale-105"
                        >
                            <Plus size={18} className="mr-2" />
                            Add Bookmark
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search bookmarks..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                        />
                    </div>

                    {tagFilter && (
                        <div className="flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-100 dark:border-blue-800">
                            <Filter size={16} className="mr-2" />
                            Filter: <span className="font-semibold ml-1">{tagFilter}</span>
                            <button onClick={() => setTagFilter('')} className="ml-2 hover:text-blue-900 dark:hover:text-blue-100">
                                <X size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                {error && (
                    <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl mb-6">
                        <p>{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-blue-600" size={48} />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookmarks.map(bookmark => (
                                <div key={bookmark.id} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1" title={bookmark.title}>
                                                {bookmark.title}
                                            </h3>
                                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal(bookmark)} className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(bookmark.id)} className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
                                        >
                                            <ExternalLink size={14} className="mr-1 flex-shrink-0" />
                                            {new URL(bookmark.url).hostname}
                                        </a>

                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                            {bookmark.description || 'No description provided.'}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {bookmark.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    onClick={() => handleTagClick(tag)}
                                                    className={`
                            px-2 py-1 text-xs rounded-full cursor-pointer transition-colors
                            ${tagFilter === tag
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 ring-2 ring-blue-500'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                          `}
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-4 mt-8">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="text-gray-600 dark:text-gray-400">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}

                        {bookmarks.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <p className="text-lg">No bookmarks found.</p>
                                {tagFilter && <p className="text-sm mt-2">Try clearing the tag filter.</p>}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold dark:text-white">
                                {editingBookmark ? 'Edit Bookmark' : 'New Bookmark'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                                <input
                                    type="url"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title {(!formData.title && !editingBookmark) && <span className="text-xs text-blue-500">(Auto-fetched if empty)</span>}
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="My Awesome Site"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Useful resources for..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.tags}
                                    onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="tech, news, reading"
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md"
                                >
                                    {editingBookmark ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
