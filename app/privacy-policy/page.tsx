'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Shield } from 'lucide-react';
import { COMPANY_INFO } from '@/constants';

export default function PrivacyPolicyPage() {
  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 font-display">
                Privacy Policy
              </h1>
              <p className="text-gray-500">Last updated: February 2026</p>
            </div>

            {/* Content */}
            <div className="prose prose-lg max-w-none theme-card rounded-2xl p-6 md:p-10 shadow-sm">
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  Alliance Shipping (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the &quot;Service&quot;).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information</h3>
                <p className="text-gray-600 leading-relaxed mb-3">When you create an account or use our Service, we may collect:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-1">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Shipping and delivery addresses</li>
                  <li>Profile photo (optional)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 text-gray-600 space-y-1">
                  <li>Device information (device type, operating system)</li>
                  <li>Approximate location (for finding nearby depots)</li>
                  <li>Push notification tokens</li>
                  <li>App usage data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-3">We use your information to:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-1">
                  <li>Create and manage your account</li>
                  <li>Process and track your package shipments</li>
                  <li>Send push notifications about package status updates</li>
                  <li>Calculate shipping fees and provide cost estimates</li>
                  <li>Locate nearby depots and delivery points</li>
                  <li>Communicate with you about our services</li>
                  <li>Improve our Service and user experience</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Sharing</h2>
                <p className="text-gray-600 leading-relaxed">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-3">
                  <li><strong>Service providers:</strong> We use third-party services (such as Clerk for authentication and Expo for push notifications) that may process your data on our behalf.</li>
                  <li><strong>Legal requirements:</strong> We may disclose your information if required by law or in response to valid legal requests.</li>
                  <li><strong>Shipping operations:</strong> Your name and address are used to process and deliver your packages through our logistics network.</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate security measures to protect your personal information. All data transmitted between your device and our servers is encrypted using HTTPS/TLS. Sensitive data such as authentication tokens are stored securely on your device.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Retention</h2>
                <p className="text-gray-600 leading-relaxed">
                  We retain your personal information for as long as your account is active or as needed to provide you with our services. You may request deletion of your account and associated data at any time by contacting us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-3">You have the right to:</p>
                <ul className="list-disc pl-6 text-gray-600 space-y-1">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data</li>
                  <li>Opt out of push notifications</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">8. Push Notifications</h2>
                <p className="text-gray-600 leading-relaxed">
                  We send push notifications to keep you informed about your package status, delivery updates, and important announcements. You can disable push notifications at any time through your device settings or within the app.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our Service is not intended for children under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">10. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">11. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <ul className="list-none pl-0 text-gray-600 mt-3 space-y-1">
                  <li><strong>Email:</strong> {COMPANY_INFO.email}</li>
                  <li><strong>Phone:</strong> {COMPANY_INFO.phone}</li>
                  <li><strong>WhatsApp:</strong> +509 4881 26-52</li>
                </ul>
              </section>
            </div>
          </motion.div>
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
