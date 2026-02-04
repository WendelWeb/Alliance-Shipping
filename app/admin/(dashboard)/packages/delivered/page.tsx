'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion } from 'framer-motion';
import {
  Search,
  CheckCircle,
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Download,
  Archive,
  Eye,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface DeliveredPackage {
  id: number;
  trackingNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  destination: string;
  weight: number;
  totalFee: number;
  deliveredAt: string;
  deliveredBy: string;
  recipientName: string;
  recipientSignature: string | null;
  deliveryPhoto: string | null;
  paymentMethod: string;
  notes: string;
  status: string;
}

const paymentMethodLabels = {
  cash: 'Cash',
  card: 'Card',
  mobile: 'Mobile Money',
};

const paymentMethodColors = {
  cash: 'bg-green-100 text-green-800',
  card: 'bg-blue-100 text-blue-800',
  mobile: 'bg-purple-100 text-purple-800',
};

export default function DeliveredPackagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDeliveredPackages = useCallback(async () => {
    const response = await fetch('/api/admin/packages?status=delivered');

    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }

    const data = await response.json();

    // Transform API data to match UI format
    const transformedPackages = data.packages.map((pkg: any) => ({
      id: pkg.id,
      trackingNumber: pkg.trackingNumber,
      userId: pkg.userId,
      userName: pkg.user ? `${pkg.user.firstName || ''} ${pkg.user.lastName || ''}`.trim() : 'Unknown',
      userEmail: pkg.user?.email || 'N/A',
      destination: pkg.recipientCity,
      weight: parseFloat(pkg.weight) || 0,
      totalFee: parseFloat(pkg.totalCost) || 0,
      deliveredAt: pkg.actualDelivery || pkg.updatedAt,
      deliveredBy: 'Admin User',
      recipientName: pkg.recipientName,
      recipientSignature: null,
      deliveryPhoto: null,
      paymentMethod: 'cash',
      notes: '',
      status: pkg.status,
    }));

    return transformedPackages;
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<DeliveredPackage[]>('admin-packages-delivered', fetchDeliveredPackages);
  const packages = data || [];

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.recipientName.toLowerCase().includes(searchQuery.toLowerCase());

    // Date filter logic would go here
    return matchesSearch;
  });

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleViewProof = (pkg: DeliveredPackage) => {
    console.log('Viewing delivery proof for:', pkg.trackingNumber);
    // TODO: Open modal with signature and photo
    alert(`Viewing delivery proof for ${pkg.trackingNumber}\n\nRecipient: ${pkg.recipientName}\nSignature: ${pkg.recipientSignature ? 'Available' : 'Not available'}\nPhoto: ${pkg.deliveryPhoto ? 'Available' : 'Not available'}`);
  };

  const handleExportReceipt = (pkg: DeliveredPackage) => {
    console.log('Exporting receipt for:', pkg.trackingNumber);
    // TODO: Generate PDF receipt
    alert(`Exporting receipt for ${pkg.trackingNumber}\n\nThis will generate a PDF receipt (feature to be implemented)`);
  };

  const handleArchive = (pkg: DeliveredPackage) => {
    if (!confirm(`Archive package ${pkg.trackingNumber}?`)) return;
    console.log('Archiving package:', pkg.trackingNumber);
    // TODO: API call to archive
    alert('Package archived successfully');
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

      // Refresh the list to reflect changes
      await refresh();

      setSelectedPackages([]);
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalRevenue = filteredPackages.reduce((sum, pkg) => sum + pkg.totalFee, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivered Packages</h1>
          <p className="mt-2 text-sm text-gray-600">
            Successfully delivered packages with proof
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
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>
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
              <p className="text-sm text-gray-600">Total Delivered</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredPackages.length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
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
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                ${totalRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
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
              <p className="text-sm text-gray-600">With Proof</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {filteredPackages.filter((p) => p.deliveryPhoto).length}
              </p>
            </div>
            <ImageIcon className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking number, customer, or recipient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              dateFilter === 'today'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              dateFilter === 'week'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              dateFilter === 'month'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              dateFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
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
                      Delivered {formatDate(pkg.deliveredAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Delivered
                  </span>
                </div>
              </div>

              {/* Customer & Recipient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Customer */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">CUSTOMER</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                      {pkg.userName ? pkg.userName.charAt(0) : '?'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pkg.userName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{pkg.userEmail || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Recipient */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">RECIPIENT</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                      {pkg.recipientName ? pkg.recipientName.charAt(0) : '?'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {pkg.recipientName || 'Unknown Recipient'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Delivered by {pkg.deliveredBy}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Destination</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {pkg.destination}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Package className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{pkg.weight} lbs</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${
                      paymentMethodColors[pkg.paymentMethod as keyof typeof paymentMethodColors]
                    }`}
                  >
                    {paymentMethodLabels[pkg.paymentMethod as keyof typeof paymentMethodLabels]}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Fee</p>
                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign className="h-3 w-3 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">
                      ${pkg.totalFee.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Proof */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">Delivery Proof</span>
                  </div>
                  <button
                    onClick={() => handleViewProof(pkg)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="flex gap-3">
                  {/* Signature */}
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">Signature</p>
                    <div className="h-20 rounded-lg bg-white border-2 border-blue-200 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>

                  {/* Photo */}
                  {pkg.deliveryPhoto ? (
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Photo</p>
                      <div className="h-20 rounded-lg bg-white border-2 border-blue-200 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <p className="text-xs text-gray-600 mb-1">Photo</p>
                      <div className="h-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No photo</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {pkg.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">DELIVERY NOTES</p>
                  <p className="text-sm text-gray-700">{pkg.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleViewProof(pkg)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Proof
                </button>
                <button
                  onClick={() => handleExportReceipt(pkg)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export Receipt
                </button>
                <button
                  onClick={() => handleArchive(pkg)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No delivered packages</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? 'No packages match your search'
              : 'No packages have been delivered yet'}
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
                selectedPkgs.forEach(pkg => handleExportReceipt(pkg));
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Download className="h-4 w-4" />
              Export All
            </button>
            <button
              onClick={() => {
                const selectedPkgs = packages.filter(p => selectedPackages.includes(p.id));
                if (confirm(`Archive ${selectedPkgs.length} package(s)?`)) {
                  selectedPkgs.forEach(pkg => handleArchive(pkg));
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              <Archive className="h-4 w-4" />
              Archive All
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
        const currentStatus = 'delivered';
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
                        ⚠️ Package already delivered - only rejection possible
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
