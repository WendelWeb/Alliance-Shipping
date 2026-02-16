'use client';

import { motion } from 'framer-motion';
import { Shield, Award, Clock, Users, Star, Quote } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { ImageGallery } from '@/components/ImageGallery';
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
    <section className="section-padding bg-theme-bg">
      <Container>
        <SectionTitle
          title={t.trust.title}
          subtitle={t.trust.subtitle}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover padding="lg" className="text-center !p-4 sm:!p-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" />
                </div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover padding="lg" className="h-full !p-4 sm:!p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
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
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-5 sm:mb-8">
            {t.trust.testimonials.title}
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {t.trust.testimonials.items.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover padding="lg" className="h-full relative !p-4 sm:!p-6">
                  <Quote className="absolute top-3 right-3 w-6 h-6 sm:w-8 sm:h-8 text-primary-200" />

                  <div className="flex gap-0.5 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                    "{testimonial.comment}"
                  </p>

                  <div className="border-t pt-3">
                    <div className="font-bold text-sm text-gray-900">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.location}</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonial Images */}
        {/* <div className="relative w-full h-48 md:h-64 mt-8 rounded-xl overflow-hidden">
          <ImageGallery
            section="testimonials"
            className="w-full h-full"
            imageClassName="object-contain"
          />
        </div> */}
      </Container>
    </section>
  );
}
