'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { LoadingSpinner, CardSkeleton, SkeletonLoader } from '@/components/admin/LoadingSpinner';

interface AnalyticsData {
  totalRevenue: number;
  totalPackages: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  packageGrowth: number;
  customerGrowth: number;
  monthlyRevenue: { month: string; revenue: number; packages: number }[];
  topCustomers: { id: number; name: string; packages: number; revenue: number }[];
  revenueByDestination: { destination: string; packages: number; revenue: number; percentage: number }[];
  paymentMethods: { method: string; count: number; revenue: number; percentage: number }[];
}

const defaultAnalytics: AnalyticsData = {
  totalRevenue: 0,
  totalPackages: 0,
  totalCustomers: 0,
  averageOrderValue: 0,
  revenueGrowth: 0,
  packageGrowth: 0,
  customerGrowth: 0,
  monthlyRevenue: [],
  topCustomers: [],
  revenueByDestination: [],
  paymentMethods: [],
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const fetchAnalytics = useCallback(async () => {
    const response = await fetch('/api/admin/analytics');
    if (!response.ok) throw new Error('Failed to fetch analytics');
    return response.json();
  }, []);

  const { data, loading, refreshing, refresh } = useCachedFetch<AnalyticsData>(
    'admin-analytics',
    fetchAnalytics,
  );

  const analytics = data || defaultAnalytics;

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      change: `+${analytics.revenueGrowth}%`,
      changeType: 'positive' as const,
      icon: DollarSign,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      name: 'Total Packages',
      value: analytics.totalPackages.toString(),
      change: `+${analytics.packageGrowth}%`,
      changeType: 'positive' as const,
      icon: Package,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Total Customers',
      value: analytics.totalCustomers.toString(),
      change: `+${analytics.customerGrowth}%`,
      changeType: 'positive' as const,
      icon: Users,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Avg. Order Value',
      value: `$${analytics.averageOrderValue.toFixed(2)}`,
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-5 w-72 bg-gray-200 rounded animate-pulse" />
        </div>
        <CardSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Revenue</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track revenue, packages, and business insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 theme-card border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                timeRange === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                timeRange === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                timeRange === 'year'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Year
            </button>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors">
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-2xl theme-card p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-semibold ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="theme-card rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Monthly Revenue</h2>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary-600" />
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {analytics.monthlyRevenue.map((item) => {
              const maxRevenue = Math.max(...analytics.monthlyRevenue.map((r) => r.revenue));
              const percentage = (item.revenue / maxRevenue) * 100;

              return (
                <div key={item.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.month}</span>
                    <span className="text-sm font-bold text-gray-900">
                      ${item.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Revenue by Destination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="theme-card rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue by Destination</h2>

          <div className="space-y-6">
            {analytics.revenueByDestination.map((item) => (
              <div key={item.destination}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {item.destination.split('-')[0].charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.destination}</p>
                      <p className="text-xs text-gray-500">{item.packages} packages</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ${item.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">{item.percentage}%</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="theme-card rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Top Customers</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
              View All →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Packages
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.topCustomers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : index === 1
                            ? 'bg-gray-200 text-gray-700'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{customer.packages}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">
                        ${customer.revenue.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="theme-card rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h2>

          <div className="space-y-4">
            {analytics.paymentMethods.map((method) => {
              const colors = {
                Cash: 'from-green-500 to-green-600',
                Card: 'from-blue-500 to-blue-600',
                'Mobile Money': 'from-purple-500 to-purple-600',
              };

              return (
                <div key={method.method}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-br ${
                          colors[method.method as keyof typeof colors]
                        } flex items-center justify-center text-white`}
                      >
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{method.method}</p>
                        <p className="text-xs text-gray-500">{method.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ${method.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{method.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${method.percentage}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                      className={`h-full bg-gradient-to-r ${
                        colors[method.method as keyof typeof colors]
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Total Revenue</span>
              <span className="text-lg font-bold text-primary-600">
                ${analytics.totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
