'use client';

import { Header } from '@/components/Header';
import { Hero } from '@/sections/Hero';
import { HowItWorks } from '@/sections/HowItWorks';
import { Pricing } from '@/sections/Pricing';
import { DeliveryTimeline } from '@/sections/DeliveryTimeline';
import { Trust } from '@/sections/Trust';
import { FAQ } from '@/sections/FAQ';
import { Tracking } from '@/sections/Tracking';
import { Contact } from '@/sections/Contact';
import { Footer } from '@/sections/Footer';
import { BottomNav } from '@/components/BottomNav';

export default function Home() {
  return (
    <>
      <Header />
      <main className="pb-24 md:pb-32">
        <Hero />
        <HowItWorks />
        <Pricing />
        <DeliveryTimeline />
        <Trust />
        <FAQ />
        <Tracking />
        <Contact />
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
