'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion } from 'framer-motion';
import { useToast } from '@/components/admin/Toast';
import {
  Search,
  Filter,
  Package,
  User,
  MapPin,
  Scale,
  DollarSign,
  Edit,
  Send,
  Image as ImageIcon,
  Camera,
  CheckCircle,
  Smartphone,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface ReceivedPackage {
  id: number;
  trackingNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  destination: string;
  description: string;
  receivedAt: string;
  weight: number;
  declaredValue: number;
  specialItemId: number | null;
  locationDetails: string;
  photos: string[];
  status: string;
  // ✅ ADDED: Fetch from DB instead of calculating with hardcoded values
  serviceFee: number;
  weightCost: number;
  totalCost: number;
}

export default function ReceivedPackagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [editingPackage, setEditingPackage] = useState<number | null>(null);
  const [packageWeights, setPackageWeights] = useState<Record<number, number>>({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const fetchPackages = useCallback(async () => {
    const response = await fetch('/api/admin/packages?status=received');

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
      destination: pkg.user?.city || '-',
      description: pkg.description,
      receivedAt: pkg.createdAt,
      weight: parseFloat(pkg.weight) || 0,
      declaredValue: 0,
      specialItemId: pkg.specialItemId,
      locationDetails: pkg.locationDetails?.warehouse || 'Warehouse A',
      photos: [],
      status: pkg.status,
      // ✅ ADDED: Extract actual fees from DB
      serviceFee: parseFloat(pkg.serviceFee) || 0,
      weightCost: parseFloat(pkg.weightCost) || 0,
      totalCost: parseFloat(pkg.totalCost) || 0,
    }));

    return transformedPackages;
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<ReceivedPackage[]>('admin-packages-received', fetchPackages);
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

  const handleWeightChange = (packageId: number, weight: number) => {
    setPackageWeights((prev) => ({ ...prev, [packageId]: weight }));
  };

  const handleSaveWeight = (pkg: ReceivedPackage) => {
    const newWeight = packageWeights[pkg.id] || pkg.weight;
    console.log('Saving weight for', pkg.trackingNumber, ':', newWeight);
    // TODO: API call to update weight
    setEditingPackage(null);
  };

  const handleMarkInTransit = async (pkg: ReceivedPackage) => {
    setProcessingIds(prev => [...prev, pkg.id]);
    try {
      const response = await fetch('/api/admin/packages/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageIds: [pkg.id],
          status: 'in-transit',
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Show success message
      alert(`✅ Colis ${pkg.trackingNumber} marqué comme "En Transit"`);

      // Wait a bit then refresh the list
      setTimeout(() => {
        refresh();
        setProcessingIds(prev => prev.filter(id => id !== pkg.id));
      }, 500);
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
      if (newStatus !== 'received') {
        refresh();
      }

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

  // ✅ REMOVED hardcoded calculation - use actual fees from database
  // Fees are already calculated server-side and stored in DB

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Received Packages</h1>
          <p className="mt-2 text-sm text-gray-600">
            Process packages received in Miami warehouse
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
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              {filteredPackages.length} In Warehouse
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
          const currentWeight = packageWeights[pkg.id] ?? pkg.weight;
          // ✅ Use actual fees from database (fetched from Drizzle)
          const isEditing = editingPackage === pkg.id;

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="theme-card rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
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
                        Received {formatDate(pkg.receivedAt)}
                      </p>
                    </div>
                  </div>

                  {pkg.specialItemId && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                      <Smartphone className="h-3 w-3" />
                      Special Item
                    </span>
                  )}
                </div>

                {/* Customer & Location Info */}
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
                      <span className="text-gray-600">{pkg.locationDetails}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">{pkg.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Declared Value: ${pkg.declaredValue.toFixed(2)}
                  </p>
                </div>

                {/* Weight Input & Fees */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Weight Section */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Scale className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">Weight</span>
                      </div>
                      {!isEditing && pkg.weight === 0 && (
                        <span className="text-xs text-red-600 font-medium">Not weighed</span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={currentWeight}
                          onChange={(e) =>
                            handleWeightChange(pkg.id, parseFloat(e.target.value) || 0)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Ex: 5"
                        />
                        <span className="text-sm text-gray-600">lbs</span>
                        <button
                          onClick={() => handleSaveWeight(pkg)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {currentWeight > 0 ? `${currentWeight} lbs` : '-'}
                        </span>
                        <button
                          onClick={() => setEditingPackage(pkg.id)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fees Section */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        Calculated Fees
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Fee:</span>
                        <span className="font-medium">${pkg.serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping Fee:</span>
                        <span className="font-medium">${pkg.weightCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-green-200">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-green-600">
                          ${pkg.totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Photos */}
                {pkg.photos.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Photos ({pkg.photos.length})
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {pkg.photos.map((photo, idx) => (
                        <div
                          key={idx}
                          className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center"
                        >
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      ))}
                      <button className="h-16 w-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 transition-colors">
                        <Camera className="h-6 w-6 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleMarkInTransit(pkg)}
                    disabled={currentWeight === 0 || processingIds.includes(pkg.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingIds.includes(pkg.id) ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Mark as In Transit
                      </>
                    )}
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit className="h-4 w-4" />
                    Edit Details
                  </button>
                  {pkg.photos.length === 0 && (
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      <Camera className="h-4 w-4" />
                      Add Photos
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPackages.length === 0 && (
        <div className="text-center py-12 theme-card rounded-2xl border border-gray-100">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No packages in warehouse</h3>
          <p className="mt-1 text-sm text-gray-500">
            All received packages have been processed
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
                setNewStatus('in-transit');
                setShowStatusModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Send className="h-4 w-4" />
              Mark All In Transit
            </button>
            <button
              onClick={() => setShowStatusModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Update Status
            </button>
          </div>
        </motion.div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (() => {
        // Current status for received page is 'received'
        const statusOrder = ['pending', 'received', 'in-transit', 'available', 'delivered'];
        const currentStatus = 'received'; // Fixed for this page
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
