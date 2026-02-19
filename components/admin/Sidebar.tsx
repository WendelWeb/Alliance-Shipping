'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  TrendingUp,
  DollarSign,
  Gift,
  Smartphone,
  Megaphone,
  ShieldCheck,
  LogOut,
  ChevronRight,
  User,
  MapPin,
  Building2,
  PhoneCall,
  ArrowRightLeft,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Transferts', href: '/admin/transfers', icon: ArrowRightLeft },
  {
    name: 'Packages',
    icon: Package,
    children: [
      { name: 'All Packages', href: '/admin/packages' },
      { name: 'Requested', href: '/admin/packages/requested' },
      { name: 'Received', href: '/admin/packages/received' },
      { name: 'In Transit', href: '/admin/packages/in-transit' },
      { name: 'Available', href: '/admin/packages/available' },
      { name: 'Delivered', href: '/admin/packages/delivered' },
    ],
  },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Loyalty Program', href: '/admin/loyalty', icon: Gift },
  { name: 'Force Phone Modal', href: '/admin/force-phone', icon: PhoneCall },
  { name: 'Admin Management', href: '/admin/admins', icon: ShieldCheck },
];

function NavItems({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <ul role="list" className="-mx-2 space-y-1">
      {navigation.map((item) => (
        <li key={item.name}>
          {!item.children ? (
            <Link
              href={item.href!}
              onClick={onNavigate}
              className={cn(
                'group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-all',
                pathname === item.href
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-400 group-hover:text-primary-600'
                )}
              />
              {item.name}
            </Link>
          ) : (
            <div>
              <div className="group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 text-gray-700">
                <item.icon className="h-5 w-5 shrink-0 text-gray-400" />
                {item.name}
              </div>
              <ul className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-4">
                {item.children.map((child) => (
                  <li key={child.name}>
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      className={cn(
                        'group flex gap-x-2 rounded-lg p-2 text-sm leading-6 transition-all',
                        pathname === child.href
                          ? 'text-primary-600 font-semibold'
                          : 'text-gray-600 hover:text-primary-600'
                      )}
                    >
                      <ChevronRight className="h-4 w-4 shrink-0" />
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 theme-surface-solid px-6 pb-4">
          {/* Logo */}
          <Link href="/admin" className="flex h-16 shrink-0 items-center gap-2 group">
            <div className="relative h-10 w-24 flex-shrink-0 rounded-lg overflow-hidden ring-2 ring-primary-100 group-hover:ring-primary-300 transition-all">
              <Image
                src="/images/logo/logo.jpg"
                alt="Alliance Shipping Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent whitespace-nowrap">
              Alliance Shipping
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <NavItems pathname={pathname} />
              </li>

              {/* Logout */}
              <li className="mt-auto">
                <button
                  onClick={async () => {
                    await fetch('/api/admin/logout', { method: 'POST' });
                    window.location.href = '/';
                  }}
                  className="group -mx-2 flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 text-gray-700 hover:bg-red-50 hover:text-red-600 w-full transition-all"
                >
                  <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-600" />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center gap-x-3 theme-surface-solid px-3 py-2.5 shadow-sm lg:hidden border-b border-gray-200">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center justify-center rounded-lg p-1.5 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/admin" className="flex items-center gap-1.5 flex-shrink-0 group min-w-0">
          <div className="relative h-7 w-16 flex-shrink-0 rounded-md overflow-hidden ring-1 ring-primary-100 group-hover:ring-primary-300 transition-all">
            <Image
              src="/images/logo/logo.jpg"
              alt="Alliance Shipping Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-base font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent whitespace-nowrap hidden xs:block">
            Alliance Shipping
          </h1>
        </Link>

        <div className="flex-1" />

        {/* Mobile user icon */}
        <button
          type="button"
          className="flex items-center gap-x-1.5 rounded-full bg-gray-100 p-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <User className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden"
            >
              <div className="flex h-full flex-col overflow-y-auto px-6 pb-4">
                {/* Drawer header */}
                <div className="flex h-16 shrink-0 items-center justify-between">
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 group">
                    <div className="relative h-9 w-20 flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-primary-100">
                      <Image
                        src="/images/logo/logo.jpg"
                        alt="Alliance Shipping Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                      Alliance
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col mt-2">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <NavItems pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
                    </li>

                    {/* Logout */}
                    <li className="mt-auto">
                      <button
                        onClick={async () => {
                          await fetch('/api/admin/logout', { method: 'POST' });
                          window.location.href = '/';
                        }}
                        className="group -mx-2 flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 text-gray-700 hover:bg-red-50 hover:text-red-600 w-full transition-all"
                      >
                        <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-600" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
