import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Gift,
  TrendingUp,
  Star,
  Truck,
  DollarSign,
  Weight,
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

const FALLBACK_REWARDS = {
  signInPrompt: 'Sign in to view your rewards',
  title: 'My Rewards',
  creditBalance: 'Credit Balance',
  points: 'Points',
  rewards: 'Rewards',
  convertPointsTitle: 'Convert Points to Credits',
  convertRate: '1000 points = $1.00 credit',
  enterPoints: 'Enter points (min 100)',
  convert: 'Convert',
  howYouEarn: 'How You Earn',
  earnPoints: 'Earn Points',
  earnPointsDesc: 'Get 50 points for every $1 spent on shipments',
  shipPackages: 'Ship Packages',
  shipPackagesDesc: 'Earn credit for each delivered shipment',
  volumeBonus: 'Volume Bonus',
  volumeBonusDesc: 'Earn extra credit per pound shipped',
  recentActivity: 'Recent Activity',
  success: 'Success',
  error: 'Error',
  pointsConverted: 'Converted {points} points to ${amount}!',
  conversionFailed: 'Failed to convert points',
  somethingWrong: 'Something went wrong',
  typeLabels: {
    shipment: 'Shipment Credit',
    weight: 'Weight Bonus',
    redemption: 'Redeemed',
    spending: 'Points Earned',
    conversion: 'Points Conversion',
    adminAdjustment: 'Adjustment',
  },
};

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { colors, fonts, spacing, borderRadius } = useTheme();
  const { t } = useTranslation();

  const rw: Record<string, any> = (t as any)?.rewards || FALLBACK_REWARDS;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState('0.00');
  const [points, setPoints] = useState(0);
  const [credits, setCredits] = useState<CreditEntry[]>([]);
  const [convertPoints, setConvertPoints] = useState('');
  const [converting, setConverting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const loyaltyData = await api.get<any>('/api/user/loyalty');
      setBalance(String(loyaltyData?.balance ?? '0.00'));
      setPoints(loyaltyData?.points || 0);
      setCredits(loyaltyData?.history || []);
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

  const handleConvertPoints = async () => {
    const pts = parseInt(convertPoints);
    if (!pts || pts <= 0) return;
    setConverting(true);
    try {
      const data = await api.post<any>('/api/user/loyalty/convert', { points: pts });
      if (data.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(rw.success || 'Success', `Converted ${pts} points!`);
        setConvertPoints('');
        fetchData();
      } else {
        Alert.alert(rw.error || 'Error', data.error || rw.conversionFailed || 'Failed');
      }
    } catch (error: any) {
      Alert.alert(rw.error || 'Error', error?.message || rw.somethingWrong || 'Error');
    } finally {
      setConverting(false);
    }
  };

  // Card style helper
  const cardStyle = {
    backgroundColor: colors.surfaceSolid,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  };

  if (!isSignedIn) {
    return (
      <View style={[s.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <View style={s.center}>
          <Text style={{ color: colors.gray[500], fontFamily: fonts.medium, fontSize: 16 }}>
            {rw.signInPrompt || 'Sign in to view your rewards'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: colors.gray[100] }]}>
          <ArrowLeft size={22} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={{ fontFamily: fonts.headingBold, fontSize: 18, color: colors.gray[900] }}>
          {rw.title || 'My Rewards'}
        </Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />}
      >
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        ) : (
          <>
            {/* Balance */}
            <View style={[cardStyle, { backgroundColor: colors.primary[600] }]}>
              <View style={s.balanceRow}>
                <View>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                    {rw.creditBalance || 'Credit Balance'}
                  </Text>
                  <Text style={{ fontFamily: fonts.headingBold, fontSize: 36, color: '#fff' }}>
                    ${balance}
                  </Text>
                </View>
                <Gift size={32} color="rgba(255,255,255,0.3)" />
              </View>
              <View style={s.statsRow}>
                <View style={s.stat}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: '#fff' }}>{points.toLocaleString()}</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{rw.points || 'Points'}</Text>
                </View>
                <View style={{ width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <View style={s.stat}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 20, color: '#fff' }}>{credits.filter(c => parseFloat(c.amount) > 0).length}</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{rw.rewards || 'Rewards'}</Text>
                </View>
              </View>
            </View>

            {/* Convert Points */}
            {points >= 100 && (
              <View style={cardStyle}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TrendingUp size={24} color={colors.purple[600]} />
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.gray[800], marginLeft: 8 }}>
                    {rw.convertPointsTitle || 'Convert Points to Credits'}
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.gray[500], marginBottom: 12 }}>
                  {rw.convertRate || '1000 points = $1.00 credit'}
                </Text>
                <View style={s.inputRow}>
                  <TextInput
                    value={convertPoints}
                    onChangeText={setConvertPoints}
                    placeholder={rw.enterPoints || 'Enter points (min 100)'}
                    placeholderTextColor={colors.gray[400]}
                    style={[s.input, { fontFamily: fonts.medium, color: colors.gray[900], borderColor: colors.gray[300], backgroundColor: colors.gray[50] }]}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={[s.actionBtn, { backgroundColor: colors.purple[600], opacity: converting || !convertPoints.trim() ? 0.5 : 1 }]}
                    onPress={handleConvertPoints}
                    disabled={converting || !convertPoints.trim()}
                  >
                    {converting ? <ActivityIndicator size="small" color="#fff" /> : (
                      <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: '#fff' }}>{rw.convert || 'Convert'}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* How It Works */}
            <View style={cardStyle}>
              <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.gray[800], marginBottom: 12 }}>
                {rw.howYouEarn || 'How You Earn'}
              </Text>
              {[
                { Icon: DollarSign, c: colors.primary[600], title: rw.earnPoints || 'Earn Points', desc: rw.earnPointsDesc || 'Get 50 points for every $1 spent' },
                { Icon: Truck, c: colors.green[600], title: rw.shipPackages || 'Ship Packages', desc: rw.shipPackagesDesc || 'Earn credit for each shipment' },
                { Icon: Weight, c: colors.purple[600], title: rw.volumeBonus || 'Volume Bonus', desc: rw.volumeBonusDesc || 'Earn extra per pound' },
              ].map((item, i) => (
                <View key={i} style={[s.earnRow, i < 2 ? { borderBottomWidth: 1, borderBottomColor: colors.gray[100] } : {}]}>
                  <View style={[s.earnIcon, { backgroundColor: colors.gray[50] }]}>
                    <item.Icon size={20} color={item.c} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 14, color: colors.gray[800], marginBottom: 2 }}>{item.title}</Text>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 12, color: colors.gray[500] }}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Recent Activity */}
            {credits.length > 0 && (
              <View style={cardStyle}>
                <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.gray[800], marginBottom: 12 }}>
                  {rw.recentActivity || 'Recent Activity'}
                </Text>
                {credits.slice(0, 10).map((credit, i) => {
                  const amt = parseFloat(credit.amount);
                  const pts = credit.points || 0;
                  return (
                    <View key={credit.id} style={[s.activityRow, i < Math.min(credits.length, 10) - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.gray[100] } : {}]}>
                      <View style={[s.activityIcon, { backgroundColor: colors.gray[50] }]}>
                        <Star size={16} color={colors.primary[600]} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: colors.gray[800] }}>{credit.type}</Text>
                        <Text style={{ fontFamily: fonts.regular, fontSize: 11, color: colors.gray[400] }}>
                          {new Date(credit.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        {Math.abs(amt) > 0 && (
                          <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: amt > 0 ? colors.green[600] : colors.red[600] }}>
                            {amt > 0 ? '+' : ''}${Math.abs(amt).toFixed(2)}
                          </Text>
                        )}
                        {Math.abs(pts) > 0 && (
                          <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: pts > 0 ? colors.primary[600] : colors.gray[500] }}>
                            {pts > 0 ? '+' : ''}{pts} pts
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  actionBtn: { paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  earnRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  earnIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  activityIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});
