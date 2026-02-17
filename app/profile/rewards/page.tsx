'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import {
  ArrowLeft,
  Gift,
  Users,
  Copy,
  Share2,
  TrendingUp,
  Truck,
  DollarSign,
  Star,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface CreditEntry {
  id: number;
  amount: string;
  points?: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function RewardsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [balance, setBalance] = useState('0.00');
  const [points, setPoints] = useState(0);
  const [credits, setCredits] = useState<CreditEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [convertPoints, setConvertPoints] = useState('');
  const [converting, setConverting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [refRes, loyRes] = await Promise.all([
        fetch('/api/user/referral'),
        fetch('/api/user/loyalty'),
      ]);
      if (refRes.ok) {
        const data = await refRes.json();
        setReferralCode(data.referralCode);
        setTotalReferrals(data.stats?.totalReferrals ?? 0);
      }
      if (loyRes.ok) {
        const data = await loyRes.json();
        setBalance(data.balance);
        setPoints(data.points || 0);
        setCredits(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load rewards:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoaded && user) fetchData();
    else if (isLoaded) setLoading(false);
  }, [isLoaded, user, fetchData]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConvertPoints = async () => {
    const pts = parseInt(convertPoints);
    if (!pts || pts <= 0) return;
    setConverting(true);
    setApplyMessage(null);
    try {
      const res = await fetch('/api/user/loyalty/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: pts }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplyMessage({ text: `Converted ${pts} points to $${data.conversion.creditReceived.toFixed(2)}!`, isError: false });
        setConvertPoints('');
        fetchData();
      } else {
        setApplyMessage({ text: data.error || 'Failed to convert points', isError: true });
      }
    } catch {
      setApplyMessage({ text: 'Something went wrong', isError: true });
    } finally {
      setConverting(false);
    }
  };

  const handleApplyCode = async () => {
    if (!applyCode.trim()) return;
    setApplying(true);
    setApplyMessage(null);
    try {
      const res = await fetch('/api/referral/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: applyCode.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplyMessage({ text: 'Referral code applied successfully!', isError: false });
        setApplyCode('');
        fetchData();
      } else {
        setApplyMessage({ text: data.error || 'Failed to apply code', isError: true });
      }
    } catch {
      setApplyMessage({ text: 'Something went wrong', isError: true });
    } finally {
      setApplying(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Alliance Shipping Referral',
        text: `Join Alliance Shipping! Use my referral code: ${referralCode}`,
      });
    } else {
      handleCopy();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'referral': return <Users className="w-4 h-4 text-primary-600" />;
      case 'shipment': return <Truck className="w-4 h-4 text-green-600" />;
      case 'weight': return <TrendingUp className="w-4 h-4 text-purple-600" />;
      case 'redemption': return <DollarSign className="w-4 h-4 text-red-600" />;
      default: return <Star className="w-4 h-4 text-primary-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'referral': return 'Referral Bonus';
      case 'shipment': return 'Shipment Credit';
      case 'weight': return 'Weight Bonus';
      case 'redemption': return 'Redeemed';
      case 'admin_adjustment': return 'Adjustment';
      case 'spending': return 'Points Earned';
      case 'conversion': return 'Points Conversion';
      default: return type;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container>
          {/* Header */}
          <div className="mb-6">
            <Link href="/profile" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Rewards & Referrals</h1>
            <p className="text-gray-600 mt-2">Earn credits by referring friends and shipping packages</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Balance Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-white/70 text-sm font-medium mb-1">Credit Balance</p>
                      <p className="text-4xl font-bold">${balance}</p>
                    </div>
                    <Gift className="w-10 h-10 text-white/30" />
                  </div>
                  <div className="flex divide-x divide-white/20">
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold">{points.toLocaleString()}</p>
                      <p className="text-white/70 text-sm">Points</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold">{totalReferrals}</p>
                      <p className="text-white/70 text-sm">Referrals</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-2xl font-bold">{credits.filter(c => parseFloat(c.amount) > 0).length}</p>
                      <p className="text-white/70 text-sm">Rewards</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Referral Code Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6">
                <Card padding="lg">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Your Referral Code</h2>
                  <div className="border-2 border-dashed border-primary-200 bg-gray-50 rounded-xl py-4 text-center mb-4">
                    <p className="text-2xl font-bold text-primary-600 tracking-widest">{referralCode}</p>
                  </div>
                  <div className="flex gap-3 mb-3">
                    <button
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-100 text-primary-600 font-semibold rounded-lg hover:bg-primary-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 text-center">Share your code and earn credits when friends sign up!</p>
                </Card>
              </motion.div>

              {/* Apply Referral Code */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
                <Card padding="lg">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Have a Referral Code?</h2>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={applyCode}
                      onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                      placeholder="Enter code (e.g. ALLIANCE-XXXX)"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 tracking-wider font-medium bg-[var(--theme-surface-solid)] text-gray-900"
                    />
                    <button
                      onClick={handleApplyCode}
                      disabled={applying || !applyCode.trim()}
                      className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors text-sm disabled:opacity-50"
                    >
                      {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </button>
                  </div>
                  {applyMessage && (
                    <p className={`text-sm mt-2 ${applyMessage.isError ? 'text-red-600' : 'text-green-600'}`}>
                      {applyMessage.text}
                    </p>
                  )}
                </Card>
              </motion.div>

              {/* Convert Points to Credits */}
              {points >= 100 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} className="mb-6">
                  <Card padding="lg">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Convert Points to Credits</h2>
                    <p className="text-sm text-gray-500 mb-4">1000 points = $1.00 credit</p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={convertPoints}
                        onChange={(e) => setConvertPoints(e.target.value)}
                        placeholder={`Enter points (max ${points})`}
                        min="0"
                        max={points}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-medium bg-[var(--theme-surface-solid)] text-gray-900"
                      />
                      <button
                        onClick={handleConvertPoints}
                        disabled={converting || !convertPoints || parseInt(convertPoints) <= 0 || parseInt(convertPoints) > points}
                        className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                      >
                        {converting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Convert'}
                      </button>
                    </div>
                    {convertPoints && parseInt(convertPoints) > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        You will receive: ${(parseInt(convertPoints) / 1000).toFixed(2)}
                      </p>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* How It Works */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
                <Card padding="lg">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">How You Earn</h2>
                  <div className="space-y-0 divide-y divide-gray-100">
                    {[
                      { icon: <DollarSign className="w-5 h-5 text-yellow-600" />, title: 'Earn Points', desc: 'Get 50 points for every $1 you spend on shipments' },
                      { icon: <Users className="w-5 h-5 text-primary-600" />, title: 'Refer Friends', desc: 'Earn credit for each friend who signs up' },
                      { icon: <Truck className="w-5 h-5 text-green-600" />, title: 'Ship Packages', desc: 'Earn credit for each delivered shipment' },
                      { icon: <TrendingUp className="w-5 h-5 text-purple-600" />, title: 'Volume Bonus', desc: 'Earn extra credit per pound shipped' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">{item.icon}</div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                          <p className="text-gray-500 text-xs">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Recent Activity */}
              {credits.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card padding="lg">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-0 divide-y divide-gray-100">
                      {credits.slice(0, 15).map((credit) => {
                        const isPositive = parseFloat(credit.amount) > 0;
                        const hasPoints = credit.points && credit.points !== 0;
                        return (
                          <div key={credit.id} className="flex items-center gap-3 py-3">
                            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                              {getTypeIcon(credit.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 text-sm">{getTypeLabel(credit.type)}</p>
                              <p className="text-gray-400 text-xs">{new Date(credit.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              {hasPoints && (
                                <p className={`font-bold text-sm ${credit.points! > 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
                                  {credit.points! > 0 ? '+' : ''}{credit.points} pts
                                </p>
                              )}
                              {parseFloat(credit.amount) !== 0 && (
                                <p className={`font-bold text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                  {isPositive ? '+' : ''}${Math.abs(parseFloat(credit.amount)).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
