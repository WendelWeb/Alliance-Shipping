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
  Globe,
  Gift,
  Palette,
  ChevronRight,
  Warehouse,
  Copy,
  Check as CheckIcon,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { localeNames, localeFlags } from '@/lib/i18n/config';
import { Locale } from '@/types';
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/themes/ThemeProvider';
import { ThemePicker } from '@/components/ThemePicker';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { t, locale, setLocale } = useTranslation();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const [isAdmin, setIsAdmin] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [dbPhone, setDbPhone] = useState<string | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState<string | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [stats, setStats] = useState([
    { label: t.profile.stats.totalPackages, value: '0', icon: Package },
    { label: t.profile.stats.inTransit, value: '0', icon: MapPin },
    { label: t.profile.stats.delivered, value: '0', icon: Package },
  ]);

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

    // Fetch admin status
    fetch('/api/admin/elevate')
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.isAdmin === true))
      .catch(() => setIsAdmin(false));

    // Fetch user profile from database
    fetch('/api/user/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.phone) {
          setDbPhone(data.user.phone);
        }
        if (data.user?.whatsappPhone) {
          setWhatsappPhone(data.user.whatsappPhone);
        }
        if (data.user?.city) {
          setUserCity(data.user.city);
        }
      })
      .catch((err) => console.error('Error fetching user profile:', err));

    // Fetch user packages and calculate stats
    fetch('/api/user/packages')
      .then((res) => res.json())
      .then((data) => {
        const packages = data.packages || [];
        const totalPackages = packages.length;
        const inTransit = packages.filter((pkg: any) =>
          pkg.status === 'in-transit' || pkg.status === 'customs'
        ).length;
        const delivered = packages.filter((pkg: any) =>
          pkg.status === 'delivered'
        ).length;

        setStats([
          { label: t.profile.stats.totalPackages, value: totalPackages.toString(), icon: Package },
          { label: t.profile.stats.inTransit, value: inTransit.toString(), icon: MapPin },
          { label: t.profile.stats.delivered, value: delivered.toString(), icon: Package },
        ]);
      })
      .catch((err) => {
        console.error('Error fetching package stats:', err);
      });
  }, [user, t]);

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
        <main className="min-h-screen pb-32 pt-2 md:pt-4 flex items-center justify-center">
          <Container>
            <Card className="max-w-md mx-auto p-8 text-center backdrop-blur-xl theme-surface">
              <User className="w-16 h-16 mx-auto mb-4" style={{ color: colors.gray[300] }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: colors.gray[900] }}>{t.profile.notConnected}</h2>
              <p className="mb-6" style={{ color: colors.gray[600] }}>
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

  const menuItems = [
    { label: t.profile.menuItems.myPackages, icon: Package, href: '/packages' },
    { label: t.profile.menuItems.requestPackage, icon: MapPin, href: '/dashboard/request-package' },
    { label: t.profile.menuItems.shippingAddress, icon: Warehouse, href: '/profile/shipping-address' },
    { label: t.profile.menuItems.rewards, icon: Gift, href: '/profile/rewards' },
    { label: t.profile.menuItems.priceCalculator, icon: CreditCard, href: '/calculator' },
    { label: t.profile.menuItems.paymentMethods, icon: Wallet, href: '/profile/payment' },
    { label: t.profile.menuItems.myAddresses, icon: Home, href: '/profile/addresses' },
    { label: t.profile.menuItems.history, icon: Clock, href: '/profile/history' },
    { label: t.profile.menuItems.notifications, icon: Bell, href: '/profile/notifications' },
    { label: t.profile.menuItems.support, icon: HelpCircle, href: '/profile/support' },
    { label: t.profile.menuItems.profileSettings, icon: Settings, href: '/profile/settings' },
  ];

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
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
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 shadow-lg" style={{ backgroundColor: '#22c55e', borderColor: isDark ? colors.gray[50] : '#ffffff' }} />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-sm sm:text-base text-white/90 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate max-w-[200px] sm:max-w-none">{user.primaryEmailAddress?.emailAddress}</span>
                    </div>
                    {dbPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{dbPhone}</span>
                      </div>
                    )}
                    {(whatsappPhone || dbPhone) && (
                      <a
                        href={`https://wa.me/${(whatsappPhone || dbPhone || '').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-white transition-colors"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{whatsappPhone || dbPhone}</span>
                      </a>
                    )}
                    {userCity && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{userCity}</span>
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

          {/* Shipping Address Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="mb-6 md:mb-8"
          >
            <Link href="/profile/shipping-address">
              <Card hover className="p-4 sm:p-5 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: isDark ? colors.primary[900] : colors.primary[100] }}>
                      <Warehouse className="w-5 h-5" style={{ color: colors.primary[600] }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: colors.gray[900] }}>
                        {t.profile.shippingAddress.cardTitle}
                      </h3>
                      <p className="text-lg font-bold tracking-widest mt-1" style={{ color: colors.primary[600] }}>
                        PQ-068508
                      </p>
                      <p className="text-xs mt-0.5 truncate max-w-[220px] sm:max-w-none" style={{ color: colors.gray[500] }}>
                        8298 NW 68th St, Miami FL 33195
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: colors.gray[400] }} />
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 justify-center" style={{ borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: colors.gray[200] }}>
                  <Copy className="w-3.5 h-3.5" style={{ color: colors.primary[600] }} />
                  <span className="text-sm font-semibold" style={{ color: colors.primary[600] }}>
                    {t.profile.shippingAddress.viewTemplate}
                  </span>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Language Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 md:mb-8"
          >
            <Card className="p-4 sm:p-5 backdrop-blur-xl theme-surface">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl" style={{ backgroundColor: isDark ? colors.primary[900] : colors.primary[100] }}>
                  <Globe className="w-5 h-5" style={{ color: colors.primary[600] }} />
                </div>
                <h3 className="font-semibold" style={{ color: colors.gray[900] }}>{t.profile.language}</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['ht', 'fr', 'en', 'es'] as Locale[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLocale(lang)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-medium text-sm transition-all"
                    style={
                      locale === lang
                        ? {
                            backgroundColor: colors.primary[600],
                            color: '#ffffff',
                            boxShadow: `0 4px 14px ${colors.primary[500]}30`
                          }
                        : {
                            backgroundColor: colors.gray[50],
                            color: colors.gray[700],
                            borderWidth: '1px',
                            borderColor: colors.gray[200]
                          }
                    }
                  >
                    <span className="text-lg">{localeFlags[lang]}</span>
                    <span>{localeNames[lang]}</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Theme Picker Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-6 md:mb-8"
          >
            <Card className="p-4 sm:p-5">
              <button
                onClick={() => setThemePickerOpen(true)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl" style={{ backgroundColor: isDark ? colors.primary[900] : colors.primary[100] }}>
                    <Palette className="w-5 h-5" style={{ color: colors.primary[600] }} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold" style={{ color: colors.gray[900] }}>Theme</h3>
                    <p className="text-sm" style={{ color: colors.gray[500] }}>{theme.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2"
                    style={{ backgroundColor: theme.preview.accent, borderColor: colors.gray[200] }}
                  />
                  <ChevronRight className="w-5 h-5" style={{ color: colors.gray[400] }} />
                </div>
              </button>
            </Card>
          </motion.div>

          <ThemePicker isOpen={themePickerOpen} onClose={() => setThemePickerOpen(false)} />

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
                  className="p-3 sm:p-4 md:p-6 text-center backdrop-blur-xl theme-surface transition-all"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3" style={{ backgroundColor: isDark ? colors.primary[900] : colors.primary[100] }}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: colors.primary[600] }} />
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold mb-1" style={{ color: colors.gray[900] }}>{stat.value}</div>
                  <div className="text-[10px] sm:text-xs md:text-sm leading-tight" style={{ color: colors.gray[600] }}>{stat.label}</div>
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
            <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: colors.gray[900] }}>{t.profile.title}</h2>
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
                        className="p-4 backdrop-blur-xl theme-surface cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl transition-colors" style={{ backgroundColor: colors.gray[100] }}>
                              <Icon className="w-5 h-5 transition-colors" style={{ color: colors.gray[600] }} />
                            </div>
                            <span className="font-medium" style={{ color: colors.gray[900] }}>{item.label}</span>
                          </div>
                          <svg
                            className="w-5 h-5 group-hover:translate-x-1 transition-all"
                            style={{ color: colors.gray[400] }}
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
                {t.profile.adminDashboard}
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
