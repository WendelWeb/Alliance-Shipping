'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import {
  ArrowLeft,
  Clock,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface PackageData {
  id: number;
  trackingNumber: string;
  description: string;
  totalCost: string;
  status: string;
  createdAt: string;
  actualDelivery?: string | null;
}

interface HistoryItem {
  id: string;
  type: 'package';
  title: string;
  description: string;
  amount?: number;
  status: 'completed' | 'cancelled' | 'in-progress';
  date: string;
  trackingNumber?: string;
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const { t, locale } = useTranslation();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ht: 'fr-FR', es: 'es-ES' };
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState('0.00');
  const [packagesDelivered, setPackagesDelivered] = useState(0);
  const [totalPackages, setTotalPackages] = useState(0);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/user/packages');
        const data = await response.json();
        const packages: PackageData[] = data.packages || [];

        // Filter only delivered and rejected packages
        const historyPackages = packages.filter(
          (pkg) => pkg.status === 'delivered' || pkg.status === 'rejected'
        );

        // Transform to history items
        const items: HistoryItem[] = historyPackages.map((pkg) => ({
          id: pkg.id.toString(),
          type: 'package',
          title:
            pkg.status === 'delivered'
              ? t.profile.history.packageDelivered
              : t.profile.history.requestCancelled,
          description: pkg.description,
          amount: parseFloat(pkg.totalCost),
          status:
            pkg.status === 'delivered' ? 'completed' : 'cancelled',
          date: pkg.actualDelivery || pkg.createdAt,
          trackingNumber: pkg.trackingNumber,
        }));

        setHistoryItems(items);

        // Calculate stats
        const delivered = historyPackages.filter((pkg) => pkg.status === 'delivered').length;
        const total = historyPackages.length;
        const spent = historyPackages
          .filter((pkg) => pkg.status === 'delivered')
          .reduce((sum, pkg) => sum + parseFloat(pkg.totalCost || '0'), 0);

        setPackagesDelivered(delivered);
        setTotalPackages(total);
        setTotalSpent(spent.toFixed(2));
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isLoaded, user, t]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in-progress':
        return <Truck className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t.profile.history.completed;
      case 'cancelled':
        return t.profile.history.cancelled;
      case 'in-progress':
        return t.profile.history.inProgress;
      default:
        return t.profile.history.pending;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(localeMap[locale] || 'fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container>
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {t.profile.backToProfile}
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">{t.profile.history.title}</h1>
            <p className="text-gray-600 mt-2">
              {t.profile.history.subtitle}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="theme-card rounded-2xl p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* History List */}
          {!loading && (
            <div className="space-y-4">
              {historyItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="theme-card rounded-2xl shadow-sm p-8 text-center"
              >
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t.profile.history.empty}
                </h3>
                <p className="text-gray-600">
                  {t.profile.history.emptyDesc}
                </p>
              </motion.div>
            ) : (
              historyItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="theme-card rounded-2xl shadow-sm p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${
                        item.type === 'package'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                          : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                      }`}>
                        {item.type === 'package' ? (
                          <Package className="h-6 w-6" />
                        ) : (
                          <DollarSign className="h-6 w-6" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {item.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {getStatusText(item.status)}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>

                        {item.trackingNumber && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg mb-2">
                            <Package className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-mono font-semibold text-gray-900">
                              {item.trackingNumber}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {formatDate(item.date)}
                        </div>
                      </div>
                    </div>

                    {item.amount && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${item.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">USD</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            </div>
          )}

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg p-6 text-white"
          >
            <h3 className="text-xl font-bold mb-4">{t.profile.history.summary}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/80 text-sm mb-1">{t.profile.history.totalSpent}</p>
                <p className="text-2xl font-bold">${totalSpent}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">{t.profile.history.packagesDelivered}</p>
                <p className="text-2xl font-bold">{packagesDelivered}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">{t.profile.history.cancelled}</p>
                <p className="text-2xl font-bold">{totalPackages - packagesDelivered}</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">{t.profile.history.totalPackages}</p>
                <p className="text-2xl font-bold">{totalPackages}</p>
              </div>
            </div>
          </motion.div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
