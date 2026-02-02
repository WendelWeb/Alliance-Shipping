'use client';

import { useState, useEffect } from 'react';
import { PRICING } from '@/constants';

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
 * Falls back to PRICING constants if API fails or is loading
 *
 * Usage:
 * const { pricing, loading } = usePricing();
 * const total = pricing.serviceFee + weight * pricing.pricePerLb;
 */
export function usePricing() {
  const [pricing, setPricing] = useState<PricingData>({
    serviceFee: PRICING.serviceFee,
    pricePerLb: PRICING.pricePerLb,
    standardDelivery: PRICING.standardDelivery,
    perfumeDelay: PRICING.perfumeDelay,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);

    fetch('/api/fees/current')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch fees');
        }
        return res.json();
      })
      .then((data) => {
        setPricing((prev) => ({
          ...prev,
          serviceFee: data.serviceFee,
          pricePerLb: data.pricePerLb,
        }));
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching pricing:', err);
        setError(err.message);
        // Keep fallback constants - no need to update state
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { pricing, loading, error };
}
