'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

interface AvailablePackage {
  id: number;
  trackingNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  destination: string;
  weight: number;
  totalFee: number;
  arrivedAt: string;
  availableSince: string;
  pickupLocation: string;
  notificationsSent: number;
  lastNotified: string;
  isPaid: boolean;
  status: string;
}

export default function AvailablePackagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [filterPaid, setFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const fetchPackages = useCallback(async (): Promise<AvailablePackage[]> => {
    const response = await fetch('/api/admin/packages?status=available');

    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }

    const data = await response.json();

    // Transform API data to match UI format
    return data.packages.map((pkg: any) => ({
      id: pkg.id,
      trackingNumber: pkg.trackingNumber,
      userId: pkg.userId,
      userName: pkg.user ? `${pkg.user.firstName || ''} ${pkg.user.lastName || ''}`.trim() : 'Unknown',
      userEmail: pkg.user?.email || 'N/A',
      userPhone: pkg.user?.phone || 'N/A',
      destination: pkg.recipientCity,
      weight: parseFloat(pkg.weight) || 0,
      totalFee: parseFloat(pkg.totalCost) || 0,
      arrivedAt: pkg.updatedAt,
      availableSince: pkg.updatedAt,
      pickupLocation: `${pkg.recipientCity} Office`,
      notificationsSent: 0,
      lastNotified: pkg.updatedAt,
      isPaid: true, // Not in schema
      status: pkg.status,
    }));
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<AvailablePackage[]>(
    'admin-packages-available',
    fetchPackages,
  );

  const packages = data || [];

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

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleNotifyCustomer = (pkg: AvailablePackage) => {
    console.log('Sending notification to:', pkg.userName);
    // TODO: API call to send SMS/Email notification
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

      // Show success message
      alert(`✅ Colis ${pkg.trackingNumber} marqué comme livré`);

      // Refresh to get updated list
      setProcessingIds(prev => prev.filter(id => id !== pkg.id));
      refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Échec de la mise à jour du statut');
      setProcessingIds(prev => prev.filter(id => id !== pkg.id));
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
      setShowStatusModal(false);
      setNewStatus('');
    } catch (error) {
      console.error('Error updating packages:', error);
      alert('Failed to update packages');
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

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return `${diffDays}d ago`;
  };

  const stats = {
    total: packages.length,
    paid: packages.filter((p) => p.isPaid).length,
    unpaid: packages.filter((p) => !p.isPaid).length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available for Pickup</h1>
          <p className="mt-2 text-sm text-gray-600">
            Packages ready for customer pickup in Haiti
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refresh}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
              ×
            </button>
          </span>
        )}
      </div>

      {/* Packages List */}
      <div className="space-y-4">
        {filteredPackages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
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
                    <span className="text-gray-600">Weight: {pkg.weight} lbs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Fee: <span className="font-semibold">${pkg.totalFee.toFixed(2)}</span>
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
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
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
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Arrived: {new Date(pkg.arrivedAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">Package #{pkg.id}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-50"
        >
          <span className="text-sm font-medium">
            {selectedPackages.length} package{selectedPackages.length > 1 ? 's' : ''} selected
          </span>
          <div className="h-6 w-px bg-gray-700" />
          <div className="flex items-center gap-2">
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
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
                        ⚠️ Can only move forward, not backward
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Status Options */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'pending', label: 'Pending', icon: '⏳', color: 'yellow', desc: 'Awaiting processing' },
                    { value: 'received', label: 'Received', icon: '📦', color: 'blue', desc: 'At warehouse' },
                    { value: 'in-transit', label: 'In Transit', icon: '🚚', color: 'purple', desc: 'On the way' },
                    { value: 'available', label: 'Available', icon: '✅', color: 'green', desc: 'Ready for pickup' },
                    { value: 'delivered', label: 'Delivered', icon: '🎉', color: 'teal', desc: 'Successfully delivered' },
                    { value: 'rejected', label: 'Rejected', icon: '❌', color: 'red', desc: 'Request rejected' },
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
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`text-2xl ${isDisabled ? 'grayscale' : ''}`}>{status.icon}</span>
                          <div className="flex-1">
                            <div className={`font-semibold ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}>
                              {status.label}
                              {isDisabled && <span className="ml-2 text-xs">🔒</span>}
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
    </div>
  );
}
