'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Package,
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  Eye,
  MoreVertical,
} from 'lucide-react';
import { LoadingSpinner, SkeletonLoader } from '@/components/admin/LoadingSpinner';

// Mock data - Package requests awaiting approval
const mockRequests = [
  {
    id: 1,
    trackingNumber: 'AS-2026-00125',
    userId: 3,
    userName: 'Bob Johnson',
    userEmail: 'bob@example.com',
    userPhone: '+1 305-555-0125',
    destination: 'Cap-Haïtien',
    description: 'Electronics and clothing',
    estimatedWeight: 5.0,
    declaredValue: 300.00,
    status: 'pending',
    requestedAt: '2026-01-06T10:30:00',
    priority: 'normal',
  },
  {
    id: 2,
    trackingNumber: 'AS-2026-00128',
    userId: 4,
    userName: 'Sarah Williams',
    userEmail: 'sarah@example.com',
    userPhone: '+1 305-555-0130',
    destination: 'Port-au-Prince',
    description: 'Documents and small items',
    estimatedWeight: 1.5,
    declaredValue: 50.00,
    status: 'pending',
    requestedAt: '2026-01-06T09:15:00',
    priority: 'urgent',
  },
  {
    id: 3,
    trackingNumber: 'AS-2026-00129',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '+1 305-555-0123',
    destination: 'Cap-Haïtien',
    description: 'Gift items for family',
    estimatedWeight: 3.2,
    declaredValue: 150.00,
    status: 'pending',
    requestedAt: '2026-01-05T16:45:00',
    priority: 'normal',
  },
];

const priorityColors = {
  urgent: 'bg-red-100 text-red-800 border-red-200',
  normal: 'bg-blue-100 text-blue-800 border-blue-200',
  low: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function RequestedPackagesPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState(mockRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<typeof mockRequests[0] | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 0));
        setRequests(mockRequests);
      } catch (error) {
        console.error('Error loading requests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  const filteredRequests = requests.filter(
    (req) =>
      req.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRequest = (requestId: number) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleApprove = (request: typeof mockRequests[0]) => {
    console.log('Approving request:', request.id);
    // TODO: API call to approve
  };

  const handleReject = (request: typeof mockRequests[0]) => {
    console.log('Rejecting request:', request.id);
    // TODO: API call to reject
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-80 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
        <SkeletonLoader rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Package Requests</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and approve package requests from customers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-700">
              {filteredRequests.length} Pending
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

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                {/* Left: Request Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedRequests.includes(request.id)}
                      onChange={() => handleSelectRequest(request.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />

                    {/* Tracking Number */}
                    <h3 className="text-lg font-bold text-gray-900">
                      {request.trackingNumber}
                    </h3>

                    {/* Priority Badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${
                        priorityColors[request.priority as keyof typeof priorityColors]
                      }`}
                    >
                      {request.priority === 'urgent' && <AlertCircle className="h-3 w-3" />}
                      {request.priority.toUpperCase()}
                    </span>

                    {/* Time Badge */}
                    <span className="text-xs text-gray-500">
                      {formatDate(request.requestedAt)}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                        {request.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.userName}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          {request.userEmail}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          {request.userPhone}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Destination: <span className="font-medium">{request.destination}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Est. Weight:{' '}
                          <span className="font-medium">{request.estimatedWeight} lbs</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Description:</span>{' '}
                      {request.description}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium text-gray-700">Declared Value:</span> $
                      {request.declaredValue.toFixed(2)}
                    </p>
                  </div>

                  {/* Estimated Fees */}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Service Fee:</span>
                      <span className="ml-2 font-semibold text-gray-900">$5.00</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Shipping Fee:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        ${(request.estimatedWeight * 4).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-bold text-primary-600">
                        ${(5 + request.estimatedWeight * 4).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 ml-6">
                  <button
                    onClick={() => handleApprove(request)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="h-5 w-5" />
                    Details
                  </button>
                </div>
              </div>
            </div>

            {/* Divider with info */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Request ID: #{request.id}</span>
                <span>•</span>
                <span>User ID: #{request.userId}</span>
              </div>
              <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                <MoreVertical className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">
            No pending package requests at the moment
          </p>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 z-50"
        >
          <span className="text-sm font-medium">
            {selectedRequests.length} request{selectedRequests.length > 1 ? 's' : ''} selected
          </span>
          <div className="h-6 w-px bg-gray-700" />
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors">
              <CheckCircle className="h-4 w-4" />
              Approve All
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
              <XCircle className="h-4 w-4" />
              Reject All
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
