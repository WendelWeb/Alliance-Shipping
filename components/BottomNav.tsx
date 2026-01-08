'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Package, Calculator, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useTranslation } from '@/lib/i18n/useTranslation';

const navItemsConfig = [
  {
    key: 'home',
    href: '/',
    icon: Home,
  },
  {
    key: 'news',
    href: '/news',
    icon: Newspaper,
  },
  {
    key: 'packages',
    href: '/packages',
    icon: Package,
  },
  {
    key: 'calculator',
    href: '/calculator',
    icon: Calculator,
  },
  {
    key: 'profile',
    href: '/profile',
    icon: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const activeIndex = navItemsConfig.findIndex(item => item.href === pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl md:bottom-6">
      {/* Glassmorphism Container */}
      <div className="relative bg-white/90 backdrop-blur-xl border-t border-gray-200/50 md:border md:rounded-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:shadow-2xl">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/3 via-transparent to-secondary-500/3 pointer-events-none md:rounded-3xl" />

        {/* Active indicator bar (top) - Mobile only */}
        {activeIndex !== -1 && (
          <motion.div
            className="absolute top-0 w-8 h-1 bg-primary-600 rounded-full md:hidden"
            animate={{
              left: `calc((100% / 5) * ${activeIndex} + (100% / 5 / 2) - 1rem)`,
            }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          />
        )}

        {/* Nav Items */}
        <div className="relative flex items-center justify-between px-0 pt-[10px] pb-2 md:px-4 md:py-3">
          {navItemsConfig.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center flex-1 group"
              >
                {/* Icon Container */}
                <div className="flex flex-col items-center gap-1">
                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative flex items-center justify-center"
                  >
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-colors duration-300',
                        isActive
                          ? 'text-primary-600'
                          : 'text-gray-500 group-hover:text-primary-500'
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />

                    {/* Glow effect for active icon */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 -z-10 bg-primary-400/20 blur-lg rounded-full"
                      />
                    )}
                  </motion.div>

                  {/* Label - Hidden on mobile, shown on desktop */}
                  <span
                    className={cn(
                      'text-[10px] md:text-xs font-medium transition-all duration-300 truncate max-w-full',
                      isActive
                        ? 'text-primary-600 font-semibold'
                        : 'text-gray-600 group-hover:text-primary-600'
                    )}
                  >
                    {t.bottomNav[item.key as keyof typeof t.bottomNav]}
                  </span>
                </div>

                {/* Active background - Desktop only */}
                {isActive && (
                  <motion.div
                    layoutId="activeBackground"
                    className="hidden md:block absolute inset-0 bg-primary-50 rounded-2xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Safe area for iOS devices */}
        <div className="h-safe-bottom md:hidden" />
      </div>
    </nav>
  );
}
