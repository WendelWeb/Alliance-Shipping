-- Script to add GPS coordinates to existing warehouses
-- This adds realistic coordinates based on the warehouse city in Haiti

-- Port-au-Prince warehouses (latitude: ~18.54, longitude: ~-72.34)
UPDATE warehouses
SET
  latitude = 18.54 + (RANDOM() * 0.02 - 0.01),  -- Random offset ±0.01 degrees (~1km)
  longitude = -72.34 + (RANDOM() * 0.02 - 0.01)
WHERE LOWER(city) LIKE '%port-au-prince%'
  AND (latitude IS NULL OR longitude IS NULL);

-- Cap-Haïtien warehouses (latitude: ~19.76, longitude: ~-72.2)
UPDATE warehouses
SET
  latitude = 19.76 + (RANDOM() * 0.02 - 0.01),
  longitude = -72.2 + (RANDOM() * 0.02 - 0.01)
WHERE LOWER(city) LIKE '%cap%ha%'
  AND (latitude IS NULL OR longitude IS NULL);

-- Port-de-Paix warehouses (latitude: ~19.95, longitude: ~-72.83)
UPDATE warehouses
SET
  latitude = 19.95 + (RANDOM() * 0.02 - 0.01),
  longitude = -72.83 + (RANDOM() * 0.02 - 0.01)
WHERE LOWER(city) LIKE '%port-de-paix%'
  AND (latitude IS NULL OR longitude IS NULL);

-- Les Cayes warehouses (latitude: ~18.2, longitude: ~-73.75)
UPDATE warehouses
SET
  latitude = 18.2 + (RANDOM() * 0.02 - 0.01),
  longitude = -73.75 + (RANDOM() * 0.02 - 0.01)
WHERE LOWER(city) LIKE '%cayes%'
  AND (latitude IS NULL OR longitude IS NULL);

-- Gonaïves warehouses (latitude: ~19.45, longitude: ~-72.68)
UPDATE warehouses
SET
  latitude = 19.45 + (RANDOM() * 0.02 - 0.01),
  longitude = -72.68 + (RANDOM() * 0.02 - 0.01)
WHERE LOWER(city) LIKE '%gona%'
  AND (latitude IS NULL OR longitude IS NULL);

-- Jacmel warehouses (latitude: ~18.23, longitude: ~-72.54)
UPDATE warehouses
SET
  latitude = 18.23 + (RANDOM() * 0.02 - 0.01),
  longitude = -72.54 + (RANDOM() * 0.02 - 0.01)
WHERE LOWER(city) LIKE '%jacmel%'
  AND (latitude IS NULL OR longitude IS NULL);

-- Jérémie warehouses (latitude: ~18.65, longitude: ~-74.12)
UPDATE warehouses
SET
  latitude = 18.65 + (RANDOM() * 0.02 - 0.01),
  longitude = -74.12 + (RANDOM() * 0.02 - 0.01)
WHERE LOWER(city) LIKE '%j%r%mie%'
  AND (latitude IS NULL OR longitude IS NULL);

-- Hinche warehouses (latitude: ~19.15, longitude: ~-72.02)
UPDATE warehouses
SET
  latitude = 19.15 + (RANDOM() * 0.02 - 0.01),
  longitude = -72.02 + (RANDOM() * 0.02 - 0.01)
WHERE LOWER(city) LIKE '%hinche%'
  AND (latitude IS NULL OR longitude IS NULL);

-- Default for any other city (use Port-au-Prince coordinates as fallback)
UPDATE warehouses
SET
  latitude = 18.54 + (RANDOM() * 0.05 - 0.025),  -- Larger offset for unknown cities
  longitude = -72.34 + (RANDOM() * 0.05 - 0.025)
WHERE (latitude IS NULL OR longitude IS NULL);

-- Verify the update
SELECT
  id,
  name,
  city,
  latitude,
  longitude,
  is_active
FROM warehouses
ORDER BY city, name;
