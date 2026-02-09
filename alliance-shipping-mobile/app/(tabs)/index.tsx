import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { Bell } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';
import { NewsCard } from '@/components/NewsCard';

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  type?: string;
  createdAt: string;
  category?: string;
}

interface AnnouncementsResponse {
  announcements: Announcement[];
  total: number;
}

export default function NewsScreen() {
  const { user } = useUser();
  const { t, locale } = useTranslation();
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const data = await api.get<AnnouncementsResponse>(
        '/api/announcements/public?lang=' + locale + '&limit=20'
      );
      setAnnouncements(data.announcements);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [locale]);

  useEffect(() => {
    setLoading(true);
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const firstName = user?.firstName || '';

  // Type labels for news cards
  const typeLabels = useMemo(() => {
    const newsT = t.news as any;
    return newsT?.types || { news: 'News', alert: 'Alert', promo: 'Promo', maintenance: 'Maintenance' };
  }, [t.news]);

  // Count badge text
  const countText = useMemo(() => {
    const newsT = t.news as any;
    const template = newsT?.newsCount || '{count} articles';
    return template.replace('{count}', String(announcements.length));
  }, [t.news, announcements.length]);

  // Greeting emoji based on time of day
  const greetingEmoji = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return '🌙';
    if (hour < 12) return '☀️';
    if (hour < 18) return '🌤️';
    return '🌙';
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        screen: {
          flex: 1,
        },
        listContent: {
          paddingBottom: 100,
        },
        headerContainer: {
          paddingTop: 48,
          marginBottom: spacing.sm,
        },
        greetingCard: {
          marginHorizontal: spacing.lg,
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          marginBottom: spacing.lg,
        },
        greetingRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        greetingContent: {
          flex: 1,
        },
        greetingEmoji: {
          fontSize: 28,
          marginBottom: spacing.xs,
        },
        greetingText: {
          fontFamily: fonts.headingBold,
          fontSize: 24,
          letterSpacing: 0.2,
          marginBottom: 4,
        },
        greetingSubtitle: {
          fontFamily: fonts.regular,
          fontSize: 14,
          lineHeight: 20,
          letterSpacing: 0.1,
        },
        bellCircle: {
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: 'rgba(255,255,255,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        },
        sectionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.md,
        },
        sectionTitleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },
        sectionTitle: {
          fontFamily: fonts.headingSemiBold,
          fontSize: 20,
          letterSpacing: 0.1,
        },
        countBadge: {
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: borderRadius.full,
        },
        countBadgeText: {
          fontFamily: fonts.semiBold,
          fontSize: 12,
        },
        loadingContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing['5xl'],
        },
        loadingText: {
          fontFamily: fonts.medium,
          fontSize: 15,
          marginTop: spacing.md,
        },
        emptyContainer: {
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: spacing['5xl'],
          paddingHorizontal: spacing['3xl'],
        },
        emptyEmoji: {
          fontSize: 48,
          marginBottom: spacing.md,
        },
        emptyTitle: {
          fontFamily: fonts.headingSemiBold,
          fontSize: 18,
          textAlign: 'center',
          marginBottom: spacing.sm,
          letterSpacing: 0.15,
        },
        emptySubtitle: {
          fontFamily: fonts.regular,
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 20,
        },
      }),
    [fonts, spacing, borderRadius]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Announcement; index: number }) => (
      <NewsCard
        item={item}
        index={index}
        locale={locale}
        readMoreLabel={t.news.readMore}
        priorityLabels={t.news.priority}
        typeLabels={typeLabels}
      />
    ),
    [locale, t.news.readMore, t.news.priority, typeLabels]
  );

  const keyExtractor = useCallback(
    (item: Announcement) => String(item.id),
    []
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        {/* Greeting card */}
        <Animated.View
          entering={FadeInDown.duration(500).springify().damping(18)}
        >
          <LinearGradient
            colors={[colors.primary[600], colors.primary[800]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.greetingCard, shadows.lg]}
          >
            <View style={styles.greetingRow}>
              <View style={styles.greetingContent}>
                <Text style={styles.greetingEmoji}>{greetingEmoji}</Text>
                <Text style={[styles.greetingText, { color: colors.white }]}>
                  {t.news.greeting}, {firstName}!
                </Text>
                <Text style={[styles.greetingSubtitle, { color: 'rgba(255,255,255,0.75)' }]}>
                  {t.news.subtitle}
                </Text>
              </View>
              <View style={styles.bellCircle}>
                <Bell size={24} color="rgba(255,255,255,0.8)" />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Section header with count */}
        <Animated.View
          entering={FadeInDown.delay(120).duration(400).springify().damping(18)}
          style={styles.sectionHeader}
        >
          <View style={styles.sectionTitleRow}>
            <Text style={{ fontSize: 18 }}>📋</Text>
            <Text style={[styles.sectionTitle, { color: colors.gray[900] }]}>
              {t.news.title}
            </Text>
          </View>

          {!loading && announcements.length > 0 && (
            <Animated.View
              entering={FadeInRight.delay(300).duration(300).springify()}
            >
              <View style={[styles.countBadge, { backgroundColor: colors.primary[50] }]}>
                <Text style={[styles.countBadgeText, { color: colors.primary[600] }]}>
                  {countText}
                </Text>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </View>
    ),
    [firstName, greetingEmoji, t.news, colors, shadows, styles, loading, announcements.length, countText]
  );

  const renderEmpty = useCallback(
    () => {
      if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={[styles.loadingText, { color: colors.gray[500] }]}>
              {t.common.loading}
            </Text>
          </View>
        );
      }

      return (
        <Animated.View
          entering={FadeInDown.duration(400).springify().damping(18)}
          style={styles.emptyContainer}
        >
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={[styles.emptyTitle, { color: colors.gray[900] }]}>
            {t.news.noNews}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.gray[400] }]}>
            {t.common.pullToRefresh}
          </Text>
        </Animated.View>
      );
    },
    [loading, t.common.loading, t.common.pullToRefresh, t.news.noNews, colors, styles]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={announcements}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      />
    </View>
  );
}
