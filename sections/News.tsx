'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { Container } from '@/components/Container';
import { SectionTitle } from '@/components/SectionTitle';
import { Card } from '@/components/Card';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'info' | 'alert' | 'update';
  publishDate: string;
  isPinned: boolean;
  createdAt: string;
}

export function News() {
  const { t, locale: language } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch announcements filtered by current language
    fetch(`/api/announcements/public?lang=${language}&limit=6`)
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data.announcements || []);
      })
      .catch((error) => {
        console.error('Error fetching announcements:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [language]);

  // Extract clean title (remove language tag like [EN], [FR], etc.)
  const cleanTitle = (title: string) => {
    return title.replace(/^\[.+?\]\s*/, '');
  };

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Type colors and icons
  const typeConfig = {
    info: {
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      icon: Bell,
    },
    alert: {
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      icon: AlertCircle,
    },
    update: {
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      icon: Bell,
    },
  };

  if (loading) {
    return (
      <section id="news" className="section-padding bg-theme-bg">
        <Container>
          <SectionTitle title={t.news.title} subtitle={t.news.subtitle} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-theme-surface-solid rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (announcements.length === 0) {
    return (
      <section id="news" className="section-padding bg-theme-bg">
        <Container>
          <SectionTitle title={t.news.title} subtitle={t.news.subtitle} />
          <div className="text-center py-12">
            <Bell className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500">{t.news.noNews}</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section id="news" className="section-padding bg-theme-bg">
      <Container>
        <SectionTitle title={t.news.title} subtitle={t.news.subtitle} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((announcement, index) => {
            const config = typeConfig[announcement.type] || typeConfig.info;
            const Icon = config.icon;

            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 flex flex-col">
                  {/* Header with icon and type */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.textColor}`} />
                    </div>
                    {announcement.isPinned && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                        Pinned
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {cleanTitle(announcement.title)}
                  </h3>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(announcement.publishDate)}</span>
                  </div>

                  {/* Content preview */}
                  <p className="text-gray-600 mb-4 flex-grow line-clamp-3">
                    {truncateContent(announcement.content)}
                  </p>

                  {/* Read more link */}
                  <button className={`inline-flex items-center gap-2 font-semibold ${config.textColor} hover:underline`}>
                    {t.news.readMore}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* View all button */}
        {announcements.length >= 6 && (
          <div className="text-center mt-12">
            <motion.a
              href="/news"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t.news.viewAll}
              <ArrowRight className="h-5 w-5" />
            </motion.a>
          </div>
        )}
      </Container>
    </section>
  );
}
