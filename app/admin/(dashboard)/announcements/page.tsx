'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Plus, Edit, Trash2, Search, Eye, EyeOff, Calendar,
  CheckCircle, Clock, X, Save, RefreshCw, Send, FileText,
  AlertCircle, Wrench, Bell, Sparkles, ChevronDown, Loader2,
  Check, XCircle, Mail, Globe,
} from 'lucide-react';
import { SkeletonLoader } from '@/components/admin/LoadingSpinner';
import { ANNOUNCEMENT_TEMPLATES, fillTemplate, generateTranslations } from '@/lib/announcements/templates';
import type { AnnouncementTemplate } from '@/lib/announcements/templates';

// ─── Types ──────────────────────────────────────────────────────

interface Announcement {
  id: number;
  title: string;
  category: string;
  content: string;
  isPublished: boolean;
  publishedAt?: string | null;
  publishDate?: string | null;
  imageUrl?: string | null;
  createdBy?: number;
  createdAt?: string;
  emailSentAt?: string | null;
  emailSentCount?: number;
  translations?: Record<string, { title: string; content: string }> | null;
}

interface AnnouncementForm {
  title: string;
  category: string;
  content: string;
  isPublished: boolean;
  sendEmail: boolean;
}

interface BroadcastProgress {
  type: 'start' | 'progress' | 'complete';
  sent: number;
  failed: number;
  total: number;
  lastEmail?: string;
  lastUser?: string;
  lastLang?: string;
  status?: string;
}

// ─── Template type colors ───────────────────────────────────────

const templateColors: Record<string, string> = {
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  purple: 'bg-purple-50 border-purple-200 text-purple-800',
  orange: 'bg-orange-50 border-orange-200 text-orange-800',
  green: 'bg-green-50 border-green-200 text-green-800',
};

const categoryColors: Record<string, string> = {
  news: 'bg-blue-100 text-blue-800',
  alert: 'bg-red-100 text-red-800',
  promo: 'bg-purple-100 text-purple-800',
  maintenance: 'bg-orange-100 text-orange-800',
  update: 'bg-blue-100 text-blue-800',
  promotion: 'bg-purple-100 text-purple-800',
  shipping: 'bg-green-100 text-green-800',
};

const categoryIcons: Record<string, typeof Bell> = {
  news: Megaphone,
  alert: AlertCircle,
  promo: Bell,
  maintenance: Wrench,
  update: Megaphone,
};

// ─── Component ──────────────────────────────────────────────────

export default function AnnouncementsPage() {
  // ─── State ────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<AnnouncementForm>({
    title: '', category: 'news', content: '', isPublished: false, sendEmail: true,
  });

  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<AnnouncementTemplate | null>(null);
  const [templateVars, setTemplateVars] = useState<Record<string, string>>({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewLang, setPreviewLang] = useState<string>('fr');

  // Broadcast modal state
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<BroadcastProgress | null>(null);
  const [broadcastLog, setBroadcastLog] = useState<{ email: string; user: string; lang: string; status: string }[]>([]);
  const [broadcastAnnouncementId, setBroadcastAnnouncementId] = useState<number | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // ─── Data Fetching ────────────────────────────────────────────

  const fetchAnnouncements = useCallback(async () => {
    const response = await fetch('/api/admin/announcements');
    if (!response.ok) throw new Error('Failed to fetch announcements');
    const data = await response.json();
    return data.announcements || [];
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<Announcement[]>(
    'admin-announcements', fetchAnnouncements,
  );

  const announcements = data || [];

  // ─── Filtering ────────────────────────────────────────────────

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'published' && a.isPublished) ||
      (filterStatus === 'draft' && !a.isPublished);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: announcements.length,
    published: announcements.filter((a) => a.isPublished).length,
    draft: announcements.filter((a) => !a.isPublished).length,
  };

  // ─── Template Handling ────────────────────────────────────────

  const selectTemplate = (template: AnnouncementTemplate) => {
    setSelectedTemplate(template);
    const vars: Record<string, string> = {};
    template.variables.forEach((v) => { vars[v.key] = ''; });
    setTemplateVars(vars);
    setFormData((prev) => ({ ...prev, category: template.type }));
    setShowTemplates(false);
  };

  const applyTemplate = () => {
    if (!selectedTemplate) return;
    const title = fillTemplate(selectedTemplate.title[previewLang], templateVars);
    const content = fillTemplate(selectedTemplate.content[previewLang], templateVars);
    setFormData((prev) => ({ ...prev, title, content, category: selectedTemplate.type }));
  };

  // Auto-apply template when vars change
  useEffect(() => {
    if (selectedTemplate) applyTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateVars, previewLang]);

  // ─── CRUD Handlers ────────────────────────────────────────────

  const handleCreate = async () => {
    if (!formData.title || !formData.category || !formData.content) return;
    setSubmitting(true);
    try {
      // Generate translations if using a template
      let translations: Record<string, { title: string; content: string }> | undefined;
      if (selectedTemplate) {
        translations = generateTranslations(selectedTemplate, templateVars);
      }

      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          translations,
        }),
      });
      if (!response.ok) throw new Error('Failed to create announcement');
      const result = await response.json();

      // Auto-send email if publishing and sendEmail is checked
      if (formData.isPublished && formData.sendEmail && result.announcement?.id) {
        startBroadcast(result.announcement.id);
      }

      setIsCreating(false);
      resetForm();
      refresh();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setSelectedTemplate(null);
    setFormData({
      title: announcement.title,
      category: announcement.category || 'news',
      content: announcement.content,
      isPublished: announcement.isPublished,
      sendEmail: false,
    });
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.title || !formData.category || !formData.content) return;
    setSubmitting(true);
    try {
      let translations: Record<string, { title: string; content: string }> | undefined;
      if (selectedTemplate) {
        translations = generateTranslations(selectedTemplate, templateVars);
      }

      const response = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId, title: formData.title, type: formData.category,
          content: formData.content, isPublished: formData.isPublished, translations,
        }),
      });
      if (!response.ok) throw new Error('Failed to update announcement');
      setEditingId(null);
      resetForm();
      refresh();
    } catch (error) {
      console.error('Error updating announcement:', error);
      alert('Failed to update announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const response = await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      refresh();
    } catch { alert('Failed to delete announcement'); }
  };

  const handlePublish = async (id: number, sendEmailToo: boolean = false) => {
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'publish' }),
      });
      if (!response.ok) throw new Error('Failed to publish');
      refresh();
      if (sendEmailToo) startBroadcast(id);
    } catch { alert('Failed to publish announcement'); }
  };

  const handleUnpublish = async (id: number) => {
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'unpublish' }),
      });
      if (!response.ok) throw new Error('Failed to unpublish');
      refresh();
    } catch { alert('Failed to unpublish announcement'); }
  };

  const resetForm = () => {
    setFormData({ title: '', category: 'news', content: '', isPublished: false, sendEmail: true });
    setSelectedTemplate(null);
    setTemplateVars({});
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  // ─── Broadcast ────────────────────────────────────────────────

  const startBroadcast = async (announcementId: number) => {
    setBroadcastAnnouncementId(announcementId);
    setBroadcastModal(true);
    setBroadcastProgress(null);
    setBroadcastLog([]);

    try {
      const response = await fetch('/api/admin/announcements/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start broadcast');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === 'start') {
                setBroadcastProgress({ type: 'start', sent: 0, failed: 0, total: event.total });
              } else if (event.type === 'progress') {
                setBroadcastProgress(event);
                setBroadcastLog((prev) => [...prev, {
                  email: event.lastEmail, user: event.lastUser,
                  lang: event.lastLang, status: event.status,
                }]);
              } else if (event.type === 'complete') {
                setBroadcastProgress(event);
              }
            } catch {}
          }
        }
      }
    } catch (error) {
      console.error('Broadcast error:', error);
      setBroadcastProgress((prev) => prev ? { ...prev, type: 'complete' } : { type: 'complete', sent: 0, failed: 0, total: 0 });
    }
  };

  // Auto-scroll broadcast log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [broadcastLog]);

  // ─── Helpers ──────────────────────────────────────────────────

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const langFlags: Record<string, string> = { en: '\ud83c\uddfa\ud83c\uddf8', fr: '\ud83c\uddeb\ud83c\uddf7', ht: '\ud83c\udded\ud83c\uddf9', es: '\ud83c\udde9\ud83c\uddf4' };

  // ─── Loading State ────────────────────────────────────────────

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

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="mt-2 text-sm text-gray-600">Create and manage news announcements for customers</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => { setIsCreating(true); setShowTemplates(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="h-5 w-5" /> New Announcement
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Megaphone, color: 'text-gray-400' },
          { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-green-500', valueColor: 'text-green-600' },
          { label: 'Drafts', value: stats.draft, icon: Clock, color: 'text-orange-500', valueColor: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="theme-card rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.valueColor || 'text-gray-900'}`}>{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search announcements..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
        </div>
        <div className="flex items-center gap-2">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">All Categories</option>
            <option value="news">News</option>
            <option value="alert">Alert</option>
            <option value="promo">Promo</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* ─── Create/Edit Form ─────────────────────────────────── */}
      {(isCreating || editingId !== null) && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="theme-card rounded-2xl p-6 shadow-sm border-2 border-primary-200">

          {/* Template Picker */}
          {isCreating && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-500" />
                  {showTemplates ? 'Choose a Template' : 'Create New Announcement'}
                </h3>
                <button onClick={() => setShowTemplates(!showTemplates)}
                  className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {showTemplates ? 'Skip, write manually' : 'Use a template'}
                </button>
              </div>

              {showTemplates && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {ANNOUNCEMENT_TEMPLATES.map((tmpl) => (
                    <button key={tmpl.id} onClick={() => selectTemplate(tmpl)}
                      className={`p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                        selectedTemplate?.id === tmpl.id
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : `${templateColors[tmpl.color]} hover:shadow-sm`
                      }`}>
                      <span className="text-2xl mb-2 block">{tmpl.icon}</span>
                      <span className="font-semibold text-sm block">{tmpl.name.fr}</span>
                      <span className="text-xs opacity-70 block mt-1">{tmpl.name.en}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Template Variables */}
              {selectedTemplate && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      {selectedTemplate.icon} {selectedTemplate.name.fr}
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        {selectedTemplate.variables.length} variables
                      </span>
                    </h4>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4 text-gray-400" />
                      {['fr', 'en', 'ht', 'es'].map((lang) => (
                        <button key={lang} onClick={() => setPreviewLang(lang)}
                          className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                            previewLang === lang ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}>
                          {langFlags[lang]} {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTemplate.variables.map((v) => (
                      <div key={v.key}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {v.label[previewLang] || v.label.en}
                        </label>
                        <input type={v.type === 'number' ? 'number' : 'text'}
                          value={templateVars[v.key] || ''} placeholder={v.placeholder}
                          onChange={(e) => setTemplateVars((prev) => ({ ...prev, [v.key]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Fields */}
          {(!showTemplates || selectedTemplate) && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="news">News</option>
                  <option value="alert">Alert</option>
                  <option value="promo">Promotion</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter announcement content..." rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm" />
              </div>

              {/* Publish + Email Toggles */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg flex-1">
                  <input type="checkbox" id="publish" checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <label htmlFor="publish" className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Publish immediately
                  </label>
                </div>
                {formData.isPublished && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg flex-1 border border-blue-200">
                    <input type="checkbox" id="sendEmail" checked={formData.sendEmail}
                      onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                      className="rounded border-blue-300 text-blue-600 focus:ring-blue-500" />
                    <label htmlFor="sendEmail" className="text-sm font-medium text-blue-900 flex items-center gap-2">
                      <Send className="h-4 w-4" /> Send email to all users
                    </label>
                  </div>
                )}
              </div>

              {selectedTemplate && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <strong>Translations auto-generated</strong> for EN, FR, HT, ES
                    {formData.sendEmail && ' - Emails will be sent in each user\'s preferred language'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {(!showTemplates || selectedTemplate) && (
            <div className="flex items-center gap-2">
              <button onClick={isCreating ? handleCreate : handleUpdate} disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                <Save className="h-4 w-4" />
                {submitting ? 'Saving...' : isCreating ? 'Create' : 'Save Changes'}
              </button>
              <button onClick={handleCancel}
                className="inline-flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                <X className="h-4 w-4" /> Cancel
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ─── Announcements List ───────────────────────────────── */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement, index) => {
          const CatIcon = categoryIcons[announcement.category] || Megaphone;
          return (
            <motion.div key={announcement.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="theme-card rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CatIcon className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-900">{announcement.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[announcement.category] || 'bg-gray-100 text-gray-800'}`}>
                      {(announcement.category || 'news').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-line">{announcement.content}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {announcement.isPublished ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      <CheckCircle className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                      <Clock className="h-3 w-3" /> Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {announcement.isPublished && (announcement.publishedAt || announcement.publishDate)
                    ? `Published ${formatDate((announcement.publishedAt || announcement.publishDate)!)}`
                    : `Created ${formatDate(announcement.createdAt!)}`}
                </div>
                {announcement.translations && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                    <Globe className="h-3 w-3" /> 4 languages
                  </span>
                )}
                {announcement.emailSentAt && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                    <Mail className="h-3 w-3" /> Sent to {announcement.emailSentCount} users
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {announcement.isPublished ? (
                  <button onClick={() => handleUnpublish(announcement.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <EyeOff className="h-4 w-4" /> Unpublish
                  </button>
                ) : (
                  <button onClick={() => handlePublish(announcement.id, true)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors text-sm">
                    <Eye className="h-4 w-4" /> Publish & Send Email
                  </button>
                )}
                {announcement.isPublished && !announcement.emailSentAt && (
                  <button onClick={() => startBroadcast(announcement.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <Send className="h-4 w-4" /> Send Email
                  </button>
                )}
                <button onClick={() => handleEdit(announcement)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors text-sm">
                  <Edit className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => handleDelete(announcement.id)}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12 theme-card rounded-2xl border border-gray-100">
          <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters' : 'Get started by creating your first announcement'}
          </p>
          {!searchQuery && filterCategory === 'all' && filterStatus === 'all' && (
            <button onClick={() => { setIsCreating(true); setShowTemplates(true); }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="h-5 w-5" /> Create First Announcement
            </button>
          )}
        </div>
      )}

      {/* ─── Broadcast Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {broadcastModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="theme-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary-600" />
                    Email Broadcast
                  </h2>
                  {broadcastProgress?.type === 'complete' && (
                    <button onClick={() => { setBroadcastModal(false); refresh(); }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <X className="h-5 w-5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="p-6">
                {broadcastProgress ? (
                  <>
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {broadcastProgress.type === 'complete' ? 'Complete!' : 'Sending emails...'}
                        </span>
                        <span className="text-sm font-bold text-primary-600">
                          {broadcastProgress.sent + broadcastProgress.failed} / {broadcastProgress.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${((broadcastProgress.sent + broadcastProgress.failed) / broadcastProgress.total) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Check className="h-5 w-5 text-green-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-green-700">{broadcastProgress.sent}</p>
                        <p className="text-xs text-green-600">Sent</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-red-700">{broadcastProgress.failed}</p>
                        <p className="text-xs text-red-600">Failed</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-gray-700">{broadcastProgress.total}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                    <span className="ml-3 text-gray-600">Preparing broadcast...</span>
                  </div>
                )}
              </div>

              {/* Log */}
              <div className="flex-1 overflow-y-auto border-t border-gray-100 max-h-[250px]">
                <div className="p-4 space-y-1">
                  {broadcastLog.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-md hover:bg-gray-50">
                      {entry.status === 'sent'
                        ? <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        : <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                      <span className="text-gray-500 w-6">{langFlags[entry.lang]}</span>
                      <span className="font-medium text-gray-700 truncate">{entry.user}</span>
                      <span className="text-gray-400 truncate ml-auto">{entry.email}</span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>

              {/* Footer */}
              {broadcastProgress?.type === 'complete' && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button onClick={() => { setBroadcastModal(false); refresh(); }}
                    className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Done - Close
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
