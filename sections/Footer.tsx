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
    { label: t.footer.privacyPolicy, href: '/privacy-policy' },
    { label: t.footer.termsOfService, href: '/terms-of-service' },
    { label: t.footer.shippingPolicy, href: '/shipping-policy' },
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
    <footer className="bg-[#111827] text-[#d1d5db]">
      <Container>
        <div className="py-8 md:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <a href="#" className="flex items-center gap-2 mb-4 group">
                <div className="bg-gradient-primary p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <Package className="w-6 h-6 text-[#ffffff]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-[#ffffff] font-display">
                    Alliance Shipping
                  </span>
                  <span className="text-xs text-[#9ca3af]">USA • Haïti</span>
                </div>
              </a>
              <p className="text-[#9ca3af] mb-6 max-w-md">
                {t.footer.description}
              </p>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-[#6b7280]">Email:</span>{' '}
                  <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-[#60a5fa] transition-colors">
                    {COMPANY_INFO.email}
                  </a>
                </p>
                <p className="text-sm">
                  <span className="text-[#6b7280]">Phone:</span>{' '}
                  <a href={`tel:${COMPANY_INFO.phone}`} className="hover:text-[#60a5fa] transition-colors">
                    {COMPANY_INFO.phone}
                  </a>
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-[#ffffff] font-bold mb-4">{t.footer.quickLinks}</h3>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-[#9ca3af] hover:text-[#60a5fa] transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#faq"
                    className="text-[#9ca3af] hover:text-[#60a5fa] transition-colors text-sm"
                  >
                    {t.nav.faq}
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-[#9ca3af] hover:text-[#60a5fa] transition-colors text-sm"
                  >
                    {t.nav.contact}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-[#ffffff] font-bold mb-4">{t.footer.legal}</h3>
              <ul className="space-y-2">
                {legalLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-[#9ca3af] hover:text-[#60a5fa] transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div className="border-t border-gray-800 pt-6 mb-6">
            <h3 className="text-[#ffffff] font-bold mb-3 text-center text-sm sm:text-base">{t.footer.followUs}</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {SOCIAL_LINKS.map((social, index) => {
                const Icon = socialIcons[social.icon] || MessageCircle;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#1f2937] hover:bg-[#2563eb] rounded-lg flex items-center justify-center transition-colors group"
                    aria-label={social.name}
                    title={social.name}
                  >
                    <Icon className="w-5 h-5 text-[#9ca3af] group-hover:text-[#ffffff] transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-sm text-[#9ca3af]">
              © {new Date().getFullYear()} Alliance Shipping. {t.footer.allRightsReserved}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
