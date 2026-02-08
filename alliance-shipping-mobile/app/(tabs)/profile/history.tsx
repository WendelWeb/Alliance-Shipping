import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import {
  ArrowLeft,
  Package,
  CreditCard,
  Truck,
  XCircle,
  DollarSign,
  CheckCircle,
  Clock,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { localeMap, type Locale } from '@/lib/i18n/config';

type HistoryType = 'delivered' | 'cancelled';

interface HistoryItem {
  id: string;
  type: HistoryType;
  description: string;
  date: string;
  amount: string;
  trackingNumber: string;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { t, locale } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState('$0.00');
  const [packagesDelivered, setPackagesDelivered] = useState(0);
  const [totalPackages, setTotalPackages] = useState(0);

  // Fetch history data
  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const { api } = await import('@/lib/api');
        const data = await api.get<{ success: boolean; packages: any[] }>('/api/user/packages');
        const packages = data.packages || [];

        // Filter only delivered and rejected packages
        const historyPackages = packages.filter(
          (pkg: any) => pkg.status === 'delivered' || pkg.status === 'rejected'
        );

        // Transform to history items
        const items: HistoryItem[] = historyPackages.map((pkg: any) => ({
          id: pkg.id.toString(),
          type: pkg.status === 'delivered' ? 'delivered' : 'cancelled',
          description: pkg.description,
          date: pkg.actualDelivery || pkg.createdAt,
          amount: `$${parseFloat(pkg.totalCost || '0').toFixed(2)}`,
          trackingNumber: pkg.trackingNumber,
        }));

        setHistoryData(items);

        // Calculate stats
        const delivered = historyPackages.filter((pkg: any) => pkg.status === 'delivered').length;
        const total = historyPackages.length;
        const spent = historyPackages
          .filter((pkg: any) => pkg.status === 'delivered')
          .reduce((sum: number, pkg: any) => sum + parseFloat(pkg.totalCost || '0'), 0);

        setPackagesDelivered(delivered);
        setTotalPackages(total);
        setTotalSpent(`$${spent.toFixed(2)}`);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isSignedIn]);

  function getTypeConfig(type: HistoryType) {
    switch (type) {
      case 'delivered':
        return {
          icon: <Package size={18} color={colors.green[600]} />,
          label: t.profile.history.completed,
          bgColor: colors.green[50],
          textColor: colors.green[600],
          dotColor: colors.green[500],
        };
      case 'cancelled':
        return {
          icon: <XCircle size={18} color={colors.red[600]} />,
          label: t.profile.history.cancelled,
          bgColor: colors.red[50],
          textColor: colors.red[600],
          dotColor: colors.red[500],
        };
    }
  }

  function getItemTitle(type: HistoryType) {
    switch (type) {
      case 'delivered':
        return t.profile.history.packageDelivered;
      case 'cancelled':
        return t.profile.history.requestCancelled;
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(localeMap[locale as Locale] || 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  const themedStyles = useMemo(() => ({
    screen: { backgroundColor: colors.background },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.gray[100],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    headerTitle: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.gray[900] },
    subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.gray[500], marginBottom: spacing.xl },
    historyCard: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    cardTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.gray[900], flex: 1, marginRight: spacing.sm },
    cardAmount: { fontFamily: fonts.bold, fontSize: 15, color: colors.gray[900] },
    cardDescription: { fontFamily: fonts.regular, fontSize: 13, color: colors.gray[500], marginBottom: spacing.sm },
    cardDate: { fontFamily: fonts.regular, fontSize: 12, color: colors.gray[400] },
    statusText: { fontFamily: fonts.semiBold, fontSize: 11 },
    summaryCard: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing.xl,
      marginTop: spacing.md,
      ...shadows.md,
    },
    summaryTitle: { fontFamily: fonts.headingSemiBold, fontSize: 16, color: colors.gray[900], marginBottom: spacing.xl, textAlign: 'center' as const },
    summaryValue: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.gray[900], marginBottom: 2 },
    summaryLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.gray[500], textAlign: 'center' as const },
    summaryDivider: { width: 1, height: 50, backgroundColor: colors.gray[200] },
  }), [colors, fonts, spacing, borderRadius, shadows]);

  return (
    <View style={[styles.screen, themedStyles.screen, { paddingTop: insets.top }]}>
      <Animated.View
        entering={FadeInDown.duration(400).springify().damping(18)}
        style={styles.header}
      >
        <TouchableOpacity
          style={themedStyles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={colors.gray[800]} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>{t.profile.history.title}</Text>
        <View style={themedStyles.backButton} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          entering={FadeInDown.delay(80).duration(400).springify().damping(18)}
        >
          <Text style={themedStyles.subtitle}>{t.profile.history.subtitle}</Text>
        </Animated.View>

        {loading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
          </View>
        ) : historyData.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400).springify().damping(18)}
            style={[themedStyles.historyCard, { alignItems: 'center', paddingVertical: 40 }]}
          >
            <Package size={48} color={colors.gray[300]} />
            <Text style={[themedStyles.cardTitle, { marginTop: 16, textAlign: 'center' }]}>
              {t.packages.noPackages}
            </Text>
            <Text style={[themedStyles.cardDescription, { textAlign: 'center' }]}>
              {t.profile.history.emptyDesc}
            </Text>
          </Animated.View>
        ) : (
          historyData.map((item, index) => {
          const config = getTypeConfig(item.type);
          const title = getItemTitle(item.type);

          return (
            <Animated.View
              key={item.id}
              entering={FadeInDown.delay(100 + index * 80)
                .duration(500)
                .springify()
                .damping(18)}
              style={themedStyles.historyCard}
            >
              <View style={styles.cardRow}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: config.bgColor },
                  ]}
                >
                  {config.icon}
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardTopRow}>
                    <Text style={themedStyles.cardTitle} numberOfLines={1}>
                      {title}
                    </Text>
                    <Text style={themedStyles.cardAmount}>{item.amount}</Text>
                  </View>
                  <Text style={themedStyles.cardDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={[themedStyles.cardDate, { fontSize: 11, fontFamily: fonts.medium }]} numberOfLines={1}>
                    {item.trackingNumber}
                  </Text>
                  <View style={styles.cardBottomRow}>
                    <View style={styles.dateRow}>
                      <Clock size={12} color={colors.gray[400]} />
                      <Text style={themedStyles.cardDate}>
                        {formatDate(item.date)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        { backgroundColor: config.bgColor },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: config.dotColor },
                        ]}
                      />
                      <Text
                        style={[
                          themedStyles.statusText,
                          { color: config.textColor },
                        ]}
                      >
                        {config.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        })
        )}

        <Animated.View
          entering={FadeInDown.delay(450).duration(500).springify().damping(18)}
          style={themedStyles.summaryCard}
        >
          <Text style={themedStyles.summaryTitle}>{t.profile.history.summary}</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIconCircle,
                  { backgroundColor: colors.green[50] },
                ]}
              >
                <DollarSign size={18} color={colors.green[600]} />
              </View>
              <Text style={themedStyles.summaryValue}>{totalSpent}</Text>
              <Text style={themedStyles.summaryLabel}>
                {t.profile.history.totalSpent}
              </Text>
            </View>

            <View style={themedStyles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIconCircle,
                  { backgroundColor: colors.primary[50] },
                ]}
              >
                <CheckCircle size={18} color={colors.primary[600]} />
              </View>
              <Text style={themedStyles.summaryValue}>{packagesDelivered}</Text>
              <Text style={themedStyles.summaryLabel}>
                {t.profile.history.packagesDelivered}
              </Text>
            </View>

            <View style={themedStyles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View
                style={[
                  styles.summaryIconCircle,
                  { backgroundColor: colors.purple[50] },
                ]}
              >
                <Package size={18} color={colors.purple[600]} />
              </View>
              <Text style={themedStyles.summaryValue}>{totalPackages}</Text>
              <Text style={themedStyles.summaryLabel}>
                {t.profile.history.totalPackages}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});
