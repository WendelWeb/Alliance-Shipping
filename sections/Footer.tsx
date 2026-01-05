'use client';

import { Package } from 'lucide-react';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Send,
  Pin,
  Radio,
  Music,
} from 'lucide-react';
import { Container } from '@/components/Container';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { COMPANY_INFO, SOCIAL_LINKS } from '@/constants';

export function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { label: t.nav.services, href: '#services' },
    { label: t.nav.pricing, href: '#pricing' },
    { label: t.nav.tracking, href: '#tracking' },
    { label: t.nav.locations, href: '#locations' },
  ];

  const legalLinks = [
    { label: t.footer.privacyPolicy, href: '#' },
    { label: t.footer.termsOfService, href: '#' },
    { label: t.footer.shippingPolicy, href: '#' },
  ];

  const socialIcons: Record<string, any> = {
    Facebook,
    Instagram,
    Twitter,
    Linkedin,
    Youtube,
    MessageCircle,
    Send,
    Pin,
    Radio,
    Music,
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <a href="#" className="flex items-center gap-2 mb-4 group">
                <div className="bg-gradient-primary p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-white font-display">
                    Alliance Shipping
                  </span>
                  <span className="text-xs text-gray-400">USA • Haïti</span>
                </div>
              </a>
              <p className="text-gray-400 mb-6 max-w-md">
                {t.footer.description}
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Email:</span>{' '}
                  <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-primary-400 transition-colors">
                    {COMPANY_INFO.email}
                  </a>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Phone:</span>{' '}
                  <a href={`tel:${COMPANY_INFO.phone}`} className="hover:text-primary-400 transition-colors">
                    {COMPANY_INFO.phone}
                  </a>
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4">{t.footer.quickLinks}</h3>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#faq"
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {t.nav.faq}
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {t.nav.contact}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-bold mb-4">{t.footer.legal}</h3>
              <ul className="space-y-2">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <h3 className="text-white font-bold mb-4 text-center">{t.footer.followUs}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {SOCIAL_LINKS.map((social, index) => {
                const Icon = socialIcons[social.icon] || MessageCircle;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors group"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Alliance Shipping. {t.footer.allRightsReserved}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
