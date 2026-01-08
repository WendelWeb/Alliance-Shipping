'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Calculator as CalcIcon, Package, DollarSign, Clock } from 'lucide-react';
import { PRICING } from '@/constants';

export default function CalculatorPage() {
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<{
    serviceFee: number;
    weightCost: number;
    total: number;
    deliveryDays: string;
  } | null>(null);

  const calculatePrice = () => {
    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum <= 0) {
      alert('Veuillez entrer un poids valide');
      return;
    }

    const serviceFee = PRICING.serviceFee;
    const weightCost = weightNum * PRICING.pricePerLb;
    const total = serviceFee + weightCost;
    const deliveryDays = `${PRICING.standardDelivery.min}-${PRICING.standardDelivery.max}`;

    setResult({
      serviceFee,
      weightCost,
      total,
      deliveryDays,
    });
  };

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 font-display">
              Calculateur de <span className="gradient-primary bg-clip-text text-transparent">Prix</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Estimez le coût de votre envoi en quelques secondes
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-8">
            {/* Calculator Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8 backdrop-blur-xl bg-white/90 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30">
                    <CalcIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Calculer le coût</h2>
                </div>

                <div className="space-y-6">
                  {/* Weight Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids du colis (lbs)
                    </label>
                    <div className="relative">
                      <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Ex: 15"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-lg font-semibold"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* Calculate Button */}
                  <Button
                    size="lg"
                    fullWidth
                    onClick={calculatePrice}
                    className="text-lg py-6"
                  >
                    <CalcIcon className="w-5 h-5 mr-2" />
                    Calculer le prix
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Result Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-8 backdrop-blur-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">Estimation du coût</h2>

                {result ? (
                  <div className="space-y-6">
                    {/* Cost Breakdown */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <span className="text-lg">Frais de service</span>
                        <span className="text-2xl font-bold">${result.serviceFee.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                        <span className="text-lg">Coût du poids</span>
                        <span className="text-2xl font-bold">${result.weightCost.toFixed(2)}</span>
                      </div>

                      <div className="border-t-2 border-white/20 pt-4">
                        <div className="flex justify-between items-center p-6 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
                          <div>
                            <div className="text-sm text-white/80 mb-1">Total</div>
                            <div className="text-4xl font-bold">${result.total.toFixed(2)}</div>
                          </div>
                          <DollarSign className="w-12 h-12 text-white/50" />
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-white bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <Clock className="w-5 h-5" />
                        <span className="font-semibold">Livraison: {result.deliveryDays} jours</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">
                      Entrez le poids de votre colis pour voir l&apos;estimation du coût
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          </div>

          {/* Pricing Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <Card className="p-8 backdrop-blur-xl bg-white/80">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Informations de tarification</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                  <div>
                    <strong className="text-gray-900">Frais fixes:</strong> ${PRICING.serviceFee} par envoi
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                  <div>
                    <strong className="text-gray-900">Prix par livre:</strong> ${PRICING.pricePerLb}/lb
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                  <div>
                    <strong className="text-gray-900">Livraison standard:</strong> {PRICING.standardDelivery.min}-{PRICING.standardDelivery.max} jours
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
