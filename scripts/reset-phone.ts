// Script to reset a user's phone to force modal
// Run with: npx tsx scripts/reset-phone.ts user@example.com

import { db } from '../lib/db';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function resetUserPhone(email: string) {
  try {
    console.log(`\n🔄 Resetting phone for: ${email}\n`);

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`📋 Current state:`);
    console.log(`   Phone: ${user.phone || 'NULL'}`);
    console.log(`   Country Code: ${user.countryCode || 'NULL'}`);
    console.log(`   City: ${user.city || 'NULL'}`);
    console.log(`   Warehouse: ${user.warehouseId || 'NULL'}`);

    // Reset phone and country code to null
    const [updated] = await db
      .update(users)
      .set({
        phone: null,
        countryCode: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    console.log(`\n✅ Phone reset successfully!`);
    console.log(`\n📋 New state:`);
    console.log(`   Phone: ${updated.phone || 'NULL'}`);
    console.log(`   Country Code: ${updated.countryCode || 'NULL'}`);
    console.log(`   City: ${updated.city || 'NULL'}`);
    console.log(`   Warehouse: ${updated.warehouseId || 'NULL'}`);

    console.log(`\n🚫 User will now be BLOCKED until they enter phone info!`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. User logs into the app`);
    console.log(`   2. Modal appears (app is blocked)`);
    console.log(`   3. User must enter phone, city, warehouse`);
    console.log(`   4. App unblocks after completion\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email || !email.includes('@')) {
  console.log('❌ Please provide a valid email address');
  console.log('Usage: npx tsx scripts/reset-phone.ts user@example.com');
  process.exit(1);
}

resetUserPhone(email);
