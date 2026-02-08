'use client';

import { useState, useCallback } from 'react';
import { useCachedFetch } from '@/hooks/useAdminCache';
import { motion } from 'framer-motion';
import {
  Gift,
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Save,
  X,
  RefreshCw,
  Loader2,
  Trophy,
  Truck,
  Weight,
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

interface TopReferrer {
  userId: number;
  name: string;
  email: string;
  totalReferrals: number;
  totalCreditsEarned: number;
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
  topReferrers: TopReferrer[];
  creditsByType: CreditByType[];
}

const CONFIG_LABELS: Record<string, { label: string; icon: React.ReactNode; unit?: string }> = {
  credit_per_referral: { label: 'Credit per Referral', icon: <Users className="w-5 h-5 text-blue-600" />, unit: '$' },
  credit_per_shipment: { label: 'Credit per Shipment', icon: <Truck className="w-5 h-5 text-green-600" />, unit: '$' },
  credit_per_lb: { label: 'Credit per Pound', icon: <Weight className="w-5 h-5 text-purple-600" />, unit: '$' },
  points_per_dollar_spent: { label: 'Points per $ Spent', icon: <DollarSign className="w-5 h-5 text-yellow-600" />, unit: 'pts' },
  points_to_dollar_rate: { label: 'Points to $1 Credit', icon: <TrendingUp className="w-5 h-5 text-orange-600" />, unit: 'pts' },
};

const TYPE_LABELS: Record<string, string> = {
  referral: 'Referral Bonuses',
  shipment: 'Shipment Credits',
  weight: 'Weight Bonuses',
  redemption: 'Redemptions',
  admin_adjustment: 'Admin Adjustments',
};

export default function LoyaltyPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    const res = await fetch('/api/admin/loyalty/config');
    if (!res.ok) throw new Error('Failed to fetch config');
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

  const startEditing = () => {
    const values: Record<string, string> = {};
    (configs || []).forEach((c) => {
      values[c.key] = String(c.value);
    });
    setEditValues(values);
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const configsToSave = Object.entries(editValues).map(([key, value]) => ({
        key,
        value: parseFloat(value),
      }));

      const res = await fetch('/api/admin/loyalty/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: configsToSave }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save');
      }

      setIsEditing(false);
      refreshConfig();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

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
          <p className="text-gray-500 text-sm mt-1">Manage referral credits, shipment rewards, and loyalty configuration</p>
        </div>
        <button
          onClick={() => { refreshConfig(); refreshOverview(); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          {stats && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Issued', value: `$${stats.totalCreditsIssued.toFixed(2)}`, icon: <TrendingUp className="w-5 h-5 text-green-600" />, color: 'bg-green-50' },
                { label: 'Total Redeemed', value: `$${stats.totalCreditsRedeemed.toFixed(2)}`, icon: <DollarSign className="w-5 h-5 text-red-600" />, color: 'bg-red-50' },
                { label: 'Outstanding', value: `$${stats.netCreditsOutstanding.toFixed(2)}`, icon: <Gift className="w-5 h-5 text-primary-600" />, color: 'bg-primary-50' },
                { label: 'Active Users', value: String(stats.activeUsersWithCredits), icon: <Users className="w-5 h-5 text-blue-600" />, color: 'bg-blue-50' },
                { label: 'Total Referrals', value: String(stats.totalReferrals), icon: <Trophy className="w-5 h-5 text-yellow-600" />, color: 'bg-yellow-50' },
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

          {/* Credit Rates Config */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="theme-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Credit Rates</h2>
                {!isEditing ? (
                  <button
                    onClick={startEditing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Rates
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {(configs || []).map((config) => {
                  const meta = CONFIG_LABELS[config.key] || { label: config.key, icon: <Gift className="w-5 h-5 text-gray-400" />, unit: '' };
                  const isPoints = config.key.includes('points');
                  const unit = meta.unit || '$';
                  return (
                    <div key={config.key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        {meta.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{meta.label}</p>
                        <p className="text-sm text-gray-500">{config.description}</p>
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          {!isPoints && <span className="text-gray-400 font-medium">{unit}</span>}
                          <input
                            type="number"
                            step={isPoints ? "1" : "0.01"}
                            min="0"
                            value={editValues[config.key] || '0'}
                            onChange={(e) => setEditValues({ ...editValues, [config.key]: e.target.value })}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-right font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          {isPoints && <span className="text-gray-400 font-medium text-sm">{unit}</span>}
                        </div>
                      ) : (
                        <p className="text-xl font-bold text-gray-900">
                          {isPoints ? Math.round(config.value) : `$${config.value.toFixed(2)}`}
                          {isPoints && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
                        </p>
                      )}
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
                  {overview.creditsByType.map((entry) => (
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

          {/* Top Referrers */}
          {overview?.topReferrers && overview.topReferrers.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="theme-card rounded-xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Top Referrers</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-500">#</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-500">User</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">Referrals</th>
                        <th className="text-right py-3 px-2 font-medium text-gray-500">Credits Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.topReferrers.map((referrer, i) => (
                        <tr key={referrer.userId} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 px-2">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              i === 0 ? 'bg-yellow-100 text-yellow-700' :
                              i === 1 ? 'bg-gray-100 text-gray-600' :
                              i === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-50 text-gray-400'
                            }`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <p className="font-medium text-gray-800">{referrer.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{referrer.email}</p>
                          </td>
                          <td className="py-3 px-2 text-right font-semibold text-gray-900">{referrer.totalReferrals}</td>
                          <td className="py-3 px-2 text-right font-bold text-green-600">${referrer.totalCreditsEarned.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
