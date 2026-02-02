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

interface Notification {
  id: string;
  type: 'package' | 'payment' | 'message' | 'general';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'package',
      title: 'Colis livré',
      message: 'Votre colis AS-2026-00123 a été livré avec succès à Port-au-Prince.',
      date: '2026-01-10T15:30:00',
      read: false,
    },
    {
      id: '2',
      type: 'payment',
      title: 'Paiement confirmé',
      message: 'Votre paiement de $37.00 via Moncash a été confirmé.',
      date: '2026-01-09T10:15:00',
      read: true,
    },
    {
      id: '3',
      type: 'package',
      title: 'Colis en transit',
      message: 'Votre colis AS-2026-00124 est en route vers Haïti. Livraison estimée: 2-3 jours.',
      date: '2026-01-08T09:00:00',
      read: true,
    },
    {
      id: '4',
      type: 'message',
      title: 'Nouveau message',
      message: 'Vous avez reçu un message de l\'équipe support concernant votre demande.',
      date: '2026-01-07T14:20:00',
      read: false,
    },
    {
      id: '5',
      type: 'general',
      title: 'Promotion spéciale',
      message: 'Profitez de 10% de réduction sur votre prochain envoi avec le code WELCOME10',
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
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Container>
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour au profil
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-2">
                  {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications sont lues'}
                </p>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
                >
                  <Check className="h-4 w-4" />
                  Tout marquer comme lu
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
                className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-8 text-center"
              >
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Aucune notification
                </h3>
                <p className="text-gray-600">
                  Vous n&apos;avez pas encore de notifications
                </p>
              </motion.div>
            ) : (
              notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                    notification.read
                      ? 'border-gray-100'
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
                                Marquer comme lu
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer"
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
                Effacer toutes les notifications
              </button>
            </motion.div>
          )}
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
