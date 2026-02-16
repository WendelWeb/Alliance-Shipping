'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Container } from './Container';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { cn } from '@/lib/utils/cn';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = [
    { label: t.nav.services, href: '#services' },
    { label: t.nav.pricing, href: '#pricing' },
    { label: t.nav.tracking, href: '#tracking' },
    { label: t.nav.locations, href: '/locations' },
    { label: t.nav.faq, href: '#faq' },
    { label: t.nav.contact, href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 theme-surface-solid backdrop-blur-sm border-b border-gray-200 w-full">
      <Container>
        <nav className="flex items-center justify-between h-16 lg:h-20 w-full">
          {/* Logo */}
          <a href="#" className="flex items-center gap-1.5 sm:gap-2.5 group flex-shrink">
            <div className="relative h-8 w-20 sm:h-10 sm:w-24 flex-shrink-0 rounded-lg overflow-hidden ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all shadow-sm">
              <Image
                src="/images/logo/logo.jpg"
                alt="Alliance Shipping Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-xl font-bold text-gray-900 font-display whitespace-nowrap">
                Alliance Shipping
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">USA • Haïti</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <LanguageSwitcher />
            <a
              href="/dashboard/request-package"
              className="hidden sm:inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 px-3 py-1.5 text-sm"
            >
              {t.nav.sendPackage}
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg flex-shrink-0"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300',
            mobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
          )}
        >
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
            <a
              href="/dashboard/request-package"
              className="mt-2 w-full inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 bg-primary-600 text-white hover:bg-primary-700 px-5 py-2.5 text-base"
            >
              {t.nav.sendPackage}
            </a>
          </div>
        </div>
      </Container>
    </header>
  );
}
