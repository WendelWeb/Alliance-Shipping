'use client';

import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Send,
} from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ImageGallery } from '@/components/ImageGallery';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { COMPANY_INFO, SOCIAL_LINKS } from '@/constants';
import { useState } from 'react';

export function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    { icon: Phone, label: t.contact.info.phone, value: COMPANY_INFO.phone },
    { icon: Mail, label: t.contact.info.email, value: COMPANY_INFO.email },
    { icon: MessageCircle, label: t.contact.info.whatsapp, value: COMPANY_INFO.whatsapp },
    { icon: Clock, label: t.contact.info.hours, value: t.contact.info.hoursValue },
  ];

  const socialIcons: Record<string, any> = {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    MessageCircle,
    Send,
  };

  return (
    <section id="contact" className="section-padding bg-white">
      <Container>
        <SectionTitle
          title={t.contact.title}
          subtitle={t.contact.subtitle}
        />

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card padding="lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact.form.name}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact.form.email}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact.form.phone}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact.form.subject}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact.form.message}
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                <Button type="submit" size="lg" fullWidth>
                  {t.contact.form.send}
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Contact Info & Social */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Contact Info Cards */}
            {contactInfo.map((info, index) => (
              <Card key={index} hover padding="lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <info.icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">{info.label}</div>
                    <div className="font-semibold text-gray-900">{info.value}</div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Social Media Links */}
            <Card padding="lg">
              <h3 className="font-bold text-gray-900 mb-4">{t.footer.followUs}</h3>
              <div className="grid grid-cols-5 gap-3">
                {SOCIAL_LINKS.slice(0, 10).map((social, index) => {
                  const Icon = socialIcons[social.icon] || MessageCircle;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-gray-100 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors group"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                    </a>
                  );
                })}
              </div>
            </Card>

            {/* Contact Team Illustration */}
            <Card padding="lg" className="mt-6">
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <ImageGallery
                  section="contact"
                  className="w-full h-full"
                  imageClassName="object-cover"
                />
              </div>
            </Card>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
