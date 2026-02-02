'use client';

import { motion } from 'framer-motion';
import { useUser, UserButton, useClerk } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Settings,
  Wallet,
  HelpCircle,
  Clock,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetch('/api/admin/elevate')
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin === true))
      .catch(() => setIsAdmin(false));
  }, [user]);

  const handleAdminAccess = async () => {
    try {
      const res = await fetch('/api/admin/elevate', { method: 'POST' });
      if (res.ok) {
        router.push('/admin');
      }
    } catch (error) {
      console.error('Admin elevation error:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="overflow-x-hidden">
        <Header />
        <main className="min-h-screen pb-32 pt-2 md:pt-4 bg-gradient-to-br from-gray-50 via-white to-primary-50 flex items-center justify-center">
          <Container>
            <Card className="max-w-md mx-auto p-8 text-center backdrop-blur-xl bg-white/90">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.profile.notConnected}</h2>
              <p className="text-gray-600 mb-6">
                {t.profile.subtitle}
              </p>
              <Link href="/sign-in">
                <Button size="lg" fullWidth>
                  {t.profile.signIn}
                </Button>
              </Link>
            </Card>
          </Container>
        </main>
        <BottomNav />
      </div>
    );
  }

  const stats = [
    { label: t.profile.stats.totalPackages, value: '12', icon: Package },
    { label: t.profile.stats.inTransit, value: '2', icon: MapPin },
    { label: t.profile.stats.delivered, value: '10', icon: Package },
  ];

  const menuItems = [
    { label: 'Mes Colis', icon: Package, href: '/packages' },
    { label: 'Demander un Colis', icon: MapPin, href: '/dashboard/request-package' },
    { label: 'Calculateur de Prix', icon: CreditCard, href: '/calculator' },
    { label: 'Méthodes de Paiement', icon: Wallet, href: '/profile/payment' },
    { label: 'Mes Adresses', icon: Home, href: '/profile/addresses' },
    { label: 'Historique', icon: Clock, href: '/profile/history' },
    { label: 'Notifications', icon: Bell, href: '/profile/notifications' },
    { label: 'Support & Aide', icon: HelpCircle, href: '/profile/support' },
    { label: 'Paramètres du Profil', icon: Settings, href: '/profile/settings' },
  ];

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Container>
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 md:mb-8"
          >
            <Card className="p-4 sm:p-6 md:p-8 backdrop-blur-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                    <UserButton
                      appearance={{
                        elements: {
                          userButtonAvatarBox: 'w-24 h-24',
                        },
                      }}
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg" />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm sm:text-base text-white/90">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-none">{user.primaryEmailAddress?.emailAddress}</span>
                    </div>
                    {user.primaryPhoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{user.primaryPhoneNumber.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                <Link href="/profile/settings">
                  <Button variant="outline" className="bg-white text-primary-600 border-white hover:bg-white/90">
                    <Settings className="w-4 h-4 mr-2" />
                    {t.profile.menu.settings}
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="p-3 sm:p-4 md:p-6 text-center backdrop-blur-xl bg-white/80 hover:bg-white/90 transition-all"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-600" />
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 leading-tight">{stat.label}</div>
                </Card>
              );
            })}
          </motion.div>

          {/* Menu Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{t.profile.title}</h2>
            <div className="space-y-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Link href={item.href}>
                      <Card
                        hover
                        className="p-4 backdrop-blur-xl bg-white/80 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-primary-100 transition-colors">
                              <Icon className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                            </div>
                            <span className="font-medium text-gray-900">{item.label}</span>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Admin Dashboard */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8"
            >
              <button
                onClick={handleAdminAccess}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-600 to-orange-500 text-white font-semibold rounded-xl border-2 border-red-600 hover:from-red-700 hover:to-orange-600 transition-all shadow-lg"
              >
                <Shield className="w-5 h-5" />
                Admin Dashboard
              </button>
            </motion.div>
          )}

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isAdmin ? 0.9 : 0.8 }}
            className="mt-8"
          >
            <button
              onClick={handleSignOut}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-red-600 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {t.profile.menu.signOut}
            </button>
          </motion.div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
