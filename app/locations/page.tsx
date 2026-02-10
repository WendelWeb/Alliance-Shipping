'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Container } from '@/components/Container';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useTheme } from '@/lib/themes/ThemeProvider';
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Search,
  X,
  Building2,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  lat: number;
  lng: number;
  hours: string;
  isOpen: boolean;
}

export default function LocationsPage() {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const colors = theme.colors;
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const cities = ['all', ...Array.from(new Set(locations.map((l) => l.city)))];

  const filtered = locations.filter((loc) => {
    const matchesSearch =
      !search ||
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.city.toLowerCase().includes(search.toLowerCase()) ||
      loc.address.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCity === 'all' || loc.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  const loc = (t as any).locationsPage || {};

  return (
    <div className="overflow-x-hidden">
      <Header />
      <main className="min-h-screen pb-32 pt-2 md:pt-4">
        <Container size="lg">
          {/* Hero Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 md:mb-12"
          >
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
              }}
            >
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 font-display"
              style={{ color: colors.gray[900] }}
            >
              {loc.title || 'Our Locations'}
            </h1>
            <p
              className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto"
              style={{ color: colors.gray[600] }}
            >
              {loc.subtitle || 'Find our offices and warehouses near you'}
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                style={{ color: colors.gray[400] }}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={loc.searchPlaceholder || 'Search by name or city...'}
                className="w-full pl-12 pr-12 py-4 border-2 rounded-2xl focus:ring-4 transition-all outline-none text-base"
                style={{
                  borderColor: colors.gray[200],
                  backgroundColor: isDark ? colors.gray[800] : colors.gray[50],
                  color: colors.gray[900],
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors"
                  style={{ color: colors.gray[400] }}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* City Filter Chips */}
            {cities.length > 2 && (
              <div className="flex flex-wrap justify-center gap-2">
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                    style={{
                      backgroundColor:
                        selectedCity === city
                          ? colors.primary[600]
                          : isDark
                          ? colors.gray[800]
                          : colors.gray[100],
                      color:
                        selectedCity === city
                          ? '#ffffff'
                          : colors.gray[700],
                      boxShadow:
                        selectedCity === city ? theme.shadow.md : 'none',
                    }}
                  >
                    {city === 'all' ? loc.filterAll || 'All' : city}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: colors.primary[600] }}
              />
            </div>
          )}

          {/* No Results */}
          {!loading && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Building2
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: colors.gray[300] }}
              />
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: colors.gray[900] }}
              >
                {search
                  ? loc.noResults || 'No results'
                  : loc.noLocations || 'No locations available'}
              </h3>
            </motion.div>
          )}

          {/* Locations Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((location, index) => (
                  <motion.div
                    key={location.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="theme-card rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all group"
                  >
                    {/* Top Color Bar */}
                    <div
                      className="h-2"
                      style={{
                        background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.primary[600]})`,
                      }}
                    />

                    {/* Map Preview */}
                    <div
                      className="relative h-40 flex items-center justify-center overflow-hidden"
                      style={{
                        background: isDark
                          ? `linear-gradient(135deg, ${colors.gray[800]}, ${colors.gray[700]})`
                          : `linear-gradient(135deg, ${colors.primary[50]}, ${colors.primary[100]})`,
                      }}
                    >
                      <div className="text-center">
                        <div
                          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-2"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
                          }}
                        >
                          <MapPin className="w-7 h-7 text-white" />
                        </div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: colors.primary[700] }}
                        >
                          {location.city}
                        </p>
                      </div>

                      {/* Open/Closed Badge */}
                      <div
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: location.isOpen
                            ? isDark
                              ? '#14532d'
                              : '#dcfce7'
                            : isDark
                            ? '#7f1d1d'
                            : '#fee2e2',
                          color: location.isOpen
                            ? isDark
                              ? '#bbf7d0'
                              : '#166534'
                            : isDark
                            ? '#fecaca'
                            : '#991b1b',
                        }}
                      >
                        {location.isOpen
                          ? loc.open || 'Open'
                          : loc.closed || 'Closed'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3
                          className="text-lg font-bold mb-1"
                          style={{ color: colors.gray[900] }}
                        >
                          {location.name}
                        </h3>
                      </div>

                      {/* Info Items */}
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            style={{ color: colors.primary[500] }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: colors.gray[600] }}
                          >
                            {location.address}
                          </span>
                        </div>

                        {location.phone && (
                          <div className="flex items-center gap-3">
                            <Phone
                              className="w-4 h-4 flex-shrink-0"
                              style={{ color: colors.primary[500] }}
                            />
                            <span
                              className="text-sm font-mono"
                              style={{ color: colors.gray[600] }}
                            >
                              {location.phone}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <Clock
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: colors.primary[500] }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: colors.gray[600] }}
                          >
                            {location.hours}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        {location.phone && (
                          <a
                            href={`tel:${location.phone.replace(/\s/g, '')}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-md"
                            style={{
                              backgroundColor: isDark
                                ? '#14532d'
                                : '#dcfce7',
                              color: isDark ? '#bbf7d0' : '#166534',
                            }}
                          >
                            <Phone className="w-4 h-4" />
                            {loc.call || 'Call'}
                          </a>
                        )}
                        <a
                          href={`https://maps.google.com/?q=${location.lat},${location.lng}&entry=gps&g_st=awb`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
                          }}
                        >
                          <Navigation className="w-4 h-4" />
                          {loc.directions || 'Directions'}
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Container>
      </main>
      <BottomNav />
    </div>
  );
}
