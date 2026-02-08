// Script to check and optionally reset user phone numbers
// Run with: npx tsx scripts/check-user-phone.ts

import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkAndResetPhone(email?: string) {
  try {
    // Get all users or specific user
    let usersList;
    if (email) {
      usersList = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
    } else {
      usersList = await db
        .select({
          id: users.id,
          email: users.email,
          phone: users.phone,
          countryCode: users.countryCode,
          city: users.city,
          warehouseId: users.warehouseId,
        })
        .from(users);
    }

    console.log('\n📊 User Phone Status:\n');
    console.log('='.repeat(80));

    for (const user of usersList) {
      const hasPhone = !!user.phone;
      const hasValidPhone = hasPhone && user.phone!.startsWith('+');
      const hasCity = !!user.city;
      const hasWarehouse = !!user.warehouseId;
      const isBlocked = !hasValidPhone || !hasCity || !hasWarehouse;

      console.log(`\n👤 User: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Phone: ${user.phone || 'NULL'}`);
      console.log(`   Country Code: ${user.countryCode || 'NULL'}`);
      console.log(`   City: ${user.city || 'NULL'}`);
      console.log(`   Warehouse ID: ${user.warehouseId || 'NULL'}`);
      console.log(`   ${isBlocked ? '🚫 BLOCKED' : '✅ ALLOWED'}`);
      console.log(`   - Valid Phone (with +): ${hasValidPhone ? '✅' : '❌'}`);
      console.log(`   - Has City: ${hasCity ? '✅' : '❌'}`);
      console.log(`   - Has Warehouse: ${hasWarehouse ? '✅' : '❌'}`);
    }

    console.log('\n' + '='.repeat(80));

    // Ask if user wants to reset phones
    if (email && usersList.length > 0) {
      console.log(`\n⚠️  To reset phone for ${email}, run:`);
      console.log(`   npx tsx scripts/reset-phone.ts ${email}`);
    }

    console.log('\n✅ Check complete!\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Get email from command line args
const email = process.argv[2];

if (email && !email.includes('@')) {
  console.log('❌ Please provide a valid email address');
  console.log('Usage: npx tsx scripts/check-user-phone.ts user@example.com');
  console.log('   or: npx tsx scripts/check-user-phone.ts (to check all users)');
  process.exit(1);
}

checkAndResetPhone(email);
