'use client';

import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Package, Shield, Zap, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function SignUpPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex flex-col">
      {/* Mobile Header */}
      <div className="relative z-10 p-4 md:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Retour</span>
        </Link>
      </div>
      {/* Animated background elements - Subtle on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 md:opacity-100">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-secondary-200/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary-200/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left side - Marketing content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block space-y-8"
        >
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
            >
              Rejoignez-nous
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-600"
            >
              Commencez à envoyer vos colis en toute simplicité
            </motion.p>
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {[
              {
                icon: Package,
                title: 'Gestion simplifiée',
                description: 'Gérez tous vos colis depuis un seul endroit',
              },
              {
                icon: TrendingUp,
                title: 'Prix transparents',
                description: 'Calculez vos frais instantanément',
              },
              {
                icon: Shield,
                title: 'Sécurité garantie',
                description: 'Vos informations sont protégées',
              },
              {
                icon: Zap,
                title: 'Notifications en temps réel',
                description: 'Restez informé à chaque étape',
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 text-white shadow-lg shadow-secondary-500/30">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right side - Sign up form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center w-full"
        >
          {/* Mobile header - Simplified */}
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              {t.auth.signUp.createAccount}
            </h1>
            <p className="text-sm md:text-base text-gray-600">{t.auth.signUp.joinAlliance}</p>
          </div>

          {/* Clerk sign-up component wrapper - Optimized for mobile */}
          <div className="w-full max-w-md">
            <div className="relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
              <SignUp
                appearance={{
                  elements: {
                    rootBox: 'w-full',
                    card: 'bg-transparent shadow-none w-full',
                    headerTitle: 'text-xl md:text-2xl font-bold text-gray-900',
                    headerSubtitle: 'text-sm md:text-base text-gray-600',
                    socialButtonsBlockButton:
                      'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-secondary-300 transition-all duration-300 text-sm md:text-base py-3',
                    socialButtonsBlockButtonText: 'text-gray-700 font-medium',
                    formButtonPrimary:
                      'bg-gradient-to-r from-secondary-600 to-primary-600 hover:from-secondary-700 hover:to-primary-700 shadow-lg shadow-secondary-500/30 transition-all duration-300 py-3',
                    formFieldInput:
                      'border-2 border-gray-200 focus:border-secondary-500 rounded-xl transition-all duration-300 text-base py-3',
                    footerActionLink: 'text-primary-600 hover:text-primary-700 font-medium text-sm md:text-base',
                    dividerLine: 'bg-gray-200',
                    dividerText: 'text-gray-500 text-sm',
                    formFieldLabel: 'text-gray-700 font-medium text-sm md:text-base',
                    identityPreviewText: 'text-gray-700',
                    formHeaderTitle: 'text-gray-900',
                    formHeaderSubtitle: 'text-gray-600',
                    otpCodeFieldInput:
                      'border-2 border-gray-200 focus:border-secondary-500 rounded-xl',
                  },
                  layout: {
                    socialButtonsPlacement: 'top',
                    socialButtonsVariant: 'blockButton',
                  },
                }}
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
              />
            </div>
          </div>

          {/* Footer - Mobile optimized */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-sm text-gray-600">
              {t.auth.signUp.hasAccount}{' '}
              <a
                href="/sign-in"
                className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all"
              >
                {t.auth.signUp.signInLink}
              </a>
            </p>
          </motion.div>

          {/* Mobile benefits - Compact */}
          <div className="md:hidden mt-8 w-full max-w-md space-y-3">
            {[
              {
                icon: Package,
                title: t.auth.signUp.benefits.management.title,
              },
              {
                icon: TrendingUp,
                title: t.auth.signUp.benefits.pricing.title,
              },
              {
                icon: Shield,
                title: t.auth.signUp.benefits.security.title,
              },
              {
                icon: Zap,
                title: t.auth.signUp.benefits.notifications.title,
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100"
              >
                <div className="p-2 rounded-lg bg-secondary-100">
                  <benefit.icon className="w-4 h-4 text-secondary-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">{benefit.title}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
