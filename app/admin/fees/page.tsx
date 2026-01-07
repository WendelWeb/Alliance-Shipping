'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Edit,
  Save,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  History,
  Plus,
} from 'lucide-react';
import { LoadingSpinner, CardSkeleton, SkeletonLoader } from '@/components/admin/LoadingSpinner';

// Mock data - Current fee configuration
const mockCurrentFees = {
  serviceFee: 5.00,
  shippingFeePerLb: 4.00,
  lastUpdated: '2026-01-01T00:00:00',
  updatedBy: 'Super Admin',
  effectiveDate: '2026-01-01',
};

// Mock fee history
const mockFeeHistory = [
  {
    id: 1,
    serviceFee: 5.00,
    shippingFeePerLb: 4.00,
    effectiveDate: '2026-01-01',
    createdAt: '2025-12-28T10:00:00',
    createdBy: 'Super Admin',
    status: 'active',
  },
  {
    id: 2,
    serviceFee: 5.00,
    shippingFeePerLb: 3.50,
    effectiveDate: '2025-10-01',
    createdAt: '2025-09-25T14:30:00',
    createdBy: 'Super Admin',
    status: 'expired',
  },
  {
    id: 3,
    serviceFee: 4.50,
    shippingFeePerLb: 3.50,
    effectiveDate: '2025-07-01',
    createdAt: '2025-06-20T09:15:00',
    createdBy: 'Admin User',
    status: 'expired',
  },
];

export default function FeesPage() {
  const [loading, setLoading] = useState(true);
  const [currentFees, setCurrentFees] = useState(mockCurrentFees);
  const [isEditing, setIsEditing] = useState(false);
  const [serviceFee, setServiceFee] = useState(mockCurrentFees.serviceFee);
  const [shippingFeePerLb, setShippingFeePerLb] = useState(mockCurrentFees.shippingFeePerLb);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const loadFees = async () => {
      setLoading(true);
      try {
        // No simulation delay for instant loading
        await new Promise((resolve) => setTimeout(resolve, 0));

        // TODO: Replace with real API call
        // const response = await fetch('/api/admin/fees');
        // const data = await response.json();
        // setCurrentFees(data);

        setCurrentFees(mockCurrentFees);
        setServiceFee(mockCurrentFees.serviceFee);
        setShippingFeePerLb(mockCurrentFees.shippingFeePerLb);
      } catch (error) {
        console.error('Error loading fees:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFees();
  }, []);

  const handleSave = () => {
    console.log('Saving fees:', { serviceFee, shippingFeePerLb, effectiveDate });
    // TODO: API call to save fees
    setIsEditing(false);
  };

  const handleCancel = () => {
    setServiceFee(mockCurrentFees.serviceFee);
    setShippingFeePerLb(mockCurrentFees.shippingFeePerLb);
    setEffectiveDate('');
    setIsEditing(false);
  };

  const calculateExampleFees = (weight: number) => {
    const shipping = weight * shippingFeePerLb;
    const total = serviceFee + shipping;
    return { shipping, total };
  };

  const exampleWeights = [1, 5, 10, 20];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-56 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-80 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure service and shipping fees
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          <History className="h-5 w-5" />
          {showHistory ? 'Hide' : 'Show'} History
        </button>
      </div>

      {/* Current Fees Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 border border-primary-100"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Current Fee Structure</h2>
              <p className="text-sm text-gray-600">
                Effective since {formatDate(mockCurrentFees.effectiveDate)}
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit className="h-5 w-5" />
              Edit Fees
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Service Fee */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-700">
                Service Fee (Fixed)
              </label>
              {!isEditing && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </span>
              )}
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(parseFloat(e.target.value) || 0)}
                  className="flex-1 text-3xl font-bold text-gray-900 border-b-2 border-primary-500 focus:outline-none bg-transparent"
                />
              </div>
            ) : (
              <p className="text-4xl font-bold text-primary-600">
                ${serviceFee.toFixed(2)}
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Fixed fee applied to all packages
            </p>
          </div>

          {/* Shipping Fee Per Lb */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-gray-700">
                Shipping Fee (Per Lb)
              </label>
              {!isEditing && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </span>
              )}
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-400">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={shippingFeePerLb}
                  onChange={(e) => setShippingFeePerLb(parseFloat(e.target.value) || 0)}
                  className="flex-1 text-3xl font-bold text-gray-900 border-b-2 border-primary-500 focus:outline-none bg-transparent"
                />
                <span className="text-xl font-medium text-gray-500">/ lb</span>
              </div>
            ) : (
              <p className="text-4xl font-bold text-primary-600">
                ${shippingFeePerLb.toFixed(2)}
                <span className="text-xl text-gray-500"> / lb</span>
              </p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Variable fee based on package weight
            </p>
          </div>
        </div>

        {/* Effective Date */}
        {isEditing && (
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  When should these new fees take effect?
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Leave blank to make changes effective immediately
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-5 w-5" />
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
          </div>
        )}
      </motion.div>

      {/* Fee Calculator / Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Fee Calculator Examples</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Weight
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Service Fee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Shipping Fee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exampleWeights.map((weight) => {
                const fees = calculateExampleFees(weight);
                return (
                  <tr key={weight} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {weight} lbs
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        ${serviceFee.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        ${fees.shipping.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-primary-600">
                        ${fees.total.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Fee History */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-900">Fee Change History</h3>
          </div>

          <div className="space-y-4">
            {mockFeeHistory.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          record.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {record.status === 'active' ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {record.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        Effective: {formatDate(record.effectiveDate)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created by {record.createdBy} on {formatDate(record.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Service Fee</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${record.serviceFee.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Shipping / Lb</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${record.shippingFeePerLb.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Example (5 lbs)</p>
                    <p className="text-sm font-semibold text-primary-600">
                      ${(record.serviceFee + 5 * record.shippingFeePerLb).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
