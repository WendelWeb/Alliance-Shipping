'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  ChevronUp,
  DollarSign,
  Scale,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface PackageData {
  id: number;
  trackingNumber: string;
  status: string;
  description: string;
  weight: string;
  serviceFee?: string;
  weightCost?: string;
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
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Helper function to translate text (handles both translation keys and regular text)
  const translateText = (text: string): string => {
    if (!text) return text;

    if (text.startsWith('packages.')) {
      const keys = text.split('.');
      let value: any = t;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) return text;
      }
      return value;
    }

    return text;
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
    pending: { label: t.packages.status.pending, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', icon: Clock, dot: 'bg-yellow-500' },
    rejected: { label: t.packages.status.rejected, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, dot: 'bg-red-500' },
    received: { label: t.packages.status.received, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Package, dot: 'bg-blue-500' },
    'in-transit': { label: t.packages.status['in-transit'], color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', icon: Plane, dot: 'bg-purple-500' },
    customs: { label: t.packages.status.customs, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertCircle, dot: 'bg-orange-500' },
    available: { label: t.packages.status.available, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: Package, dot: 'bg-green-500' },
    delivered: { label: t.packages.status.delivered, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, dot: 'bg-emerald-500' },
  };

  const filterButtons = [
    { key: 'all', label: t.packages.filters.all, count: packages.length },
    { key: 'pending', label: t.packages.filters.pending, count: packages.filter(p => p.status === 'pending').length },
    { key: 'received', label: t.packages.filters.received, count: packages.filter(p => p.status === 'received').length },
    { key: 'in-transit', label: t.packages.filters.inTransit, count: packages.filter(p => p.status === 'in-transit').length },
    { key: 'available', label: t.packages.filters.available, count: packages.filter(p => p.status === 'available').length },
    { key: 'delivered', label: t.packages.filters.delivered, count: packages.filter(p => p.status === 'delivered').length },
    { key: 'rejected', label: t.packages.filters.rejected, count: packages.filter(p => p.status === 'rejected').length },
  ];

  // Filter and sort packages
  const filteredAndSortedPackages = packages
    .filter(pkg => {
      if (statusFilter !== 'all' && pkg.status !== statusFilter) return false;
      if (searchQuery && !pkg.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !pkg.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const aIsBottom = a.status === 'delivered' || a.status === 'rejected';
      const bIsBottom = b.status === 'delivered' || b.status === 'rejected';
      if (aIsBottom && !bIsBottom) return 1;
      if (!aIsBottom && bIsBottom) return -1;
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
            className="mb-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.packages.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all outline-none"
              />
            </div>
          </motion.div>

          {/* Status Filters - Horizontal scroll on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
              {filterButtons.map((btn) => {
                const isActive = statusFilter === btn.key;
                const config = btn.key !== 'all' ? statusConfig[btn.key] : null;
                return (
                  <button
                    key={btn.key}
                    onClick={() => setStatusFilter(btn.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all shrink-0 ${
                      isActive
                        ? btn.key === 'all'
                          ? 'bg-gray-900 text-white shadow-lg'
                          : `${config?.bg} ${config?.color} ${config?.border} border shadow-sm`
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {config && isActive && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
                    {btn.label}
                    <span className={`text-xs ${isActive ? 'opacity-80' : 'text-gray-400'}`}>
                      {btn.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                      <div>
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-48 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="h-7 w-24 bg-gray-200 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j}>
                        <div className="h-3 w-16 bg-gray-100 rounded mb-1.5" />
                        <div className="h-4 w-20 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && packages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
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
              className="text-center py-16"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!loading && filteredAndSortedPackages.map((pkg, index) => {
              const statusInfo = statusConfig[pkg.status] || statusConfig.pending;
              const StatusIcon = statusInfo?.icon || Clock;
              const isExpanded = expandedId === pkg.id;
              const serviceFee = pkg.serviceFee ? parseFloat(pkg.serviceFee) : 0;
              const weightCost = pkg.weightCost ? parseFloat(pkg.weightCost) : 0;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  className="col-span-1"
                >
                  <Card
                    className={`overflow-hidden bg-white border transition-all ${
                      isExpanded ? `${statusInfo.border} shadow-lg` : 'border-gray-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Status bar at top */}
                    <div className={`h-1 ${statusInfo.dot}`} />

                    <div className="p-4 sm:p-5">
                      {/* Header: Status badge + tracking */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${statusInfo.bg} ${statusInfo.border} border rounded-full mb-2`}>
                            <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                            <span className={`text-xs font-semibold ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </span>
                          <p className="font-mono text-sm font-bold text-gray-900 tracking-wide">
                            {pkg.trackingNumber}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          ${parseFloat(pkg.totalCost).toFixed(2)}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        {pkg.description}
                      </p>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-3">
                        <div className="flex items-center gap-2">
                          <Scale className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-gray-400">{t.packages.details.weight}</p>
                            <p className="text-sm font-semibold text-gray-900">{parseFloat(pkg.weight).toFixed(1)} lbs</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-gray-400">{t.packages.details.recipient}</p>
                            <p className="text-sm font-semibold text-gray-900 truncate">{pkg.recipientCity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-gray-400">{t.pricing.serviceFee}</p>
                            <p className="text-sm font-semibold text-gray-900">
                              ${serviceFee.toFixed(2)} + ${weightCost.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-gray-400">{t.packages.details.estimatedDelivery}</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {pkg.estimatedDelivery
                                ? new Date(pkg.estimatedDelivery).toLocaleDateString('fr-FR')
                                : t.packages.messages.toBeDelivered}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Current Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2.5 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                        <span className="truncate">{translateText(pkg.currentLocation)}</span>
                      </div>

                      {/* Expand button */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : pkg.id)}
                        className="w-full flex items-center justify-center gap-1 pt-2 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            {t.packages.details.timeline ? `${t.packages.details.timeline}` : 'Timeline'}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            {t.packages.details.timeline || 'Timeline'}
                          </>
                        )}
                      </button>

                      {/* Timeline (Expanded) */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <h4 className="font-semibold text-gray-900 mb-4 text-sm">{t.packages.details.timeline}</h4>
                              <div className="space-y-0">
                                {pkg.timeline.map((event, idx) => {
                                  const eventStatusInfo = statusConfig[event.status?.toLowerCase()] || statusConfig.pending;
                                  return (
                                    <div key={idx} className="flex gap-3">
                                      <div className="relative flex flex-col items-center">
                                        <div
                                          className={`w-2.5 h-2.5 rounded-full ${
                                            event.pending ? 'bg-gray-300' : eventStatusInfo.dot
                                          } ring-4 ring-white z-10`}
                                        />
                                        {idx < pkg.timeline.length - 1 && (
                                          <div className="w-px flex-1 bg-gray-200 min-h-[24px]" />
                                        )}
                                      </div>
                                      <div className="flex-1 pb-4">
                                        <div className={`font-medium text-sm ${event.pending ? 'text-gray-400' : 'text-gray-900'}`}>
                                          {translateText(event.status)}
                                        </div>
                                        <div className="text-xs text-gray-500">{translateText(event.location)}</div>
                                        {event.description && (
                                          <div className="text-xs text-gray-400 mt-0.5">{translateText(event.description)}</div>
                                        )}
                                        <div className="text-[10px] text-gray-400 mt-0.5">
                                          {new Date(event.date).toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
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
