'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import {
  ArrowLeft,
  Clock,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Truck,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  type: 'package' | 'payment';
  title: string;
  description: string;
  amount?: number;
  status: 'completed' | 'cancelled' | 'in-progress';
  date: string;
  trackingNumber?: string;
}

export default function HistoryPage() {
  const historyItems: HistoryItem[] = [
    {
      id: '1',
      type: 'package',
      title: 'Colis livré',
      description: 'Vêtements et accessoires',
      amount: 37.00,
      status: 'completed',
      date: '2026-01-10',
      trackingNumber: 'AS-2026-00123',
    },
    {
      id: '2',
      type: 'payment',
      title: 'Paiement effectué',
      description: 'Moncash - AS-2026-00123',
      amount: 37.00,
      status: 'completed',
      date: '2026-01-09',
    },
    {
      id: '3',
      type: 'package',
      title: 'Colis en transit',
      description: 'Électronique',
      amount: 52.00,
      status: 'in-progress',
      date: '2026-01-08',
      trackingNumber: 'AS-2026-00124',
    },
    {
      id: '4',
      type: 'package',
      title: 'Demande annulée',
      description: 'Documents',
      status: 'cancelled',
      date: '2026-01-05',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in-progress':
        return <Truck className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      case 'in-progress':
        return 'En cours';
      default:
        return 'En attente';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

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

            <h1 className="text-3xl font-bold text-gray-900">Historique</h1>
            <p className="text-gray-600 mt-2">
              Consultez l&apos;historique de vos colis et paiements
            </p>
          </div>

          {/* History List */}
          <div className="space-y-4">
            {historyItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-8 text-center"
              >
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Aucun historique
                </h3>
                <p className="text-gray-600">
                  Votre historique de transactions apparaîtra ici
                </p>
              </motion.div>
            ) : (
              historyItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${
                        item.type === 'package'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                          : 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                      }`}>
                        {item.type === 'package' ? (
                          <Package className="h-6 w-6" />
                        ) : (
                          <DollarSign className="h-6 w-6" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {item.title}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {getStatusIcon(item.status)}
                            {getStatusText(item.status)}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>

                        {item.trackingNumber && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg mb-2">
                            <Package className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-mono font-semibold text-gray-900">
                              {item.trackingNumber}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {formatDate(item.date)}
                        </div>
                      </div>
                    </div>

                    {item.amount && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${item.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">USD</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg p-6 text-white"
          >
            <h3 className="text-xl font-bold mb-4">Résumé</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Total dépensé</p>
                <p className="text-2xl font-bold">$126.00</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Colis livrés</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">En cours</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <div>
                <p className="text-white/80 text-sm mb-1">Total colis</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </motion.div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
