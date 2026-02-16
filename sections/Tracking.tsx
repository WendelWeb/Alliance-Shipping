'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Plane, CheckCircle, MapPin, Clock, AlertCircle, Loader2, Weight } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useState } from 'react';

interface TrackingResult {
  found: boolean;
  package?: {
    trackingNumber: string;
    status: string;
    weight: number | null;
    currentLocation: string | null;
    estimatedDelivery: string | null;
    city: string | null;
    createdAt: string;
  };
  history?: Array<{
    status: string;
    location: string | null;
    description: string | null;
    timestamp: string;
  }>;
  error?: string;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
  received: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  'in-transit': { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
  available: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' },
  delivered: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
};

const statusIcons: Record<string, typeof Package> = {
  pending: Clock,
  received: Package,
  'in-transit': Plane,
  available: MapPin,
  delivered: CheckCircle,
};

export function Tracking() {
  const { t } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setIsSearching(true);
    setResult(null);
    setError('');

    try {
      const res = await fetch(`/api/packages/track?tracking=${encodeURIComponent(trackingNumber.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.found) {
        setResult({ found: false });
      } else {
        setResult(data);
      }
    } catch {
      setError(t.tracking.error || 'An error occurred');
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap = t.tracking.status as Record<string, string>;
    return statusMap[status] || status;
  };

  return (
    <section id="tracking" className="py-6 md:py-16 bg-[var(--theme-bg)]">
      <Container size="lg">
        <SectionTitle
          title={t.tracking.title}
          subtitle={t.tracking.subtitle}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Search Form */}
          <div className="bg-[var(--theme-surface)] rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6">
              <form onSubmit={handleTrack}>
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t.tracking.placeholder}
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl bg-[var(--theme-bg)] text-gray-900 focus:border-primary-500 focus:outline-none transition-colors placeholder:text-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching || !trackingNumber.trim()}
                    className="px-6 py-3.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSearching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">{isSearching ? (t.tracking.searching || 'Searching...') : t.tracking.button}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 p-4 sm:p-6"
                >
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-red-50 rounded-xl border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Not Found */}
              {result && !result.found && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 p-4 sm:p-6"
                >
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{t.tracking.noResults}</p>
                  </div>
                </motion.div>
              )}

              {/* Found */}
              {result?.found && result.package && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200"
                >
                  {/* Package Info */}
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900">
                        {t.tracking.result?.title || 'Package Found'}
                      </h4>
                      {(() => {
                        const status = result.package!.status;
                        const colors = statusColors[status] || statusColors.pending;
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            {getStatusLabel(status)}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[var(--theme-bg)] rounded-lg">
                        <div className="text-xs text-gray-500">{t.tracking.result?.trackingNumber || 'Tracking'}</div>
                        <div className="text-sm font-bold text-gray-900 mt-0.5">{result.package.trackingNumber}</div>
                      </div>
                      {result.package.weight && (
                        <div className="p-3 bg-[var(--theme-bg)] rounded-lg">
                          <div className="text-xs text-gray-500">{t.tracking.result?.weight || 'Weight'}</div>
                          <div className="text-sm font-bold text-gray-900 mt-0.5">{result.package.weight} {t.tracking.result?.lbs || 'lbs'}</div>
                        </div>
                      )}
                      {result.package.city && (
                        <div className="p-3 bg-[var(--theme-bg)] rounded-lg">
                          <div className="text-xs text-gray-500">{t.tracking.result?.city || 'Destination'}</div>
                          <div className="text-sm font-bold text-gray-900 mt-0.5">{result.package.city}</div>
                        </div>
                      )}
                      <div className="p-3 bg-[var(--theme-bg)] rounded-lg">
                        <div className="text-xs text-gray-500">{t.tracking.result?.createdAt || 'Shipped on'}</div>
                        <div className="text-sm font-bold text-gray-900 mt-0.5">
                          {new Date(result.package.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Tracking History Timeline */}
                    {result.history && result.history.length > 0 && (
                      <div className="pt-4">
                        <h5 className="text-sm font-semibold text-gray-700 mb-4">
                          {t.tracking.result?.history || 'Tracking History'}
                        </h5>
                        <div className="space-y-0">
                          {result.history.map((entry, index) => {
                            const StatusIcon = statusIcons[entry.status] || Package;
                            const isFirst = index === 0;
                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex gap-4 relative"
                              >
                                {/* Timeline line */}
                                {index < result.history!.length - 1 && (
                                  <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-gray-200" />
                                )}
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center z-10 ${
                                  isFirst ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <StatusIcon className="w-4 h-4" />
                                </div>
                                {/* Content */}
                                <div className="pb-6 flex-1">
                                  <div className={`text-sm font-medium ${isFirst ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {getStatusLabel(entry.status)}
                                  </div>
                                  {entry.location && (
                                    <div className="text-xs text-gray-500 mt-0.5">{entry.location}</div>
                                  )}
                                  <div className="text-xs text-gray-400 mt-0.5">
                                    {new Date(entry.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!result && !error && !isSearching && (
              <div className="border-t border-gray-200 p-5 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-primary-400" />
                </div>
                <p className="text-sm text-gray-500">
                  {t.tracking.subtitle}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
