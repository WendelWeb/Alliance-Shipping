'use client';

import { motion } from 'framer-motion';
import { DollarSign, Check, Shield, MapPin, Package, Star, Gift, Smartphone, Calculator } from 'lucide-react';
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
    <section id="pricing" className="py-20 bg-[var(--theme-bg)]">
      <Container>
        <SectionTitle
          title={t.pricing.title}
          subtitle={t.pricing.subtitle}
        />

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Calculator */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-[var(--theme-surface)] rounded-2xl shadow-xl border border-[var(--gray-200)] overflow-hidden">
              {/* Calculator Header */}
              <div className="bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Calculator className="w-6 h-6" />
                  <h3 className="text-xl font-bold">{t.pricing.calculator?.title || 'Shipping Calculator'}</h3>
                </div>
                <p className="text-white/80 text-sm">{t.pricing.subtitle}</p>
              </div>

              <div className="p-6 space-y-5">
                {/* City Selector */}
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">
                    {t.pricing.calculator?.city || 'Destination City'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => setSelectedCity(city.city)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                          selectedCity === city.city
                            ? 'bg-[var(--primary-600)] text-white border-[var(--primary-600)] shadow-md'
                            : 'bg-[var(--theme-bg)] text-[var(--gray-700)] border-[var(--gray-200)] hover:border-[var(--primary-300)]'
                        }`}
                      >
                        <div>{city.city.split(',')[0]}</div>
                        <div className={`text-xs mt-0.5 ${selectedCity === city.city ? 'text-white/80' : 'text-[var(--gray-500)]'}`}>
                          ${city.pricePerLb}{t.pricing.calculator?.lbs ? `/${t.pricing.calculator.lbs}` : '/lb'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight Input */}
                <div>
                  <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">
                    {t.pricing.calculator?.weight || 'Package Weight (lbs)'}
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="flex-1 h-2 bg-[var(--gray-200)] rounded-lg appearance-none cursor-pointer accent-[var(--primary-600)]"
                    />
                    <div className="flex items-center gap-1 bg-[var(--theme-bg)] border border-[var(--gray-200)] rounded-lg px-3 py-2 min-w-[80px]">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={weight}
                        onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                        className="w-12 text-center font-bold text-[var(--gray-900)] bg-transparent outline-none"
                      />
                      <span className="text-xs text-[var(--gray-500)]">lbs</span>
                    </div>
                  </div>
                </div>

                {/* Special Item */}
                {specialItems.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--gray-700)] mb-2">
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
                      className="w-full px-4 py-2.5 rounded-lg border border-[var(--gray-200)] bg-[var(--theme-bg)] text-[var(--gray-900)] outline-none focus:border-[var(--primary-400)] transition-colors"
                    >
                      <option value="">{t.pricing.calculator?.noSpecialItem || 'No special item'}</option>
                      {specialItems.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.itemName} ({item.brand}) — ${parseFloat(item.fixedFee).toFixed(2)}
                        </option>
                      ))}
                    </select>

                    {selectedSpecialItem && (
                      <label className="flex items-center gap-2 mt-3 text-sm text-[var(--gray-600)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={chargeByWeight}
                          onChange={(e) => setChargeByWeight(e.target.checked)}
                          className="rounded border-[var(--gray-300)] accent-[var(--primary-600)]"
                        />
                        {t.pricing.calculator?.chargeByWeight || 'Also charge by weight'}
                      </label>
                    )}
                  </div>
                )}

                {/* Result Breakdown */}
                <div className="bg-[var(--theme-bg)] rounded-xl p-5 border border-[var(--gray-200)]">
                  <h4 className="text-sm font-semibold text-[var(--gray-700)] mb-3">
                    {t.pricing.calculator?.result || 'Estimated Cost'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--gray-600)]">{t.pricing.calculator?.breakdown?.service || 'Service Fee'}</span>
                      <span className="font-medium text-[var(--gray-900)]">${serviceFee.toFixed(2)}</span>
                    </div>
                    {(!selectedSpecialItem || chargeByWeight) && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--gray-600)]">
                          {t.pricing.calculator?.breakdown?.weight || 'Weight Fee'} ({weight} lbs x ${pricePerLb})
                        </span>
                        <span className="font-medium text-[var(--gray-900)]">${weightCost.toFixed(2)}</span>
                      </div>
                    )}
                    {specialItem && (
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600">{specialItem.itemName} ({specialItem.brand})</span>
                        <span className="font-medium text-purple-600">${specialFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-[var(--gray-200)] pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-[var(--gray-900)]">
                          {t.pricing.calculator?.breakdown?.total || 'Total'}
                        </span>
                        <span className="text-2xl font-bold text-[var(--primary-600)]">
                          ${totalCost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <a
                  href="/dashboard/request-package"
                  className="w-full inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 bg-[var(--primary-600)] text-white hover:bg-[var(--primary-700)] px-5 py-3 text-base"
                >
                  {t.hero.ctaPrimary}
                </a>
              </div>
            </div>

            {/* City Pricing Cards */}
            {cities.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-bold text-[var(--gray-900)] mb-4">
                  {t.pricing.cityPricing?.title || 'Pricing by City'}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {cities.map((city) => (
                    <motion.div
                      key={city.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-[var(--theme-surface)] rounded-xl p-4 border border-[var(--gray-200)] text-center hover:shadow-md transition-shadow"
                    >
                      <MapPin className="w-5 h-5 text-[var(--primary-600)] mx-auto mb-2" />
                      <div className="text-sm font-semibold text-[var(--gray-900)]">{city.city.split(',')[0]}</div>
                      <div className="text-xl font-bold text-[var(--primary-600)] mt-1">
                        ${city.pricePerLb}{t.pricing.cityPricing?.perLb || '/lb'}
                      </div>
                      <div className="text-xs text-[var(--gray-500)] mt-0.5">
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
            className="space-y-8"
          >
            {/* What's Included */}
            <div>
              <h3 className="text-2xl font-bold text-[var(--gray-900)] mb-6">
                {t.pricing.included?.title || "What's Included"}
              </h3>
              <div className="grid gap-3">
                {includedItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    className="flex items-center gap-3 p-4 bg-[var(--theme-surface)] rounded-xl border border-[var(--gray-200)] hover:border-[var(--primary-300)] hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-[var(--gray-700)] font-medium">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Loyalty Program */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--gray-900)]">
                    {t.pricing.loyalty?.title || 'Loyalty Program'}
                  </h3>
                  <p className="text-sm text-[var(--gray-600)]">
                    {t.pricing.loyalty?.description || 'Earn rewards with every shipment'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Star, text: t.pricing.loyalty?.pointsPerDollar || '50 points per $1 spent' },
                  { icon: DollarSign, text: t.pricing.loyalty?.creditPerShipment || '$1 credit per shipment' },
                  { icon: Package, text: t.pricing.loyalty?.pointsPerLb || '$0.10 per lb shipped' },
                  { icon: Gift, text: t.pricing.loyalty?.redemption || '1,000 points = $1 discount' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/80 rounded-lg p-3">
                    <item.icon className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-xs font-medium text-[var(--gray-700)]">{item.text}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-amber-700 font-medium mt-4 text-center">
                {t.pricing.loyalty?.program || 'The more you ship, the more you save!'}
              </p>
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
