import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { Newspaper } from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';
import { NewsCard } from '@/components/NewsCard';

interface Announcement {
  id: string;
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
  const insets = useSafeAreaInsets();
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
    } catch {
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
          paddingTop: spacing.lg,
          marginBottom: spacing.sm,
        },
        greetingCard: {
          marginHorizontal: spacing.lg,
          borderRadius: borderRadius.xl,
          padding: spacing.xl,
          marginBottom: spacing.xl,
        },
        greetingText: {
          fontFamily: fonts.headingBold,
          fontSize: 22,
          letterSpacing: 0.2,
          marginBottom: spacing.xs,
        },
        greetingSubtitle: {
          fontFamily: fonts.regular,
          fontSize: 14,
          lineHeight: 20,
          letterSpacing: 0.1,
        },
        sectionHeader: {
          paddingHorizontal: spacing.lg,
          marginBottom: spacing.md,
        },
        sectionTitle: {
          fontFamily: fonts.headingSemiBold,
          fontSize: 20,
          letterSpacing: 0.1,
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
        emptyIconCircle: {
          width: 72,
          height: 72,
          borderRadius: 36,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xl,
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
      />
    ),
    [locale, t.news.readMore, t.news.priority]
  );

  const keyExtractor = useCallback(
    (item: Announcement) => item.id,
    []
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <Animated.View
          entering={FadeInDown.duration(500).springify().damping(18)}
        >
          <LinearGradient
            colors={[colors.primary[600], colors.primary[800]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.greetingCard, shadows.lg]}
          >
            <Text style={[styles.greetingText, { color: colors.white }]}>
              {t.news.greeting}, {firstName}!
            </Text>
            <Text style={[styles.greetingSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
              {t.news.subtitle}
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(120).duration(400).springify().damping(18)}
          style={styles.sectionHeader}
        >
          <Text style={[styles.sectionTitle, { color: colors.gray[900] }]}>
            {t.news.title}
          </Text>
        </Animated.View>
      </View>
    ),
    [firstName, t.news.greeting, t.news.subtitle, t.news.title, colors, shadows, styles]
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
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.primary[50] }]}>
            <Newspaper size={32} color={colors.primary[400]} />
          </View>
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
