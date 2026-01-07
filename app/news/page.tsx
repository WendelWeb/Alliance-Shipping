'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const newsArticles = [
  {
    id: 1,
    title: 'Nouveau Service Express: Miami → Cap-Haïtien en 48h',
    excerpt: 'Alliance Shipping lance un nouveau service express qui réduit le temps de livraison à seulement 2 jours pour les envois urgents.',
    image: '/images/hero/hero-shipping.jpg',
    date: '2026-01-05',
    readTime: '3 min',
    category: 'Service',
  },
  {
    id: 2,
    title: 'Expansion vers Port-au-Prince et Port-de-Paix',
    excerpt: 'Nous sommes ravis d\'annoncer l\'ouverture prochaine de deux nouvelles destinations en Haïti.',
    image: '/images/hero/hero-shipping-1.jpg',
    date: '2026-01-03',
    readTime: '4 min',
    category: 'Expansion',
  },
  {
    id: 3,
    title: 'Promotion Spéciale: -20% sur tous les envois',
    excerpt: 'Profitez de notre promotion du Nouvel An avec 20% de réduction sur tous vos envois ce mois-ci!',
    image: '/images/hero/hero-shipping-2.jpg',
    date: '2026-01-01',
    readTime: '2 min',
    category: 'Promotion',
  },
];

export default function NewsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-32 pt-20 bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <Container>
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 pt-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 font-display">
              Actualités & <span className="gradient-primary bg-clip-text text-transparent">Nouveautés</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Restez informé des dernières nouvelles et mises à jour d'Alliance Shipping
            </p>
          </motion.div>

          {/* News Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  hover
                  className="h-full overflow-hidden group cursor-pointer backdrop-blur-xl bg-white/80 border-white/20 shadow-2xl"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-600 text-xs font-semibold rounded-full shadow-lg">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all">
                      Lire la suite
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </main>
      <BottomNav />
    </>
  );
}
