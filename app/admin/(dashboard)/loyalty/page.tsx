'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Gift,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Loader2,
  Truck,
  Weight,
  Star,
  Info,
  ChevronRight,
  XCircle,
  Megaphone,
  ArrowRight,
} from 'lucide-react';

interface LoyaltyConfigItem {
  id: number | null;
  key: string;
  value: number;
  description: string | null;
  updatedBy: number | null;
  updatedAt: string | null;
  isDefault?: boolean;
}

interface CreditByType {
  type: string;
  totalAmount: number;
  transactionCount: number;
}

interface OverviewData {
  overview: {
    totalCreditsIssued: number;
    totalCreditsRedeemed: number;
    netCreditsOutstanding: number;
    activeUsersWithCredits: number;
    totalReferrals: number;
  };
  topReferrers: unknown[];
  creditsByType: CreditByType[];
}

const CONFIG_LABELS: Record<string, { label: string; icon: React.ReactNode; unit?: string; color: string }> = {
  credit_per_shipment: { label: 'Credit per Shipment', icon: <Truck className="w-5 h-5 text-green-600" />, unit: '$', color: 'green' },
  credit_per_lb: { label: 'Credit per Pound', icon: <Weight className="w-5 h-5 text-purple-600" />, unit: '$', color: 'purple' },
  points_per_dollar_spent: { label: 'Points per $ Spent', icon: <DollarSign className="w-5 h-5 text-yellow-600" />, unit: 'pts', color: 'yellow' },
  points_to_dollar_rate: { label: 'Points to $1 Credit', icon: <TrendingUp className="w-5 h-5 text-orange-600" />, unit: 'pts', color: 'orange' },
};

const TYPE_LABELS: Record<string, string> = {
  shipment: 'Shipment Credits',
  weight: 'Weight Bonuses',
  redemption: 'Redemptions',
  admin_adjustment: 'Admin Adjustments',
  spending: 'Points Earned',
  conversion: 'Points Conversion',
};

// Default config values (matches API defaults)
const DEFAULT_CONFIG_VALUES: Record<string, { value: number; description: string }> = {
  credit_per_shipment: { value: 1.00, description: 'Credit (in $) earned per completed shipment' },
  credit_per_lb: { value: 0.10, description: 'Credit (in $) earned per pound shipped on delivered packages' },
  points_per_dollar_spent: { value: 50, description: 'Points earned for every dollar spent on shipments' },
  points_to_dollar_rate: { value: 1000, description: 'Points needed to convert to 1 dollar of credit' },
};

// How It Works steps (no referral)
const HOW_IT_WORKS_STEPS = [
  {
    key: 'credit_per_shipment',
    icon: <Truck className="w-6 h-6" />,
    title: 'Ship a Package',
    desc: 'Credit earned for each delivered shipment',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  {
    key: 'credit_per_lb',
    icon: <Weight className="w-6 h-6" />,
    title: 'Weight Bonus',
    desc: 'Extra credit per pound on delivered packages',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
  },
  {
    key: 'points_per_dollar_spent',
    icon: <Star className="w-6 h-6" />,
    title: 'Earn Points',
    desc: 'Points earned for every $1 spent on shipments',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
  },
  {
    key: 'points_to_dollar_rate',
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Convert Points',
    desc: 'Points needed to get $1.00 in credits',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
];

export default function LoyaltyPage() {
  const [configError, setConfigError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setConfigError(null);
    const res = await fetch('/api/admin/loyalty/config');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = err.error || `API error: ${res.status}`;
      setConfigError(msg);
      throw new Error(msg);
    }
    const data = await res.json();
    return data.configs as LoyaltyConfigItem[];
  }, []);

  const fetchOverview = useCallback(async () => {
    const res = await fetch('/api/admin/loyalty/overview');
    if (!res.ok) throw new Error('Failed to fetch overview');
    return (await res.json()) as OverviewData;
  }, []);

  const { data: configs, loading: configLoading, refresh: refreshConfig } = useCachedFetch<LoyaltyConfigItem[]>(
    'admin-loyalty-config',
    fetchConfig,
  );

  const { data: overview, loading: overviewLoading, refresh: refreshOverview } = useCachedFetch<OverviewData>(
    'admin-loyalty-overview',
    fetchOverview,
  );

  const configMap = new Map((configs || []).map((c) => [c.key, c.value]));
  const getConfigValue = (key: string) => configMap.get(key) ?? DEFAULT_CONFIG_VALUES[key]?.value ?? 0;

  // Build display configs: use API data if available, otherwise defaults (exclude referral)
  const displayConfigs: LoyaltyConfigItem[] = (configs && configs.length > 0)
    ? configs.filter((c) => c.key !== 'credit_per_referral')
    : Object.entries(DEFAULT_CONFIG_VALUES).map(([key, def]) => ({
        id: null,
        key,
        value: def.value,
        description: def.description,
        updatedBy: null,
        updatedAt: null,
        isDefault: true,
      }));

  const loading = configLoading || overviewLoading;
  const stats = overview?.overview;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-7 h-7 text-primary-600" />
            Loyalty Program
          </h1>
          <p className="text-gray-500 text-sm mt-1">View shipment rewards and loyalty configuration</p>
        </div>
        <button
          onClick={() => { refreshConfig(); refreshOverview(); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Banner: Go to Announcements Hub to modify */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/admin/announcements"
          className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 transition-colors group"
        >
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
            <Megaphone className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-primary-800">Want to modify loyalty rates?</p>
            <p className="text-sm text-primary-600">Use the Announcements Hub to update rates and notify all users automatically.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary-400 group-hover:text-primary-600 transition-colors" />
        </Link>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Error Banner */}
          {configError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Failed to load config from server: {configError}</p>
                <p className="text-xs text-red-600 mt-0.5">Showing default values.</p>
              </div>
              <button onClick={refreshConfig} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200">
                Retry
              </button>
            </div>
          )}

          {/* How It Works Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="theme-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Info className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-900">How the Loyalty Program Works</h2>
              </div>

              {/* Steps flow */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {HOW_IT_WORKS_STEPS.map((step, i) => {
                  const value = getConfigValue(step.key);
                  const isPoints = step.key.includes('points');
                  const displayValue = isPoints
                    ? `${Math.round(value)} pts`
                    : `$${value.toFixed(2)}`;

                  return (
                    <div key={step.key} className="relative">
                      <div className={`${step.bgColor} border ${step.borderColor} rounded-xl p-4 text-center h-full`}>
                        <div className={`w-12 h-12 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-3 ${step.iconColor}`}>
                          {step.icon}
                        </div>
                        <p className="font-semibold text-gray-800 text-sm mb-1">{step.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-1">{displayValue}</p>
                        <p className="text-xs text-gray-500">{step.desc}</p>
                      </div>
                      {i < HOW_IT_WORKS_STEPS.length - 1 && (
                        <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                          <ChevronRight className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary explanation */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Example:</strong> A 10 lb package costing $50 earns the user:
                  <span className="font-semibold text-green-600"> ${getConfigValue('credit_per_shipment').toFixed(2)}</span> (shipment) +
                  <span className="font-semibold text-purple-600"> ${(getConfigValue('credit_per_lb') * 10).toFixed(2)}</span> (weight: 10 lbs) +
                  <span className="font-semibold text-yellow-600"> {Math.floor(getConfigValue('points_per_dollar_spent') * 50)} pts</span> (spending).
                  <span className="font-semibold text-orange-600"> {Math.round(getConfigValue('points_to_dollar_rate'))} pts</span> = $1.00 credit.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Overview Stats */}
          {stats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Issued', value: `$${stats.totalCreditsIssued.toFixed(2)}`, icon: <TrendingUp className="w-5 h-5 text-green-600" />, color: 'bg-green-50' },
                { label: 'Total Redeemed', value: `$${stats.totalCreditsRedeemed.toFixed(2)}`, icon: <DollarSign className="w-5 h-5 text-red-600" />, color: 'bg-red-50' },
                { label: 'Outstanding', value: `$${stats.netCreditsOutstanding.toFixed(2)}`, icon: <Gift className="w-5 h-5 text-primary-600" />, color: 'bg-primary-50' },
                { label: 'Active Users', value: String(stats.activeUsersWithCredits), icon: <Users className="w-5 h-5 text-blue-600" />, color: 'bg-blue-50' },
              ].map((stat, i) => (
                <div key={i} className="theme-card rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Credit Rates (Read-Only) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="theme-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Current Credit Rates</h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                  <Info className="w-3 h-3" />
                  Read-only
                </span>
              </div>

              <div className="space-y-4">
                {displayConfigs.map((config) => {
                  const meta = CONFIG_LABELS[config.key] || { label: config.key, icon: <Gift className="w-5 h-5 text-gray-400" />, unit: '', color: 'gray' };
                  const isPoints = config.key.includes('points');

                  return (
                    <div key={config.key} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {meta.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{meta.label}</p>
                        <p className="text-sm text-gray-500">{config.description}</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {isPoints ? Math.round(config.value) : `$${config.value.toFixed(2)}`}
                        {isPoints && <span className="text-sm text-gray-500 ml-1">{meta.unit}</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Credits Breakdown by Type */}
          {overview?.creditsByType && overview.creditsByType.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="theme-card rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Credit Breakdown</h2>
                <div className="space-y-3">
                  {overview.creditsByType
                    .filter((entry) => entry.type !== 'referral')
                    .map((entry) => (
                    <div key={entry.type} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-800">{TYPE_LABELS[entry.type] || entry.type}</p>
                        <p className="text-sm text-gray-500">{entry.transactionCount} transactions</p>
                      </div>
                      <p className={`font-bold text-lg ${entry.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.totalAmount >= 0 ? '+' : ''}${Math.abs(entry.totalAmount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
