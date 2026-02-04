import 'dotenv/config';
import { db } from './index';
import {
  users,
  admins,
  packages,
  packageRequests,
  serviceFees,
  specialItemFees,
  announcements,
  revenueRecords,
  trackingHistory,
} from './schema';
// Note: All tables imported for clearing; only admin, fees, and special items are seeded
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 0. Clear existing data
    console.log('Clearing existing data...');
    await db.delete(trackingHistory);
    await db.delete(revenueRecords);
    await db.delete(announcements);
    await db.delete(packageRequests);
    await db.delete(packages);
    await db.delete(specialItemFees);
    await db.delete(serviceFees);
    await db.delete(admins);
    await db.delete(users);
    console.log('✅ Database cleared');

    // 1. Create Super Admin User
    console.log('Creating super admin...');
    const [superAdminUser] = await db
      .insert(users)
      .values({
        clerkId: 'dev_admin_clerk_id',
        email: 'stanleywendeljoseph@gmail.com',
        firstName: 'Stanley',
        lastName: 'Joseph',
        phone: '+1 305-555-0000',
      })
      .returning();

    // 2. Create Admin Record
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Alliance$hip2026!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    const [adminRecord] = await db.insert(admins).values({
      userId: superAdminUser.id,
      role: 'super_admin',
      password: hashedPassword,
      permissions: {
        users: { read: true, create: true, update: true, delete: true },
        packages: { read: true, create: true, update: true, delete: true },
        fees: { read: true, update: true },
        specialItems: { read: true, create: true, update: true, delete: true },
        announcements: { read: true, create: true, update: true, delete: true },
        analytics: { read: true },
      },
      isActive: true,
    }).returning();

    console.log(`✅ Super admin created: stanleywendeljoseph@gmail.com / ${adminPassword}`);

    // 3. Create Service Fees (Default)
    console.log('Creating default service fees...');
    // Create service fee
    await db.insert(serviceFees).values({
      feeType: 'service_fee',
      amount: '5.00',
      currency: 'USD',
      description: 'Fixed service fee per package',
      effectiveFrom: new Date('2026-01-01'),
      createdBy: adminRecord.id,
      isActive: true,
    });

    // Create per pound fee
    await db.insert(serviceFees).values({
      feeType: 'per_pound',
      amount: '4.00',
      currency: 'USD',
      description: 'Shipping fee per pound',
      effectiveFrom: new Date('2026-01-01'),
      createdBy: adminRecord.id,
      isActive: true,
    });

    console.log('✅ Default fees created: $5 service + $4/lb shipping');

    // 5. Create Special Item Fees
    console.log('Creating special item fees...');
    const specialItems = [
      // iPhone Models
      {
        category: 'phone',
        brand: 'Apple',
        itemName: 'iPhone',
        minModel: '7',
        maxModel: '11',
        fixedFee: '15.00',
      },
      {
        category: 'phone',
        brand: 'Apple',
        itemName: 'iPhone',
        minModel: '12',
        maxModel: '14',
        fixedFee: '20.00',
      },
      {
        category: 'phone',
        brand: 'Apple',
        itemName: 'iPhone',
        minModel: '15',
        maxModel: '17',
        fixedFee: '25.00',
      },
      // Samsung Galaxy
      {
        category: 'phone',
        brand: 'Samsung',
        itemName: 'Galaxy S',
        minModel: 'S6',
        maxModel: 'S10',
        fixedFee: '15.00',
      },
      {
        category: 'phone',
        brand: 'Samsung',
        itemName: 'Galaxy S',
        minModel: 'S20',
        maxModel: 'S24',
        fixedFee: '20.00',
      },
      // Starlink
      {
        category: 'satellite',
        brand: 'SpaceX',
        itemName: 'Starlink',
        minModel: 'Standard',
        maxModel: 'Standard',
        fixedFee: '50.00',
      },
    ];

    for (const item of specialItems) {
      await db.insert(specialItemFees).values({
        ...item,
        createdBy: adminRecord.id,
        isActive: true,
      });
    }

    console.log('✅ Special items created (6 items)');

    console.log('\n🎉 Database seed completed successfully!\n');
    console.log('📋 Summary:');
    console.log('  - 1 Super Admin');
    console.log('  - 1 Service Fee Configuration');
    console.log('  - 6 Special Item Fees');
    console.log('\n✅ Ready to use!');
    console.log('\n🔐 Admin Login:');
    console.log('   Email: stanleywendeljoseph@gmail.com');
    console.log(`   Password: ${adminPassword}`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log('✅ Seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}

export { seed };
