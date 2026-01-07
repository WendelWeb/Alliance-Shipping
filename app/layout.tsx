import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/useTranslation';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Alliance Shipping | USA-Haiti International Shipping Services',
  description:
    'Fast, reliable, and affordable international shipping between USA and Haiti. $5 service fee + $4/lb. Track your packages in real-time. 3-6 days delivery.',
  keywords: [
    'shipping USA Haiti',
    'international shipping',
    'Haiti shipping',
    'package delivery',
    'Miami Haiti shipping',
    'cargo service',
    'Alliance Shipping',
  ],
  authors: [{ name: 'Alliance Shipping' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://allianceshipping.com',
    title: 'Alliance Shipping | USA-Haiti International Shipping',
    description:
      'Your trusted partner for fast, reliable, and affordable shipping between USA and Haiti.',
    siteName: 'Alliance Shipping',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alliance Shipping | USA-Haiti International Shipping',
    description:
      'Your trusted partner for fast, reliable, and affordable shipping between USA and Haiti.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#0066CC',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          colorInputBackground: '#f9fafb',
          colorInputText: '#1f2937',
          borderRadius: '0.75rem',
        },
        elements: {
          formButtonPrimary: 'bg-primary-600 hover:bg-primary-700 text-white transition-all',
          card: 'shadow-2xl backdrop-blur-xl bg-white/90',
        },
      }}
    >
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.variable} ${poppins.variable} antialiased`}>
          <LanguageProvider>{children}</LanguageProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
