'use client';

import { useState } from 'react';
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
} from 'lucide-react';

// Mock data - Packages in transit to Haiti
const mockInTransitPackages = [
  {
    id: 1,
    trackingNumber: 'AS-2026-00123',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    destination: 'Cap-Haïtien',
    weight: 5.5,
    totalFee: 27.00,
    departedMiami: '2026-01-05T10:00:00',
    estimatedArrival: '2026-01-08T14:00:00',
    currentLocation: 'Port-au-Prince Airport',
    status: 'in-transit',
    carrier: 'Air Cargo Express',
    flightNumber: 'ACX-2134',
    progress: 75, // percentage
  },
  {
    id: 2,
    trackingNumber: 'AS-2026-00132',
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    destination: 'Port-au-Prince',
    weight: 3.2,
    totalFee: 17.80,
    departedMiami: '2026-01-06T08:30:00',
    estimatedArrival: '2026-01-09T12:00:00',
    currentLocation: 'In Flight',
    status: 'in-transit',
    carrier: 'Haiti Air Freight',
    flightNumber: 'HAF-891',
    progress: 40,
  },
  {
    id: 3,
    trackingNumber: 'AS-2026-00133',
    userId: 3,
    userName: 'Bob Johnson',
    userEmail: 'bob@example.com',
    destination: 'Cap-Haïtien',
    weight: 8.0,
    totalFee: 37.00,
    departedMiami: '2026-01-04T16:00:00',
    estimatedArrival: '2026-01-07T10:00:00',
    currentLocation: 'Cap-Haïtien Customs',
    status: 'in-transit',
    carrier: 'Air Cargo Express',
    flightNumber: 'ACX-2130',
    progress: 90,
    delayed: true,
  },
];

export default function InTransitPackagesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [editingLocation, setEditingLocation] = useState<number | null>(null);
  const [newLocations, setNewLocations] = useState<Record<number, string>>({});

  const filteredPackages = mockInTransitPackages.filter(
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

  const handleUpdateLocation = (pkg: typeof mockInTransitPackages[0]) => {
    const newLocation = newLocations[pkg.id] || pkg.currentLocation;
    console.log('Updating location for', pkg.trackingNumber, ':', newLocation);
    // TODO: API call to update location
    setEditingLocation(null);
  };

  const handleMarkAvailable = (pkg: typeof mockInTransitPackages[0]) => {
    console.log('Marking as available:', pkg.trackingNumber);
    // TODO: API call to update status
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
                    disabled={pkg.progress < 90}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Available for Pickup
                  </button>
                  <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
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
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
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
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
              <CheckCircle className="h-4 w-4" />
              Mark All Available
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
              <User className="h-4 w-4" />
              Notify Customers
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
