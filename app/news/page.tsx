'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { Card } from '@/components/Card';
import { Calendar, ArrowRight, Bell, AlertCircle, Megaphone, Wrench, Pin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  category: string;
  priority: string;
  publishDate: string;
  isPinned: boolean;
  imageUrl?: string | null;
  createdAt: string;
}

const typeConfig: Record<string, { bgColor: string; textColor: string; icon: typeof Bell }> = {
  news: { bgColor: 'bg-blue-50', textColor: 'text-blue-600', icon: Megaphone },
  alert: { bgColor: 'bg-red-50', textColor: 'text-red-600', icon: AlertCircle },
  promo: { bgColor: 'bg-purple-50', textColor: 'text-purple-600', icon: Bell },
  maintenance: { bgColor: 'bg-orange-50', textColor: 'text-orange-600', icon: Wrench },
};

export default function NewsPage() {
  const { t, locale } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/announcements/public?lang=${locale}&limit=50`)
      .then((res) => res.json())
      .then((data) => setAnnouncements(data.announcements || []))
      .catch((err) => console.error('Error fetching news:', err))
      .finally(() => setLoading(false));
  }, [locale]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ht' ? 'fr-HT' : locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container>
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-4 font-display">
              {t.news.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              {t.news.subtitle}
            </p>
          </motion.div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="theme-card rounded-2xl p-6 animate-pulse shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="h-5 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && announcements.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Bell className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">{t.news.noNews}</h3>
              <p className="text-gray-500">{t.news.subtitle}</p>
            </motion.div>
          )}

          {/* News Grid */}
          {!loading && announcements.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {announcements.map((article, index) => {
                const config = typeConfig[article.type] || typeConfig.news;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.07 }}
                  >
                    <Card
                      hover
                      className="h-full overflow-hidden group cursor-pointer backdrop-blur-xl theme-surface border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Header with type icon and pinned badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-xl ${config.bgColor}`}>
                          <Icon className={`h-5 w-5 ${config.textColor}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          {article.isPinned && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                              <Pin className="h-3 w-3" />
                            </span>
                          )}
                          <span className={`px-3 py-1 ${config.bgColor} ${config.textColor} text-xs font-semibold rounded-full uppercase`}>
                            {article.type}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(article.publishDate || article.createdAt)}</span>
                      </div>

                      {/* Content preview */}
                      <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-4 flex-grow whitespace-pre-line">
                        {article.content.length > 200
                          ? article.content.substring(0, 200).trim() + '...'
                          : article.content}
                      </p>

                      {/* Read More */}
                      <div className={`flex items-center gap-2 ${config.textColor} font-semibold group-hover:gap-3 transition-all mt-auto`}>
                        {t.news.readMore}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
