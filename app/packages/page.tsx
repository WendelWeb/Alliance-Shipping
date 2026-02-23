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
  ChevronDown,
  DollarSign,
  Scale,
  AlertTriangle,
  Smartphone,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTheme } from '@/lib/themes/ThemeProvider';

interface PackageData {
  id: number;
  trackingNumber: string;
  externalTrackingNumber?: string;
  status: string;
  description: string;
  weight: string;
  category?: string;
  serviceFee?: string;
  weightCost?: string;
  customsFees?: string;
  specialItemId?: number;
  specialItemName?: string;
  specialItemBrand?: string;
  specialItemFixedFee?: string;
  chargeByWeight?: boolean;
  deliveryBundleId?: number;
  totalCost: string;
  currentLocation: string;
  estimatedDelivery: string | null;
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

const categoryLabels: Record<string, string> = {
  general: 'General',
  clothing: 'Vetements',
  electronics: 'Electronique',
  food: 'Nourriture',
  documents: 'Documents',
  other: 'Autre',
};

export default function PackagesPage() {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const webRouter = useRouter();

  // Helper function to translate text (handles both translation keys and regular text)
  const translateText = (text: string): string => {
    if (!text) return text;

    // Check if it looks like a translation key (contains dots)
    if (text.includes('.')) {
      const keys = text.split('.');
      let value: any = t;
      for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          // Key not found, return original text
          return text;
        }
      }
      // Return the translated value if it's a string
      return typeof value === 'string' ? value : text;
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

  // Define status colors that work in both light and dark modes
  const statusColors = {
    pending: { text: '#d97706', bg: isDark ? '#78350f' : '#fef3c7', border: isDark ? '#92400e' : '#fde68a', dot: '#eab308' },
    rejected: { text: '#dc2626', bg: isDark ? '#7f1d1d' : '#fee2e2', border: isDark ? '#991b1b' : '#fecaca', dot: '#ef4444' },
    received: { text: '#2563eb', bg: isDark ? '#1e3a8a' : '#dbeafe', border: isDark ? '#1e40af' : '#bfdbfe', dot: '#3b82f6' },
    'in-transit': { text: '#9333ea', bg: isDark ? '#581c87' : '#f3e8ff', border: isDark ? '#6b21a8' : '#e9d5ff', dot: '#a855f7' },
    customs: { text: '#ea580c', bg: isDark ? '#7c2d12' : '#fed7aa', border: isDark ? '#9a3412' : '#fdba74', dot: '#f97316' },
    available: { text: '#16a34a', bg: isDark ? '#14532d' : '#dcfce7', border: isDark ? '#166534' : '#bbf7d0', dot: '#22c55e' },
    delivered: { text: '#059669', bg: isDark ? '#064e3b' : '#d1fae5', border: isDark ? '#065f46' : '#a7f3d0', dot: '#10b981' },
  };

  const statusConfig: Record<string, any> = {
    pending: { label: t.packages.status.pending, ...statusColors.pending, icon: Clock },
    rejected: { label: t.packages.status.rejected, ...statusColors.rejected, icon: AlertCircle },
    received: { label: t.packages.status.received, ...statusColors.received, icon: Package },
    'in-transit': { label: t.packages.status['in-transit'], ...statusColors['in-transit'], icon: Plane },
    customs: { label: t.packages.status.customs, ...statusColors.customs, icon: AlertCircle },
    available: { label: t.packages.status.available, ...statusColors.available, icon: Package },
    delivered: { label: t.packages.status.delivered, ...statusColors.delivered, icon: CheckCircle },
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
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTracking = pkg.trackingNumber.toLowerCase().includes(query);
        const matchesExternal = pkg.externalTrackingNumber?.toLowerCase().includes(query);
        const matchesDescription = pkg.description.toLowerCase().includes(query);
        if (!matchesTracking && !matchesExternal && !matchesDescription) return false;
      }
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
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-display" style={{ color: colors.gray[900] }}>
                  {t.packages.title}
                </h1>
                <p className="text-sm sm:text-base" style={{ color: colors.gray[600] }}>
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.gray[400] }} />
              <input
                type="text"
                placeholder={t.packages.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-theme-surface-solid border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all outline-none"
                style={{
                  borderColor: colors.gray[200],
                  color: colors.gray[900],
                }}
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
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all shrink-0"
                    style={
                      isActive
                        ? btn.key === 'all'
                          ? { backgroundColor: colors.primary[600], color: '#ffffff', boxShadow: theme.shadow.lg }
                          : {
                              backgroundColor: config?.bg,
                              color: config?.text,
                              borderWidth: '1px',
                              borderColor: config?.border,
                              boxShadow: theme.shadow.sm
                            }
                        : {
                            backgroundColor: theme.colors.surfaceSolid,
                            color: colors.gray[600],
                            borderWidth: '1px',
                            borderColor: colors.gray[200]
                          }
                    }
                  >
                    {config && isActive && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.dot }} />}
                    {btn.label}
                    <span className="text-xs" style={{ opacity: isActive ? 0.8 : 1, color: isActive ? 'inherit' : colors.gray[400] }}>
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
                <div key={i} className="theme-card rounded-2xl p-5 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: colors.gray[200] }} />
                      <div>
                        <div className="h-4 w-32 rounded mb-2" style={{ backgroundColor: colors.gray[200] }} />
                        <div className="h-3 w-48 rounded" style={{ backgroundColor: colors.gray[100] }} />
                      </div>
                    </div>
                    <div className="h-7 w-24 rounded-full" style={{ backgroundColor: colors.gray[200] }} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j}>
                        <div className="h-3 w-16 rounded mb-1.5" style={{ backgroundColor: colors.gray[100] }} />
                        <div className="h-4 w-20 rounded" style={{ backgroundColor: colors.gray[200] }} />
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: colors.gray[100] }}>
                <Package className="w-10 h-10" style={{ color: colors.gray[400] }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: colors.gray[900] }}>
                {t.packages.noPackages}
              </h3>
              <p className="mb-6" style={{ color: colors.gray[600] }}>
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: colors.gray[100] }}>
                <Search className="w-8 h-8" style={{ color: colors.gray[400] }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: colors.gray[900] }}>
                {t.packages.noResults}
              </h3>
              <p style={{ color: colors.gray[600] }}>
                {t.packages.noResultsDescription}
              </p>
            </motion.div>
          )}

          {/* Packages List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!loading && filteredAndSortedPackages.map((pkg, index) => {
              const statusInfo = statusConfig[pkg.status] || statusConfig.pending;
              const StatusIcon = statusInfo?.icon || Clock;
              const serviceFee = pkg.serviceFee ? parseFloat(pkg.serviceFee) : 0;
              const weightCost = pkg.weightCost ? parseFloat(pkg.weightCost) : 0;
              const customsFees = pkg.customsFees ? parseFloat(pkg.customsFees) : 0;
              const specialItemFixedFee = pkg.specialItemFixedFee ? parseFloat(pkg.specialItemFixedFee) : 0;
              const totalCost = serviceFee + weightCost + customsFees + specialItemFixedFee;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                  className="col-span-1"
                >
                  <Card
                    className="overflow-hidden bg-theme-surface-solid border transition-all cursor-pointer hover:shadow-lg"
                    style={{
                      borderColor: colors.gray[100],
                      boxShadow: theme.shadow.sm,
                    }}
                    hover
                  >
                    {/* Status bar at top */}
                    <div className="h-1" style={{ backgroundColor: statusInfo.dot }} />

                    <div className="p-4 sm:p-5" onClick={() => webRouter.push(`/packages/${pkg.id}`)}>
                      {/* Header: Status badge + tracking */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full mb-2"
                            style={{
                              backgroundColor: statusInfo.bg,
                              borderColor: statusInfo.border,
                            }}
                          >
                            <StatusIcon className="w-3.5 h-3.5" style={{ color: statusInfo.text }} />
                            <span className="text-xs font-semibold" style={{ color: statusInfo.text }}>
                              {statusInfo.label}
                            </span>
                          </span>
                          <p className="font-mono text-sm font-bold tracking-wide" style={{ color: colors.gray[900] }}>
                            {pkg.trackingNumber}
                          </p>
                          {pkg.externalTrackingNumber && pkg.externalTrackingNumber !== pkg.trackingNumber && (
                            <p className="font-mono text-xs mt-0.5" style={{ color: colors.gray[500] }}>
                              {pkg.externalTrackingNumber}
                            </p>
                          )}
                        </div>
                        <p className="text-lg font-bold" style={{ color: colors.gray[900] }}>
                          ${totalCost.toFixed(2)}
                        </p>
                      </div>

                      {/* Description */}
                      <p className="text-sm mb-3 line-clamp-1" style={{ color: colors.gray[600] }}>
                        {pkg.description}
                      </p>

                      {/* Special Item Badge */}
                      {pkg.specialItemId && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold mb-3" style={{
                          backgroundColor: isDark ? '#581c87' : '#f3e8ff',
                          color: isDark ? '#e9d5ff' : '#7c3aed'
                        }}>
                          <Smartphone className="w-3.5 h-3.5" />
                          {pkg.specialItemBrand ? `${pkg.specialItemBrand} ` : ''}{pkg.specialItemName || (t as any).packages?.specialItem || 'Article Special'}
                        </div>
                      )}

                      {/* Bundle Badge */}
                      {pkg.deliveryBundleId && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold mb-3" style={{
                          background: isDark
                            ? 'linear-gradient(135deg, #581c87, #312e81)'
                            : 'linear-gradient(135deg, #f3e8ff, #ede9fe)',
                          color: isDark ? '#c4b5fd' : '#6d28d9',
                          border: `1px solid ${isDark ? '#7c3aed' : '#c4b5fd'}`,
                        }}>
                          <Layers className="w-3.5 h-3.5" />
                          {(t as any).bundle?.badge || 'Bundle'} #{pkg.deliveryBundleId}
                          {serviceFee === 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold" style={{
                              backgroundColor: isDark ? '#064e3b' : '#dcfce7',
                              color: isDark ? '#6ee7b7' : '#15803d',
                            }}>
                              {(t as any).bundle?.serviceFeeWaived || 'OFFERT'}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-3">
                        <div className="flex items-center gap-2">
                          <Scale className="w-3.5 h-3.5 shrink-0" style={{ color: colors.gray[400] }} />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.gray[400] }}>{t.packages.details.weight}</p>
                            <p className="text-sm font-semibold" style={{ color: colors.gray[900] }}>{parseFloat(pkg.weight).toFixed(1)} lbs</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: colors.gray[400] }} />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.gray[400] }}>{t.packages.details.recipient}</p>
                            <p className="text-sm font-semibold truncate" style={{ color: colors.gray[900] }}>{translateText(pkg.currentLocation)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" style={{ color: customsFees > 0 ? '#dc2626' : colors.gray[400] }} />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.gray[400] }}>Taxes Douane</p>
                            <p className={`text-sm font-semibold ${customsFees > 0 ? 'font-bold' : ''}`} style={{ color: customsFees > 0 ? '#dc2626' : colors.gray[900] }}>
                              {customsFees > 0 ? `+$${customsFees.toFixed(2)}` : '$0.00'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: colors.gray[400] }} />
                          <div>
                            <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.gray[400] }}>{t.packages.details.estimatedDelivery}</p>
                            <p className="text-sm font-semibold" style={{ color: colors.gray[900] }}>
                              {pkg.estimatedDelivery
                                ? new Date(pkg.estimatedDelivery).toLocaleDateString('fr-FR')
                                : t.packages.messages.toBeDelivered}
                            </p>
                          </div>
                        </div>
                        {pkg.category && (
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 shrink-0" style={{ color: colors.gray[400] }} />
                            <div>
                              <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.gray[400] }}>Categorie</p>
                              <p className="text-sm font-semibold" style={{ color: colors.gray[900] }}>
                                {categoryLabels[pkg.category] || pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fee Breakdown */}
                      <div className="rounded-lg p-3 mb-2 border" style={{
                        backgroundColor: isDark ? colors.gray[200] : '#f0f4ff',
                        borderColor: isDark ? colors.gray[300] : '#c7d7fe'
                      }}>
                        <p className="text-[10px] uppercase tracking-wide font-bold mb-2 flex items-center gap-1" style={{ color: colors.gray[500] }}>
                          <DollarSign className="w-3 h-3" />
                          Detail des Frais
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span style={{ color: colors.gray[600] }}>Frais de service:</span>
                            {pkg.deliveryBundleId && serviceFee === 0 ? (
                              <span className="flex items-center gap-1.5">
                                <span className="line-through" style={{ color: colors.gray[400] }}>$5.00</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{
                                  backgroundColor: isDark ? '#064e3b' : '#dcfce7',
                                  color: isDark ? '#6ee7b7' : '#15803d',
                                }}>
                                  {(t as any).bundle?.serviceFeeWaived || 'OFFERT'}
                                </span>
                              </span>
                            ) : (
                              <span className="font-semibold" style={{ color: colors.gray[900] }}>${serviceFee.toFixed(2)}</span>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: colors.gray[600] }}>Frais de poids ({parseFloat(pkg.weight).toFixed(1)} lbs):</span>
                            <span className="font-semibold" style={{ color: colors.gray[900] }}>${weightCost.toFixed(2)}</span>
                          </div>
                          {pkg.specialItemId && (
                            <div className="flex justify-between py-0.5 px-1 -mx-1 rounded" style={{
                              backgroundColor: isDark ? '#581c87' : '#f3e8ff',
                              color: isDark ? '#e9d5ff' : '#7c3aed'
                            }}>
                              <span className="font-semibold flex items-center gap-1">
                                <Smartphone className="w-3 h-3" />
                                {pkg.specialItemName ? `${pkg.specialItemBrand || ''} ${pkg.specialItemName}`.trim() : 'Article Special'} (Fixe):
                              </span>
                              <span className="font-bold">
                                ${parseFloat(pkg.specialItemFixedFee || '0').toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className={`flex justify-between ${customsFees > 0 ? 'font-bold' : ''}`} style={{ color: customsFees > 0 ? '#dc2626' : colors.gray[600] }}>
                            <span>Taxes de douane:</span>
                            <span className="font-semibold" style={{ color: customsFees > 0 ? '#dc2626' : colors.gray[900] }}>
                              {customsFees > 0 ? '+' : ''}${customsFees.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1.5 mt-1" style={{ borderTop: `2px solid ${isDark ? colors.gray[600] : '#93b4fd'}` }}>
                            <span className="font-bold text-sm" style={{ color: colors.gray[900] }}>TOTAL:</span>
                            <span className="font-bold text-sm" style={{ color: colors.primary[600] }}>
                              ${totalCost.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Current Location */}
                      <div className="flex items-center gap-2 text-sm rounded-lg p-2.5 mb-2" style={{ color: colors.gray[600], backgroundColor: colors.gray[50] }}>
                        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: colors.primary[600] }} />
                        <span className="truncate">{translateText(pkg.currentLocation)}</span>
                      </div>

                      {/* View Details indicator */}
                      <div
                        className="flex items-center justify-between pt-2 mt-1 border-t"
                        style={{ borderColor: colors.gray[100] }}
                      >
                        <span className="text-xs font-medium" style={{ color: colors.primary[600] }}>
                          {(t as any).packageDetail?.viewDetails || 'View details'}
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90" style={{ color: colors.primary[600] }} />
                      </div>
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
