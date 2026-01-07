'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  Package,
  Plus,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plane,
  TruckIcon,
} from 'lucide-react';

// Mock data - sera remplacé par les données de la DB
const mockPackages = [
  {
    id: 1,
    trackingNumber: 'AS-2026-00123',
    status: 'in-transit',
    description: 'Vêtements et chaussures',
    weight: 15.5,
    totalCost: 67.00,
    currentLocation: 'Miami, FL - En transit',
    estimatedDelivery: '2026-01-08',
    recipientName: 'Jean Baptiste',
    recipientCity: 'Cap-Haïtien',
    timeline: [
      { status: 'Package Received', location: 'Miami, FL', date: '2026-01-05 09:00' },
      { status: 'In Transit', location: 'Miami Port', date: '2026-01-05 14:30' },
      { status: 'Customs Clearance', location: 'Port-au-Prince', date: 'Pending', pending: true },
      { status: 'Out for Delivery', location: 'Cap-Haïtien', date: 'Pending', pending: true },
    ],
  },
  {
    id: 2,
    trackingNumber: 'AS-2026-00124',
    status: 'delivered',
    description: 'Électronique',
    weight: 8.2,
    totalCost: 37.80,
    currentLocation: 'Cap-Haïtien - Livré',
    estimatedDelivery: '2026-01-03',
    recipientName: 'Marie Dupont',
    recipientCity: 'Cap-Haïtien',
    timeline: [
      { status: 'Package Received', location: 'Miami, FL', date: '2025-12-30 10:00' },
      { status: 'In Transit', location: 'Miami Port', date: '2025-12-31 08:00' },
      { status: 'Customs Cleared', location: 'Port-au-Prince', date: '2026-01-02 11:00' },
      { status: 'Delivered', location: 'Cap-Haïtien', date: '2026-01-03 15:45' },
    ],
  },
];

const statusConfig = {
  pending: { label: 'En Attente', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Clock },
  'in-transit': { label: 'En Transit', color: 'text-blue-600', bg: 'bg-blue-100', icon: Plane },
  customs: { label: 'Douanes', color: 'text-orange-600', bg: 'bg-orange-100', icon: AlertCircle },
  delivered: { label: 'Livré', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
};

export default function PackagesPage() {
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<typeof mockPackages[0] | null>(null);

  return (
    <>
      <Header />
      <main className="min-h-screen pb-32 pt-20 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Container>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 pt-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display">
                  Mes <span className="gradient-primary bg-clip-text text-transparent">Colis</span>
                </h1>
                <p className="text-gray-600">
                  Suivez tous vos envois en temps réel
                </p>
              </div>

              <Button size="lg" className="group">
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                Nouveau Colis
              </Button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-4 backdrop-blur-xl bg-white/80">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro de suivi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </Card>
          </motion.div>

          {/* Packages List */}
          <div className="space-y-6">
            {mockPackages.map((pkg, index) => {
              const statusInfo = statusConfig[pkg.status as keyof typeof statusConfig];
              const StatusIcon = statusInfo.icon;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <Card
                    hover
                    className="overflow-hidden backdrop-blur-xl bg-white/80 border-white/20 shadow-xl cursor-pointer"
                    onClick={() => setSelectedPackage(selectedPackage?.id === pkg.id ? null : pkg)}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30">
                            <Package className="w-6 h-6 text-white" />
                          </div>

                          <div>
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              {pkg.trackingNumber}
                            </h3>
                            <p className="text-gray-600 text-sm">{pkg.description}</p>
                          </div>
                        </div>

                        <div className={`px-3 py-1.5 ${statusInfo.bg} rounded-full flex items-center gap-2`}>
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`text-sm font-semibold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Poids</div>
                          <div className="font-semibold text-gray-900">{pkg.weight} lbs</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Coût Total</div>
                          <div className="font-semibold text-gray-900">${pkg.totalCost}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Destination</div>
                          <div className="font-semibold text-gray-900">{pkg.recipientCity}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Livraison prévue</div>
                          <div className="font-semibold text-gray-900">
                            {new Date(pkg.estimatedDelivery).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>

                      {/* Current Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        <span>{pkg.currentLocation}</span>
                      </div>

                      {/* Timeline (Expanded) */}
                      {selectedPackage?.id === pkg.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t"
                        >
                          <h4 className="font-semibold text-gray-900 mb-4">Historique de suivi</h4>
                          <div className="space-y-4">
                            {pkg.timeline.map((event, idx) => (
                              <div key={idx} className="flex gap-4">
                                <div className="relative">
                                  <div
                                    className={`w-3 h-3 rounded-full ${
                                      event.pending ? 'bg-gray-300' : 'bg-primary-600'
                                    } ring-4 ring-white shadow`}
                                  />
                                  {idx < pkg.timeline.length - 1 && (
                                    <div className="absolute left-1.5 top-3 w-px h-full bg-gray-300" />
                                  )}
                                </div>
                                <div className="flex-1 pb-6">
                                  <div className="font-semibold text-gray-900">{event.status}</div>
                                  <div className="text-sm text-gray-600">{event.location}</div>
                                  <div className="text-xs text-gray-500 mt-1">{event.date}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </main>
      <BottomNav />
    </>
  );
}
