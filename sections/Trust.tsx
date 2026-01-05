'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Shield, Award, Clock, Users, Star, Quote } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { STATS } from '@/constants';

export function Trust() {
  const { t } = useTranslation();

  const stats = [
    { icon: Clock, value: `${STATS.yearsExperience}+`, label: t.trust.stats.experience },
    { icon: Users, value: `${STATS.packagesDelivered.toLocaleString()}+`, label: t.trust.stats.packages },
    { icon: Award, value: `${STATS.satisfactionRate}%`, label: t.trust.stats.satisfaction },
    { icon: Shield, value: `${STATS.deliverySuccess}%`, label: t.trust.stats.success },
  ];

  const features = [
    {
      icon: Shield,
      title: t.trust.features[0].title,
      description: t.trust.features[0].description,
    },
    {
      icon: Award,
      title: t.trust.features[1].title,
      description: t.trust.features[1].description,
    },
    {
      icon: Users,
      title: t.trust.features[2].title,
      description: t.trust.features[2].description,
    },
    {
      icon: Clock,
      title: t.trust.features[3].title,
      description: t.trust.features[3].description,
    },
  ];

  return (
    <section className="section-padding bg-gradient-to-br from-gray-50 via-white to-primary-50">
      <Container>
        <SectionTitle
          title={t.trust.title}
          subtitle={t.trust.subtitle}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover padding="lg" className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover padding="lg" className="h-full">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {t.trust.testimonials.title}
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {t.trust.testimonials.items.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover padding="lg" className="h-full relative">
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-primary-200" />

                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.comment}"
                  </p>

                  <div className="border-t pt-4">
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonial Images */}
        <div className="relative w-full h-64 md:h-80 mt-12">
          <Image
            src="/images/testimonials-group.jpg"
            alt="Professional customer testimonial portraits - Diverse, friendly customers (Haitian and American) with genuine smiles, professional attire, warm natural lighting, satisfied and trustworthy expressions"
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>
      </Container>
    </section>
  );
}
