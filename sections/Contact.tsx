'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle, Clock, MapPin } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { COMPANY_INFO } from '@/constants';

export function Contact() {
  const { t } = useTranslation();

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

  const offices = [
    {
      title: t.contact.info.miami?.title || 'Miami Office',
      address: t.contact.info.miami?.address || '8298 Northwest 68th Street, Miami, FL 33195',
      country: 'USA',
    },
    {
      title: t.contact.info.capHaitien?.title || 'Cap-Haïtien Office',
      address: t.contact.info.capHaitien?.address || 'Cap-Haïtien, Nord, Haïti',
      country: 'Haiti',
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
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
                  <div className="text-xs text-[var(--gray-500)] mb-1">{card.label}</div>
                  <div className="text-sm font-bold text-[var(--gray-900)] mb-2">{card.value}</div>
                  {card.action && (
                    <div className="text-xs font-medium text-[var(--primary-600)]">{card.action} &rarr;</div>
                  )}
                </a>
              ) : (
                <div className={`p-5 rounded-2xl border ${card.color} h-full`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.iconColor}`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className="text-xs text-[var(--gray-500)] mb-1">{card.label}</div>
                  <div className="text-sm font-bold text-[var(--gray-900)]">{card.value}</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Office Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto"
        >
          {offices.map((office, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-5 bg-[var(--theme-bg)] rounded-2xl border border-[var(--gray-200)]"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-[var(--primary-100)] rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[var(--primary-600)]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--gray-900)]">{office.title}</div>
                <div className="text-xs text-[var(--gray-500)] mt-1">{office.address}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Response time note */}
        <div className="text-center mt-8">
          <p className="text-sm text-[var(--gray-500)]">
            {t.contact.responseTime || 'We respond within 24 hours'}
          </p>
        </div>
      </Container>
    </section>
  );
}
