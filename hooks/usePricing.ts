'use client';

import { useState, useEffect } from 'react';
import { PRICING } from '@/constants';

interface CityPricing {
  id: number;
  city: string;
  serviceFee: number;
  pricePerLb: number;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  perfumeDaysMin: number;
  perfumeDaysMax: number;
}

interface PricingData {
  serviceFee: number;
  pricePerLb: number;
  standardDelivery: {
    min: number;
    max: number;
  };
  perfumeDelay: number;
}

/**
 * Custom hook to fetch dynamic pricing from API
 * Fetches all city pricing from /api/pricing/all
 * Falls back to PRICING constants if API fails
 *
 * Usage:
 * const { pricing, cities, loading } = usePricing();
 * const cityData = cities.find(c => c.city === selectedCity);
 */
export function usePricing() {
  const [cities, setCities] = useState<CityPricing[]>([]);
  const [pricing, setPricing] = useState<PricingData>({
    serviceFee: PRICING.serviceFee,
    pricePerLb: PRICING.pricePerLb,
    standardDelivery: PRICING.standardDelivery,
    perfumeDelay: PRICING.perfumeDelay,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/pricing/all')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch pricing');
        return res.json();
      })
      .then((data) => {
        const fetchedCities: CityPricing[] = data.cities || [];
        setCities(fetchedCities);

        // Use first city as default pricing (or lowest serviceFee)
        if (fetchedCities.length > 0) {
          const first = fetchedCities[0];
          setPricing({
            serviceFee: first.serviceFee,
            pricePerLb: first.pricePerLb,
            standardDelivery: {
              min: first.deliveryDaysMin,
              max: first.deliveryDaysMax,
            },
            perfumeDelay: first.perfumeDaysMax - first.deliveryDaysMax,
          });
        }
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching pricing:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { pricing, cities, loading, error };
}
