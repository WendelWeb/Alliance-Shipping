'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';

// Mock data - Packages received in Miami warehouse
const mockReceivedPackages = [
  {
    id: 5,
    trackingNumber: 'AS-2026-00127',
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    destination: 'Cap-Haïtien',
    description: 'Electronics and accessories',
    receivedAt: '2026-01-06T08:00:00',
    weight: 0, // Not weighed yet
    declaredValue: 85.00,
    specialItemId: null,
    locationDetails: 'Warehouse A - Shelf 12',
    photos: [],
    status: 'received',
  },
  {
    id: 6,
    trackingNumber: 'AS-2026-00130',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    destination: 'Port-au-Prince',
    description: 'Clothing and shoes',
    receivedAt: '2026-01-06T09:30:00',
    weight: 4.2,
    declaredValue: 180.00,
    specialItemId: null,
    locationDetails: 'Warehouse A - Shelf 15',
    photos: ['photo1.jpg'],
    status: 'received',
  },
  {
    id: 7,
    trackingNumber: 'AS-2026-00131',
    userId: 3,
    userName: 'Bob Johnson',
    userEmail: 'bob@example.com',
    destination: 'Cap-Haïtien',
    description: 'iPhone 15 Pro',
    receivedAt: '2026-01-05T14:20:00',
    weight: 0.5,
    declaredValue: 999.00,
    specialItemId: 15, // iPhone 15 Pro
    locationDetails: 'Warehouse B - Secure Section',
    photos: ['iphone_photo.jpg'],
    status: 'received',
  },
];

export default function ReceivedPackagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [editingPackage, setEditingPackage] = useState<number | null>(null);
  const [packageWeights, setPackageWeights] = useState<Record<number, number>>({});

  const filteredPackages = mockReceivedPackages.filter(
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

  const handleSaveWeight = (pkg: typeof mockReceivedPackages[0]) => {
    const newWeight = packageWeights[pkg.id] || pkg.weight;
    console.log('Saving weight for', pkg.trackingNumber, ':', newWeight);
    // TODO: API call to update weight
    setEditingPackage(null);
  };

  const handleMarkInTransit = (pkg: typeof mockReceivedPackages[0]) => {
    console.log('Marking as in-transit:', pkg.trackingNumber);
    // TODO: API call to update status
  };

  const calculateFees = (weight: number, specialItemId: number | null) => {
    if (specialItemId) {
      // Special item has fixed fee
      return { serviceFee: 5.0, shippingFee: 20.0, total: 25.0 };
    }
    const serviceFee = 5.0;
    const shippingFee = weight * 4.0;
    return { serviceFee, shippingFee, total: serviceFee + shippingFee };
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
          const fees = calculateFees(currentWeight, pkg.specialItemId);
          const isEditing = editingPackage === pkg.id;

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
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
                      {pkg.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pkg.userName}</div>
                      <div className="text-xs text-gray-500">{pkg.userEmail}</div>
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
                          step="0.1"
                          min="0"
                          value={currentWeight}
                          onChange={(e) =>
                            handleWeightChange(pkg.id, parseFloat(e.target.value) || 0)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0.0"
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
                        <span className="font-medium">${fees.serviceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping Fee:</span>
                        <span className="font-medium">${fees.shippingFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-green-200">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-green-600">
                          ${fees.total.toFixed(2)}
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
                    disabled={currentWeight === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    Mark as In Transit
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
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
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
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors">
              <Send className="h-4 w-4" />
              Mark All In Transit
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
