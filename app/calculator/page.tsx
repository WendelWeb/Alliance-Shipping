'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Calculator as CalcIcon, Package, DollarSign, Clock, MapPin } from 'lucide-react';
import { usePricing } from '@/hooks/usePricing';
import { useTranslation } from '@/lib/i18n/useTranslation';

const CITIES = [
  { id: 'Port-au-Prince', label: 'Port-au-Prince', description: 'Capitale' },
  { id: 'Cap-Haïtien', label: 'Cap-Haïtien', description: 'Deuxième ville' },
  { id: 'Port-de-Paix', label: 'Port-de-Paix', description: 'Nord-Ouest' },
];

export default function CalculatorPage() {
  const { t } = useTranslation();
  const { pricing } = usePricing();
  const [selectedCity, setSelectedCity] = useState('');
  const [cityPricing, setCityPricing] = useState<{ serviceFee: number; pricePerLb: number } | null>(null);
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<{
    serviceFee: number;
    weightCost: number;
    total: number;
    deliveryDays: string;
  } | null>(null);

  // Fetch city-specific pricing when city is selected
  useEffect(() => {
    if (selectedCity) {
      fetch(`/api/city-pricing/${selectedCity}`)
        .then(res => res.json())
        .then(data => {
          setCityPricing({
            serviceFee: data.serviceFee,
            pricePerLb: data.pricePerLb,
          });
        })
        .catch(err => {
          console.error('Error fetching city pricing:', err);
          // Fallback to default pricing
          setCityPricing({
            serviceFee: pricing.serviceFee,
            pricePerLb: pricing.pricePerLb,
          });
        });
    }
  }, [selectedCity, pricing]);

  const calculatePrice = () => {
    if (!selectedCity) {
      alert('Please select a destination city first');
      return;
    }

    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum <= 0) {
      alert(t.calculator.weightPlaceholder);
      return;
    }

    if (!cityPricing) {
      alert('Loading city pricing...');
      return;
    }

    const serviceFee = cityPricing.serviceFee;
    const weightCost = weightNum * cityPricing.pricePerLb;
    const total = serviceFee + weightCost;
    const deliveryDays = `${pricing.standardDelivery.min}-${pricing.standardDelivery.max}`;

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
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container size="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 font-display">
              {t.calculator.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t.calculator.subtitle}
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* City Selection - FIRST */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8 backdrop-blur-xl theme-surface shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Select Destination City</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {CITIES.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => setSelectedCity(city.id)}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        selectedCity === city.id
                          ? 'border-primary-500 bg-primary-50 shadow-lg'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-center">
                        <MapPin className={`h-8 w-8 mx-auto mb-2 ${
                          selectedCity === city.id ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <h3 className="font-bold text-lg text-gray-900">{city.label}</h3>
                        <p className="text-sm text-gray-500">{city.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Calculator Form */}
            <div className="grid lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-8 backdrop-blur-xl theme-surface shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/30">
                      <CalcIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t.calculator.title}</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Weight Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.calculator.weightLabel}
                      </label>
                      <div className="relative">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder={t.calculator.weightPlaceholder}
                          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-lg font-semibold"
                          min="0"
                          step="0.1"
                          disabled={!selectedCity}
                        />
                      </div>
                    </div>

                    {/* Calculate Button */}
                    <Button
                      size="lg"
                      fullWidth
                      onClick={calculatePrice}
                      className="text-lg py-6"
                      disabled={!selectedCity}
                    >
                      <CalcIcon className="w-5 h-5 mr-2" />
                      {t.calculator.calculate}
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
                  <h2 className="text-2xl font-bold mb-6">{t.calculator.result.title}</h2>

                  {result ? (
                    <div className="space-y-6">
                      {/* City Info */}
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2 text-white/90">
                          <MapPin className="w-5 h-5" />
                          <span className="font-semibold">Destination: {selectedCity}</span>
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                          <span className="text-lg">{t.calculator.result.serviceFee}</span>
                          <span className="text-2xl font-bold">${result.serviceFee.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                          <span className="text-lg">{t.calculator.result.weightCost}</span>
                          <span className="text-2xl font-bold">${result.weightCost.toFixed(2)}</span>
                        </div>

                        <div className="border-t-2 border-white/20 pt-4">
                          <div className="flex justify-between items-center p-6 bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl">
                            <div>
                              <div className="text-sm text-white/80 mb-1">{t.calculator.result.total}</div>
                              <div className="text-4xl font-bold">${result.total.toFixed(2)}</div>
                            </div>
                            <DollarSign className="w-12 h-12 text-white/50" />
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-white bg-white/10 backdrop-blur-sm rounded-xl p-4">
                          <Clock className="w-5 h-5" />
                          <span className="font-semibold">{t.calculator.result.deliveryTime}: {result.deliveryDays} {t.calculator.result.days}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      {!selectedCity ? (
                        <>
                          <MapPin className="w-16 h-16 text-white/30 mx-auto mb-4" />
                          <p className="text-white/60">
                            Select a destination city to start
                          </p>
                        </>
                      ) : (
                        <>
                          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
                          <p className="text-white/60">
                            {t.calculator.subtitle}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Pricing Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <Card className="p-8 backdrop-blur-xl theme-surface">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t.calculator.pricing.title}</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                  <div>
                    {t.calculator.pricing.serviceFee}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                  <div>
                    {t.calculator.pricing.perPound}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2" />
                  <div>
                    {t.calculator.pricing.example}
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
