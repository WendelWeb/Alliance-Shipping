'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Calendar,
  CheckCircle,
  Clock,
  X,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { LoadingSpinner, SkeletonLoader, CardSkeleton } from '@/components/admin/LoadingSpinner';

// Mock data - Announcements
const mockAnnouncements = [
  {
    id: 1,
    title: 'Holiday Shipping Schedule',
    category: 'shipping',
    content: 'We will be operating on a modified schedule during the holidays. Please check our website for specific dates and times.',
    isPublished: true,
    publishedAt: '2026-01-05T10:00:00',
    createdBy: 'Super Admin',
    createdAt: '2026-01-04T14:30:00',
    imageUrl: null,
  },
  {
    id: 2,
    title: 'New Port-au-Prince Location Opening',
    category: 'update',
    content: 'We are excited to announce the opening of our new location in downtown Port-au-Prince! Now offering faster pickup times and extended hours.',
    isPublished: true,
    publishedAt: '2026-01-03T09:00:00',
    createdBy: 'Admin User',
    createdAt: '2026-01-02T16:20:00',
    imageUrl: '/news-placeholder.jpg',
  },
  {
    id: 3,
    title: 'Special Promotion: 20% Off',
    category: 'promotion',
    content: 'Get 20% off your shipping fees for packages over 10 lbs this month! Use code SAVE20 at checkout.',
    isPublished: false,
    publishedAt: null,
    createdBy: 'Super Admin',
    createdAt: '2026-01-06T11:45:00',
    imageUrl: null,
  },
];

interface Announcement {
  id?: number;
  title: string;
  category: string;
  content: string;
  isPublished: boolean;
  publishedAt?: string | null;
  imageUrl?: string | null;
  createdBy?: string;
  createdAt?: string;
}

export default function AnnouncementsPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Announcement>({
    title: '',
    category: 'update',
    content: '',
    isPublished: false,
  });

  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoading(true);
      try {
        // No simulation delay for instant loading
        await new Promise((resolve) => setTimeout(resolve, 0));

        // TODO: Replace with real API call
        // const response = await fetch('/api/admin/announcements');
        // const data = await response.json();
        // setAnnouncements(data);

        setAnnouncements(mockAnnouncements);
      } catch (error) {
        console.error('Error loading announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filterCategory === 'all' || announcement.category === filterCategory;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && announcement.isPublished) ||
      (filterStatus === 'draft' && !announcement.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreate = () => {
    console.log('Creating announcement:', formData);
    // TODO: API call to create
    setIsCreating(false);
    resetForm();
  };

  const handleEdit = (announcement: typeof mockAnnouncements[0]) => {
    setEditingId(announcement.id);
    setFormData(announcement);
  };

  const handleUpdate = () => {
    console.log('Updating announcement:', formData);
    // TODO: API call to update
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      console.log('Deleting announcement:', id);
      // TODO: API call to delete
    }
  };

  const handlePublish = (id: number) => {
    console.log('Publishing announcement:', id);
    // TODO: API call to publish
  };

  const handleUnpublish = (id: number) => {
    console.log('Unpublishing announcement:', id);
    // TODO: API call to unpublish
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'update',
      content: '',
      isPublished: false,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const categoryColors = {
    update: 'bg-blue-100 text-blue-800',
    promotion: 'bg-purple-100 text-purple-800',
    shipping: 'bg-green-100 text-green-800',
    alert: 'bg-red-100 text-red-800',
  };

  const stats = {
    total: announcements.length,
    published: announcements.filter((a) => a.isPublished).length,
    draft: announcements.filter((a) => !a.isPublished).length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-80 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-4">
          <div className="h-24 flex-1 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-24 flex-1 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-24 flex-1 bg-gray-200 rounded-xl animate-pulse" />
        </div>
        <SkeletonLoader rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create and manage news announcements for customers
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Announcement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Megaphone className="h-8 w-8 text-gray-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.published}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.draft}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="update">Updates</option>
            <option value="promotion">Promotions</option>
            <option value="shipping">Shipping</option>
            <option value="alert">Alerts</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId !== null) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border-2 border-primary-200"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {isCreating ? 'Create New Announcement' : 'Edit Announcement'}
          </h3>

          <div className="space-y-4 mb-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter announcement title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="update">Update</option>
                <option value="promotion">Promotion</option>
                <option value="shipping">Shipping</option>
                <option value="alert">Alert</option>
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter announcement content..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            {/* Image Upload Placeholder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer">
                <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">Click to upload image</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="publish"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="publish" className="text-sm font-medium text-gray-900">
                Publish immediately
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={isCreating ? handleCreate : handleUpdate}
              className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              {isCreating ? 'Create' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      categoryColors[announcement.category as keyof typeof categoryColors]
                    }`}
                  >
                    {announcement.category.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {announcement.isPublished ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                    <Clock className="h-3 w-3" />
                    Draft
                  </span>
                )}
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {announcement.isPublished && announcement.publishedAt
                  ? `Published ${formatDate(announcement.publishedAt)}`
                  : `Created ${formatDate(announcement.createdAt!)}`}
              </div>
              <span>•</span>
              <span>By {announcement.createdBy}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {announcement.isPublished ? (
                <button
                  onClick={() => handleUnpublish(announcement.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <EyeOff className="h-4 w-4" />
                  Unpublish
                </button>
              ) : (
                <button
                  onClick={() => handlePublish(announcement.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Publish
                </button>
              )}
              <button
                onClick={() => handleEdit(announcement)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(announcement.id)}
                className="inline-flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first announcement'}
          </p>
          {!searchQuery && filterCategory === 'all' && filterStatus === 'all' && (
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create First Announcement
            </button>
          )}
        </div>
      )}
    </div>
  );
}
