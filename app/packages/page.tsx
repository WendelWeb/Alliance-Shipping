'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  Package,
  Plus,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plane,
  TruckIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface PackageData {
  id: number;
  trackingNumber: string;
  status: string;
  description: string;
  weight: string;
  totalCost: string;
  currentLocation: string;
  estimatedDelivery: string | null;
  recipientName: string;
  recipientCity: string;
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    status: string;
    location: string;
    description?: string;
    date: string;
    pending?: boolean;
  }>;
}

export default function PackagesPage() {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);

  // Helper function to translate text (handles both translation keys and regular text)
  const translateText = (text: string): string => {
    if (!text) return text;

    // If text starts with "packages.", it's a translation key
    if (text.startsWith('packages.')) {
      const keys = text.split('.');
      let value: any = t;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) return text; // Return original if key not found
      }
      return value;
    }

    return text; // Return original text if not a translation key
  };

  // Fetch user packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      if (!isLoaded || !user) return;

      setLoading(true);
      try {
        const response = await fetch('/api/user/packages');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const data = await response.json();
        setPackages(data.packages || []);
      } catch (error) {
        console.error('Error fetching packages:', error);
        setPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [user, isLoaded]);

  const statusConfig: Record<string, any> = {
    pending: { label: t.packages.status.pending, color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
    rejected: { label: t.packages.status.rejected, color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle },
    received: { label: t.packages.status.received, color: 'text-blue-600', bg: 'bg-blue-100', icon: Package },
    'in-transit': { label: t.packages.status['in-transit'], color: 'text-blue-600', bg: 'bg-blue-100', icon: Plane },
    customs: { label: t.packages.status.customs, color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertCircle },
    available: { label: t.packages.status.available, color: 'text-purple-600', bg: 'bg-purple-100', icon: Package },
    delivered: { label: t.packages.status.delivered, color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
  };

  // Filter and sort packages
  const filteredAndSortedPackages = packages
    .filter(pkg => {
      // Filter by status
      if (statusFilter !== 'all' && pkg.status !== statusFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery && !pkg.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !pkg.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Put delivered and rejected packages at the bottom
      const aIsBottom = a.status === 'delivered' || a.status === 'rejected';
      const bIsBottom = b.status === 'delivered' || b.status === 'rejected';

      if (aIsBottom && !bIsBottom) return 1;
      if (!aIsBottom && bIsBottom) return -1;

      // Otherwise sort by most recent first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Container>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-display">
                  {t.packages.title}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.packages.subtitle}
                </p>
              </div>

              <Link href="/dashboard/request-package">
                <Button size="md" className="group sm:text-lg sm:px-7 sm:py-3.5">
                  <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                  {t.packages.createPackage}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-4 backdrop-blur-xl bg-white/80">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.packages.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </Card>
          </motion.div>

          {/* Status Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {t.packages.filters.all} ({packages.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {t.packages.filters.pending} ({packages.filter(p => p.status === 'pending').length})
              </button>
              <button
                onClick={() => setStatusFilter('received')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === 'received'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {t.packages.filters.received} ({packages.filter(p => p.status === 'received').length})
              </button>
              <button
                onClick={() => setStatusFilter('in-transit')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === 'in-transit'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {t.packages.filters.inTransit} ({packages.filter(p => p.status === 'in-transit').length})
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === 'available'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {t.packages.filters.available} ({packages.filter(p => p.status === 'available').length})
              </button>
              <button
                onClick={() => setStatusFilter('delivered')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === 'delivered'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {t.packages.filters.delivered} ({packages.filter(p => p.status === 'delivered').length})
              </button>
              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {t.packages.filters.rejected} ({packages.filter(p => p.status === 'rejected').length})
              </button>
            </div>
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-primary-600"></div>
              <p className="mt-4 text-gray-600">{t.packages.loading || 'Chargement des colis...'}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && packages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t.packages.noPackages}
              </h3>
              <p className="text-gray-600 mb-6">
                {t.packages.noPackagesDescription}
              </p>
              <Link href="/dashboard/request-package">
                <Button size="md">
                  <Plus className="w-5 h-5 mr-2" />
                  {t.packages.createPackage}
                </Button>
              </Link>
            </motion.div>
          )}

          {/* No results for filter */}
          {!loading && packages.length > 0 && filteredAndSortedPackages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t.packages.noResults}
              </h3>
              <p className="text-gray-600">
                {t.packages.noResultsDescription}
              </p>
            </motion.div>
          )}

          {/* Packages List */}
          <div className="space-y-6">
            {!loading && filteredAndSortedPackages.map((pkg, index) => {
              const statusInfo = statusConfig[pkg.status] || statusConfig.pending;
              const StatusIcon = statusInfo?.icon || Clock;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedPackage(selectedPackage?.id === pkg.id ? null : pkg)}
                  >
                    <Card
                      hover
                      className="overflow-hidden backdrop-blur-xl bg-white/80 border-white/20 shadow-xl"
                    >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30">
                            <Package className="w-6 h-6 text-white" />
                          </div>

                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              {pkg.trackingNumber}
                            </h3>
                            <p className="text-gray-600 text-sm">{pkg.description}</p>
                          </div>
                        </div>

                        <div className={`px-3 py-1.5 ${statusInfo.bg} rounded-full flex items-center gap-2`}>
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`text-sm font-semibold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">{t.packages.details.weight}</div>
                          <div className="font-semibold text-gray-900">{parseFloat(pkg.weight).toFixed(1)} lbs</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">{t.pricing.serviceFee}</div>
                          <div className="font-semibold text-gray-900">${parseFloat(pkg.totalCost).toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">{t.packages.details.recipient}</div>
                          <div className="font-semibold text-gray-900">{pkg.recipientCity}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">{t.packages.details.estimatedDelivery}</div>
                          <div className="font-semibold text-gray-900">
                            {pkg.estimatedDelivery
                              ? new Date(pkg.estimatedDelivery).toLocaleDateString('fr-FR')
                              : t.packages.messages.toBeDelivered}
                          </div>
                        </div>
                      </div>

                      {/* Current Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        <span>{translateText(pkg.currentLocation)}</span>
                      </div>

                      {/* Timeline (Expanded) */}
                      {selectedPackage?.id === pkg.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t"
                        >
                          <h4 className="font-semibold text-gray-900 mb-4">{t.packages.details.timeline}</h4>
                          <div className="space-y-4">
                            {pkg.timeline.map((event, idx) => (
                              <div key={idx} className="flex gap-4">
                                <div className="relative">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      event.pending ? 'bg-gray-300' : 'bg-primary-600'
                                    } ring-4 ring-white shadow`}
                                  />
                                  {idx < pkg.timeline.length - 1 && (
                                    <div className="absolute left-1.5 top-3 w-px h-full bg-gray-300" />
                                  )}
                                </div>
                                <div className="flex-1 pb-6">
                                  <div className="font-semibold text-gray-900">{translateText(event.status)}</div>
                                  <div className="text-sm text-gray-600">{translateText(event.location)}</div>
                                  {event.description && (
                                    <div className="text-xs text-gray-600 mt-1">{translateText(event.description)}</div>
                                  )}
                                  <div className="text-xs text-gray-500 mt-1">
                                    {new Date(event.date).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
