'use client';

import { useState, useCallback, useMemo } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle,
  Bell,
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Clock,
  Camera,
  FileText,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Layers,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import AddCustomsFeesModal from '@/components/admin/AddCustomsFeesModal';
import { useToast } from '@/components/admin/Toast';

interface AvailablePackage {
  id: number;
  trackingNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  destination: string;
  weight: number;
  quantity: number;
  serviceFee: number;
  weightCost: number;
  totalFee: number;
  customsFees: number;
  totalCost: number;
  arrivedAt: string;
  availableSince: string;
  pickupLocation: string;
  notificationsSent: number;
  lastNotified: string;
  isPaid: boolean;
  status: string;
}

interface PotentialBundle {
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  city: string;
  packageCount: number;
  packages: {
    id: number;
    trackingNumber: string;
    weight: string;
    serviceFee: string;
    weightCost: string;
    customsFees: string;
    totalCost: string;
    quantity: number;
    description: string | null;
    createdAt: string;
  }[];
  potentialSavings: number;
  totalCost: number;
  bundleCost: number;
}

export default function AvailablePackagesPage() {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [showCustomsModal, setShowCustomsModal] = useState(false);
  const [selectedPackageForCustoms, setSelectedPackageForCustoms] = useState<AvailablePackage | null>(null);

  // Bundle states
  const [viewMode, setViewMode] = useState<'all' | 'bundles'>('all');
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [bundleTarget, setBundleTarget] = useState<PotentialBundle | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [bundleNotes, setBundleNotes] = useState('');
  const [isBundleDelivering, setIsBundleDelivering] = useState(false);
  const [expandedBundleUsers, setExpandedBundleUsers] = useState<Set<number>>(new Set());

  const fetchPackages = useCallback(async (): Promise<AvailablePackage[]> => {
    const response = await fetch('/api/admin/packages?status=available');
    if (!response.ok) throw new Error('Failed to fetch packages');
    const data = await response.json();

    return data.packages.map((pkg: any) => ({
      id: pkg.id,
      trackingNumber: pkg.trackingNumber,
      userId: pkg.userId,
      userName: pkg.user ? `${pkg.user.firstName || ''} ${pkg.user.lastName || ''}`.trim() : 'Unknown',
      userEmail: pkg.user?.email || 'N/A',
      userPhone: pkg.user?.phone || 'N/A',
      destination: pkg.user?.city || '-',
      weight: parseFloat(pkg.weight) || 0,
      quantity: parseInt(pkg.quantity) || 1,
      serviceFee: parseFloat(pkg.serviceFee) || 0,
      weightCost: parseFloat(pkg.weightCost) || 0,
      totalFee: parseFloat(pkg.totalCost) || 0,
      customsFees: parseFloat(pkg.customsFees) || 0,
      totalCost: parseFloat(pkg.totalCost) || 0,
      arrivedAt: pkg.updatedAt,
      availableSince: pkg.updatedAt,
      pickupLocation: `${pkg.user?.city || 'Haiti'} Office`,
      notificationsSent: 0,
      lastNotified: pkg.updatedAt,
      isPaid: true,
      status: pkg.status,
    }));
  }, []);

  // Fetch potential bundles
  const fetchBundles = useCallback(async (): Promise<{
    bundles: PotentialBundle[];
    totalPotentialBundles: number;
    totalPotentialSavings: number;
  }> => {
    const response = await fetch('/api/admin/packages/potential-bundles');
    if (!response.ok) throw new Error('Failed to fetch bundles');
    return response.json();
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<AvailablePackage[]>(
    'admin-packages-available',
    fetchPackages,
  );

  const { data: bundleData, refresh: refreshBundles } = useCachedFetch(
    'admin-potential-bundles',
    fetchBundles,
  );

  const packages = data || [];
  const potentialBundles = bundleData?.bundles || [];
  const totalPotentialSavings = bundleData?.totalPotentialSavings || 0;

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPaid =
      filterPaid === 'all' ||
      (filterPaid === 'paid' && pkg.isPaid) ||
      (filterPaid === 'unpaid' && !pkg.isPaid);

    return matchesSearch && matchesPaid;
  });

  // Group filtered packages by user for bundle view
  const groupedByUser = useMemo(() => {
    const groups: Record<number, { userId: number; userName: string; userEmail: string; userPhone: string; city: string; packages: AvailablePackage[] }> = {};
    for (const pkg of filteredPackages) {
      if (!groups[pkg.userId]) {
        groups[pkg.userId] = {
          userId: pkg.userId,
          userName: pkg.userName,
          userEmail: pkg.userEmail,
          userPhone: pkg.userPhone,
          city: pkg.destination,
          packages: [],
        };
      }
      groups[pkg.userId].packages.push(pkg);
    }
    // Sort: users with most packages first
    return Object.values(groups).sort((a, b) => b.packages.length - a.packages.length);
  }, [filteredPackages]);

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
  };

  // Select/deselect all packages from a user
  const handleSelectUserPackages = (userId: number) => {
    const userPkgIds = filteredPackages.filter(p => p.userId === userId).map(p => p.id);
    const allSelected = userPkgIds.every(id => selectedPackages.includes(id));

    if (allSelected) {
      setSelectedPackages(prev => prev.filter(id => !userPkgIds.includes(id)));
    } else {
      setSelectedPackages(prev => [...new Set([...prev, ...userPkgIds])]);
    }
  };

  const handleNotifyCustomer = (pkg: AvailablePackage) => {
    console.log('Sending notification to:', pkg.userName);
    alert(`Notification sent to ${pkg.userName} (${pkg.userEmail})`);
  };

  const handleMarkDelivered = async (pkg: AvailablePackage) => {
    setProcessingIds(prev => [...prev, pkg.id]);
    try {
      const response = await fetch('/api/admin/packages/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageIds: [pkg.id],
          status: 'delivered',
        }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      toast.success(`Colis ${pkg.trackingNumber} livre`, 'Statut mis a jour');
      setProcessingIds(prev => prev.filter(id => id !== pkg.id));
      refresh();
      refreshBundles();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Echec de la mise a jour du statut');
      setProcessingIds(prev => prev.filter(id => id !== pkg.id));
    }
  };

  // Open bundle modal for a specific potential bundle
  const handleOpenBundleModal = (bundle: PotentialBundle) => {
    setBundleTarget(bundle);
    setRecipientName(bundle.userName);
    setBundleNotes('');
    setShowBundleModal(true);
  };

  // Open bundle modal from selected packages
  const handleOpenBundleFromSelection = () => {
    // Verify all selected packages belong to same user
    const selectedPkgs = packages.filter(p => selectedPackages.includes(p.id));
    const userIds = new Set(selectedPkgs.map(p => p.userId));
    if (userIds.size !== 1) {
      toast.error('Tous les colis doivent appartenir au meme client pour un bundle');
      return;
    }
    if (selectedPkgs.length < 2) {
      toast.error('Il faut au moins 2 colis pour un bundle');
      return;
    }

    const userId = selectedPkgs[0].userId;
    const serviceFees = selectedPkgs.map(p => p.serviceFee).sort((a, b) => b - a);
    const savings = serviceFees.slice(1).reduce((sum, fee) => sum + fee, 0);

    const bundle: PotentialBundle = {
      userId,
      userName: selectedPkgs[0].userName,
      userEmail: selectedPkgs[0].userEmail,
      userPhone: selectedPkgs[0].userPhone,
      city: selectedPkgs[0].destination,
      packageCount: selectedPkgs.length,
      packages: selectedPkgs.map(p => ({
        id: p.id,
        trackingNumber: p.trackingNumber,
        weight: String(p.weight),
        serviceFee: String(p.serviceFee),
        weightCost: String(p.weightCost),
        customsFees: String(p.customsFees),
        totalCost: String(p.totalCost),
        quantity: p.quantity,
        description: null,
        createdAt: p.arrivedAt,
      })),
      potentialSavings: savings,
      totalCost: selectedPkgs.reduce((sum, p) => sum + p.totalCost, 0),
      bundleCost: selectedPkgs.reduce((sum, p) => sum + p.totalCost, 0) - savings,
    };

    setBundleTarget(bundle);
    setRecipientName(bundle.userName);
    setBundleNotes('');
    setShowBundleModal(true);
  };

  // Execute bundle delivery
  const handleBundleDeliver = async () => {
    if (!bundleTarget) return;
    setIsBundleDelivering(true);
    try {
      const packageIds = bundleTarget.packages.map(p => p.id);
      const response = await fetch('/api/admin/packages/bundle-deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageIds,
          proofData: {
            recipientName: recipientName || bundleTarget.userName,
            notes: bundleNotes || undefined,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to deliver bundle');
      }

      const result = await response.json();
      toast.success(
        `Bundle livre ! ${bundleTarget.packageCount} colis`,
        `Economie: $${result.savings} | Points: ${result.loyaltySummary.totalPointsAwarded}`
      );
      setShowBundleModal(false);
      setBundleTarget(null);
      setSelectedPackages([]);
      refresh();
      refreshBundles();
    } catch (error: any) {
      console.error('Bundle delivery error:', error);
      toast.error(error.message || 'Echec de la livraison bundle');
    } finally {
      setIsBundleDelivering(false);
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (selectedPackages.length === 0 || !newStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/packages/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageIds: selectedPackages,
          status: newStatus,
        }),
      });
      if (!response.ok) throw new Error('Failed to update packages');
      setSelectedPackages([]);
      refresh();
      refreshBundles();
      setShowStatusModal(false);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating packages:', error);
      toast.error('Failed to update packages');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const toggleBundleUser = (userId: number) => {
    setExpandedBundleUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  // Check if selected packages can form a bundle
  const selectedCanBundle = useMemo(() => {
    if (selectedPackages.length < 2) return false;
    const selectedPkgs = packages.filter(p => selectedPackages.includes(p.id));
    const userIds = new Set(selectedPkgs.map(p => p.userId));
    return userIds.size === 1;
  }, [selectedPackages, packages]);

  const stats = {
    total: packages.length,
    paid: packages.filter((p) => p.isPaid).length,
    unpaid: packages.filter((p) => !p.isPaid).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available for Pickup</h1>
          <p className="mt-2 text-sm text-gray-600">
            Packages ready for customer pickup in Haiti
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* View mode toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="h-4 w-4 inline mr-1" />
              Tous
            </button>
            <button
              onClick={() => setViewMode('bundles')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'bundles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers className="h-4 w-4 inline mr-1" />
              Par Client
            </button>
          </div>

          <button
            onClick={() => { refresh(); refreshBundles(); }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              {filteredPackages.length} Available
            </span>
          </div>
        </div>
      </div>

      {/* Bundle Banner */}
      {potentialBundles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {potentialBundles.length} client{potentialBundles.length > 1 ? 's' : ''} avec bundles potentiels
                </p>
                <p className="text-sm text-gray-600">
                  Economie totale possible : <span className="font-bold text-green-600">${totalPotentialSavings.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setViewMode('bundles')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Sparkles className="h-4 w-4" />
              Voir les Bundles
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="theme-card rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setFilterPaid('all')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Available</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="theme-card rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setFilterPaid('paid')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="theme-card rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setFilterPaid('unpaid')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unpaid</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.unpaid}</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking number or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {filterPaid !== 'all' && (
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
            {filterPaid === 'paid' ? 'Paid only' : 'Unpaid only'}
            <button onClick={() => setFilterPaid('all')} className="hover:bg-primary-100 rounded-full p-0.5">
              x
            </button>
          </span>
        )}
      </div>

      {/* === BUNDLE VIEW (Grouped by client) === */}
      {viewMode === 'bundles' && (
        <div className="space-y-6">
          {groupedByUser.map((group) => {
            const isExpanded = expandedBundleUsers.has(group.userId);
            const hasBundle = group.packages.length >= 2;
            const matchingBundle = potentialBundles.find(b => b.userId === group.userId);
            const savings = matchingBundle?.potentialSavings || 0;
            const allUserPkgIds = group.packages.map(p => p.id);
            const allSelected = allUserPkgIds.every(id => selectedPackages.includes(id));

            return (
              <motion.div
                key={group.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`theme-card rounded-2xl shadow-sm border overflow-hidden ${
                  hasBundle ? 'border-purple-200' : 'border-gray-100'
                }`}
              >
                {/* User Header */}
                <div
                  className={`p-4 sm:p-5 cursor-pointer ${hasBundle ? 'bg-purple-50/50' : 'bg-gray-50/50'}`}
                  onClick={() => toggleBundleUser(group.userId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => { e.stopPropagation(); handleSelectUserPackages(group.userId); }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                        {group.userName.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{group.userName}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {group.packages.length} colis
                          </span>
                          {hasBundle && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                              <Layers className="h-3 w-3" />
                              Bundle
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{group.city}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{group.userPhone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasBundle && savings > 0 && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                          <Sparkles className="h-3.5 w-3.5" />
                          Economie: ${savings.toFixed(2)}
                        </span>
                      )}
                      {hasBundle && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (matchingBundle) handleOpenBundleModal(matchingBundle);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Layers className="h-4 w-4" />
                          <span className="hidden sm:inline">Livrer en Bundle</span>
                          <span className="sm:hidden">Bundle</span>
                        </button>
                      )}
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Savings badge on mobile */}
                  {hasBundle && savings > 0 && (
                    <div className="sm:hidden mt-2 flex items-center gap-1 text-xs font-medium text-green-700">
                      <Sparkles className="h-3 w-3" />
                      Economie possible: ${savings.toFixed(2)}
                    </div>
                  )}
                </div>

                {/* Expanded packages list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100 divide-y divide-gray-50">
                        {group.packages.map((pkg) => (
                          <div key={pkg.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 min-w-0 flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedPackages.includes(pkg.id)}
                                  onChange={() => handleSelectPackage(pkg.id)}
                                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900 text-sm">{pkg.trackingNumber}</span>
                                    <span className="text-xs text-gray-500">{formatDate(pkg.availableSince)}</span>
                                  </div>
                                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                                    <span>{pkg.weight} lbs</span>
                                    <span>Qty: {pkg.quantity}</span>
                                    <span>Service: ${pkg.serviceFee.toFixed(2)}</span>
                                    {pkg.customsFees > 0 && (
                                      <span className="text-red-600">Douane: ${pkg.customsFees.toFixed(2)}</span>
                                    )}
                                    <span className="font-semibold text-gray-700">${pkg.totalCost.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => handleMarkDelivered(pkg)}
                                  disabled={processingIds.includes(pkg.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                  {processingIds.includes(pkg.id) ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-3.5 w-3.5" />
                                  )}
                                  <span className="hidden sm:inline">Livrer</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedPackageForCustoms(pkg);
                                    setShowCustomsModal(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-700 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  <span className="hidden sm:inline">Douane</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {groupedByUser.length === 0 && (
            <div className="text-center py-12 theme-card rounded-2xl border border-gray-100">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No packages available</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'No packages match your search' : 'All packages have been picked up'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* === FLAT VIEW (All packages) === */}
      {viewMode === 'all' && (
        <div className="space-y-4">
          {filteredPackages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.05, 0.5) }}
              className="theme-card rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedPackages.includes(pkg.id)}
                      onChange={() => handleSelectPackage(pkg.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {pkg.trackingNumber}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Available {formatDate(pkg.availableSince)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bundle indicator if user has 2+ packages */}
                    {packages.filter(p => p.userId === pkg.userId).length >= 2 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        <Layers className="h-3 w-3" />
                        Bundle
                      </span>
                    )}
                    {pkg.isPaid ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                        <DollarSign className="h-3 w-3" />
                        Unpaid
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                      {pkg.userName ? pkg.userName.charAt(0) : '?'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pkg.userName || 'Unknown'}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        {pkg.userEmail || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="h-3 w-3" />
                        {pkg.userPhone || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{pkg.pickupLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Quantite: {pkg.quantity || 1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Weight: {pkg.weight} lbs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        Fee: <span className="font-semibold">${pkg.totalFee.toFixed(2)}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className={`h-4 w-4 ${pkg.customsFees > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                      <span className="text-gray-600">
                        Customs: <span className={`font-medium ${pkg.customsFees > 0 ? 'text-red-600' : 'text-gray-500'}`}>${pkg.customsFees.toFixed(2)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notifications Info */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold">{pkg.notificationsSent}</span>{' '}
                        notification{pkg.notificationsSent > 1 ? 's' : ''} sent
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      Last: {formatDate(pkg.lastNotified)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100 flex-wrap">
                  <button
                    onClick={() => handleMarkDelivered(pkg)}
                    disabled={processingIds.includes(pkg.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingIds.includes(pkg.id) ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        Process Delivery
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleNotifyCustomer(pkg)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Bell className="h-4 w-4" />
                    Send Reminder
                  </button>
                  {!pkg.isPaid && (
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
                      <DollarSign className="h-4 w-4" />
                      Record Payment
                    </button>
                  )}
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPackageForCustoms(pkg);
                      setShowCustomsModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {pkg.customsFees > 0 ? 'Modifier Douane' : 'Ajouter Douane'}
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Arrived: {new Date(pkg.arrivedAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">Package #{pkg.id}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State (flat view) */}
      {viewMode === 'all' && filteredPackages.length === 0 && (
        <div className="text-center py-12 theme-card rounded-2xl border border-gray-100">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No packages available</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? 'No packages match your search'
              : 'All packages have been picked up'}
          </p>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedPackages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 sm:px-6 py-4 rounded-xl shadow-2xl flex flex-col sm:flex-row items-center gap-3 sm:gap-4 z-50 max-w-[95vw]"
        >
          <span className="text-sm font-medium whitespace-nowrap">
            {selectedPackages.length} colis selectionne{selectedPackages.length > 1 ? 's' : ''}
          </span>
          <div className="h-px sm:h-6 w-full sm:w-px bg-gray-700" />
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Bundle Deliver button - only if 2+ from same user */}
            {selectedCanBundle && (
              <button
                onClick={handleOpenBundleFromSelection}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Layers className="h-4 w-4" />
                Livrer en Bundle
              </button>
            )}
            <button
              onClick={() => {
                const selectedPkgs = packages.filter(p => selectedPackages.includes(p.id));
                selectedPkgs.forEach(pkg => handleNotifyCustomer(pkg));
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Bell className="h-4 w-4" />
              Notify All
            </button>
            <button
              onClick={() => {
                setNewStatus('delivered');
                setShowStatusModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Bulk Delivery
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors"
            >
              Update Status
            </button>
          </div>
        </motion.div>
      )}

      {/* === BUNDLE DELIVERY MODAL === */}
      <AnimatePresence>
        {showBundleModal && bundleTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="theme-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-4 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Layers className="h-6 w-6" />
                    <div>
                      <h3 className="text-lg font-bold">Livraison Bundle</h3>
                      <p className="text-sm text-purple-200">
                        {bundleTarget.packageCount} colis pour {bundleTarget.userName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBundleModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Client info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {bundleTarget.userName.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{bundleTarget.userName}</div>
                    <div className="text-xs text-gray-500">{bundleTarget.userEmail} | {bundleTarget.userPhone}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="h-3 w-3" />{bundleTarget.city}</div>
                  </div>
                </div>

                {/* Packages recap */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Colis dans le Bundle</h4>
                  <div className="space-y-2">
                    {bundleTarget.packages.map((pkg, i) => (
                      <div
                        key={pkg.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          i === 0 ? 'border-gray-200 bg-white' : 'border-green-200 bg-green-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-medium text-gray-900">{pkg.trackingNumber}</span>
                            {i === 0 ? (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">1er colis</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Service $0.00</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {parseFloat(pkg.weight).toFixed(1)} lbs | Qty: {pkg.quantity}
                            {parseFloat(pkg.customsFees) > 0 && ` | Douane: $${parseFloat(pkg.customsFees).toFixed(2)}`}
                          </div>
                        </div>
                        <div className="text-right">
                          {i > 0 && (
                            <div className="text-xs text-gray-400 line-through">
                              ${parseFloat(pkg.totalCost).toFixed(2)}
                            </div>
                          )}
                          <div className="font-semibold text-sm text-gray-900">
                            ${i === 0
                              ? parseFloat(pkg.totalCost).toFixed(2)
                              : (parseFloat(pkg.totalCost) - parseFloat(pkg.serviceFee)).toFixed(2)
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Savings recap */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total original</p>
                      <p className="text-lg font-bold text-gray-400 line-through">${bundleTarget.totalCost.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600 font-medium">Economie</p>
                      <p className="text-lg font-bold text-green-600">-${bundleTarget.potentialSavings.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Bundle</p>
                      <p className="text-xl font-bold text-gray-900">${bundleTarget.bundleCost.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      <Sparkles className="h-3 w-3" />
                      1 seul frais de service au lieu de {bundleTarget.packageCount}
                    </span>
                  </div>
                </div>

                {/* Proof of delivery */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Preuve de livraison</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du destinataire
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nom de la personne qui recoit"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optionnel)
                    </label>
                    <textarea
                      value={bundleNotes}
                      onChange={(e) => setBundleNotes(e.target.value)}
                      placeholder="Notes supplementaires..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowBundleModal(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleBundleDeliver}
                    disabled={isBundleDelivering || !recipientName.trim()}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isBundleDelivering ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Livraison en cours...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Layers className="h-4 w-4" />
                        Confirmer Bundle ({bundleTarget.packageCount} colis)
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Update Modal */}
      {showStatusModal && (() => {
        const statusOrder = ['pending', 'received', 'in-transit', 'available', 'delivered'];
        const currentStatus = 'available';
        const currentIndex = statusOrder.indexOf(currentStatus);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="theme-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="h-6 w-6" />
                    <div>
                      <h3 className="text-lg font-bold">Update Package Status</h3>
                      <p className="text-sm text-primary-100">
                        {selectedPackages.length} package{selectedPackages.length > 1 ? 's' : ''} selected
                      </p>
                      <p className="text-xs text-primary-200 mt-1">
                        Can only move forward, not backward
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Status Options */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'pending', label: 'Pending', icon: '???', color: 'yellow', desc: 'Awaiting processing' },
                    { value: 'received', label: 'Received', icon: '???', color: 'blue', desc: 'At warehouse' },
                    { value: 'in-transit', label: 'In Transit', icon: '???', color: 'purple', desc: 'On the way' },
                    { value: 'available', label: 'Available', icon: '???', color: 'green', desc: 'Ready for pickup' },
                    { value: 'delivered', label: 'Delivered', icon: '???', color: 'teal', desc: 'Successfully delivered' },
                    { value: 'rejected', label: 'Rejected', icon: '???', color: 'red', desc: 'Request rejected' },
                  ].map((status) => {
                    const statusIndex = statusOrder.indexOf(status.value);
                    const isDisabled = status.value !== 'rejected' && statusIndex <= currentIndex;

                    return (
                      <motion.button
                        key={status.value}
                        onClick={() => !isDisabled && setNewStatus(status.value)}
                        disabled={isDisabled}
                        whileHover={!isDisabled ? { scale: 1.02 } : {}}
                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          isDisabled
                            ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                            : newStatus === status.value
                            ? `border-${status.color}-500 bg-${status.color}-50`
                            : 'border-gray-200 hover:border-gray-300 bg-theme-surface-solid'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-2xl ${isDisabled ? 'grayscale' : ''}`}>{status.icon}</span>
                          <div className="flex-1">
                            <div className={`font-semibold ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                              {status.label}
                            </div>
                            <div className={`text-xs mt-0.5 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                              {isDisabled ? 'Already passed' : status.desc}
                            </div>
                          </div>
                          {!isDisabled && newStatus === status.value && (
                            <CheckCircle className="h-5 w-5 text-green-600 absolute top-3 right-3" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkUpdateStatus}
                  disabled={!newStatus || isUpdating}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        );
      })()}

      {/* Customs Fees Modal */}
      {showCustomsModal && selectedPackageForCustoms && (
        <AddCustomsFeesModal
          isOpen={showCustomsModal}
          onClose={() => {
            setShowCustomsModal(false);
            setSelectedPackageForCustoms(null);
          }}
          packageData={{
            id: selectedPackageForCustoms.id,
            trackingNumber: selectedPackageForCustoms.trackingNumber,
            totalCost: selectedPackageForCustoms.totalCost.toString(),
          }}
          onSuccess={() => {
            refresh();
            refreshBundles();
            toast.success('Frais ajoutes avec succes', 'Email envoye au client');
          }}
        />
      )}
    </div>
  );
}
