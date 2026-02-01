'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { LoadingSpinner, CardSkeleton, SkeletonLoader } from '@/components/admin/LoadingSpinner';

// Mock data - Replace with real API data
const mockAnalytics = {
  totalRevenue: 15420.50,
  totalPackages: 156,
  totalCustomers: 89,
  averageOrderValue: 98.85,
  revenueGrowth: 12.5,
  packageGrowth: 8.2,
  customerGrowth: 15.3,

  // Revenue by month
  monthlyRevenue: [
    { month: 'Jan', revenue: 3200, packages: 42 },
    { month: 'Feb', revenue: 3800, packages: 48 },
    { month: 'Mar', revenue: 4100, packages: 52 },
    { month: 'Apr', revenue: 4320, packages: 54 },
  ],

  // Top customers
  topCustomers: [
    { id: 1, name: 'John Doe', packages: 15, revenue: 1245.00 },
    { id: 2, name: 'Jane Smith', packages: 12, revenue: 980.00 },
    { id: 3, name: 'Bob Johnson', packages: 10, revenue: 875.00 },
    { id: 4, name: 'Sarah Williams', packages: 8, revenue: 720.00 },
    { id: 5, name: 'Mike Brown', packages: 7, revenue: 650.00 },
  ],

  // Revenue by destination
  revenueByDestination: [
    { destination: 'Port-au-Prince', packages: 89, revenue: 8950.00, percentage: 58 },
    { destination: 'Cap-Haïtien', packages: 67, revenue: 6470.50, percentage: 42 },
  ],

  // Payment methods
  paymentMethods: [
    { method: 'Cash', count: 92, revenue: 9200.00, percentage: 60 },
    { method: 'Card', count: 38, revenue: 3800.00, percentage: 25 },
    { method: 'Mobile Money', count: 26, revenue: 2420.50, percentage: 15 },
  ],
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // No simulation delay for instant loading
        await new Promise((resolve) => setTimeout(resolve, 0));

        // TODO: Replace with real API call
        // const response = await fetch('/api/admin/analytics');
        // const data = await response.json();
        // setAnalytics(data);

        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${mockAnalytics.totalRevenue.toLocaleString()}`,
      change: `+${mockAnalytics.revenueGrowth}%`,
      changeType: 'positive' as const,
      icon: DollarSign,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      name: 'Total Packages',
      value: mockAnalytics.totalPackages.toString(),
      change: `+${mockAnalytics.packageGrowth}%`,
      changeType: 'positive' as const,
      icon: Package,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Total Customers',
      value: mockAnalytics.totalCustomers.toString(),
      change: `+${mockAnalytics.customerGrowth}%`,
      changeType: 'positive' as const,
      icon: Users,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Avg. Order Value',
      value: `$${mockAnalytics.averageOrderValue.toFixed(2)}`,
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
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
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
            className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
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
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
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
            {mockAnalytics.monthlyRevenue.map((item) => {
              const maxRevenue = Math.max(...mockAnalytics.monthlyRevenue.map((r) => r.revenue));
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
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue by Destination</h2>

          <div className="space-y-6">
            {mockAnalytics.revenueByDestination.map((item) => (
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
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
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
                {mockAnalytics.topCustomers.map((customer, index) => (
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
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Methods</h2>

          <div className="space-y-4">
            {mockAnalytics.paymentMethods.map((method) => {
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
                ${mockAnalytics.totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
