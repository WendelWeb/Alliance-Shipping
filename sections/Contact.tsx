'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Clock, MapPin, Building2, Warehouse, Navigation, Globe } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { COMPANY_INFO } from '@/constants';

interface DepotLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  hours: string;
}

const MIAMI_ADDRESS = '8298 Northwest 68th Street, Miami, FL 33195';

export function Contact() {
  const { t } = useTranslation();
  const [depots, setDepots] = useState<DepotLocation[]>([]);
  const [loadingDepots, setLoadingDepots] = useState(true);

  useEffect(() => {
    fetch('/api/locations')
      .then((res) => res.ok ? res.json() : [])
      .then((data: DepotLocation[]) => setDepots(data))
      .catch(() => setDepots([]))
      .finally(() => setLoadingDepots(false));
  }, []);

  const haitiDepots = depots.filter((d) => d.city !== 'Miami');

  const off = (t.contact as any).offices || {};

  const contactCards = [
    {
      icon: Phone,
      label: t.contact.info.phone,
      value: COMPANY_INFO.phone,
      action: t.contact.callUs || 'Call us',
      href: `tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Mail,
      label: t.contact.info.email,
      value: COMPANY_INFO.email,
      action: t.contact.emailUs || 'Email us',
      href: `mailto:${COMPANY_INFO.email}`,
      color: 'bg-red-50 border-red-200',
      iconColor: 'bg-red-100 text-red-600',
    },
    {
      icon: MessageCircle,
      label: t.contact.info.whatsapp,
      value: COMPANY_INFO.whatsapp,
      action: t.contact.chatWhatsApp || 'Chat on WhatsApp',
      href: `https://wa.me/${COMPANY_INFO.whatsapp}`,
      color: 'bg-green-50 border-green-200',
      iconColor: 'bg-green-100 text-green-600',
    },
    {
      icon: Clock,
      label: t.contact.info.hours,
      value: t.contact.info.hoursValue,
      action: null,
      href: null,
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <section id="contact" className="py-20 bg-[var(--theme-surface)]">
      <Container>
        <SectionTitle
          title={t.contact.title}
          subtitle={t.contact.subtitle}
        />

        {/* Contact Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {contactCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {card.href ? (
                <a
                  href={card.href}
                  target={card.icon === MessageCircle ? '_blank' : undefined}
                  rel={card.icon === MessageCircle ? 'noopener noreferrer' : undefined}
                  className={`block p-5 rounded-2xl border ${card.color} hover:shadow-lg transition-all duration-300 h-full`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.iconColor}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{card.label}</div>
                  <div className="text-sm font-bold text-gray-900 mb-2">{card.value}</div>
                  {card.action && (
                    <div className="text-xs font-medium text-primary-600">{card.action} &rarr;</div>
                  )}
                </a>
              ) : (
                <div className={`p-5 rounded-2xl border ${card.color} h-full`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.iconColor}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{card.label}</div>
                  <div className="text-sm font-bold text-gray-900">{card.value}</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Offices Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[var(--theme-bg)] rounded-3xl border border-gray-200 overflow-hidden shadow-sm"
        >
          {/* Section Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 sm:px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {off.title || 'Our Offices'}
              </h3>
            </div>
            {!loadingDepots && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-300 bg-white/10 px-3 py-1 rounded-full">
                  {1 + haitiDepots.length} locations
                </span>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {/* Miami Warehouse */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {off.warehouse || 'Warehouse'} — {off.usa || 'USA'}
                </span>
              </div>

              <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white rounded-2xl border border-blue-100 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                    <Warehouse className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold text-gray-900">
                        {t.contact.info.miami?.title || 'Miami Office'}
                      </h4>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        PQ-068508
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{MIAMI_ADDRESS}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Haiti Depots */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {off.haitiDepots || 'Haiti Depots'}
                </span>
                {!loadingDepots && haitiDepots.length > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {haitiDepots.length}
                  </span>
                )}
              </div>

              {loadingDepots ? (
                <div className="flex items-center justify-center py-10 gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600" />
                  <span className="text-sm text-gray-500">{off.loadingDepots || 'Loading depots...'}</span>
                </div>
              ) : haitiDepots.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">{off.noDepots || 'No depots available'}</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {haitiDepots.map((depot, index) => (
                    <motion.div
                      key={depot.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
                    >
                      {/* Depot Header */}
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-3.5 h-3.5 text-white" />
                          </div>
                          <h4 className="font-bold text-white text-sm truncate">{depot.name}</h4>
                        </div>
                      </div>

                      {/* Depot Body */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-600 leading-relaxed">{depot.address}</p>
                        </div>

                        {depot.phone && (
                          <a
                            href={`tel:${depot.phone.replace(/\s/g, '')}`}
                            className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {depot.phone}
                          </a>
                        )}

                        {depot.hours && depot.hours !== 'Hours not available' && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            {depot.hours}
                          </div>
                        )}

                        {/* View on map button */}
                        <a
                          href={`https://maps.google.com/?q=${depot.lat},${depot.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full mt-1 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          {off.viewOnMap || 'View on map'}
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Response time note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            {t.contact.responseTime || 'We respond within 24 hours'}
          </p>
        </div>
      </Container>
    </section>
  );
}
