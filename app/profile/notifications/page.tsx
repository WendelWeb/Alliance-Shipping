'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Package,
  DollarSign,
  Trash2,
  Check,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface Notification {
  id: string;
  type: 'package' | 'payment' | 'message' | 'general';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { t, locale } = useTranslation();
  const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', ht: 'fr-FR', es: 'es-ES' };

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'package',
      title: t.profile.notifications.packageDelivered,
      message: t.profile.notifications.packageDeliveredMsg,
      date: '2026-01-10T15:30:00',
      read: false,
    },
    {
      id: '2',
      type: 'payment',
      title: t.profile.notifications.paymentConfirmed,
      message: t.profile.notifications.paymentConfirmedMsg,
      date: '2026-01-09T10:15:00',
      read: true,
    },
    {
      id: '3',
      type: 'package',
      title: t.profile.notifications.packageInTransit,
      message: t.profile.notifications.packageInTransitMsg,
      date: '2026-01-08T09:00:00',
      read: true,
    },
    {
      id: '4',
      type: 'message',
      title: t.profile.notifications.newMessage,
      message: t.profile.notifications.newMessageMsg,
      date: '2026-01-07T14:20:00',
      read: false,
    },
    {
      id: '5',
      type: 'general',
      title: t.profile.notifications.specialPromotion,
      message: t.profile.notifications.specialPromotionMsg,
      date: '2026-01-05T08:00:00',
      read: true,
    },
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(
      notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map(notif => ({ ...notif, read: true }))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'package':
        return <Package className="h-6 w-6" />;
      case 'payment':
        return <DollarSign className="h-6 w-6" />;
      case 'message':
        return <MessageSquare className="h-6 w-6" />;
      default:
        return <Bell className="h-6 w-6" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'package':
        return 'from-blue-500 to-blue-600';
      case 'payment':
        return 'from-green-500 to-green-600';
      case 'message':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${t.profile.notifications.minutesAgo}`;
    } else if (diffHours < 24) {
      return `${diffHours}${t.profile.notifications.hoursAgo}`;
    } else if (diffDays < 7) {
      return `${diffDays}${t.profile.notifications.daysAgo}`;
    } else {
      return date.toLocaleDateString(localeMap[locale] || 'fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container>
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              {t.profile.backToProfile}
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t.profile.notifications.title}</h1>
                <p className="text-gray-600 mt-2">
                  {unreadCount > 0 ? `${unreadCount} ${unreadCount > 1 ? t.profile.notifications.unreadPlural : t.profile.notifications.unread}` : t.profile.notifications.allRead}
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  <Check className="h-4 w-4" />
                  {t.profile.notifications.markAllRead}
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="theme-card rounded-2xl shadow-sm p-8 text-center"
              >
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {t.profile.notifications.empty}
                </h3>
                <p className="text-gray-600">
                  {t.profile.notifications.emptyDesc}
                </p>
              </motion.div>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`theme-card rounded-xl shadow-sm transition-all ${
                    notification.read
                      ? ''
                      : 'border-primary-200 bg-primary-50/30'
                  } hover:shadow-md`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${getIconColor(notification.type)} text-white flex-shrink-0`}>
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-bold ${notification.read ? 'text-gray-900' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full" />
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.date)}
                          </span>

                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
                              >
                                {t.profile.notifications.markAsRead}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title={t.profile.notifications.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Clear All Button */}
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <button
                onClick={handleClearAll}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
                {t.profile.notifications.clearAll}
              </button>
            </motion.div>
          )}
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
