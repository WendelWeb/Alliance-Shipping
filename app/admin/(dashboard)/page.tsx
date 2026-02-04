'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { LoadingSpinner, CardSkeleton, SkeletonLoader } from '@/components/admin/LoadingSpinner';
import { useCachedFetch } from '@/hooks/useAdminCache';

interface DashboardStats {
  totalRevenue: number;
  activePackages: number;
  totalUsers: number;
  pendingRequests: number;
  inTransitCount: number;
  availableCount: number;
  recentPackages: { id: string; customer: string; destination: string; status: string; amount: string }[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  received: 'bg-blue-100 text-blue-800',
  'in-transit': 'bg-purple-100 text-purple-800',
  available: 'bg-green-100 text-green-800',
  delivered: 'bg-teal-100 text-teal-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const fetchDashboard = useCallback(async () => {
    const response = await fetch('/api/admin/dashboard');
    if (!response.ok) throw new Error('Failed to fetch dashboard');
    return response.json();
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<DashboardStats>(
    'admin-dashboard',
    fetchDashboard,
  );

  const dashboardData = data || {
    totalRevenue: 0,
    activePackages: 0,
    totalUsers: 0,
    pendingRequests: 0,
    inTransitCount: 0,
    availableCount: 0,
    recentPackages: [],
  };

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${dashboardData.totalRevenue.toLocaleString()}`,
      change: '',
      changeType: 'positive',
      icon: DollarSign,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      name: 'Active Packages',
      value: dashboardData.activePackages.toString(),
      change: '',
      changeType: 'positive',
      icon: Package,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Total Users',
      value: dashboardData.totalUsers.toString(),
      change: '',
      changeType: 'positive',
      icon: Users,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Pending Requests',
      value: dashboardData.pendingRequests.toString(),
      change: '',
      changeType: 'positive',
      icon: Clock,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Overview of your shipping operations
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
          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Package
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              {stat.change && (
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {stat.change}
              </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
          ))}
        </div>
      )}

      {/* Recent Packages */}
      {loading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Packages</h2>
          <a
            href="/admin/packages"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            View all →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dashboardData.recentPackages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{pkg.id}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{pkg.customer}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{pkg.destination}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[pkg.status as keyof typeof statusColors]
                      }`}
                    >
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {pkg.amount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      )}

      {/* Quick Actions */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <a
          href="/admin/packages/requested"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-medium opacity-90">Pending Requests</p>
              <p className="mt-2 text-3xl font-bold">{dashboardData.pendingRequests}</p>
            </div>
            <Package className="h-12 w-12 opacity-50" />
          </div>
          <div className="mt-4 text-sm text-white opacity-90">
            Review and approve →
          </div>
        </a>

        <a
          href="/admin/packages/in-transit"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-medium opacity-90">In Transit</p>
              <p className="mt-2 text-3xl font-bold">{dashboardData.inTransitCount}</p>
            </div>
            <TrendingUp className="h-12 w-12 opacity-50" />
          </div>
          <div className="mt-4 text-sm text-white opacity-90">
            Track packages →
          </div>
        </a>

        <a
          href="/admin/packages/available"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-medium opacity-90">Ready for Pickup</p>
              <p className="mt-2 text-3xl font-bold">{dashboardData.availableCount}</p>
            </div>
            <CheckCircle className="h-12 w-12 opacity-50" />
          </div>
          <div className="mt-4 text-sm text-white opacity-90">
            Notify customers →
          </div>
        </a>
      </motion.div>
      )}
    </div>
  );
}
