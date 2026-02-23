'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  Calculator as CalcIcon,
  Package,
  DollarSign,
  Clock,
  MapPin,
  Droplets,
  Smartphone,
  Tag,
  Check,
} from 'lucide-react';
import { usePricing } from '@/hooks/usePricing';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTheme } from '@/lib/themes/ThemeProvider';

interface SpecialItem {
  id: number;
  category: string;
  brand: string;
  itemName: string;
  minModel: string | null;
  maxModel: string | null;
  fixedFee: number;
  description: string | null;
  imageUrl: string | null;
}

export default function CalculatorPage() {
  const { t } = useTranslation();
  const { pricing, cities, loading: pricingLoading } = usePricing();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const [selectedCity, setSelectedCity] = useState('');
  const [weight, setWeight] = useState('');
  const [hasPerfume, setHasPerfume] = useState(false);
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([]);
  const [loadingSpecial, setLoadingSpecial] = useState(true);
  const [result, setResult] = useState<{
    serviceFee: number;
    weightCost: number;
    total: number;
    deliveryDays: string;
  } | null>(null);

  // Fetch special items
  useEffect(() => {
    fetch('/api/special-items/public')
      .then((res) => res.json())
      .then((data) => {
        const items = (data.items || []).map((item: any) => ({
          ...item,
          fixedFee: typeof item.fixedFee === 'string' ? parseFloat(item.fixedFee) : (item.fixedFee || 0),
        }));
        setSpecialItems(items);
      })
      .catch(() => setSpecialItems([]))
      .finally(() => setLoadingSpecial(false));
  }, []);

  // Get pricing for selected city
  const currentCityData = cities.find((c) => c.city === selectedCity);
  const cityServiceFee = currentCityData?.serviceFee ?? pricing.serviceFee;
  const cityPricePerLb = currentCityData?.pricePerLb ?? pricing.pricePerLb;

  const calculatePrice = () => {
    if (!selectedCity) {
      alert(t.calculator.selectCityFirst);
      return;
    }

    const weightNum = parseFloat(weight);
    if (!weightNum || weightNum <= 0) {
      alert(t.calculator.weightPlaceholder);
      return;
    }

    const serviceFee = cityServiceFee;
    const weightCost = weightNum * cityPricePerLb;
    const total = serviceFee + weightCost;

    let deliveryDays: string;
    if (hasPerfume && currentCityData) {
      deliveryDays = `${currentCityData.perfumeDaysMin}-${currentCityData.perfumeDaysMax}`;
    } else if (currentCityData) {
      deliveryDays = `${currentCityData.deliveryDaysMin}-${currentCityData.deliveryDaysMax}`;
    } else {
      deliveryDays = `${pricing.standardDelivery.min}-${pricing.standardDelivery.max}`;
    }

    setResult({
      serviceFee,
      weightCost,
      total,
      deliveryDays,
    });
  };

  // Group special items by category
  const groupedSpecialItems = specialItems.reduce((acc, item) => {
    const key = item.category || 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, SpecialItem[]>);

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
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 font-display" style={{ color: colors.gray[900] }}>
              {t.calculator.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto" style={{ color: colors.gray[600] }}>
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
                  <h2 className="text-2xl font-bold" style={{ color: colors.gray[900] }}>{t.calculator.selectCityTitle}</h2>
                </div>

                {pricingLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary[500] }} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          setSelectedCity(city.city);
                          setResult(null);
                        }}
                        className="p-6 rounded-xl border-2 transition-all"
                        style={{
                          borderColor: selectedCity === city.city ? colors.primary[500] : colors.gray[200],
                          backgroundColor: selectedCity === city.city
                            ? (isDark ? colors.primary[900] : colors.primary[50])
                            : (isDark ? 'transparent' : colors.gray[50]),
                          boxShadow: selectedCity === city.city ? theme.shadow.lg : 'none'
                        }}
                      >
                        <div className="text-center">
                          {selectedCity === city.city ? (
                            <div
                              className="h-8 w-8 mx-auto mb-2 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: colors.primary[600] }}
                            >
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <MapPin
                              className="h-8 w-8 mx-auto mb-2"
                              style={{ color: colors.gray[400] }}
                            />
                          )}
                          <h3 className="font-bold text-lg" style={{ color: colors.gray[900] }}>{city.city}</h3>
                          <p className="text-sm mt-1" style={{ color: colors.gray[500] }}>
                            ${city.serviceFee.toFixed(2)} + ${city.pricePerLb.toFixed(2)}/lb
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
                    <h2 className="text-2xl font-bold" style={{ color: colors.gray[900] }}>{t.calculator.title}</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Weight Input */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.gray[700] }}>
                        {t.calculator.weightLabel}
                      </label>
                      <div className="relative">
                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: colors.gray[400] }} />
                        <input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder={t.calculator.weightPlaceholder}
                          className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-4 transition-all outline-none text-lg font-semibold"
                          style={{
                            borderColor: colors.gray[200],
                            backgroundColor: colors.gray[50],
                            color: colors.gray[900],
                          }}
                          min="0"
                          step="0.1"
                          disabled={!selectedCity}
                        />
                      </div>
                    </div>

                    {/* Perfume/Liquid Toggle */}
                    <div
                      className="flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer"
                      style={{
                        borderColor: hasPerfume ? '#f59e0b' : colors.gray[200],
                        backgroundColor: hasPerfume
                          ? (isDark ? '#78350f' : '#fffbeb')
                          : 'transparent',
                      }}
                      onClick={() => setHasPerfume(!hasPerfume)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{
                            backgroundColor: hasPerfume
                              ? (isDark ? '#92400e' : '#fef3c7')
                              : (isDark ? colors.gray[200] : colors.gray[100]),
                          }}
                        >
                          <Droplets
                            className="w-5 h-5"
                            style={{
                              color: hasPerfume ? '#f59e0b' : colors.gray[400],
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: colors.gray[900] }}>
                            {t.calculator.perfumeLabel}
                          </p>
                          <p className="text-xs" style={{ color: colors.gray[500] }}>
                            {t.calculator.perfumeNote}
                          </p>
                        </div>
                      </div>
                      <div
                        className="relative w-12 h-7 rounded-full transition-all"
                        style={{
                          backgroundColor: hasPerfume ? '#f59e0b' : colors.gray[300],
                        }}
                      >
                        <motion.div
                          className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md"
                          animate={{ left: hasPerfume ? '22px' : '2px' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
                          <span className="font-semibold">{t.calculator.destination}: {selectedCity}</span>
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
                          <span className="font-semibold">
                            {t.calculator.result.deliveryTime}: {result.deliveryDays} {t.calculator.result.days}
                          </span>
                        </div>

                        {hasPerfume && (
                          <div className="flex items-center justify-center gap-2 bg-yellow-500/20 backdrop-blur-sm rounded-xl p-3">
                            <Droplets className="w-4 h-4 text-yellow-300" />
                            <span className="text-sm text-yellow-100 font-medium">
                              {t.calculator.perfumeNote}
                            </span>
                          </div>
                        )}

                        {/* Purchase Assistance Hint */}
                        <a
                          href="https://wa.me/50948812652"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-colors"
                        >
                          <span className="text-base">🛒</span>
                          <span className="text-sm text-white/80 font-medium">
                            {(t as any).purchaseAssistance?.subtitle || 'No US card? We buy for you!'}
                          </span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      {!selectedCity ? (
                        <>
                          <MapPin className="w-16 h-16 text-white/30 mx-auto mb-4" />
                          <p className="text-white/60">
                            {t.calculator.selectCityToStart}
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

          {/* Special Items Section */}
          {!loadingSpecial && specialItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-12 max-w-4xl mx-auto"
            >
              <Card className="p-8 backdrop-blur-xl theme-surface shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="p-3 rounded-2xl shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, #8b5cf6, #7c3aed)`,
                    }}
                  >
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: colors.gray[900] }}>
                      {t.calculator.specialItemsTitle}
                    </h3>
                    <p className="text-sm" style={{ color: colors.gray[500] }}>
                      {t.calculator.specialItemsSubtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(groupedSpecialItems).map(([category, items]) => (
                    <div key={category}>
                      <h4
                        className="text-sm font-bold uppercase tracking-wider mb-3"
                        style={{ color: colors.gray[500] }}
                      >
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 rounded-xl border-2 transition-all"
                            style={{
                              borderColor: colors.gray[200],
                              backgroundColor: isDark ? colors.gray[200] : colors.gray[50],
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="p-2 rounded-lg"
                                style={{
                                  backgroundColor: isDark ? '#581c87' : '#f3e8ff',
                                }}
                              >
                                <Tag className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                              </div>
                              <div>
                                <p className="font-semibold text-sm" style={{ color: colors.gray[900] }}>
                                  {item.itemName}
                                </p>
                                {(item.minModel || item.maxModel) && (
                                  <p className="text-xs font-medium" style={{ color: colors.primary[600] }}>
                                    {item.minModel && item.maxModel
                                      ? `${item.minModel} - ${item.maxModel}`
                                      : item.minModel || item.maxModel}
                                  </p>
                                )}
                                {item.description && (
                                  <p className="text-xs" style={{ color: colors.gray[500] }}>
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div
                              className="px-3 py-1.5 rounded-lg text-sm font-bold"
                              style={{
                                backgroundColor: isDark ? '#581c87' : '#f3e8ff',
                                color: '#8b5cf6',
                              }}
                            >
                              ${item.fixedFee.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Pricing Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 max-w-4xl mx-auto"
          >
            <Card className="p-8 backdrop-blur-xl theme-surface">
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.gray[900] }}>{t.calculator.pricing.title}</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm" style={{ color: colors.gray[600] }}>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: colors.primary[600] }} />
                  <div>
                    {t.calculator.pricing.serviceFee}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: colors.primary[600] }} />
                  <div>
                    {t.calculator.pricing.perPound}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: colors.primary[600] }} />
                  <div>
                    {t.calculator.pricing.example}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#f59e0b' }} />
                  <div>
                    {t.calculator.pricing.perfumeExtra}
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
