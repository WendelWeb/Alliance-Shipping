'use client';

import { motion } from 'framer-motion';
import { DollarSign, Check, Shield, MapPin, Package, Star, Gift, Smartphone, Calculator, TrendingUp, Zap, Coins } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { usePricing } from '@/hooks/usePricing';
import { useState, useEffect } from 'react';

interface SpecialItem {
  id: number;
  itemName: string;
  itemName_fr?: string;
  itemName_ht?: string;
  itemName_es?: string;
  brand: string;
  fixedFee: string;
}

export function Pricing() {
  const { t } = useTranslation();
  const { pricing, cities, loading } = usePricing();
  const [selectedCity, setSelectedCity] = useState('');
  const [weight, setWeight] = useState(10);
  const [specialItems, setSpecialItems] = useState<SpecialItem[]>([]);
  const [selectedSpecialItem, setSelectedSpecialItem] = useState<number | null>(null);
  const [chargeByWeight, setChargeByWeight] = useState(false);

  // Set default city when cities load
  useEffect(() => {
    if (cities.length > 0 && !selectedCity) {
      const capHaitien = cities.find(c => c.city === 'Cap-Haïtien');
      setSelectedCity(capHaitien?.city || cities[0].city);
    }
  }, [cities, selectedCity]);

  // Fetch special items
  useEffect(() => {
    fetch('/api/special-items/public')
      .then(res => res.ok ? res.json() : { items: [] })
      .then(data => setSpecialItems(data.items || []))
      .catch(() => {});
  }, []);

  const cityData = cities.find(c => c.city === selectedCity);
  const serviceFee = cityData?.serviceFee || pricing.serviceFee;
  const pricePerLb = cityData?.pricePerLb || pricing.pricePerLb;
  const specialItem = specialItems.find(i => i.id === selectedSpecialItem);
  const specialFee = specialItem ? parseFloat(specialItem.fixedFee) : 0;

  const weightCost = (!selectedSpecialItem || chargeByWeight) ? weight * pricePerLb : 0;
  const totalCost = serviceFee + weightCost + specialFee;

  const includedItems = [
    { icon: Shield, label: t.pricing.included?.insurance || 'Package insurance' },
    { icon: MapPin, label: t.pricing.included?.tracking || 'Real-time GPS tracking' },
    { icon: Package, label: t.pricing.included?.packaging || 'Professional packaging' },
    { icon: Star, label: t.pricing.included?.support || 'Dedicated customer support' },
    { icon: Check, label: t.pricing.included?.customs || 'Customs clearance assistance' },
    { icon: Check, label: t.pricing.included?.notifications || 'SMS & email notifications' },
  ];

  return (
    <section id="pricing" className="pt-4 pb-6 md:py-16 bg-[var(--theme-bg)]">
      <Container>
        <SectionTitle
          title={t.pricing.title}
          subtitle={t.pricing.subtitle}
        />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: Calculator */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-[var(--theme-surface)] rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Calculator Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 sm:p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Calculator className="w-5 h-5" />
                  <h3 className="text-lg font-bold">{t.pricing.calculator?.title || 'Shipping Calculator'}</h3>
                </div>
                <p className="text-white/80 text-sm">{t.pricing.subtitle}</p>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {/* City Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.pricing.calculator?.city || 'Destination City'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => setSelectedCity(city.city)}
                        className={`px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border ${
                          selectedCity === city.city
                            ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                            : 'bg-[var(--theme-bg)] text-gray-700 border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div>{city.city.split(',')[0]}</div>
                        <div className={`text-xs mt-0.5 ${selectedCity === city.city ? 'text-white/80' : 'text-gray-500'}`}>
                          ${city.pricePerLb}{t.pricing.calculator?.lbs ? `/${t.pricing.calculator.lbs}` : '/lb'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.pricing.calculator?.weight || 'Package Weight (lbs)'}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="flex items-center gap-1 bg-[var(--theme-bg)] border border-gray-200 rounded-lg px-3 py-2 min-w-[80px]">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={weight}
                        onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                        className="w-12 text-center font-bold text-gray-900 bg-transparent outline-none"
                      />
                      <span className="text-xs text-gray-500">lbs</span>
                    </div>
                  </div>
                </div>

                {/* Special Item */}
                {specialItems.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Smartphone className="w-4 h-4 inline mr-1" />
                      {t.pricing.calculator?.specialItem || 'Special Item (optional)'}
                    </label>
                    <select
                      value={selectedSpecialItem || ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setSelectedSpecialItem(val);
                        if (!val) setChargeByWeight(false);
                      }}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-[var(--theme-bg)] text-gray-900 outline-none focus:border-primary-400 transition-colors"
                    >
                      <option value="">{t.pricing.calculator?.noSpecialItem || 'No special item'}</option>
                      {specialItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.itemName} ({item.brand}) — ${parseFloat(item.fixedFee).toFixed(2)}
                        </option>
                      ))}
                    </select>

                    {selectedSpecialItem && (
                      <label className="flex items-center gap-2 mt-3 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={chargeByWeight}
                          onChange={(e) => setChargeByWeight(e.target.checked)}
                          className="rounded border-gray-300 accent-primary-600"
                        />
                        {t.pricing.calculator?.chargeByWeight || 'Also charge by weight'}
                      </label>
                    )}
                  </div>
                )}

                {/* Result Breakdown */}
                <div className="bg-[var(--theme-bg)] rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    {t.pricing.calculator?.result || 'Estimated Cost'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t.pricing.calculator?.breakdown?.service || 'Service Fee'}</span>
                      <span className="font-medium text-gray-900">${serviceFee.toFixed(2)}</span>
                    </div>
                    {(!selectedSpecialItem || chargeByWeight) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {t.pricing.calculator?.breakdown?.weight || 'Weight Fee'} ({weight} lbs x ${pricePerLb})
                        </span>
                        <span className="font-medium text-gray-900">${weightCost.toFixed(2)}</span>
                      </div>
                    )}
                    {specialItem && (
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600">{specialItem.itemName} ({specialItem.brand})</span>
                        <span className="font-medium text-purple-600">${specialFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          {t.pricing.calculator?.breakdown?.total || 'Total'}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-primary-600">
                          ${totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href="/dashboard/request-package"
                  className="w-full inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 px-5 py-3 text-base"
                >
                  {t.hero.ctaPrimary}
                </a>
              </div>
            </div>

            {/* City Pricing Cards */}
            {cities.length > 0 && (
              <div className="mt-6">
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                  {t.pricing.cityPricing?.title || 'Pricing by City'}
                </h4>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {cities.map((city) => (
                    <motion.div
                      key={city.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-[var(--theme-surface)] rounded-xl p-3 sm:p-4 border border-gray-200 text-center hover:shadow-md transition-shadow"
                    >
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 mx-auto mb-1.5" />
                      <div className="text-xs sm:text-sm font-semibold text-gray-900">{city.city.split(',')[0]}</div>
                      <div className="text-lg sm:text-xl font-bold text-primary-600 mt-0.5">
                        ${city.pricePerLb}{t.pricing.cityPricing?.perLb || '/lb'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        ${city.serviceFee} {t.pricing.cityPricing?.service || 'service fee'}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right: Included + Loyalty */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* What's Included */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                {t.pricing.included?.title || "What's Included"}
              </h3>
              <div className="grid gap-2 sm:gap-3">
                {includedItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="flex items-center gap-2.5 p-3 sm:p-4 bg-[var(--theme-surface)] rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Loyalty Program */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border border-amber-200 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 sm:px-5 py-3 sm:py-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Gift className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {t.pricing.loyalty?.title || 'Loyalty Program'}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/80">
                      {t.pricing.loyalty?.description || 'Earn rewards with every shipment'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {/* How you earn - 2x2 grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { icon: Star, text: t.pricing.loyalty?.pointsPerDollar || '50 points per $1 spent' },
                    { icon: DollarSign, text: t.pricing.loyalty?.creditPerShipment || '$1 credit per shipment' },
                    { icon: Package, text: t.pricing.loyalty?.pointsPerLb || '$0.10 per lb shipped' },
                    { icon: Coins, text: t.pricing.loyalty?.redemption || '1,000 points = $1 discount' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-[var(--theme-surface-solid)] rounded-xl p-2.5 sm:p-3 border border-amber-100 shadow-sm">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-700 leading-tight">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Dynamic Example */}
                {(() => {
                  const exampleWeight = 20;
                  const capHaitien = cities.find(c => c.city === 'Cap-Haïtien');
                  if (!capHaitien) return null;

                  const exServiceFee = capHaitien.serviceFee;
                  const exPricePerLb = capHaitien.pricePerLb;
                  const exWeightCost = exampleWeight * exPricePerLb;
                  const exTotal = exServiceFee + exWeightCost;

                  // Rewards calculation
                  const creditPerShipment = 1;
                  const weightBonus = exampleWeight * 0.10;
                  const pointsEarned = Math.floor(exTotal * 50);
                  const pointsValue = pointsEarned / 1000;
                  const totalRewards = creditPerShipment + weightBonus + pointsValue;

                  const ex = (t.pricing.loyalty as any)?.example;

                  return (
                    <div className="bg-[var(--theme-surface-solid)] rounded-xl border-2 border-dashed border-amber-300 overflow-hidden">
                      {/* Example Header */}
                      <div className="bg-amber-50 px-3 sm:px-5 py-2.5 border-b border-amber-200 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-amber-800">
                          {ex?.title || 'Concrete Example'}: {exampleWeight} lbs {ex?.to || 'to'} Cap-Haïtien
                        </span>
                      </div>

                      <div className="p-3 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Left: Shipping Cost */}
                        <div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            {ex?.shippingCost || 'Shipping Cost'}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{ex?.serviceFee || 'Service fee'}</span>
                              <span className="font-semibold text-gray-800">${exServiceFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{ex?.weightFee || 'Weight fee'}</span>
                              <span className="font-semibold text-gray-800">${exWeightCost.toFixed(2)}</span>
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {exampleWeight} lbs × ${exPricePerLb.toFixed(2)}
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                              <div className="flex justify-between">
                                <span className="font-bold text-gray-900">{ex?.total || 'Total'}</span>
                                <span className="font-bold text-lg text-gray-900">${exTotal.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Rewards */}
                        <div className="border-t sm:border-t-0 sm:border-l border-amber-200 pt-4 sm:pt-0 sm:pl-4">
                          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {ex?.yourRewards || 'Your Rewards'}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{ex?.creditShipment || 'Shipment credit'}</span>
                              <span className="font-semibold text-green-600">+${creditPerShipment.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{ex?.weightBonus || 'Weight bonus'}</span>
                              <span className="font-semibold text-green-600">+${weightBonus.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{ex?.pointsEarned || 'Points earned'}</span>
                              <span className="font-semibold text-amber-600">{pointsEarned.toLocaleString()} pts</span>
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {pointsEarned.toLocaleString()} pts ÷ 1000 = ${pointsValue.toFixed(2)} {ex?.pointsConversion || '= in discounts'}
                            </div>
                            <div className="border-t border-amber-200 pt-2">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-amber-800">{ex?.totalRewards || 'Total earned'}</span>
                                <span className="font-bold text-lg text-green-600">${totalRewards.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-green-50 px-3 sm:px-5 py-2 border-t border-green-200 text-center">
                        <span className="text-sm font-bold text-green-700">
                          💰 ${totalRewards.toFixed(2)} {ex?.perShipment || 'earned on this shipment'}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <p className="text-sm text-amber-700 font-semibold text-center bg-amber-100/50 rounded-lg px-3 py-2">
                  {t.pricing.loyalty?.program || 'The more you ship, the more you save!'}
                </p>
              </div>
            </motion.div>

            {/* Perfume Note */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm text-blue-800">
                {t.pricing.perfumeNote}
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
