'use client';

import { useState, useCallback, useMemo } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
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
  Building2,
  Truck,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RefreshCw,
  Weight,
  Hash,
  Globe,
  Star,
  Gift,
  Crown,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  ExternalLink,
  Layers,
  Search,
  ArrowRight,
  Copy,
  Check,
  List,
  Table2,
  LayoutGrid,
  ChevronRight,
  Sparkles,
  Shield,
  ReceiptText,
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
  whatsappPhone?: string | null;
  city?: string | null;
  warehouseId?: number | null;
  warehouseName?: string | null;
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
  customsFees?: string;
  specialItemId?: number | null;
  currency: string;
  status: string;
  currentLocation: string | null;
  estimatedDelivery: string | null;
  actualDelivery: string | null;
  deliveryBundleId: number | null;
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

interface LoyaltyData {
  creditBalance: number;
  totalCreditsEarned: number;
  totalCreditsRedeemed: number;
  pointsBalance: number;
  totalPointsEarned: number;
  totalPointsUsed: number;
  transactionCount: number;
  recentTransactions: {
    id: number;
    amount: number;
    points: number;
    type: string;
    description: string | null;
    createdAt: string;
  }[];
}

interface Stats {
  packageCount: number;
  totalSpent: number;
}

// ── Status config ──────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; gradient: string }> = {
  pending: { label: 'En attente', color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200', gradient: 'from-yellow-400 to-yellow-500' },
  received: { label: 'Recu', color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200', gradient: 'from-blue-400 to-blue-500' },
  'in-transit': { label: 'En transit', color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-200', gradient: 'from-purple-400 to-purple-500' },
  customs: { label: 'Douane', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200', gradient: 'from-orange-400 to-orange-500' },
  available: { label: 'Disponible', color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', gradient: 'from-green-400 to-green-500' },
  delivered: { label: 'Livre', color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', gradient: 'from-emerald-400 to-emerald-500' },
  rejected: { label: 'Rejete', color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', gradient: 'from-red-400 to-red-500' },
};

const ALL_STATUSES = ['pending', 'received', 'in-transit', 'customs', 'available', 'delivered'];

const NEXT_STATUS: Record<string, string> = {
  pending: 'received',
  received: 'in-transit',
  'in-transit': 'available',
  available: 'delivered',
};

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

// ── VIP Tier ───────────────────────────────────────────────────────────
const getVipTier = (totalSpent: number, packageCount: number) => {
  if (totalSpent >= 500 || packageCount >= 20)
    return { tier: 'gold', label: 'Gold', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
  if (totalSpent >= 200 || packageCount >= 10)
    return { tier: 'silver', label: 'Silver', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300' };
  if (totalSpent >= 50 || packageCount >= 5)
    return { tier: 'bronze', label: 'Bronze', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' };
  return null;
};

// ── Page ───────────────────────────────────────────────────────────────
interface UserDetailData {
  user: UserProfile;
  packages: PackageData[];
  notifications: NotificationData[];
  stats: Stats;
  loyalty: LoyaltyData;
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
  const [activeTab, setActiveTab] = useState<'packages' | 'loyalty' | 'notifications'>('packages');
  const [cancelBundleId, setCancelBundleId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showBundleDeliverModal, setShowBundleDeliverModal] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [bundleRecipient, setBundleRecipient] = useState('');
  const [bundleNotes, setBundleNotes] = useState('');

  // New states
  const [viewMode, setViewMode] = useState<'list' | 'table' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'weight' | 'tracking'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);
  const [showBulkStatusDropdown, setShowBulkStatusDropdown] = useState(false);

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
  const loyalty = data?.loyalty || {
    creditBalance: 0, totalCreditsEarned: 0, totalCreditsRedeemed: 0,
    pointsBalance: 0, totalPointsEarned: 0, totalPointsUsed: 0,
    transactionCount: 0, recentTransactions: [],
  };

  // ── Financial Summary ─────────────────────────────────────────────
  const financials = useMemo(() => {
    const totalRevenue = userPackages.reduce((s, p) => s + (parseFloat(p.totalCost) || 0), 0);
    const totalService = userPackages.reduce((s, p) => s + (parseFloat(p.serviceFee) || 0), 0);
    const totalWeightCost = userPackages.reduce((s, p) => s + (parseFloat(p.weightCost) || 0), 0);
    const totalCustoms = userPackages.reduce((s, p) => s + (parseFloat(p.customsFees || '0') || 0), 0);
    const totalSpecial = Math.max(0, totalRevenue - totalService - totalWeightCost - totalCustoms);
    return { totalRevenue, totalService, totalWeightCost, totalCustoms, totalSpecial };
  }, [userPackages]);

  // ── Processed packages (filter + search + sort) ───────────────────
  const processedPackages = useMemo(() => {
    let result = [...userPackages];
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.trackingNumber.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.externalTrackingNumber?.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'date': return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'cost': return dir * (parseFloat(a.totalCost) - parseFloat(b.totalCost));
        case 'weight': return dir * (parseFloat(a.weight) - parseFloat(b.weight));
        case 'tracking': return dir * a.trackingNumber.localeCompare(b.trackingNumber);
        default: return 0;
      }
    });
    return result;
  }, [userPackages, statusFilter, searchQuery, sortBy, sortDir]);

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

      toast.success('Colis mis a jour', 'Le colis a ete mis a jour avec succes');
      setEditingPackage(null);
      setEditForm({ status: '', currentLocation: '', weight: '' });
      refresh();
    } catch {
      toast.error('Erreur', 'Echec de la mise a jour du colis');
    }
  };

  const handleDeletePackage = async (packageId: number, trackingNumber: string) => {
    const confirmed = await toast.confirm({
      title: 'Supprimer le colis',
      description: `Etes-vous sur de vouloir supprimer le colis ${trackingNumber} ? Cette action est irreversible.`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/packages?id=${packageId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Supprime', `Le colis ${trackingNumber} a ete supprime`);
      refresh();
    } catch {
      toast.error('Erreur', 'Echec de la suppression du colis');
    }
  };

  const handleQuickStatus = async (pkg: PackageData) => {
    const next = NEXT_STATUS[pkg.status];
    if (!next) return;
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pkg.id, status: next }),
      });
      if (!res.ok) throw new Error('Failed');
      const nextLabel = STATUS_CONFIG[next]?.label || next;
      toast.success('Statut mis a jour', `${pkg.trackingNumber} → ${nextLabel}`);
      refresh();
    } catch {
      toast.error('Erreur', 'Echec du changement de statut');
    }
  };

  const handleCopyTracking = async (tracking: string) => {
    try {
      await navigator.clipboard.writeText(tracking);
      setCopiedTracking(tracking);
      setTimeout(() => setCopiedTracking(null), 2000);
    } catch {
      toast.error('Erreur', 'Impossible de copier');
    }
  };

  // ── Bulk Actions ──────────────────────────────────────────────────
  const handleBulkStatusChange = async (newStatus: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map(pkgId =>
        fetch('/api/admin/packages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: pkgId, status: newStatus }),
        })
      ));
      const label = STATUS_CONFIG[newStatus]?.label || newStatus;
      toast.success('Mise a jour groupee', `${ids.length} colis → ${label}`);
      setSelectedIds(new Set());
      setShowBulkStatusDropdown(false);
      refresh();
    } catch {
      toast.error('Erreur', 'Echec de la mise a jour groupee');
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const confirmed = await toast.confirm({
      title: `Supprimer ${ids.length} colis`,
      description: `Etes-vous sur de vouloir supprimer ${ids.length} colis ? Cette action est irreversible.`,
      confirmLabel: 'Supprimer tout',
      cancelLabel: 'Annuler',
      variant: 'danger',
    });
    if (!confirmed) return;
    try {
      await Promise.all(ids.map(pkgId =>
        fetch(`/api/admin/packages?id=${pkgId}`, { method: 'DELETE' })
      ));
      toast.success('Suppression groupee', `${ids.length} colis supprimes`);
      setSelectedIds(new Set());
      refresh();
    } catch {
      toast.error('Erreur', 'Echec de la suppression groupee');
    }
  };

  const toggleSelect = (pkgId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(pkgId)) next.delete(pkgId);
      else next.add(pkgId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === processedPackages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(processedPackages.map(p => p.id)));
    }
  };

  const handleCancelBundle = async () => {
    if (!cancelBundleId) return;
    setIsCancelling(true);
    try {
      const res = await fetch('/api/admin/packages/bundle-deliver', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId: cancelBundleId, reason: cancelReason || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      toast.success('Bundle annule', 'Les colis sont de retour en statut Disponible');
      setCancelBundleId(null);
      setCancelReason('');
      refresh();
    } catch (error: any) {
      toast.error('Erreur', error.message || 'Impossible d\'annuler le bundle');
    } finally {
      setIsCancelling(false);
    }
  };

  // ── Bundle deliver ───────────────────────────────────────────────
  const availablePackages = userPackages.filter(p => p.status === 'available');
  const hasBundleOpportunity = availablePackages.length >= 2;

  const bundleSavings = hasBundleOpportunity
    ? availablePackages.slice(1).reduce((sum, p) => sum + (parseFloat(p.serviceFee || '0') || 0), 0)
    : 0;

  const bundleTotalWeight = availablePackages.reduce(
    (sum, p) => sum + parseFloat(p.weight || '0'), 0
  );

  const bundleNormalTotal = availablePackages.reduce(
    (sum, p) => sum + parseFloat(p.totalCost || '0'), 0
  );

  const handleBundleDeliver = async () => {
    if (!hasBundleOpportunity) return;
    setIsDelivering(true);
    try {
      const res = await fetch('/api/admin/packages/bundle-deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageIds: availablePackages.map(p => p.id),
          proofData: {
            recipientName: bundleRecipient || undefined,
            notes: bundleNotes || undefined,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }
      const result = await res.json();
      toast.success(
        'Bundle livre !',
        `${availablePackages.length} colis livres en bundle. Economies: $${result.savings}`
      );
      setShowBundleDeliverModal(false);
      setBundleRecipient('');
      setBundleNotes('');
      refresh();
    } catch (error: any) {
      toast.error('Erreur', error.message || 'Impossible de livrer le bundle');
    } finally {
      setIsDelivering(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notifyForm.title || !notifyForm.message) {
      toast.warning('Champs manquants', 'Le titre et le message sont requis');
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
        toast.success('Notification envoyee', `Email envoye a ${user?.email}`);
      } else {
        toast.warning('Notification sauvegardee', `Sauvegardee in-app mais l'email a echoue`);
      }
      setShowNotifyModal(false);
      setNotifyForm({ title: '', message: '', type: 'general' });
      refresh();
    } catch {
      toast.error('Erreur', 'Echec de l\'envoi de la notification');
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

  const vip = getVipTier(stats.totalSpent, stats.packageCount);

  // ── Loading ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" message="Chargement..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Utilisateur introuvable</h2>
        <button onClick={() => router.push('/admin/users')} className="mt-4 text-primary-600 hover:underline">
          Retour aux utilisateurs
        </button>
      </div>
    );
  }

  // ── Revenue % helper ──────────────────────────────────────────────
  const pct = (val: number) => financials.totalRevenue > 0 ? ((val / financials.totalRevenue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-10">
      {/* ── Back button ─────────────────────────────────────────────── */}
      <button
        onClick={() => router.push('/admin/users')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux utilisateurs
      </button>

      {/* ── User Header Card ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="theme-card rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="relative h-24 sm:h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-white/25 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowNotifyModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-white/25 transition-colors"
            >
              <Bell className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Notifier</span>
            </button>
            <button
              onClick={() => router.push(`/admin/packages/new?userId=${user.dbId}`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-white/25 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ajouter colis</span>
            </button>
          </div>
        </div>

        <div className="relative px-4 sm:px-6 pb-5">
          <div className="absolute -top-8 sm:-top-10 left-4 sm:left-6">
            {user.imageUrl ? (
              <img src={user.imageUrl} alt={user.name} className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold ring-4 ring-white shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="pt-10 sm:pt-14">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user.name}</h1>
                  {user.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3" /> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                      <Ban className="h-3 w-3" /> Banni
                    </span>
                  )}
                  {vip && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${vip.bg} ${vip.text} ${vip.border}`}>
                      <Crown className="h-3 w-3" /> {vip.label}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm text-gray-500">
                  <a href={`mailto:${user.email}`} className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                    <Mail className="h-4 w-4" />{user.email}
                  </a>
                  {user.phone && (
                    <a href={`tel:${user.phone}`} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                      <Phone className="h-4 w-4 text-blue-500" />{user.phone}
                    </a>
                  )}
                  {user.whatsappPhone && (
                    <a
                      href={`https://wa.me/${user.whatsappPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-green-600 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 text-green-500" />WhatsApp
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-400">
                  {user.city && (
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{user.city}</span>
                  )}
                  {user.warehouseName && (
                    <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{user.warehouseName}</span>
                  )}
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Inscrit {user.joinedAt}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {user.lastSignInAt ? `Vu ${new Date(user.lastSignInAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Jamais connecte'}
                  </span>
                  <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{user.preferredLanguage.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="bg-primary-50 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                  <p className="text-xl sm:text-2xl font-bold text-primary-700">{stats.packageCount}</p>
                  <p className="text-[10px] font-medium text-primary-400 uppercase tracking-wider">Colis</p>
                </div>
                <div className="bg-green-50 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                  <p className="text-xl sm:text-2xl font-bold text-green-700">${stats.totalSpent.toFixed(2)}</p>
                  <p className="text-[10px] font-medium text-green-400 uppercase tracking-wider">Depense</p>
                </div>
                <div className="bg-yellow-50 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-700">{loyalty.pointsBalance.toLocaleString()}</p>
                  <p className="text-[10px] font-medium text-yellow-500 uppercase tracking-wider">Points</p>
                </div>
                <div className="hidden sm:block bg-purple-50 rounded-xl px-4 py-2.5 text-center min-w-[80px]">
                  <p className="text-xl sm:text-2xl font-bold text-purple-700">${loyalty.creditBalance.toFixed(2)}</p>
                  <p className="text-[10px] font-medium text-purple-400 uppercase tracking-wider">Credits</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Financial Summary ────────────────────────────────────────── */}
      {userPackages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Revenue Total', value: financials.totalRevenue, icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50', barColor: 'bg-emerald-500' },
              { label: 'Frais Service', value: financials.totalService, icon: ReceiptText, color: 'text-blue-700', bg: 'bg-blue-50', barColor: 'bg-blue-500' },
              { label: 'Frais Poids', value: financials.totalWeightCost, icon: Weight, color: 'text-orange-700', bg: 'bg-orange-50', barColor: 'bg-orange-500' },
              { label: 'Articles Speciaux', value: financials.totalSpecial, icon: Sparkles, color: 'text-violet-700', bg: 'bg-violet-50', barColor: 'bg-violet-500' },
              { label: 'Frais Douane', value: financials.totalCustoms, icon: Shield, color: 'text-amber-700', bg: 'bg-amber-50', barColor: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="theme-card rounded-xl border border-gray-100 p-3.5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${item.bg}`}>
                    <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{item.label}</span>
                </div>
                <p className={`text-lg font-bold ${item.color}`}>${item.value.toFixed(2)}</p>
                {i > 0 && (
                  <p className="text-[10px] text-gray-400 mt-0.5">{pct(item.value)}% du total</p>
                )}
              </div>
            ))}
          </div>

          {/* Revenue bar */}
          {financials.totalRevenue > 0 && (
            <div className="mt-3 theme-card rounded-xl border border-gray-100 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Decomposition du revenue</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex bg-gray-100">
                {[
                  { value: financials.totalService, color: 'bg-blue-500' },
                  { value: financials.totalWeightCost, color: 'bg-orange-500' },
                  { value: financials.totalSpecial, color: 'bg-violet-500' },
                  { value: financials.totalCustoms, color: 'bg-amber-500' },
                ].filter(s => s.value > 0).map((seg, i) => (
                  <div
                    key={i}
                    className={`${seg.color} transition-all duration-500`}
                    style={{ width: `${(seg.value / financials.totalRevenue) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {[
                  { label: 'Service', color: 'bg-blue-500', value: financials.totalService },
                  { label: 'Poids', color: 'bg-orange-500', value: financials.totalWeightCost },
                  { label: 'Special', color: 'bg-violet-500', value: financials.totalSpecial },
                  { label: 'Douane', color: 'bg-amber-500', value: financials.totalCustoms },
                ].filter(l => l.value > 0).map((l, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                    <span className="text-[10px] text-gray-500">{l.label} {pct(l.value)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'packages' as const, label: 'Colis', count: userPackages.length, icon: PackageIcon },
          { key: 'loyalty' as const, label: 'Fidelite', count: loyalty.transactionCount, icon: Gift },
          { key: 'notifications' as const, label: 'Notifications', count: userNotifications.length, icon: Bell },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                activeTab === tab.key ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Packages ─────────────────────────────────────────────── */}
      {activeTab === 'packages' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* ── Toolbar ───────────────────────────────────────────────── */}
          <div className="space-y-3 mb-4">
            {/* Row 1: Search + Sort + View Modes */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher tracking, description..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded">
                    <X className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="date">Date</option>
                  <option value="cost">Cout</option>
                  <option value="weight">Poids</option>
                  <option value="tracking">Tracking</option>
                </select>
                <button
                  onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  title={sortDir === 'asc' ? 'Croissant' : 'Decroissant'}
                >
                  {sortDir === 'asc' ? <ArrowUpRight className="h-4 w-4 text-gray-500" /> : <ArrowDownRight className="h-4 w-4 text-gray-500" />}
                </button>
              </div>

              {/* View Modes */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                {[
                  { mode: 'list' as const, icon: List, label: 'Liste' },
                  { mode: 'table' as const, icon: Table2, label: 'Tableau' },
                  { mode: 'kanban' as const, icon: LayoutGrid, label: 'Kanban' },
                ].map((v) => (
                  <button
                    key={v.mode}
                    onClick={() => setViewMode(v.mode)}
                    title={v.label}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === v.mode
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <v.icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Status chips + Bundle + Select All */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Select All checkbox */}
              {processedPackages.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    selectedIds.size === processedPackages.length && processedPackages.length > 0
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {selectedIds.size === processedPackages.length && processedPackages.length > 0 ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <div className="h-3.5 w-3.5 border border-gray-300 rounded" />
                  )}
                  Tout
                </button>
              )}

              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Tous ({userPackages.length})
              </button>
              {ALL_STATUSES.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const cnt = userPackages.filter((p) => p.status === s).length;
                const rev = userPackages.filter(p => p.status === s).reduce((sum, p) => sum + (parseFloat(p.totalCost) || 0), 0);
                if (cnt === 0) return null;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {cfg?.label || s} ({cnt})
                    <span className="ml-1 opacity-60">${rev.toFixed(0)}</span>
                  </button>
                );
              })}

              {hasBundleOpportunity && (
                <button
                  onClick={() => setShowBundleDeliverModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg ml-auto"
                >
                  <Layers className="h-4 w-4" />
                  Livrer Bundle ({availablePackages.length})
                  <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
                    -{bundleSavings.toFixed(2)}$
                  </span>
                </button>
              )}
            </div>
          </div>

          {processedPackages.length === 0 ? (
            <div className="theme-card rounded-2xl border border-gray-100 p-12 text-center">
              <PackageIcon className="h-14 w-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucun colis</p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery ? 'Aucun resultat pour cette recherche' : statusFilter !== 'all' ? 'Essayez de retirer le filtre' : 'Cet utilisateur n\'a pas encore de colis'}
              </p>
              <button
                onClick={() => router.push(`/admin/packages/new?userId=${user.dbId}`)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Ajouter un colis
              </button>
            </div>
          ) : (
            <>
              {/* ── LIST VIEW ──────────────────────────────────────── */}
              {viewMode === 'list' && (
                <div className="space-y-3">
                  {processedPackages.map((pkg, idx) => {
                    const cfg = STATUS_CONFIG[pkg.status] || { label: pkg.status, color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', gradient: 'from-gray-400 to-gray-500' };
                    const isExpanded = expandedPackage === pkg.id;
                    const isEditing = editingPackage === pkg.id;
                    const isSelected = selectedIds.has(pkg.id);
                    const nextStatus = NEXT_STATUS[pkg.status];

                    return (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className={`theme-card rounded-xl border shadow-sm overflow-hidden transition-all ${
                          isSelected ? 'border-primary-300 ring-2 ring-primary-100' : 'border-gray-100'
                        }`}
                      >
                        {/* Package Header */}
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleSelect(pkg.id)}
                              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300 hover:border-primary-400'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </button>

                            {/* Status dot */}
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 bg-gradient-to-br ${cfg.gradient}`} />

                            {/* Main info */}
                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => setExpandedPackage(isExpanded ? null : pkg.id)}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Tracking - clickable to copy */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCopyTracking(pkg.trackingNumber); }}
                                  className="inline-flex items-center gap-1 font-semibold text-gray-900 text-sm hover:text-primary-600 transition-colors group"
                                >
                                  {pkg.trackingNumber}
                                  {copiedTracking === pkg.trackingNumber ? (
                                    <Check className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-gray-300 group-hover:text-primary-400 transition-colors" />
                                  )}
                                </button>
                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${cfg.bg} ${cfg.color}`}>
                                  {cfg.label}
                                </span>
                                {pkg.deliveryBundleId && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-purple-100 text-purple-700">
                                    <Layers className="h-3 w-3" />
                                    Bundle #{pkg.deliveryBundleId}
                                  </span>
                                )}
                                {pkg.priority !== 'normal' && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-orange-100 text-orange-700">
                                    {pkg.priority}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <p className="text-xs text-gray-500 truncate">{pkg.description}</p>
                                <span className="text-[10px] text-gray-300 flex-shrink-0">
                                  {new Date(pkg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                            </div>

                            {/* Right side: cost + weight + quick action */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900">${pkg.totalCost}</p>
                                <p className="text-[10px] text-gray-400">{pkg.weight} {pkg.weightUnit}</p>
                              </div>

                              {/* Quick status button */}
                              {nextStatus && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleQuickStatus(pkg); }}
                                  title={`→ ${STATUS_CONFIG[nextStatus]?.label}`}
                                  className={`p-1.5 rounded-lg border transition-all hover:shadow-sm ${STATUS_CONFIG[nextStatus]?.bg} ${STATUS_CONFIG[nextStatus]?.border} ${STATUS_CONFIG[nextStatus]?.color}`}
                                >
                                  <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => setExpandedPackage(isExpanded ? null : pkg.id)}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                              </button>
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
                              <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                                {/* Info Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  <div className="bg-gray-50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5"><Hash className="h-3 w-3" />Tracking</div>
                                    <p className="text-xs font-medium text-gray-900">{pkg.trackingNumber}</p>
                                    {pkg.externalTrackingNumber && (
                                      <p className="text-[10px] text-gray-500 mt-0.5">Ext: {pkg.externalTrackingNumber}</p>
                                    )}
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5"><Weight className="h-3 w-3" />Poids</div>
                                    <p className="text-xs font-medium text-gray-900">{pkg.weight} {pkg.weightUnit}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5"><MapPin className="h-3 w-3" />Emplacement</div>
                                    <p className="text-xs font-medium text-gray-900">{pkg.currentLocation || 'N/A'}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-0.5"><DollarSign className="h-3 w-3" />Breakdown</div>
                                    <p className="text-xs font-bold text-primary-700">${pkg.totalCost}</p>
                                    <div className="text-[10px] text-gray-400 space-y-0.5 mt-0.5">
                                      <p>Service: ${pkg.serviceFee}</p>
                                      <p>Poids: ${pkg.weightCost}</p>
                                      {parseFloat(pkg.customsFees || '0') > 0 && <p>Douane: ${pkg.customsFees}</p>}
                                      {pkg.specialItemId && (
                                        <p className="text-violet-500">Special: ${(parseFloat(pkg.totalCost) - parseFloat(pkg.serviceFee) - parseFloat(pkg.weightCost) - parseFloat(pkg.customsFees || '0')).toFixed(2)}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Edit Form */}
                                {isEditing ? (
                                  <div className="bg-primary-50/50 rounded-xl p-4 border border-primary-100">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Modifier le colis</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      <div>
                                        <label className="text-xs font-medium text-gray-500 block mb-1">Statut</label>
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
                                        <label className="text-xs font-medium text-gray-500 block mb-1">Emplacement</label>
                                        <select
                                          value={editForm.currentLocation}
                                          onChange={(e) => setEditForm((f) => ({ ...f, currentLocation: e.target.value }))}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                          <option value="">-- Selectionner --</option>
                                          {LOCATIONS.map((l) => (
                                            <option key={l} value={l}>{l}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500 block mb-1">Poids (lbs)</label>
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
                                        Sauvegarder
                                      </button>
                                      <button
                                        onClick={() => { setEditingPackage(null); setEditForm({ status: '', currentLocation: '', weight: '' }); }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                      >
                                        Annuler
                                      </button>
                                    </div>
                                  </div>
                                ) : null}

                                {/* Timeline */}
                                {pkg.timeline && pkg.timeline.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Historique</h4>
                                    <div className="space-y-2">
                                      {pkg.timeline.map((entry, i) => (
                                        <div key={entry.id} className="flex items-start gap-3">
                                          <div className="relative flex-shrink-0">
                                            <div className={`h-2.5 w-2.5 rounded-full mt-1 ${i === 0 ? 'bg-primary-500 ring-4 ring-primary-100' : 'bg-gray-300'}`} />
                                            {i < pkg.timeline.length - 1 && (
                                              <div className="absolute top-3.5 left-1 w-px h-5 bg-gray-200" />
                                            )}
                                          </div>
                                          <div>
                                            <p className="text-xs font-medium text-gray-900">{entry.status}</p>
                                            <p className="text-[10px] text-gray-500">{entry.location} {entry.description ? `- ${entry.description}` : ''}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">
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
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeletePackage(pkg.id, pkg.trackingNumber); }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Supprimer
                                  </button>
                                  {pkg.status === 'available' && hasBundleOpportunity && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setShowBundleDeliverModal(true); }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                    >
                                      <Layers className="h-3.5 w-3.5" />
                                      Bundle
                                    </button>
                                  )}
                                  {pkg.deliveryBundleId && pkg.status === 'delivered' && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setCancelBundleId(pkg.deliveryBundleId); }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                                    >
                                      <Layers className="h-3.5 w-3.5" />
                                      Annuler Bundle
                                    </button>
                                  )}
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

              {/* ── TABLE VIEW ─────────────────────────────────────── */}
              {viewMode === 'table' && (
                <div className="theme-card rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-3 py-3 text-left">
                            <button
                              onClick={toggleSelectAll}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                selectedIds.size === processedPackages.length && processedPackages.length > 0
                                  ? 'bg-primary-600 border-primary-600' : 'border-gray-300 hover:border-primary-400'
                              }`}
                            >
                              {selectedIds.size === processedPackages.length && processedPackages.length > 0 && <Check className="h-3 w-3 text-white" />}
                            </button>
                          </th>
                          {[
                            { key: 'tracking', label: 'Tracking' },
                            { key: 'description', label: 'Description' },
                            { key: 'status', label: 'Statut' },
                            { key: 'weight', label: 'Poids' },
                            { key: 'service', label: 'Service' },
                            { key: 'weightCost', label: 'Poids$' },
                            { key: 'customs', label: 'Douane' },
                            { key: 'cost', label: 'Total' },
                            { key: 'date', label: 'Date' },
                          ].map((col) => (
                            <th
                              key={col.key}
                              className="px-3 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors whitespace-nowrap"
                              onClick={() => {
                                if (['date', 'cost', 'weight', 'tracking'].includes(col.key)) {
                                  if (sortBy === col.key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
                                  else { setSortBy(col.key as any); setSortDir('desc'); }
                                }
                              }}
                            >
                              <span className="inline-flex items-center gap-1">
                                {col.label}
                                {sortBy === col.key && (
                                  sortDir === 'asc' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />
                                )}
                              </span>
                            </th>
                          ))}
                          <th className="px-3 py-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {processedPackages.map((pkg, idx) => {
                          const cfg = STATUS_CONFIG[pkg.status] || { label: pkg.status, color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', gradient: 'from-gray-400 to-gray-500' };
                          const isSelected = selectedIds.has(pkg.id);
                          const nextStatus = NEXT_STATUS[pkg.status];
                          return (
                            <tr key={pkg.id} className={`transition-colors ${idx % 2 === 0 ? '' : 'bg-gray-50/30'} ${isSelected ? 'bg-primary-50/50' : 'hover:bg-gray-50/50'}`}>
                              <td className="px-3 py-2.5">
                                <button
                                  onClick={() => toggleSelect(pkg.id)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300 hover:border-primary-400'
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3 text-white" />}
                                </button>
                              </td>
                              <td className="px-3 py-2.5">
                                <button
                                  onClick={() => handleCopyTracking(pkg.trackingNumber)}
                                  className="inline-flex items-center gap-1 font-medium text-gray-900 hover:text-primary-600 transition-colors text-xs"
                                >
                                  {pkg.trackingNumber}
                                  {copiedTracking === pkg.trackingNumber ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-gray-300" />}
                                </button>
                              </td>
                              <td className="px-3 py-2.5 max-w-[150px]">
                                <p className="text-xs text-gray-600 truncate">{pkg.description}</p>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full ${cfg.bg} ${cfg.color}`}>
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-xs text-gray-700">{pkg.weight} {pkg.weightUnit}</td>
                              <td className="px-3 py-2.5 text-xs text-gray-700">${pkg.serviceFee}</td>
                              <td className="px-3 py-2.5 text-xs text-gray-700">${pkg.weightCost}</td>
                              <td className="px-3 py-2.5 text-xs text-gray-700">${pkg.customsFees || '0.00'}</td>
                              <td className="px-3 py-2.5 text-xs font-bold text-gray-900">${pkg.totalCost}</td>
                              <td className="px-3 py-2.5 text-[10px] text-gray-400 whitespace-nowrap">
                                {new Date(pkg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1 justify-end">
                                  {nextStatus && (
                                    <button
                                      onClick={() => handleQuickStatus(pkg)}
                                      title={`→ ${STATUS_CONFIG[nextStatus]?.label}`}
                                      className={`p-1 rounded ${STATUS_CONFIG[nextStatus]?.bg} ${STATUS_CONFIG[nextStatus]?.color} transition-colors`}
                                    >
                                      <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => { startEditing(pkg); setExpandedPackage(pkg.id); setViewMode('list'); }}
                                    className="p-1 rounded text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePackage(pkg.id, pkg.trackingNumber)}
                                    className="p-1 rounded text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* Footer totals */}
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5 text-xs text-gray-700">{processedPackages.length} colis</td>
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5 text-xs text-gray-700">{processedPackages.reduce((s, p) => s + parseFloat(p.weight || '0'), 0).toFixed(1)} lbs</td>
                          <td className="px-3 py-2.5 text-xs text-blue-700">${processedPackages.reduce((s, p) => s + parseFloat(p.serviceFee || '0'), 0).toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-xs text-orange-700">${processedPackages.reduce((s, p) => s + parseFloat(p.weightCost || '0'), 0).toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-xs text-amber-700">${processedPackages.reduce((s, p) => s + parseFloat(p.customsFees || '0'), 0).toFixed(2)}</td>
                          <td className="px-3 py-2.5 text-xs font-bold text-gray-900">${processedPackages.reduce((s, p) => s + parseFloat(p.totalCost || '0'), 0).toFixed(2)}</td>
                          <td className="px-3 py-2.5" />
                          <td className="px-3 py-2.5" />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* ── KANBAN VIEW ────────────────────────────────────── */}
              {viewMode === 'kanban' && (
                <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
                  {ALL_STATUSES.map((status) => {
                    const cfg = STATUS_CONFIG[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', gradient: 'from-gray-400 to-gray-500' };
                    const statusPackages = processedPackages.filter(p => p.status === status);
                    const statusRevenue = statusPackages.reduce((s, p) => s + (parseFloat(p.totalCost) || 0), 0);

                    return (
                      <div key={status} className="flex-shrink-0 w-[240px] sm:w-[260px]">
                        {/* Column Header */}
                        <div className={`rounded-t-xl bg-gradient-to-r ${cfg.gradient} px-3 py-2.5`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{cfg.label}</span>
                            <span className="px-2 py-0.5 bg-white/25 rounded-full text-[10px] font-bold text-white">
                              {statusPackages.length}
                            </span>
                          </div>
                          {statusPackages.length > 0 && (
                            <p className="text-[10px] text-white/80 mt-0.5">${statusRevenue.toFixed(2)}</p>
                          )}
                        </div>

                        {/* Column Body */}
                        <div className="bg-gray-50/50 rounded-b-xl border border-t-0 border-gray-200 p-2 min-h-[200px] max-h-[60vh] overflow-y-auto space-y-2">
                          {statusPackages.length === 0 ? (
                            <div className="text-center py-8">
                              <PackageIcon className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                              <p className="text-[10px] text-gray-400">Aucun colis</p>
                            </div>
                          ) : (
                            statusPackages.map((pkg) => {
                              const isSelected = selectedIds.has(pkg.id);
                              const nextStatus = NEXT_STATUS[pkg.status];
                              return (
                                <motion.div
                                  key={pkg.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={`bg-white rounded-lg border p-2.5 cursor-pointer hover:shadow-md transition-all ${
                                    isSelected ? 'border-primary-300 ring-1 ring-primary-100' : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                  onClick={() => { setExpandedPackage(pkg.id); setViewMode('list'); }}
                                >
                                  <div className="flex items-start justify-between gap-1.5">
                                    <div className="min-w-0 flex-1">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleCopyTracking(pkg.trackingNumber); }}
                                        className="text-xs font-bold text-gray-900 hover:text-primary-600 transition-colors truncate block"
                                      >
                                        {pkg.trackingNumber}
                                      </button>
                                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{pkg.description}</p>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleSelect(pkg.id); }}
                                      className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-primary-600 border-primary-600' : 'border-gray-300'
                                      }`}
                                    >
                                      {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-gray-400">{pkg.weight} lbs</span>
                                      <span className="text-xs font-bold text-gray-800">${pkg.totalCost}</span>
                                    </div>
                                    {nextStatus && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleQuickStatus(pkg); }}
                                        title={`→ ${STATUS_CONFIG[nextStatus]?.label}`}
                                        className={`p-1 rounded ${STATUS_CONFIG[nextStatus]?.bg} ${STATUS_CONFIG[nextStatus]?.color} transition-colors`}
                                      >
                                        <ChevronRight className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>

                                  {pkg.priority !== 'normal' && (
                                    <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 text-[9px] font-semibold rounded bg-orange-100 text-orange-700">
                                      {pkg.priority}
                                    </span>
                                  )}
                                </motion.div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* ── Bulk Actions Bar ──────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3 border border-gray-700">
              <span className="text-sm font-medium">{selectedIds.size} selectionne{selectedIds.size > 1 ? 's' : ''}</span>

              <div className="w-px h-6 bg-gray-600" />

              {/* Bulk Status Change */}
              <div className="relative">
                <button
                  onClick={() => setShowBulkStatusDropdown(!showBulkStatusDropdown)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-sm font-medium rounded-lg hover:bg-white/20 transition-colors"
                >
                  Changer statut
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {showBulkStatusDropdown && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[160px]">
                    {ALL_STATUSES.map((s) => {
                      const c = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          onClick={() => handleBulkStatusChange(s)}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${c?.gradient || 'from-gray-400 to-gray-500'}`} />
                          <span className="text-gray-700">{c?.label || s}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bulk Delete */}
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-300 text-sm font-medium rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>

              <div className="w-px h-6 bg-gray-600" />

              {/* Deselect */}
              <button
                onClick={() => { setSelectedIds(new Set()); setShowBulkStatusDropdown(false); }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tab: Loyalty ──────────────────────────────────────────────── */}
      {activeTab === 'loyalty' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="theme-card rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-5 py-3 border-b border-yellow-100">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Points de fidelite
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-700">{loyalty.pointsBalance.toLocaleString()}</p>
                    <p className="text-[10px] font-medium text-yellow-500 uppercase mt-1">Solde</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                      <p className="text-2xl font-bold text-green-700">{loyalty.totalPointsEarned.toLocaleString()}</p>
                    </div>
                    <p className="text-[10px] font-medium text-green-500 uppercase mt-1">Gagnes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                      <p className="text-2xl font-bold text-red-600">{loyalty.totalPointsUsed.toLocaleString()}</p>
                    </div>
                    <p className="text-[10px] font-medium text-red-400 uppercase mt-1">Utilises</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="theme-card rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 py-3 border-b border-purple-100">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-purple-500" />
                  Credits ($)
                </h3>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-700">${loyalty.creditBalance.toFixed(2)}</p>
                    <p className="text-[10px] font-medium text-purple-400 uppercase mt-1">Solde</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                      <p className="text-2xl font-bold text-green-700">${loyalty.totalCreditsEarned.toFixed(2)}</p>
                    </div>
                    <p className="text-[10px] font-medium text-green-500 uppercase mt-1">Gagnes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <ArrowDownRight className="h-3.5 w-3.5 text-orange-500" />
                      <p className="text-2xl font-bold text-orange-600">${loyalty.totalCreditsRedeemed.toFixed(2)}</p>
                    </div>
                    <p className="text-[10px] font-medium text-orange-400 uppercase mt-1">Utilises</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loyalty.recentTransactions.length > 0 ? (
            <div className="theme-card rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  Transactions recentes ({loyalty.transactionCount} total)
                </h3>
              </div>
              <div className="divide-y divide-gray-50">
                {loyalty.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${
                        tx.type === 'shipment' ? 'bg-green-100' :
                        tx.type === 'weight' ? 'bg-yellow-100' :
                        tx.type === 'redemption' ? 'bg-red-100' :
                        tx.type === 'conversion' ? 'bg-purple-100' :
                        tx.type === 'spending' ? 'bg-indigo-100' :
                        'bg-gray-100'
                      }`}>
                        {tx.type === 'shipment' ? <PackageIcon className="h-3.5 w-3.5 text-green-600" /> :
                         tx.type === 'redemption' ? <ArrowDownRight className="h-3.5 w-3.5 text-red-600" /> :
                         tx.type === 'conversion' ? <TrendingUp className="h-3.5 w-3.5 text-purple-600" /> :
                         tx.type === 'spending' ? <Star className="h-3.5 w-3.5 text-indigo-600" /> :
                         <DollarSign className="h-3.5 w-3.5 text-gray-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 capitalize">{tx.type.replace('_', ' ')}</p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {tx.description || new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      {Math.abs(tx.amount) > 0 && (
                        <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                        </p>
                      )}
                      {Math.abs(tx.points) > 0 && (
                        <p className={`text-[10px] font-medium ${tx.points > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                          {tx.points > 0 ? '+' : ''}{tx.points} pts
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="theme-card rounded-xl border border-gray-100 p-12 text-center">
              <Gift className="h-14 w-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucune transaction</p>
              <p className="text-sm text-gray-400 mt-1">Les transactions de fidelite apparaitront ici</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Tab: Notifications ────────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {userNotifications.length > 0 ? (
            <div className="theme-card rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
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
          ) : (
            <div className="theme-card rounded-xl border border-gray-100 p-12 text-center">
              <Bell className="h-14 w-14 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Aucune notification</p>
              <p className="text-sm text-gray-400 mt-1">Les notifications envoyees apparaitront ici</p>
              <button
                onClick={() => setShowNotifyModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Send className="h-4 w-4" />
                Envoyer une notification
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Cancel Bundle Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {cancelBundleId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="theme-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="h-6 w-6" />
                    <div>
                      <h3 className="text-lg font-bold">Annuler le Bundle #{cancelBundleId}</h3>
                      <p className="text-sm text-purple-200">Les colis seront remis en &quot;Disponible&quot;</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setCancelBundleId(null); setCancelReason(''); }}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    Les frais de service originaux seront restaures et les points de fidelite annules.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raison (optionnelle)</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ex: Erreur de livraison, demande client..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => { setCancelBundleId(null); setCancelReason(''); }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCancelBundle}
                    disabled={isCancelling}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 shadow-lg"
                  >
                    {isCancelling ? 'Annulation...' : 'Confirmer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bundle Deliver Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showBundleDeliverModal && hasBundleOpportunity && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="theme-card rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-t-2xl flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/15 rounded-lg">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Livrer {availablePackages.length} colis en Bundle</h3>
                      <p className="text-sm text-purple-200">Livraison groupee pour {user?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowBundleDeliverModal(false); setBundleRecipient(''); setBundleNotes(''); }}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">Economies Bundle</span>
                    </div>
                    <span className="text-xl font-bold text-green-700">-${bundleSavings.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">1 seul frais de service au lieu de {availablePackages.length}</p>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Colis inclus</h4>
                  <div className="space-y-2">
                    {availablePackages.map((pkg, idx) => (
                      <div key={pkg.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-purple-700">{idx + 1}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{pkg.trackingNumber}</p>
                            <p className="text-[10px] text-gray-500 truncate">{pkg.description}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-xs font-bold text-gray-900">{pkg.weight} lbs</p>
                          {idx > 0 ? (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-400 line-through">${pkg.serviceFee}</span>
                              <span className="text-[10px] font-bold text-green-600">OFFERT</span>
                            </div>
                          ) : (
                            <p className="text-[10px] text-gray-500">${pkg.serviceFee}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Recap financier</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Poids total</span>
                    <span className="font-medium text-gray-700">{bundleTotalWeight.toFixed(1)} lbs</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Prix normal</span>
                    <span className="text-gray-400 line-through">${bundleNormalTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Economies</span>
                    <span className="font-bold text-green-600">-${bundleSavings.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="text-sm font-semibold text-gray-700">Prix bundle</span>
                    <span className="text-lg font-bold text-purple-700">${(bundleNormalTotal - bundleSavings).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire (optionnel)</label>
                    <input
                      type="text"
                      value={bundleRecipient}
                      onChange={(e) => setBundleRecipient(e.target.value)}
                      placeholder={user?.name || 'Nom du destinataire...'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                    <textarea
                      value={bundleNotes}
                      onChange={(e) => setBundleNotes(e.target.value)}
                      placeholder="Notes de livraison..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => { setShowBundleDeliverModal(false); setBundleRecipient(''); setBundleNotes(''); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleBundleDeliver}
                  disabled={isDelivering}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                >
                  {isDelivering ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" />Livraison...</>
                  ) : (
                    <><Truck className="h-4 w-4" />Confirmer la livraison</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Notify Modal ──────────────────────────────────────────────── */}
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
                    <h3 className="font-semibold text-gray-900">Envoyer une notification</h3>
                    <p className="text-xs text-gray-500">a {user?.name}</p>
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
                    <option value="package_update">Mise a jour colis</option>
                    <option value="delivery">Livraison</option>
                    <option value="payment">Paiement</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Titre</label>
                  <input
                    type="text"
                    value={notifyForm.title}
                    onChange={(e) => setNotifyForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Titre de la notification..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Message</label>
                  <textarea
                    value={notifyForm.message}
                    onChange={(e) => setNotifyForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Ecrivez le message..."
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
                  Annuler
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={sending || !notifyForm.title || !notifyForm.message}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Envoyer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
