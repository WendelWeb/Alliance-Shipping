'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion } from 'framer-motion';
import {
  Search,
  Plane,
  MapPin,
  Package,
  Calendar,
  Clock,
  Edit,
  CheckCircle,
  User,
  TrendingUp,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface InTransitPackage {
  id: number;
  trackingNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  destination: string;
  weight: number;
  totalFee: number;
  departedMiami: string;
  estimatedArrival: string;
  currentLocation: string;
  status: string;
  carrier: string;
  flightNumber: string;
  progress: number;
  delayed?: boolean;
}

export default function InTransitPackagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [editingLocation, setEditingLocation] = useState<number | null>(null);
  const [newLocations, setNewLocations] = useState<Record<number, string>>({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const fetchPackages = useCallback(async () => {
    const response = await fetch('/api/admin/packages?status=in-transit');

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
      departedMiami: pkg.createdAt,
      estimatedArrival: pkg.estimatedDelivery || new Date().toISOString(),
      currentLocation: pkg.currentLocation || 'In Transit',
      status: pkg.status,
      carrier: 'Air Cargo Express', // Not in schema
      flightNumber: 'N/A', // Not in schema
      progress: 50, // Default progress
    }));

    return transformedPackages;
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<InTransitPackage[]>('admin-packages-in-transit', fetchPackages);
  const packages = data || [];

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleUpdateLocation = (pkg: InTransitPackage) => {
    const newLocation = newLocations[pkg.id] || pkg.currentLocation;
    console.log('Updating location for', pkg.trackingNumber, ':', newLocation);
    // TODO: API call to update location
    setEditingLocation(null);
  };

  const handleMarkAvailable = async (pkg: InTransitPackage) => {
    setProcessingIds(prev => [...prev, pkg.id]);
    try {
      const response = await fetch('/api/admin/packages/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageIds: [pkg.id],
          status: 'available',
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Show success message
      alert(`✅ Colis ${pkg.trackingNumber} est maintenant disponible pour retrait`);

      // Refresh the list and clean up processing state
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

      // Refresh the list to reflect status changes
      refresh();

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">In Transit Packages</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track packages currently being shipped to Haiti
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
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <Plane className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              {filteredPackages.length} In Transit
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by tracking number or customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Packages List */}
      <div className="space-y-4">
        {filteredPackages.map((pkg, index) => {
          const isEditing = editingLocation === pkg.id;
          const currentLocation = newLocations[pkg.id] || pkg.currentLocation;

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="theme-card rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
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
                        Flight: {pkg.flightNumber} • {pkg.carrier}
                      </p>
                    </div>
                  </div>

                  {pkg.delayed && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                      <AlertTriangle className="h-3 w-3" />
                      Delayed
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Shipment Progress
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {pkg.progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pkg.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full ${getProgressColor(pkg.progress)}`}
                    />
                  </div>
                </div>

                {/* Customer & Destination */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                      {pkg.userName ? pkg.userName.charAt(0) : '?'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pkg.userName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{pkg.userEmail || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">
                        To: <span className="font-medium">{pkg.destination}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Weight: {pkg.weight} lbs</span>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Departed */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs font-semibold text-gray-700">Departed</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(pkg.departedMiami)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Miami, FL</p>
                    </div>

                    {/* Current Location */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-semibold text-gray-700">
                          Current Location
                        </span>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={currentLocation}
                            onChange={(e) =>
                              setNewLocations((prev) => ({
                                ...prev,
                                [pkg.id]: e.target.value,
                              }))
                            }
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                          <button
                            onClick={() => handleUpdateLocation(pkg)}
                            className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-medium text-gray-900">
                            {pkg.currentLocation}
                          </span>
                          <button
                            onClick={() => setEditingLocation(pkg.id)}
                            className="ml-1 p-0.5 hover:bg-blue-100 rounded"
                          >
                            <Edit className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Estimated Arrival */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                        <span className="text-xs font-semibold text-gray-700">
                          Est. Arrival
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock className="h-3 w-3" />
                        {formatDate(pkg.estimatedArrival)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{pkg.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <div className="flex items-center justify-between text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-gray-600">Total Fee:</span>
                    <span className="ml-2 font-bold text-gray-900">
                      ${pkg.totalFee.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Weight:</span>
                    <span className="ml-2 font-semibold text-gray-900">{pkg.weight} lbs</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleMarkAvailable(pkg)}
                    disabled={pkg.progress < 90 || processingIds.includes(pkg.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingIds.includes(pkg.id) ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Mark Available for Pickup
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPackages([pkg.id]);
                      setShowStatusModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Update Status
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <User className="h-4 w-4" />
                    Notify Customer
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12 theme-card rounded-2xl border border-gray-100">
          <Plane className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No packages in transit</h3>
          <p className="mt-1 text-sm text-gray-500">
            All packages have reached their destination
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
                setNewStatus('available');
                setShowStatusModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Mark All Available
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Edit className="h-4 w-4" />
              Update Status
            </button>
          </div>
        </motion.div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (() => {
        const statusOrder = ['pending', 'received', 'in-transit', 'available', 'delivered'];
        const currentStatus = 'in-transit';
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
                            : 'border-gray-200 hover:border-gray-300 bg-theme-surface-solid'
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
