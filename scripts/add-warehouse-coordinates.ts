/**
 * Script to add GPS coordinates to existing warehouses
 * Run with: npx ts-node scripts/add-warehouse-coordinates.ts
 */

import { db } from '../lib/db';
import { warehouses } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

// City coordinates map (center of each city)
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'port-au-prince': { lat: 18.54, lng: -72.34 },
  'cap-haitien': { lat: 19.76, lng: -72.2 },
  'cap-haïtien': { lat: 19.76, lng: -72.2 },
  'port-de-paix': { lat: 19.95, lng: -72.83 },
  'les cayes': { lat: 18.2, lng: -73.75 },
  'gonaives': { lat: 19.45, lng: -72.68 },
  'gonaïves': { lat: 19.45, lng: -72.68 },
  'jacmel': { lat: 18.23, lng: -72.54 },
  'jeremie': { lat: 18.65, lng: -74.12 },
  'jérémie': { lat: 18.65, lng: -74.12 },
  'hinche': { lat: 19.15, lng: -72.02 },
};

function getRandomOffset(range: number = 0.01): number {
  // Generate random offset between -range and +range
  return (Math.random() * 2 - 1) * range;
}

function getCityCoordinates(city: string): { lat: number; lng: number } {
  const normalizedCity = city.toLowerCase().trim();

  // Try exact match first
  if (CITY_COORDINATES[normalizedCity]) {
    return CITY_COORDINATES[normalizedCity];
  }

  // Try partial match
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
      return coords;
    }
  }

  // Default to Port-au-Prince if no match
  console.warn(`⚠️  Unknown city: ${city}, using Port-au-Prince coordinates`);
  return CITY_COORDINATES['port-au-prince'];
}

async function addWarehouseCoordinates() {
  try {
    console.log('🚀 Starting warehouse coordinates migration...\n');

    // Get all warehouses without coordinates
    const warehousesWithoutCoords = await db
      .select()
      .from(warehouses)
      .where(
        sql`${warehouses.latitude} IS NULL OR ${warehouses.longitude} IS NULL`
      );

    if (warehousesWithoutCoords.length === 0) {
      console.log('✅ All warehouses already have coordinates!');
      return;
    }

    console.log(
      `📍 Found ${warehousesWithoutCoords.length} warehouses without coordinates\n`
    );

    // Update each warehouse
    for (const warehouse of warehousesWithoutCoords) {
      const baseCoords = getCityCoordinates(warehouse.city);

      // Add small random offset to avoid exact duplicates
      const latitude = baseCoords.lat + getRandomOffset(0.01);
      const longitude = baseCoords.lng + getRandomOffset(0.01);

      await db
        .update(warehouses)
        .set({
          latitude: latitude.toFixed(7),
          longitude: longitude.toFixed(7),
          updatedAt: new Date(),
        })
        .where(sql`${warehouses.id} = ${warehouse.id}`);

      console.log(
        `✓ Updated ${warehouse.name} (${warehouse.city}): ${latitude.toFixed(
          5
        )}, ${longitude.toFixed(5)}`
      );
    }

    console.log('\n✅ Migration completed successfully!');

    // Display summary
    const allWarehouses = await db.select().from(warehouses);
    const withCoords = allWarehouses.filter((w) => w.latitude && w.longitude);

    console.log('\n📊 Summary:');
    console.log(`   Total warehouses: ${allWarehouses.length}`);
    console.log(`   With coordinates: ${withCoords.length}`);
    console.log(
      `   Without coordinates: ${allWarehouses.length - withCoords.length}`
    );
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
}

// Run the migration
addWarehouseCoordinates()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
