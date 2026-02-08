import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  RefreshControl,
  TextInput,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  Gift,
  Users,
  Copy,
  Share2,
  TrendingUp,
  Star,
  Truck,
  Weight,
  DollarSign,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';

interface CreditEntry {
  id: number;
  amount: string;
  points?: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [balance, setBalance] = useState('0.00');
  const [points, setPoints] = useState(0);
  const [credits, setCredits] = useState<CreditEntry[]>([]);
  const [applyCode, setApplyCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [convertPoints, setConvertPoints] = useState('');
  const [converting, setConverting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const [referralData, loyaltyData] = await Promise.all([
        api.get<{ referralCode: string; stats: { totalReferrals: number; totalCreditsEarned: number } }>('/api/user/referral'),
        api.get<{ balance: number; points: number; history: CreditEntry[] }>('/api/user/loyalty'),
      ]);
      setReferralCode(referralData.referralCode);
      setTotalReferrals(referralData.stats?.totalReferrals ?? 0);
      setBalance(String(loyaltyData.balance));
      setPoints(loyaltyData.points || 0);
      setCredits(loyaltyData.history || []);
    } catch (error) {
      console.error('Failed to load rewards:', error);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(t.rewards.copied, t.rewards.copiedMessage);
  };

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Join Alliance Shipping and get a bonus! Use my referral code: ${referralCode}\n\nDownload the app and start shipping from USA to Haiti today!`,
      });
    } catch {}
  };

  const handleConvertPoints = async () => {
    const pts = parseInt(convertPoints);
    if (!pts || pts <= 0) return;
    setConverting(true);
    try {
      const data = await api.post<{ success: boolean; error?: string; conversion?: any; newBalance: number; newPoints: number }>('/api/user/loyalty/convert', { points: pts });
      if (data.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t.rewards.success, `${t.rewards.converted} ${pts} ${t.rewards.pointsTo} $${data.conversion?.creditReceived.toFixed(2)}!`);
        setConvertPoints('');
        fetchData();
      } else {
        Alert.alert(t.rewards.error, data.error || t.rewards.failedConvert);
      }
    } catch (error: any) {
      let msg = t.rewards.somethingWrong;
      try {
        const parsed = JSON.parse(error?.message?.split(': ').slice(1).join(': ') || '{}');
        msg = parsed.error || msg;
      } catch { msg = error?.message || msg; }
      Alert.alert(t.rewards.error, msg);
    } finally {
      setConverting(false);
    }
  };

  const handleApplyCode = async () => {
    if (!applyCode.trim()) return;
    setApplying(true);
    try {
      const data = await api.post<{ success: boolean; error?: string }>('/api/referral/apply', { code: applyCode.trim() });
      if (data.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t.rewards.success, t.rewards.codeApplied);
        setApplyCode('');
        fetchData();
      } else {
        Alert.alert(t.rewards.error, data.error || t.rewards.failedApply);
      }
    } catch (error: any) {
      let msg = t.rewards.somethingWrong;
      try {
        const parsed = JSON.parse(error?.message?.split(': ').slice(1).join(': ') || '{}');
        msg = parsed.error || msg;
      } catch { msg = error?.message || msg; }
      Alert.alert(t.rewards.error, msg);
    } finally {
      setApplying(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'referral': return <Users size={16} color={colors.primary[600]} />;
      case 'shipment': return <Truck size={16} color={colors.green[600]} />;
      case 'weight': return <Weight size={16} color={colors.purple[600]} />;
      case 'redemption': return <DollarSign size={16} color={colors.red[600]} />;
      case 'spending': return <DollarSign size={16} color={colors.blue[600]} />;
      case 'conversion': return <TrendingUp size={16} color={colors.purple[600]} />;
      default: return <Star size={16} color={colors.primary[600]} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'referral': return 'Referral Bonus';
      case 'shipment': return 'Shipment Credit';
      case 'weight': return 'Weight Bonus';
      case 'redemption': return 'Redeemed';
      case 'spending': return 'Points Earned';
      case 'conversion': return 'Points Conversion';
      case 'admin_adjustment': return 'Adjustment';
      default: return type;
    }
  };

  const themedStyles = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    backButton: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: colors.gray[100],
      alignItems: 'center' as const, justifyContent: 'center' as const,
    },
    headerTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.gray[900] },
    card: {
      backgroundColor: colors.surfaceSolid,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...shadows.md,
    },
  }), [colors, fonts, spacing, borderRadius, shadows]);

  if (!isSignedIn) {
    return (
      <View style={[styles.screen, themedStyles.screen, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: colors.gray[500], fontFamily: fonts.medium }]}>
            {t.rewards.signInPrompt}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, themedStyles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400).springify()} style={styles.header}>
        <TouchableOpacity style={themedStyles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={22} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Rewards & Referrals</Text>
        <View style={themedStyles.backButton} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        ) : (
          <>
            {/* Balance Card */}
            <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
              <View style={[themedStyles.card, { backgroundColor: colors.primary[600] }]}>
                <View style={styles.balanceRow}>
                  <View>
                    <Text style={[styles.balanceLabel, { fontFamily: fonts.medium, color: 'rgba(255,255,255,0.7)' }]}>
                      Credit Balance
                    </Text>
                    <Text style={[styles.balanceAmount, { fontFamily: fonts.headingBold, color: colors.white }]}>
                      ${balance}
                    </Text>
                  </View>
                  <View style={styles.balanceIcon}>
                    <Gift size={32} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>
                <View style={styles.balanceStats}>
                  <View style={styles.balanceStat}>
                    <Text style={[styles.statValue, { fontFamily: fonts.bold, color: colors.white }]}>
                      {points.toLocaleString()}
                    </Text>
                    <Text style={[styles.statLabel, { fontFamily: fonts.regular, color: 'rgba(255,255,255,0.7)' }]}>
                      Points
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
                  <View style={styles.balanceStat}>
                    <Text style={[styles.statValue, { fontFamily: fonts.bold, color: colors.white }]}>
                      {totalReferrals}
                    </Text>
                    <Text style={[styles.statLabel, { fontFamily: fonts.regular, color: 'rgba(255,255,255,0.7)' }]}>
                      Referrals
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
                  <View style={styles.balanceStat}>
                    <Text style={[styles.statValue, { fontFamily: fonts.bold, color: colors.white }]}>
                      {credits.filter(c => parseFloat(c.amount) > 0).length}
                    </Text>
                    <Text style={[styles.statLabel, { fontFamily: fonts.regular, color: 'rgba(255,255,255,0.7)' }]}>
                      Rewards
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Referral Code Card */}
            <Animated.View entering={FadeInDown.delay(200).duration(500).springify()}>
              <View style={themedStyles.card}>
                <Text style={[styles.sectionTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>
                  Your Referral Code
                </Text>
                <View style={[styles.codeBox, { backgroundColor: colors.gray[50], borderColor: colors.primary[200] }]}>
                  <Text style={[styles.codeText, { fontFamily: fonts.headingBold, color: colors.primary[600] }]}>
                    {referralCode}
                  </Text>
                </View>
                <View style={styles.codeActions}>
                  <TouchableOpacity
                    style={[styles.codeButton, { backgroundColor: colors.primary[100] }]}
                    onPress={handleCopyCode}
                    activeOpacity={0.7}
                  >
                    <Copy size={18} color={colors.primary[600]} />
                    <Text style={[styles.codeButtonText, { fontFamily: fonts.semiBold, color: colors.primary[600] }]}>
                      Copy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.codeButton, { backgroundColor: colors.primary[600] }]}
                    onPress={handleShare}
                    activeOpacity={0.7}
                  >
                    <Share2 size={18} color={colors.white} />
                    <Text style={[styles.codeButtonText, { fontFamily: fonts.semiBold, color: colors.white }]}>
                      Share
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.codeNote, { fontFamily: fonts.regular, color: colors.gray[400] }]}>
                  Share your code and earn credits when friends sign up!
                </Text>
              </View>
            </Animated.View>

            {/* Apply Referral Code */}
            <Animated.View entering={FadeInDown.delay(250).duration(500).springify()}>
              <View style={themedStyles.card}>
                <Text style={[styles.sectionTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>
                  Have a Referral Code?
                </Text>
                <View style={styles.applyRow}>
                  <TextInput
                    value={applyCode}
                    onChangeText={(text) => setApplyCode(text.toUpperCase())}
                    placeholder="Enter code (e.g. ALLIANCE-XXXX)"
                    placeholderTextColor={colors.gray[400]}
                    style={[styles.applyInput, { fontFamily: fonts.medium, color: colors.gray[900], borderColor: colors.gray[300], backgroundColor: colors.gray[50] }]}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={[styles.applyButton, { backgroundColor: colors.primary[600], opacity: applying || !applyCode.trim() ? 0.5 : 1 }]}
                    onPress={handleApplyCode}
                    disabled={applying || !applyCode.trim()}
                    activeOpacity={0.7}
                  >
                    {applying ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Text style={[styles.applyButtonText, { fontFamily: fonts.semiBold, color: colors.white }]}>Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>

            {/* Convert Points to Credits */}
            {points >= 100 && (
              <Animated.View entering={FadeInDown.delay(300).duration(500).springify()}>
                <View style={themedStyles.card}>
                  <View style={styles.convertHeader}>
                    <TrendingUp size={24} color={colors.purple[600]} />
                    <Text style={[styles.sectionTitle, { fontFamily: fonts.semiBold, color: colors.gray[800], marginBottom: 0, marginLeft: 8 }]}>
                      Convert Points to Credits
                    </Text>
                  </View>
                  <Text style={[styles.convertRate, { fontFamily: fonts.medium, color: colors.gray[500] }]}>
                    1000 points = $1.00 credit
                  </Text>
                  <View style={styles.applyRow}>
                    <TextInput
                      value={convertPoints}
                      onChangeText={setConvertPoints}
                      placeholder="Enter points (min 100)"
                      placeholderTextColor={colors.gray[400]}
                      style={[styles.applyInput, { fontFamily: fonts.medium, color: colors.gray[900], borderColor: colors.gray[300], backgroundColor: colors.gray[50] }]}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity
                      style={[styles.applyButton, { backgroundColor: colors.purple[600], opacity: converting || !convertPoints.trim() ? 0.5 : 1 }]}
                      onPress={handleConvertPoints}
                      disabled={converting || !convertPoints.trim()}
                      activeOpacity={0.7}
                    >
                      {converting ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Text style={[styles.applyButtonText, { fontFamily: fonts.semiBold, color: colors.white }]}>Convert</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.codeNote, { fontFamily: fonts.regular, color: colors.gray[400] }]}>
                    Available: {points.toLocaleString()} points ≈ ${(points / 1000).toFixed(2)}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* How It Works */}
            <Animated.View entering={FadeInDown.delay(350).duration(500).springify()}>
              <View style={themedStyles.card}>
                <Text style={[styles.sectionTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>
                  How You Earn
                </Text>
                {[
                  { icon: <DollarSign size={20} color={colors.blue[600]} />, title: 'Earn Points', desc: 'Get 50 points for every $1 spent on shipments' },
                  { icon: <Users size={20} color={colors.primary[600]} />, title: 'Refer Friends', desc: 'Earn credit for each friend who signs up' },
                  { icon: <Truck size={20} color={colors.green[600]} />, title: 'Ship Packages', desc: 'Earn credit for each delivered shipment' },
                  { icon: <TrendingUp size={20} color={colors.purple[600]} />, title: 'Volume Bonus', desc: 'Earn extra credit per pound shipped' },
                ].map((item, i) => (
                  <View key={i} style={[styles.earnRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: colors.gray[100] }]}>
                    <View style={[styles.earnIcon, { backgroundColor: colors.gray[50] }]}>{item.icon}</View>
                    <View style={styles.earnText}>
                      <Text style={[styles.earnTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>{item.title}</Text>
                      <Text style={[styles.earnDesc, { fontFamily: fonts.regular, color: colors.gray[500] }]}>{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* Recent Activity */}
            {credits.length > 0 && (
              <Animated.View entering={FadeInDown.delay(450).duration(500).springify()}>
                <View style={themedStyles.card}>
                  <Text style={[styles.sectionTitle, { fontFamily: fonts.semiBold, color: colors.gray[800] }]}>
                    Recent Activity
                  </Text>
                  {credits.slice(0, 10).map((credit, i) => {
                    const amount = parseFloat(credit.amount);
                    const pts = credit.points || 0;
                    const isPositive = amount > 0 || pts > 0;
                    const hasAmount = Math.abs(amount) > 0;
                    const hasPoints = Math.abs(pts) > 0;

                    return (
                      <View
                        key={credit.id}
                        style={[styles.activityRow, i < Math.min(credits.length, 10) - 1 && { borderBottomWidth: 1, borderBottomColor: colors.gray[100] }]}
                      >
                        <View style={[styles.activityIcon, { backgroundColor: colors.gray[50] }]}>
                          {getTypeIcon(credit.type)}
                        </View>
                        <View style={styles.activityText}>
                          <Text style={[styles.activityTitle, { fontFamily: fonts.medium, color: colors.gray[800] }]}>
                            {getTypeLabel(credit.type)}
                          </Text>
                          <Text style={[styles.activityDate, { fontFamily: fonts.regular, color: colors.gray[400] }]}>
                            {new Date(credit.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.activityAmounts}>
                          {hasAmount && (
                            <Text
                              style={[
                                styles.activityAmount,
                                { fontFamily: fonts.bold, color: amount > 0 ? colors.green[600] : colors.red[600] },
                              ]}
                            >
                              {amount > 0 ? '+' : ''}${Math.abs(amount).toFixed(2)}
                            </Text>
                          )}
                          {hasPoints && (
                            <Text
                              style={[
                                styles.activityPoints,
                                { fontFamily: fonts.medium, color: pts > 0 ? colors.blue[600] : colors.gray[500] },
                              ]}
                            >
                              {pts > 0 ? '+' : ''}{pts} pts
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 120 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  emptyText: { fontSize: 16 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  balanceLabel: { fontSize: 14, marginBottom: 4 },
  balanceAmount: { fontSize: 36 },
  balanceIcon: { opacity: 0.5 },
  balanceStats: { flexDirection: 'row', alignItems: 'center' },
  balanceStat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 30 },
  statValue: { fontSize: 20, marginBottom: 2 },
  statLabel: { fontSize: 12 },
  sectionTitle: { fontSize: 16, marginBottom: 12 },
  codeBox: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginBottom: 12,
  },
  codeText: { fontSize: 22, letterSpacing: 2 },
  codeActions: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  codeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  codeButtonText: { fontSize: 14 },
  codeNote: { fontSize: 12, textAlign: 'center' },
  earnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  earnIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  earnText: { flex: 1 },
  earnTitle: { fontSize: 14, marginBottom: 2 },
  earnDesc: { fontSize: 12 },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  activityIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  activityText: { flex: 1 },
  activityTitle: { fontSize: 14 },
  activityDate: { fontSize: 11 },
  activityAmount: { fontSize: 15 },
  applyRow: { flexDirection: 'row', gap: 8 },
  applyInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, letterSpacing: 1 },
  applyButton: { paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  applyButtonText: { fontSize: 14 },
  convertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  convertRate: { fontSize: 13, marginBottom: 12 },
  activityAmounts: { alignItems: 'flex-end' },
  activityPoints: { fontSize: 12, marginTop: 2 },
});
