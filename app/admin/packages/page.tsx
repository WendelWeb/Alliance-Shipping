'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Package,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { LoadingSpinner, SkeletonLoader, CardSkeleton } from '@/components/admin/LoadingSpinner';

// Mock data - Replace with real API data
const mockPackages = [
  {
    id: 1,
    trackingNumber: 'AS-2026-00123',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    destination: 'Cap-Haïtien',
    status: 'in-transit',
    weight: 5.5,
    declaredValue: 250.00,
    serviceFee: 5.00,
    shippingFee: 22.00,
    totalFee: 27.00,
    createdAt: '2026-01-05',
    updatedAt: '2026-01-06',
    assignedAdmin: 'Admin User',
  },
  {
    id: 2,
    trackingNumber: 'AS-2026-00124',
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    destination: 'Port-au-Prince',
    status: 'available',
    weight: 3.2,
    declaredValue: 120.00,
    serviceFee: 5.00,
    shippingFee: 12.80,
    totalFee: 17.80,
    createdAt: '2026-01-04',
    updatedAt: '2026-01-06',
    assignedAdmin: 'Admin User',
  },
  {
    id: 3,
    trackingNumber: 'AS-2026-00125',
    userId: 3,
    userName: 'Bob Johnson',
    userEmail: 'bob@example.com',
    destination: 'Cap-Haïtien',
    status: 'requested',
    weight: 0,
    declaredValue: 0,
    serviceFee: 0,
    shippingFee: 0,
    totalFee: 0,
    createdAt: '2026-01-06',
    updatedAt: '2026-01-06',
    assignedAdmin: null,
  },
  {
    id: 4,
    trackingNumber: 'AS-2026-00126',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    destination: 'Port-au-Prince',
    status: 'delivered',
    weight: 8.0,
    declaredValue: 500.00,
    serviceFee: 5.00,
    shippingFee: 32.00,
    totalFee: 37.00,
    createdAt: '2025-12-28',
    updatedAt: '2026-01-05',
    assignedAdmin: 'Admin User',
  },
  {
    id: 5,
    trackingNumber: 'AS-2026-00127',
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    destination: 'Cap-Haïtien',
    status: 'received',
    weight: 2.1,
    declaredValue: 85.00,
    serviceFee: 5.00,
    shippingFee: 8.40,
    totalFee: 13.40,
    createdAt: '2026-01-05',
    updatedAt: '2026-01-06',
    assignedAdmin: 'Admin User',
  },
];

const statusColors = {
  requested: 'bg-yellow-100 text-yellow-800',
  received: 'bg-blue-100 text-blue-800',
  'in-transit': 'bg-purple-100 text-purple-800',
  available: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800',
};

const statusLabels = {
  requested: 'Requested',
  received: 'Received',
  'in-transit': 'In Transit',
  available: 'Available',
  delivered: 'Delivered',
};

export default function AllPackagesPage() {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState(mockPackages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadPackages = async () => {
      setLoading(true);
      try {
        // No simulation delay for instant loading
        await new Promise((resolve) => setTimeout(resolve, 0));

        // TODO: Replace with real API call
        // const response = await fetch('/api/admin/packages');
        // const data = await response.json();
        // setPackages(data.packages);

        setPackages(mockPackages);
      } catch (error) {
        console.error('Error loading packages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, []);

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSelectPackage = (packageId: number) => {
    setSelectedPackages((prev) =>
      prev.includes(packageId)
        ? prev.filter((id) => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPackages(filteredPackages.map((p) => p.id));
    } else {
      setSelectedPackages([]);
    }
  };

  // Stats
  const stats = {
    total: packages.length,
    requested: packages.filter((p) => p.status === 'requested').length,
    received: packages.filter((p) => p.status === 'received').length,
    inTransit: packages.filter((p) => p.status === 'in-transit').length,
    available: packages.filter((p) => p.status === 'available').length,
    delivered: packages.filter((p) => p.status === 'delivered').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Packages</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and track all packages across all statuses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Package
          </Link>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <CardSkeleton count={6} />
      ) : (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setStatusFilter('all')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
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
          onClick={() => setStatusFilter('requested')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requested</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.requested}</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setStatusFilter('received')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Received</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.received}</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setStatusFilter('in-transit')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Transit</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.inTransit}</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-purple-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setStatusFilter('available')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.available}</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setStatusFilter('delivered')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.delivered}</p>
            </div>
            <div className="h-3 w-3 rounded-full bg-gray-500" />
          </div>
        </motion.div>
      </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking number, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Filter Badge */}
      {statusFilter !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Active filter:</span>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
            {statusLabels[statusFilter as keyof typeof statusLabels]}
            <button
              onClick={() => setStatusFilter('all')}
              className="hover:bg-primary-100 rounded-full p-0.5"
            >
              ×
            </button>
          </span>
        </div>
      )}

      {/* Packages Table */}
      {loading ? (
        <SkeletonLoader rows={10} />
      ) : (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPackages.length === filteredPackages.length && filteredPackages.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPackages.includes(pkg.id)}
                      onChange={() => handleSelectPackage(pkg.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-primary-600">
                      {pkg.trackingNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                        {pkg.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{pkg.userName}</div>
                        <div className="text-xs text-gray-500">{pkg.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{pkg.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[pkg.status as keyof typeof statusColors]
                      }`}
                    >
                      {statusLabels[pkg.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {pkg.weight > 0 ? `${pkg.weight} lbs` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">
                        {pkg.totalFee > 0 ? pkg.totalFee.toFixed(2) : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{pkg.createdAt}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="View details"
                      >
                        <Eye className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredPackages.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">1-{filteredPackages.length}</span> of{' '}
              <span className="font-medium">{filteredPackages.length}</span> packages
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </motion.div>
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
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-medium transition-colors">
              Update Status
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
              Assign Admin
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
              Delete
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
