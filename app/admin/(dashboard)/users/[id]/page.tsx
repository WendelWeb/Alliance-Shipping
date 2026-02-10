'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Package as PackageIcon,
  DollarSign,
  CheckCircle,
  Ban,
  Bell,
  Send,
  X,
  MapPin,
  Truck,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
  Eye,
  Weight,
  Hash,
  FileText,
  Globe,
} from 'lucide-react';
import { useToast } from '@/components/admin/Toast';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';

// ── Types ──────────────────────────────────────────────────────────────
interface UserProfile {
  id: string;
  dbId: number | null;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  imageUrl: string | null;
  status: string;
  createdAt: number;
  lastSignInAt: number | null;
  joinedAt: string;
  preferredLanguage: string;
}

interface PackageData {
  id: number;
  trackingNumber: string;
  externalTrackingNumber: string | null;
  description: string;
  weight: string;
  weightUnit: string;
  category: string | null;
  serviceFee: string;
  weightCost: string;
  totalCost: string;
  currency: string;
  status: string;
  currentLocation: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  priority: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEntry[];
}

interface TimelineEntry {
  id: number;
  status: string;
  location: string | null;
  description: string | null;
  timestamp: string;
}

interface NotificationData {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Stats {
  packageCount: number;
  totalSpent: number;
}

// ── Status config ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  received: { label: 'Received', color: 'text-blue-700', bg: 'bg-blue-100' },
  'in-transit': { label: 'In Transit', color: 'text-purple-700', bg: 'bg-purple-100' },
  customs: { label: 'Customs', color: 'text-orange-700', bg: 'bg-orange-100' },
  available: { label: 'Available', color: 'text-green-700', bg: 'bg-green-100' },
  delivered: { label: 'Delivered', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100' },
};

const ALL_STATUSES = ['pending', 'received', 'in-transit', 'customs', 'available', 'delivered'];

const LOCATIONS = [
  'Miami Warehouse',
  'In Transit - Miami to Haiti',
  'Haiti Customs',
  'Port-au-Prince Office',
  'Cap-Haitien Office',
  'Port-de-Paix Office',
  'Out for Delivery',
  'Delivered',
];

// ── Page ───────────────────────────────────────────────────────────────
interface UserDetailData {
  user: UserProfile;
  packages: PackageData[];
  notifications: NotificationData[];
  stats: Stats;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  // UI state
  const [expandedPackage, setExpandedPackage] = useState<number | null>(null);
  const [editingPackage, setEditingPackage] = useState<number | null>(null);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sending, setSending] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({ status: '', currentLocation: '', weight: '' });

  // Notify form state
  const [notifyForm, setNotifyForm] = useState({ title: '', message: '', type: 'general' });

  // ── Fetch ──────────────────────────────────────────────────────────
  const fetchUserData = useCallback(async () => {
    const res = await fetch(`/api/admin/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json() as Promise<UserDetailData>;
  }, [id]);

  const { data, loading, refreshing, refresh } = useCachedFetch<UserDetailData>(
    `admin-user-${id}`,
    fetchUserData,
  );

  const user = data?.user || null;
  const userPackages = data?.packages || [];
  const userNotifications = data?.notifications || [];
  const stats = data?.stats || { packageCount: 0, totalSpent: 0 };

  // ── Handlers ───────────────────────────────────────────────────────
  const handleUpdatePackage = async (packageId: number) => {
    try {
      const updateData: Record<string, string> = { id: packageId.toString() };
      if (editForm.status) updateData.status = editForm.status;
      if (editForm.currentLocation) updateData.currentLocation = editForm.currentLocation;
      if (editForm.weight) updateData.weight = editForm.weight;

      const res = await fetch('/api/admin/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: packageId, ...updateData }),
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Package updated', `Package updated successfully`);
      setEditingPackage(null);
      setEditForm({ status: '', currentLocation: '', weight: '' });
      refresh();
    } catch {
      toast.error('Error', 'Failed to update package');
    }
  };

  const handleDeletePackage = async (packageId: number, trackingNumber: string) => {
    const confirmed = await toast.confirm({
      title: 'Delete Package',
      description: `Are you sure you want to delete package ${trackingNumber}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/packages?id=${packageId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted', `Package ${trackingNumber} has been deleted`);
      refresh();
    } catch {
      toast.error('Error', 'Failed to delete package');
    }
  };

  const handleSendNotification = async () => {
    if (!notifyForm.title || !notifyForm.message) {
      toast.warning('Missing fields', 'Title and message are required');
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`/api/admin/users/${id}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifyForm),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send');
      }
      const result = await res.json();
      if (result.emailSent) {
        toast.success('Notification sent', `Email sent to ${user?.email}`);
      } else {
        toast.warning('Notification saved', `Saved in-app but email failed: ${result.emailError || 'unknown error'}`);
      }
      setShowNotifyModal(false);
      setNotifyForm({ title: '', message: '', type: 'general' });
      refresh();
    } catch {
      toast.error('Error', 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const startEditing = (pkg: PackageData) => {
    setEditingPackage(pkg.id);
    setEditForm({
      status: pkg.status,
      currentLocation: pkg.currentLocation || '',
      weight: pkg.weight,
    });
  };

  // ── Filter ─────────────────────────────────────────────────────────
  const filteredPackages = statusFilter === 'all'
    ? userPackages
    : userPackages.filter((p) => p.status === statusFilter);

  // ── Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Loading user..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
        <button onClick={() => router.push('/admin/users')} className="mt-4 text-primary-600 hover:underline">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ── Back button ─────────────────────────────────────────────── */}
      <button
        onClick={() => router.push('/admin/users')}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </button>

      {/* ── User Header Card ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="relative h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          {/* Actions on header */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium rounded-lg hover:bg-white/25 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowNotifyModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium rounded-lg hover:bg-white/25 transition-colors"
            >
              <Bell className="h-4 w-4" />
              Notify
            </button>
          </div>
        </div>

        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-10 left-6">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.name} className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User info */}
          <div className="pt-14 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                {user.status === 'active' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                    <Ban className="h-3 w-3" /> Banned
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{user.email}</span>
                {user.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" />{user.phone}</span>}
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Joined {user.joinedAt}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{user.lastSignInAt ? `Last seen ${new Date(user.lastSignInAt).toLocaleDateString('fr-FR')}` : 'Never signed in'}</span>
                <span className="flex items-center gap-1.5"><Globe className="h-4 w-4" />{user.preferredLanguage.toUpperCase()}</span>
              </div>
            </div>

            {/* Stats mini */}
            <div className="flex items-center gap-4">
              <div className="bg-primary-50 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-primary-700">{stats.packageCount}</p>
                <p className="text-xs font-medium text-primary-400 uppercase tracking-wider">Packages</p>
              </div>
              <div className="bg-green-50 rounded-xl px-5 py-3 text-center">
                <p className="text-2xl font-bold text-green-700">${stats.totalSpent.toFixed(2)}</p>
                <p className="text-xs font-medium text-green-400 uppercase tracking-wider">Total Spent</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Packages Section ────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Packages ({filteredPackages.length})</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              All
            </button>
            {ALL_STATUSES.map((s) => {
              const cfg = STATUS_CONFIG[s];
              const cnt = userPackages.filter((p) => p.status === s).length;
              if (cnt === 0) return null;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cfg?.label || s} ({cnt})
                </button>
              );
            })}
          </div>
        </div>

        {filteredPackages.length === 0 ? (
          <div className="theme-card rounded-2xl border border-gray-100 p-12 text-center">
            <PackageIcon className="h-14 w-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No packages found</p>
            <p className="text-sm text-gray-400 mt-1">
              {statusFilter !== 'all' ? 'Try removing the filter' : 'This user has no packages yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPackages.map((pkg, idx) => {
              const cfg = STATUS_CONFIG[pkg.status] || { label: pkg.status, color: 'text-gray-700', bg: 'bg-gray-100' };
              const isExpanded = expandedPackage === pkg.id;
              const isEditing = editingPackage === pkg.id;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="theme-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Package Card Header */}
                  <div
                    className="p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpandedPackage(isExpanded ? null : pkg.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="p-2.5 bg-primary-50 rounded-xl flex-shrink-0">
                          <PackageIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900">{pkg.trackingNumber}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            {pkg.priority !== 'normal' && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                                {pkg.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5 truncate">{pkg.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-gray-900">${pkg.totalCost}</p>
                          <p className="text-xs text-gray-400">{pkg.weight} {pkg.weightUnit}</p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                          {/* Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                            <div className="bg-gray-50 rounded-xl p-3">
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Hash className="h-3 w-3" />Tracking</div>
                              <p className="text-sm font-medium text-gray-900">{pkg.trackingNumber}</p>
                              {pkg.externalTrackingNumber && (
                                <p className="text-xs text-gray-500 mt-0.5">Ext: {pkg.externalTrackingNumber}</p>
                              )}
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Weight className="h-3 w-3" />Weight</div>
                              <p className="text-sm font-medium text-gray-900">{pkg.weight} {pkg.weightUnit}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><MapPin className="h-3 w-3" />Location</div>
                              <p className="text-sm font-medium text-gray-900">{pkg.currentLocation || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3">
                              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"><Truck className="h-3 w-3" />Destination</div>
                              <p className="text-sm font-medium text-gray-900">{pkg.currentLocation || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="bg-gray-50 rounded-xl p-4 mb-5">
                            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Pricing</h4>
                            <div className="flex items-center gap-6 text-sm">
                              <div><span className="text-gray-500">Service Fee:</span> <span className="font-semibold">${pkg.serviceFee}</span></div>
                              <div><span className="text-gray-500">Weight Cost:</span> <span className="font-semibold">${pkg.weightCost}</span></div>
                              <div><span className="text-gray-500">Total:</span> <span className="font-bold text-primary-700">${pkg.totalCost}</span></div>
                            </div>
                          </div>

                          {/* Edit Form */}
                          {isEditing ? (
                            <div className="bg-primary-50/50 rounded-xl p-4 mb-5 border border-primary-100">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3">Edit Package</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-500 block mb-1">Status</label>
                                  <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  >
                                    {ALL_STATUSES.map((s) => (
                                      <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 block mb-1">Location</label>
                                  <select
                                    value={editForm.currentLocation}
                                    onChange={(e) => setEditForm((f) => ({ ...f, currentLocation: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  >
                                    <option value="">-- Select --</option>
                                    {LOCATIONS.map((l) => (
                                      <option key={l} value={l}>{l}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-500 block mb-1">Weight (lbs)</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={editForm.weight}
                                    onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <button
                                  onClick={() => handleUpdatePackage(pkg.id)}
                                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                  Save Changes
                                </button>
                                <button
                                  onClick={() => { setEditingPackage(null); setEditForm({ status: '', currentLocation: '', weight: '' }); }}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {/* Timeline */}
                          {pkg.timeline && pkg.timeline.length > 0 && (
                            <div className="mb-5">
                              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Tracking History</h4>
                              <div className="space-y-3">
                                {pkg.timeline.map((entry, i) => (
                                  <div key={entry.id} className="flex items-start gap-3">
                                    <div className="relative flex-shrink-0">
                                      <div className={`h-3 w-3 rounded-full mt-1 ${i === 0 ? 'bg-primary-500 ring-4 ring-primary-100' : 'bg-gray-300'}`} />
                                      {i < pkg.timeline.length - 1 && (
                                        <div className="absolute top-4 left-1.5 w-px h-6 bg-gray-200" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{entry.status}</p>
                                      <p className="text-xs text-gray-500">{entry.location} {entry.description ? `- ${entry.description}` : ''}</p>
                                      <p className="text-xs text-gray-400 mt-0.5">
                                        {new Date(entry.timestamp).toLocaleDateString('fr-FR', {
                                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={(e) => { e.stopPropagation(); startEditing(pkg); }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeletePackage(pkg.id, pkg.trackingNumber); }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ── Notifications History ────────────────────────────────────── */}
      {userNotifications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications Sent ({userNotifications.length})</h2>
          <div className="theme-card rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
            {userNotifications.map((notif) => (
              <div key={notif.id} className="p-4 flex items-start gap-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${notif.isRead ? 'bg-gray-100' : 'bg-primary-50'}`}>
                  <Bell className={`h-4 w-4 ${notif.isRead ? 'text-gray-400' : 'text-primary-500'}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                    {!notif.isRead && <span className="h-2 w-2 rounded-full bg-primary-500" />}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Notify Modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNotifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNotifyModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="theme-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-50 rounded-lg">
                    <Bell className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Send Notification</h3>
                    <p className="text-xs text-gray-500">to {user?.name}</p>
                  </div>
                </div>
                <button onClick={() => setShowNotifyModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Type</label>
                  <select
                    value={notifyForm.type}
                    onChange={(e) => setNotifyForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="general">General</option>
                    <option value="package_update">Package Update</option>
                    <option value="delivery">Delivery</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Title</label>
                  <input
                    type="text"
                    value={notifyForm.title}
                    onChange={(e) => setNotifyForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Notification title..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Message</label>
                  <textarea
                    value={notifyForm.message}
                    onChange={(e) => setNotifyForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Write the notification message..."
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={sending || !notifyForm.title || !notifyForm.message}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
