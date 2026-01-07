'use client';

import { useState } from 'react';
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
} from 'lucide-react';

// Mock data - Delivered packages
const mockDeliveredPackages = [
  {
    id: 4,
    trackingNumber: 'AS-2026-00126',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    destination: 'Port-au-Prince',
    weight: 8.0,
    totalFee: 37.00,
    deliveredAt: '2026-01-05T15:30:00',
    deliveredBy: 'Admin User',
    recipientName: 'John Doe',
    recipientSignature: 'signature1.jpg',
    deliveryPhoto: 'delivery1.jpg',
    paymentMethod: 'cash',
    notes: 'Delivered in perfect condition',
    status: 'delivered',
  },
  {
    id: 10,
    trackingNumber: 'AS-2026-00136',
    userId: 2,
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    destination: 'Cap-Haïtien',
    weight: 4.5,
    totalFee: 23.00,
    deliveredAt: '2026-01-04T11:20:00',
    deliveredBy: 'Admin User',
    recipientName: 'Marie Smith (Sister)',
    recipientSignature: 'signature2.jpg',
    deliveryPhoto: 'delivery2.jpg',
    paymentMethod: 'card',
    notes: 'Picked up by family member',
    status: 'delivered',
  },
  {
    id: 11,
    trackingNumber: 'AS-2026-00137',
    userId: 3,
    userName: 'Bob Johnson',
    userEmail: 'bob@example.com',
    destination: 'Port-au-Prince',
    weight: 2.3,
    totalFee: 14.20,
    deliveredAt: '2026-01-03T09:45:00',
    deliveredBy: 'Admin User',
    recipientName: 'Bob Johnson',
    recipientSignature: 'signature3.jpg',
    deliveryPhoto: null,
    paymentMethod: 'mobile',
    notes: '',
    status: 'delivered',
  },
];

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

  const filteredPackages = mockDeliveredPackages.filter((pkg) => {
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

  const handleViewProof = (pkg: typeof mockDeliveredPackages[0]) => {
    console.log('Viewing delivery proof for:', pkg.trackingNumber);
    // TODO: Open modal with signature and photo
  };

  const handleExportReceipt = (pkg: typeof mockDeliveredPackages[0]) => {
    console.log('Exporting receipt for:', pkg.trackingNumber);
    // TODO: Generate PDF receipt
  };

  const handleArchive = (pkg: typeof mockDeliveredPackages[0]) => {
    console.log('Archiving package:', pkg.trackingNumber);
    // TODO: API call to archive
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
                      {pkg.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pkg.userName}</div>
                      <div className="text-xs text-gray-500">{pkg.userEmail}</div>
                    </div>
                  </div>
                </div>

                {/* Recipient */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">RECIPIENT</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                      {pkg.recipientName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {pkg.recipientName}
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
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
              <Download className="h-4 w-4" />
              Export All
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
              <Archive className="h-4 w-4" />
              Archive All
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
