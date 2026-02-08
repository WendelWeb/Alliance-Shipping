import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Bell,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Megaphone,
  DollarSign,
  CheckCheck,
  Eye,
} from 'lucide-react-native';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { api } from '@/lib/api';

interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  packageId?: number | null;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  total: number;
}

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h`;
  return `${Math.floor(diffMin / 1440)}d`;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { isSignedIn } = useAuth();
  const { colors, fonts, spacing, borderRadius, shadows } = useTheme();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'package_received':
        return <Package size={18} color={colors.primary[600]} />;
      case 'package_in_transit':
        return <Truck size={18} color={colors.orange[600]} />;
      case 'package_available':
        return <CheckCircle size={18} color={colors.green[600]} />;
      case 'package_delivered':
        return <CheckCircle size={18} color={colors.green[700]} />;
      case 'request_approved':
        return <CheckCircle size={18} color={colors.green[600]} />;
      case 'request_rejected':
        return <XCircle size={18} color={colors.red[500]} />;
      case 'new_announcement':
        return <Megaphone size={18} color={colors.purple[600]} />;
      case 'price_change':
        return <DollarSign size={18} color={colors.orange[600]} />;
      default:
        return <Bell size={18} color={colors.primary[600]} />;
    }
  }

  function getNotificationBg(type: string) {
    switch (type) {
      case 'package_received':
        return colors.primary[50];
      case 'package_in_transit':
        return colors.yellow[50];
      case 'package_available':
      case 'package_delivered':
      case 'request_approved':
        return colors.green[50];
      case 'request_rejected':
        return colors.red[50];
      case 'new_announcement':
        return colors.purple[50];
      case 'price_change':
        return colors.yellow[50];
      default:
        return colors.gray[100];
    }
  }

  const fetchNotifications = useCallback(async () => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.get<NotificationsResponse>('/api/user/notifications?limit=50');
      setNotifications(data.notifications);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    api.patch('/api/user/notifications', { notificationId: id }).catch(() => {});
  };

  const handleMarkAllRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    api.patch('/api/user/notifications', { markAll: true }).catch(() => {});
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
    unreadBadge: {
      backgroundColor: colors.red[500],
      borderRadius: borderRadius.full,
      minWidth: 22,
      height: 22,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingHorizontal: 6,
    },
    unreadBadgeText: { fontFamily: fonts.bold, fontSize: 12, color: colors.white },
    unreadText: { fontFamily: fonts.medium, fontSize: 14, color: colors.gray[600] },
    markAllText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary[600] },
    allReadRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: spacing.sm,
      marginBottom: spacing.lg,
      backgroundColor: colors.green[50],
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
    },
    allReadText: { fontFamily: fonts.medium, fontSize: 14, color: colors.green[600] },
    emptyCard: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing['3xl'],
      alignItems: 'center' as const,
      ...shadows.md,
    },
    emptyIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.gray[100],
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: spacing.lg,
    },
    emptyTitle: { fontFamily: fonts.headingSemiBold, fontSize: 16, color: colors.gray[800], marginBottom: spacing.xs },
    emptyDesc: { fontFamily: fonts.regular, fontSize: 13, color: colors.gray[400], textAlign: 'center' as const },
    notificationCard: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    notificationCardUnread: {
      borderLeftWidth: 3,
      borderLeftColor: colors.primary[500],
    },
    notificationTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.gray[800], flex: 1 },
    notificationTitleUnread: { fontFamily: fonts.semiBold, color: colors.gray[900] },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary[500],
      marginLeft: spacing.sm,
    },
    notificationMessage: { fontFamily: fonts.regular, fontSize: 13, color: colors.gray[500], lineHeight: 18, marginBottom: spacing.sm },
    notificationTime: { fontFamily: fonts.regular, fontSize: 12, color: colors.gray[400] },
    notificationActions: {
      flexDirection: 'row' as const,
      borderTopWidth: 1,
      borderTopColor: colors.gray[100],
      marginTop: spacing.md,
      paddingTop: spacing.md,
      gap: spacing.xl,
    },
    notifActionText: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary[600] },
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
        <View style={styles.headerCenter}>
          <Text style={themedStyles.headerTitle}>
            {t.profile.notifications.title}
          </Text>
          {unreadCount > 0 && (
            <View style={themedStyles.unreadBadge}>
              <Text style={themedStyles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={themedStyles.backButton} />
      </Animated.View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
        >
          {unreadCount > 0 ? (
            <Animated.View
              entering={FadeInDown.delay(80).duration(400).springify().damping(18)}
              style={styles.unreadRow}
            >
              <Text style={themedStyles.unreadText}>
                {unreadCount}{' '}
                {unreadCount === 1
                  ? t.profile.notifications.unread
                  : t.profile.notifications.unreadPlural}
              </Text>
              <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
                <View style={styles.markAllButton}>
                  <CheckCheck size={14} color={colors.primary[600]} />
                  <Text style={themedStyles.markAllText}>
                    {t.profile.notifications.markAllRead}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ) : notifications.length > 0 ? (
            <Animated.View
              entering={FadeInDown.delay(80).duration(400).springify().damping(18)}
              style={themedStyles.allReadRow}
            >
              <CheckCheck size={16} color={colors.green[600]} />
              <Text style={themedStyles.allReadText}>
                {t.profile.notifications.allRead}
              </Text>
            </Animated.View>
          ) : null}

          {notifications.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(150).duration(500).springify().damping(18)}
              style={themedStyles.emptyCard}
            >
              <View style={themedStyles.emptyIconCircle}>
                <Bell size={32} color={colors.gray[400]} />
              </View>
              <Text style={themedStyles.emptyTitle}>
                {t.profile.notifications.empty}
              </Text>
              <Text style={themedStyles.emptyDesc}>
                {t.profile.notifications.emptyDesc}
              </Text>
            </Animated.View>
          ) : (
            notifications.map((notification, index) => (
              <Animated.View
                key={notification.id}
                entering={FadeInDown.delay(120 + index * 70)
                  .duration(500)
                  .springify()
                  .damping(18)}
              >
                <TouchableOpacity
                  style={[
                    themedStyles.notificationCard,
                    !notification.isRead && themedStyles.notificationCardUnread,
                  ]}
                  onPress={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationRow}>
                    <View
                      style={[
                        styles.notificationIconCircle,
                        {
                          backgroundColor: getNotificationBg(notification.type),
                        },
                      ]}
                    >
                      {getNotificationIcon(notification.type)}
                    </View>
                    <View style={styles.notificationContent}>
                      <View style={styles.notificationTitleRow}>
                        <Text
                          style={[
                            themedStyles.notificationTitle,
                            !notification.isRead && themedStyles.notificationTitleUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {notification.title}
                        </Text>
                        {!notification.isRead && <View style={themedStyles.unreadDot} />}
                      </View>
                      <Text
                        style={themedStyles.notificationMessage}
                        numberOfLines={2}
                      >
                        {notification.message}
                      </Text>
                      <Text style={themedStyles.notificationTime}>
                        {formatTimeAgo(notification.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {!notification.isRead && (
                    <View style={themedStyles.notificationActions}>
                      <TouchableOpacity
                        style={styles.notifAction}
                        onPress={() => handleMarkAsRead(notification.id)}
                        activeOpacity={0.7}
                      >
                        <Eye size={14} color={colors.primary[600]} />
                        <Text style={themedStyles.notifActionText}>
                          {t.profile.notifications.markAsRead}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </ScrollView>
      )}
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  unreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notifAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
