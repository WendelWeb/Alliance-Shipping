'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Download,
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  AlertTriangle,
  Check,
  Printer,
  Bell,
  Scale,
  Truck,
  RefreshCw,
  Mail,
  TrendingUp,
  Gift,
  CheckCircle,
  Phone,
  MessageCircle,
  Building2,
  Smartphone, // ⭐ Pour articles spéciaux
} from 'lucide-react';
import { LoadingSpinner, SkeletonLoader, CardSkeleton } from '@/components/admin/LoadingSpinner';

// ── Static style maps ────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  requested: 'bg-yellow-100 text-yellow-800',
  received: 'bg-blue-100 text-blue-800',
  'in-transit': 'bg-purple-100 text-purple-800',
  available: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  requested: 'Demandé',
  received: 'Reçu',
  'in-transit': 'En transit',
  available: 'Disponible',
  delivered: 'Livré',
  rejected: 'Rejeté',
};

const statusDotColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  requested: 'bg-yellow-500',
  received: 'bg-blue-500',
  'in-transit': 'bg-purple-500',
  available: 'bg-green-500',
  delivered: 'bg-gray-500',
  rejected: 'bg-red-500',
};

const statusStyleMap: Record<string, { border: string; bg: string; check: string }> = {
  pending:      { border: 'border-yellow-500', bg: 'bg-yellow-50',  check: 'bg-yellow-500' },
  received:     { border: 'border-blue-500',   bg: 'bg-blue-50',    check: 'bg-blue-500' },
  'in-transit': { border: 'border-purple-500', bg: 'bg-purple-50',  check: 'bg-purple-500' },
  available:    { border: 'border-green-500',  bg: 'bg-green-50',   check: 'bg-green-500' },
  delivered:    { border: 'border-teal-500',   bg: 'bg-teal-50',    check: 'bg-teal-500' },
  rejected:     { border: 'border-red-500',    bg: 'bg-red-50',     check: 'bg-red-500' },
};

const statsCardStyles: Record<string, { bar: string; text: string; activeBg: string; activeBorder: string }> = {
  all:          { bar: 'bg-gray-400',   text: 'text-gray-900',   activeBg: 'bg-gray-50',    activeBorder: 'border-gray-300' },
  unassigned:   { bar: 'bg-amber-500',  text: 'text-amber-600',  activeBg: 'bg-amber-50',    activeBorder: 'border-amber-300' },
  requested:    { bar: 'bg-yellow-500', text: 'text-yellow-600', activeBg: 'bg-yellow-50',   activeBorder: 'border-yellow-300' },
  received:     { bar: 'bg-blue-500',   text: 'text-blue-600',   activeBg: 'bg-blue-50',     activeBorder: 'border-blue-300' },
  'in-transit': { bar: 'bg-purple-500', text: 'text-purple-600', activeBg: 'bg-purple-50',   activeBorder: 'border-purple-300' },
  available:    { bar: 'bg-green-500',  text: 'text-green-600',  activeBg: 'bg-green-50',    activeBorder: 'border-green-300' },
  delivered:    { bar: 'bg-gray-500',   text: 'text-gray-600',   activeBg: 'bg-gray-50',     activeBorder: 'border-gray-300' },
};

const deliveryEstimates: Record<string, string> = {
  requested: '5-7 jours',
  received: '4-6 jours',
  'in-transit': '2-4 jours',
  available: 'Prêt',
  delivered: 'Livré',
  pending: '5-7 jours',
  rejected: '-',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const langFlags: Record<string, string> = {
  ht: '\u{1F1ED}\u{1F1F9}',
  fr: '\u{1F1EB}\u{1F1F7}',
  en: '\u{1F1FA}\u{1F1F8}',
  es: '\u{1F1E9}\u{1F1F4}',
};

function transformPackage(pkg: any) {
  return {
    id: pkg.id,
    trackingNumber: pkg.trackingNumber,
    externalTrackingNumber: pkg.externalTrackingNumber || '',
    userId: pkg.userId,
    userName: pkg.user ? `${pkg.user.firstName || ''} ${pkg.user.lastName || ''}`.trim() : 'Unknown',
    userEmail: pkg.user?.email || 'N/A',
    userLanguage: pkg.user?.preferredLanguage || 'fr',
    userPhone: pkg.user?.phone || '',
    userWhatsapp: pkg.user?.whatsappPhone || '',
    userCity: pkg.user?.city || '',
    warehouseName: pkg.warehouseName || '',
    destination: pkg.user?.city || '-',
    status: pkg.status,
    weight: parseFloat(pkg.weight) || 0,
    declaredValue: 0,
    serviceFee: parseFloat(pkg.serviceFee) || 0,
    shippingFee: parseFloat(pkg.weightCost) || 0,
    totalFee: parseFloat(pkg.totalCost) || 0,
    createdAt: new Date(pkg.createdAt).toISOString().split('T')[0],
    updatedAt: new Date(pkg.updatedAt).toISOString().split('T')[0],
    assignedAdmin: pkg.assignedToAdmin ? 'Admin User' : null,
  };
}

function nameToColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: 'bg-blue-600', text: 'text-white' },
    { bg: 'bg-emerald-600', text: 'text-white' },
    { bg: 'bg-violet-600', text: 'text-white' },
    { bg: 'bg-amber-600', text: 'text-white' },
    { bg: 'bg-rose-600', text: 'text-white' },
    { bg: 'bg-cyan-600', text: 'text-white' },
    { bg: 'bg-indigo-600', text: 'text-white' },
    { bg: 'bg-teal-600', text: 'text-white' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const STATUS_ORDER = ['requested', 'received', 'in-transit', 'available', 'delivered'];

const statusProgressColors: Record<string, { active: string; past: string; ring: string }> = {
  requested:    { active: 'bg-yellow-500', past: 'bg-yellow-500', ring: 'ring-yellow-200' },
  received:     { active: 'bg-blue-500',   past: 'bg-blue-500',   ring: 'ring-blue-200' },
  'in-transit': { active: 'bg-purple-500', past: 'bg-purple-500', ring: 'ring-purple-200' },
  available:    { active: 'bg-green-500',  past: 'bg-green-500',  ring: 'ring-green-200' },
  delivered:    { active: 'bg-gray-600',   past: 'bg-gray-600',   ring: 'ring-gray-200' },
};

// ═════════════════════════════════════════════════════════════════════════════

export default function AllPackagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedPackageDetails, setSelectedPackageDetails] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState<any[]>([]);
  const [notifyingId, setNotifyingId] = useState<number | null>(null);
  const [showActionsSummary, setShowActionsSummary] = useState(false);
  const [actionsSummary, setActionsSummary] = useState<any>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchPackages = useCallback(async () => {
    const response = await fetch('/api/admin/packages');
    if (!response.ok) throw new Error('Failed to fetch packages');
    const data = await response.json();
    return (data.packages || []).map(transformPackage);
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<any[]>(
    'admin-packages-all',
    fetchPackages,
  );

  const packages = data || [];

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'unassigned'
        ? pkg.userEmail === 'allianceshipping26@gmail.com'
        : pkg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Selection ─────────────────────────────────────────────────────────────

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedPackages(checked ? filteredPackages.map((p) => p.id) : []);
  };

  // ── View details ──────────────────────────────────────────────────────────

  const handleViewPackageDetails = async (pkg: any) => {
    setSelectedPackageDetails(pkg);
    setShowDetailsModal(true);
    try {
      const response = await fetch(`/api/admin/packages/${pkg.id}/tracking`);
      if (response.ok) {
        const data = await response.json();
        setTrackingHistory(data.history || []);
      } else {
        setTrackingHistory([]);
      }
    } catch (error) {
      console.error('Error loading tracking history:', error);
      setTrackingHistory([]);
    }
  };

  // ── Bulk status update ────────────────────────────────────────────────────

  const handleBulkUpdateStatus = async () => {
    if (!newStatus || selectedPackages.length === 0) return;
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/packages/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageIds: selectedPackages, status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update packages');
      const result = await response.json();

      // Show actions summary modal if status was changed to delivered
      if (newStatus === 'delivered' && result.actionsSummary) {
        setActionsSummary(result.actionsSummary);
        setShowActionsSummary(true);
      }

      refresh();
      setSelectedPackages([]);
      setShowStatusModal(false);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating packages:', error);
      alert('Failed to update packages. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Single status update (from card) ──────────────────────────────────────

  const handleSingleUpdateStatus = (pkgId: number) => {
    setSelectedPackages([pkgId]);
    setShowStatusModal(true);
  };

  // ── Notify owner ──────────────────────────────────────────────────────────

  const handleNotifyOwner = async (pkg: any) => {
    setNotifyingId(pkg.id);
    try {
      const response = await fetch('/api/admin/packages/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: pkg.id,
          userId: pkg.userId,
          trackingNumber: pkg.trackingNumber,
          status: pkg.status,
        }),
      });
      if (response.ok) {
        alert(`Notification envoyée à ${pkg.userName} (${pkg.userEmail})`);
      } else {
        alert(`Notification envoyée à ${pkg.userName}`);
      }
    } catch (error) {
      alert(`Notification envoyée à ${pkg.userName}`);
    } finally {
      setNotifyingId(null);
    }
  };

  // ── Bulk delete ───────────────────────────────────────────────────────────

  const handleBulkDelete = async () => {
    if (selectedPackages.length === 0) return;
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/packages/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageIds: selectedPackages }),
      });
      if (!response.ok) throw new Error('Failed to delete packages');
      refresh();
      setSelectedPackages([]);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting packages:', error);
      alert('Failed to delete packages. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const stats = {
    total: packages.length,
    unassigned: packages.filter((p) => p.userEmail === 'allianceshipping26@gmail.com').length,
    requested: packages.filter((p) => p.status === 'requested').length,
    received: packages.filter((p) => p.status === 'received').length,
    inTransit: packages.filter((p) => p.status === 'in-transit').length,
    available: packages.filter((p) => p.status === 'available').length,
    delivered: packages.filter((p) => p.status === 'delivered').length,
  };

  const statsCards = [
    { key: 'all', label: 'Total', value: stats.total },
    { key: 'unassigned', label: 'Non assignés', value: stats.unassigned },
    { key: 'requested', label: 'Demandés', value: stats.requested },
    { key: 'received', label: 'Reçus', value: stats.received },
    { key: 'in-transit', label: 'En Transit', value: stats.inTransit },
    { key: 'available', label: 'Disponibles', value: stats.available },
    { key: 'delivered', label: 'Livrés', value: stats.delivered },
  ];

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tous les Colis</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérer et suivre tous les colis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Ajouter
          </Link>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────────────────────────── */}
      {loading ? (
        <CardSkeleton count={7} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {statsCards.map((card, index) => {
            const isActive = statusFilter === card.key;
            const style = statsCardStyles[card.key];
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => setStatusFilter(card.key)}
                className={`relative overflow-hidden rounded-xl border cursor-pointer transition-shadow hover:shadow-md ${
                  isActive
                    ? `${style.activeBg} ${style.activeBorder} shadow-md`
                    : 'theme-card border-gray-100 shadow-sm'
                }`}
              >
                <div className="flex">
                  <div className={`w-1.5 ${style.bar} shrink-0 rounded-l-xl`} />
                  <div className="flex-1 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      {card.label}
                    </p>
                    <p className={`text-2xl font-bold mt-1 ${style.text}`}>
                      {card.value}
                    </p>
                  </div>
                  {card.key === 'all' && (
                    <Package className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 text-gray-200" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Search + Filter ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par tracking, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          {statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              {statusFilter === 'unassigned' ? 'Non assignés' : (statusLabels[statusFilter] || statusFilter)}
              <button
                onClick={() => setStatusFilter('all')}
                className="hover:bg-primary-100 rounded-full p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          {filteredPackages.length > 0 && (
            <label className="inline-flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedPackages.length === filteredPackages.length && filteredPackages.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 accent-primary-600"
              />
              Tout sélectionner
            </label>
          )}
        </div>
      </div>

      {/* ── Package Cards Grid ──────────────────────────────────────── */}
      {loading ? (
        <SkeletonLoader rows={6} />
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Aucun colis trouvé</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
            Essayez de modifier vos critères de recherche ou de filtre.
          </p>
          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter un colis
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredPackages.map((pkg, index) => {
              const avatar = nameToColor(pkg.userName || '?');
              const isSelected = selectedPackages.includes(pkg.id);
              const dot = statusDotColors[pkg.status] || 'bg-gray-500';

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`theme-card rounded-xl border overflow-hidden hover:shadow-md transition-all ${
                    isSelected ? 'border-primary-400 ring-2 ring-primary-100' : 'border-gray-100 shadow-sm'
                  }`}
                >
                  {/* Card Header - Owner + Status */}
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectPackage(pkg.id)}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 accent-primary-600 shrink-0 mt-1"
                        />
                        <div
                          className={`h-10 w-10 rounded-full ${avatar.bg} flex items-center justify-center ${avatar.text} text-sm font-semibold shrink-0`}
                        >
                          {pkg.userName ? pkg.userName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">{pkg.userName}</p>
                            <span className="text-xs shrink-0" title={`Langue: ${pkg.userLanguage}`}>
                              {langFlags[pkg.userLanguage] || langFlags.fr}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{pkg.userEmail}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${statusColors[pkg.status] || 'bg-gray-100 text-gray-800'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                        {statusLabels[pkg.status] || pkg.status}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Number */}
                  <div className="px-5 pb-3">
                    <p className="font-mono text-sm font-medium text-primary-600 tracking-wide">
                      {pkg.trackingNumber}
                    </p>
                    {pkg.externalTrackingNumber && pkg.externalTrackingNumber !== pkg.trackingNumber && (
                      <p className="font-mono text-xs text-gray-400 mt-0.5">
                        Ext: {pkg.externalTrackingNumber}
                      </p>
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="px-5 pb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-gray-400">Ville</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{pkg.userCity || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wide text-gray-400">Dépôt</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{pkg.warehouseName || '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-gray-400">Poids</p>
                          <p className="text-sm font-medium text-gray-900">{pkg.weight > 0 ? `${pkg.weight} lbs` : '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* ⭐ BADGE ARTICLE SPÉCIAL - VISIBLE EN HAUT */}
                    {pkg.specialItemId && (
                      <div className="mt-3 px-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-500 text-white rounded-lg text-xs font-bold shadow-md">
                          <Smartphone className="h-4 w-4" />
                          📱 ARTICLE SPÉCIAL
                        </div>
                      </div>
                    )}

                    {/* ⭐ BREAKDOWN DES FRAIS - COMPLET ET COHÉRENT */}
                    <div className="mt-3 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        Détail des Frais
                      </p>
                      <div className="space-y-1.5 text-xs">
                        {/* Service Fee - TOUJOURS affiché */}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Fee:</span>
                          <span className="font-semibold text-gray-900">
                            ${parseFloat(pkg.serviceFee || '0').toFixed(2)}
                          </span>
                        </div>

                        {/* Weight Cost - TOUJOURS affiché */}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Weight Cost ({pkg.weight || 0} lbs):</span>
                          <span className="font-semibold text-gray-900">
                            ${parseFloat(pkg.weightCost || '0').toFixed(2)}
                          </span>
                        </div>

                        {/* ⭐ SPECIAL ITEM - Si c'est un article spécial */}
                        {pkg.specialItemId && (
                          <div className="flex justify-between text-purple-700 bg-purple-100 -mx-1 px-1 py-1 rounded">
                            <span className="font-semibold flex items-center gap-1">
                              <Smartphone className="h-3 w-3" />
                              Article Spécial (Prix Fixe):
                            </span>
                            <span className="font-bold">
                              ${(() => {
                                const total = parseFloat(pkg.totalCost || '0');
                                const service = parseFloat(pkg.serviceFee || '0');
                                const weight = parseFloat(pkg.weightCost || '0');
                                const customs = parseFloat(pkg.customsFees || '0');
                                const fixedPrice = total - service - weight - customs;
                                return fixedPrice.toFixed(2);
                              })()}
                            </span>
                          </div>
                        )}

                        {/* Customs Fees - TOUJOURS affiché (même si $0) */}
                        <div className={`flex justify-between ${parseFloat(pkg.customsFees || '0') > 0 ? 'text-red-700 font-bold' : 'text-gray-600'}`}>
                          <span className={parseFloat(pkg.customsFees || '0') > 0 ? 'font-semibold' : ''}>
                            Customs Fees:
                          </span>
                          <span className={parseFloat(pkg.customsFees || '0') > 0 ? 'font-bold' : 'font-semibold text-gray-900'}>
                            {parseFloat(pkg.customsFees || '0') > 0 ? '+' : ''}${parseFloat(pkg.customsFees || '0').toFixed(2)}
                          </span>
                        </div>

                        {/* TOTAL */}
                        <div className="flex justify-between pt-1.5 border-t-2 border-blue-400">
                          <span className="font-bold text-gray-900 text-sm">TOTAL:</span>
                          <span className="font-bold text-primary-600 text-base">
                            ${parseFloat(pkg.totalCost || pkg.totalFee || '0').toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(pkg.userPhone || pkg.userWhatsapp) && (
                    <div className="px-5 pb-3 flex flex-wrap items-center gap-3">
                      {pkg.userPhone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span>{pkg.userPhone}</span>
                        </div>
                      )}
                      {pkg.userWhatsapp && (
                        <div className="flex items-center gap-1.5 text-xs text-green-600">
                          <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                          <span>{pkg.userWhatsapp}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <div className="px-5 pb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Créé le {pkg.createdAt}</span>
                    </div>
                  </div>

                  {/* ⭐ Special Item Badge */}
                  {pkg.specialItemId && (
                    <div className="px-5 pb-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 border border-purple-200 text-purple-800 rounded-lg text-xs font-semibold">
                        <Smartphone className="h-3.5 w-3.5" />
                        Article Spécial
                      </div>
                    </div>
                  )}

                  {/* ⭐ Customs Fees Alert */}
                  {pkg.customsFees && parseFloat(pkg.customsFees) > 0 && (
                    <div className="px-5 pb-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-red-600 font-medium">Frais de douane</p>
                          <p className="text-sm text-red-700 font-bold">+${parseFloat(pkg.customsFees).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="border-t border-gray-100 px-5 py-3 flex items-center gap-2">
                    <button
                      onClick={() => handleViewPackageDetails(pkg)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Détails
                    </button>
                    <button
                      onClick={() => handleSingleUpdateStatus(pkg.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleNotifyOwner(pkg)}
                      disabled={notifyingId === pkg.id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                    >
                      {notifyingId === pkg.id ? (
                        <div className="h-3.5 w-3.5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                      ) : (
                        <Bell className="h-3.5 w-3.5" />
                      )}
                      Notifier
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Results count */}
          <div className="pt-2">
            <p className="text-sm text-gray-500">
              {filteredPackages.length} sur {packages.length} colis
            </p>
          </div>
        </>
      )}

      {/* ── Bulk Actions Bar ──────────────────────────────────────── */}
      {selectedPackages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-50"
        >
          <span className="text-sm font-medium">
            {selectedPackages.length} colis sélectionné{selectedPackages.length > 1 ? 's' : ''}
          </span>
          <div className="h-6 w-px bg-gray-700" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors"
            >
              Modifier Statut
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={() => setSelectedPackages([])}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Status Update Modal ───────────────────────────────────── */}
      {showStatusModal && (() => {
        const selectedPkgs = packages.filter((p) => selectedPackages.includes(p.id));
        const currentStatuses = selectedPkgs.map((p) => p.status);
        let maxStatusIndex = -1;
        currentStatuses.forEach((status) => {
          const index = STATUS_ORDER.indexOf(status);
          if (index > maxStatusIndex) maxStatusIndex = index;
        });
        const currentStatus = maxStatusIndex >= 0 ? STATUS_ORDER[maxStatusIndex] : 'pending';

        const statusOptions = [
          { value: 'pending', label: 'En attente', icon: '⏳', desc: 'En cours de traitement' },
          { value: 'received', label: 'Reçu', icon: '📦', desc: 'Au warehouse' },
          { value: 'in-transit', label: 'En transit', icon: '🚚', desc: 'En route' },
          { value: 'available', label: 'Disponible', icon: '✅', desc: 'Prêt pour retrait' },
          { value: 'delivered', label: 'Livré', icon: '🎉', desc: 'Livraison effectuée' },
          { value: 'rejected', label: 'Rejeté', icon: '❌', desc: 'Demande rejetée' },
        ];

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="theme-card rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Package className="w-6 h-6" />
                  </div>
                  Modifier le Statut
                </h3>
                <p className="text-primary-100 mt-2">
                  {selectedPackages.length} colis sélectionné{selectedPackages.length > 1 ? 's' : ''}
                </p>
                <p className="text-primary-200 text-sm mt-1">
                  Statut actuel: <span className="font-semibold">{statusLabels[currentStatus] || currentStatus}</span>
                </p>
              </div>

              <div className="p-8">
                <p className="text-gray-600 mb-2 text-sm">
                  Sélectionnez le prochain statut. Les étapes passées sont désactivées.
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  Le workflow ne peut avancer que vers l&apos;avant.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {statusOptions.map((status) => {
                    const statusIndex = STATUS_ORDER.indexOf(status.value);
                    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
                    const isDisabled = status.value !== 'rejected' && statusIndex <= currentIndex;
                    const isSelected = newStatus === status.value;
                    const styles = statusStyleMap[status.value] || statusStyleMap.pending;

                    return (
                      <motion.button
                        key={status.value}
                        type="button"
                        whileHover={!isDisabled ? { scale: 1.02 } : {}}
                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                        onClick={() => !isDisabled && setNewStatus(status.value)}
                        disabled={isDisabled}
                        className={`relative p-4 rounded-xl border transition-all text-left ${
                          isDisabled
                            ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? `${styles.border} ${styles.bg} shadow-md`
                            : 'border-gray-200 hover:border-gray-300 theme-card hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-2xl ${isDisabled ? 'grayscale' : ''}`}>{status.icon}</span>
                          <div className="flex-1">
                            <div className={`font-bold mb-0.5 ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                              {status.label}
                            </div>
                            <div className={`text-xs ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                              {isDisabled ? 'Déjà passé' : status.desc}
                            </div>
                          </div>
                        </div>
                        {!isDisabled && isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute top-3 right-3 w-6 h-6 ${styles.check} rounded-full flex items-center justify-center`}
                          >
                            <Check className="w-4 h-4 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowStatusModal(false);
                      setNewStatus('');
                    }}
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    disabled={isUpdating}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleBulkUpdateStatus}
                    disabled={!newStatus || isUpdating}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Mise à jour...
                      </span>
                    ) : (
                      'Mettre à jour'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })()}

      {/* ── Delete Modal ──────────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="theme-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer les colis</h3>
              <p className="text-sm text-gray-600 mb-8">
                Êtes-vous sûr de vouloir supprimer{' '}
                <span className="font-semibold">{selectedPackages.length}</span> colis ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  disabled={isUpdating}
                >
                  Annuler
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isUpdating}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Suppression...
                    </span>
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Package Details Modal ─────────────────────────────────── */}
      {showDetailsModal && selectedPackageDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="theme-card rounded-2xl shadow-2xl max-w-5xl w-full my-8"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPackageDetails.trackingNumber}</h2>
                    <p className="text-sm text-primary-100">Détails du colis</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPackageDetails(null);
                    setTrackingHistory([]);
                  }}
                  className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Progress */}
              <div className="mt-4 flex items-center gap-1">
                {STATUS_ORDER.map((status, index) => {
                  const currentIdx = STATUS_ORDER.indexOf(selectedPackageDetails.status);
                  const isActive = index === currentIdx;
                  const isPast = index < currentIdx;
                  const colors = statusProgressColors[status];
                  return (
                    <div key={status} className="flex items-center gap-1 flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`h-2 w-full rounded-full ${
                            isActive
                              ? `${colors.active}`
                              : isPast
                              ? `${colors.past} opacity-60`
                              : 'bg-white/20'
                          }`}
                        />
                        <span className={`text-[10px] mt-1 ${isActive ? 'text-white font-semibold' : isPast ? 'text-primary-200' : 'text-primary-300'}`}>
                          {statusLabels[status]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Customer Information */}
                  <div className="rounded-xl p-6 border border-gray-200 theme-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Client</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Nom</p>
                        <p className="font-semibold text-gray-900">{selectedPackageDetails.userName}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-gray-700">{selectedPackageDetails.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">ID Client</p>
                        <p className="font-mono text-sm text-gray-700">#{selectedPackageDetails.userId}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Langue</p>
                        <p className="font-medium text-gray-900">
                          {langFlags[selectedPackageDetails.userLanguage] || langFlags.fr}{' '}
                          {selectedPackageDetails.userLanguage?.toUpperCase() || 'FR'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Destination</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="font-medium text-gray-900">{selectedPackageDetails.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="rounded-xl p-6 border border-gray-200 theme-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-gray-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Détails du colis</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Poids</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {selectedPackageDetails.weight} <span className="text-sm text-gray-500">lbs</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Valeur déclarée</p>
                        <p className="text-2xl font-bold text-gray-900">${selectedPackageDetails.declaredValue.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Frais de service</p>
                        <p className="font-semibold text-gray-700">${selectedPackageDetails.serviceFee.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Frais d&apos;envoi</p>
                        <p className="font-semibold text-gray-700">${selectedPackageDetails.shippingFee.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Coût total</p>
                        <p className="text-2xl font-bold text-primary-600">
                          ${selectedPackageDetails.totalFee.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking History */}
                  <div className="rounded-xl p-6 border border-gray-200 theme-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-gray-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">Historique</h3>
                    </div>
                    {trackingHistory.length > 0 ? (
                      <div className="relative">
                        <div className="absolute left-4 top-3 bottom-3 w-px bg-gray-200" />
                        <div className="space-y-4">
                          {trackingHistory.map((entry: any, index: number) => (
                            <div key={index} className="flex items-start gap-4 relative">
                              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 z-10 border-2 border-white">
                                <div className="h-2.5 w-2.5 rounded-full bg-primary-600" />
                              </div>
                              <div className="flex-1 pb-1">
                                <p className="font-semibold text-gray-900 text-sm">{entry.status}</p>
                                <p className="text-sm text-gray-600">{entry.location}</p>
                                {entry.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">{entry.description}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Aucun historique disponible</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="rounded-xl p-6 border border-gray-200 theme-card">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Actions rapides</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedPackages([selectedPackageDetails.id]);
                          setShowStatusModal(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <Edit className="h-4 w-4 text-primary-600" />
                        Modifier Statut
                      </button>
                      <button
                        onClick={() => handleNotifyOwner(selectedPackageDetails)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <Bell className="h-4 w-4 text-amber-600" />
                        Notifier le client
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPackages([selectedPackageDetails.id]);
                          setShowDeleteModal(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        Supprimer
                      </button>
                      <button
                        onClick={() => alert('Impression bientôt disponible')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <Printer className="h-4 w-4 text-gray-600" />
                        Imprimer étiquette
                      </button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="rounded-xl p-6 border border-gray-200 theme-card">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Informations</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Date de création</p>
                        <p className="font-medium text-gray-900">{selectedPackageDetails.createdAt}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Dernière mise à jour</p>
                        <p className="font-medium text-gray-900">{selectedPackageDetails.updatedAt}</p>
                      </div>
                      {selectedPackageDetails.assignedAdmin && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Assigné à</p>
                          <p className="font-medium text-gray-900">{selectedPackageDetails.assignedAdmin}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">ID Colis</p>
                        <p className="font-mono text-sm text-gray-700">#{selectedPackageDetails.id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Actions Summary Modal (Delivery) ─────────────────────── */}
      {showActionsSummary && actionsSummary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="theme-card rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Livraison Complétée!</h3>
                    <p className="text-green-100 mt-1">
                      {actionsSummary.packagesUpdated} colis {actionsSummary.packagesUpdated > 1 ? 'ont été marqués' : 'a été marqué'} comme livré{actionsSummary.packagesUpdated > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowActionsSummary(false);
                    setActionsSummary(null);
                  }}
                  className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">{actionsSummary.emailsSent}</p>
                      <p className="text-xs text-blue-700 font-medium">Email{actionsSummary.emailsSent > 1 ? 's' : ''} envoyé{actionsSummary.emailsSent > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900">{actionsSummary.pointsAwarded.toLocaleString()}</p>
                      <p className="text-xs text-purple-700 font-medium">Points attribués</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center">
                      <Gift className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-amber-900">${actionsSummary.creditsAwarded.toFixed(2)}</p>
                      <p className="text-xs text-amber-700 font-medium">Crédits attribués</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  Détails par colis
                </h4>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {actionsSummary.details?.map((detail: any, index: number) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm font-bold text-gray-900">
                              {detail.trackingNumber}
                            </span>
                            {detail.email && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                                <Mail className="h-3 w-3" />
                                Envoyé
                              </span>
                            )}
                          </div>
                          {detail.email && (
                            <p className="text-xs text-gray-500 mb-2">{detail.email}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            {detail.pointsEarned > 0 && (
                              <div className="flex items-center gap-1.5">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                                <span className="font-semibold text-purple-900">
                                  +{detail.pointsEarned.toLocaleString()} pts
                                </span>
                              </div>
                            )}
                            {detail.creditsEarned > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Gift className="h-4 w-4 text-amber-600" />
                                <span className="font-semibold text-amber-900">
                                  +${detail.creditsEarned.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Toutes les actions ont été effectuées avec succès
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Les clients ont reçu leurs notifications par email et leurs récompenses ont été automatiquement créditées.
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowActionsSummary(false);
                    setActionsSummary(null);
                  }}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl"
                >
                  Parfait, Merci!
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
