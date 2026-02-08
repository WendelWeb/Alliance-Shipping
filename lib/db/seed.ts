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
  cityPricing,
  adminActivityLogs,
  notifications,
  loyaltyCredits,
  referrals,
  referralCodes,
  deliveryProof,
  warehouses,
} from './schema';
// Note: All tables imported for clearing; only admin, fees, and special items are seeded
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 0. Clear existing data
    console.log('Clearing existing data...');
    await db.delete(deliveryProof);
    await db.delete(trackingHistory);
    await db.delete(revenueRecords);
    await db.delete(notifications);
    await db.delete(loyaltyCredits);
    await db.delete(referrals);
    await db.delete(referralCodes);
    await db.delete(announcements);
    await db.delete(packageRequests);
    await db.delete(packages);
    await db.delete(specialItemFees);
    await db.delete(serviceFees);
    await db.delete(cityPricing);
    await db.delete(warehouses);
    await db.delete(adminActivityLogs);
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

    // 6. Create City Pricing
    console.log('Creating city pricing...');
    const cities = [
      {
        city: 'Port-au-Prince',
        serviceFee: '5.00',
        pricePerLb: '4.00',
      },
      {
        city: 'Cap-Haïtien',
        serviceFee: '6.00',
        pricePerLb: '4.50',
      },
      {
        city: 'Port-de-Paix',
        serviceFee: '7.00',
        pricePerLb: '5.00',
      },
    ];

    for (const city of cities) {
      await db.insert(cityPricing).values({
        ...city,
        isActive: true,
      });
    }

    console.log('✅ City pricing created (3 cities)');

    // 7. Create Mock Warehouses
    console.log('Creating mock warehouses...');
    const mockWarehouses = [
      // Port-au-Prince Warehouses
      {
        name: 'Alliance Shipping - Centre-Ville',
        city: 'Port-au-Prince',
        address: 'Rue des Miracles, Centre-Ville, Port-au-Prince, Haiti',
        latitude: '18.5944',
        longitude: '-72.3074',
        phone: '+509 3700-1234',
        email: 'pap-centre@allianceshipping.com',
        openingHours: 'Lun-Ven: 8h00-17h00, Sam: 9h00-13h00',
        isActive: true,
      },
      {
        name: 'Alliance Shipping - Delmas',
        city: 'Port-au-Prince',
        address: 'Delmas 33, Port-au-Prince, Haiti',
        latitude: '18.5615',
        longitude: '-72.3020',
        phone: '+509 3700-5678',
        email: 'pap-delmas@allianceshipping.com',
        openingHours: 'Lun-Ven: 8h00-18h00, Sam: 8h00-14h00',
        isActive: true,
      },
      {
        name: 'Alliance Shipping - Pétion-Ville',
        city: 'Port-au-Prince',
        address: 'Rue Grégoire, Pétion-Ville, Haiti',
        latitude: '18.5125',
        longitude: '-72.2850',
        phone: '+509 3700-9012',
        email: 'pap-petionville@allianceshipping.com',
        openingHours: 'Lun-Sam: 8h00-17h00',
        isActive: true,
      },
      // Cap-Haïtien Warehouses
      {
        name: 'Alliance Shipping - Cap-Haïtien Centre',
        city: 'Cap-Haïtien',
        address: 'Boulevard du Cap, Centre-Ville, Cap-Haïtien, Haiti',
        latitude: '19.7585',
        longitude: '-72.2015',
        phone: '+509 3701-2345',
        email: 'cap-centre@allianceshipping.com',
        openingHours: 'Lun-Ven: 8h00-17h00, Sam: 9h00-12h00',
        isActive: true,
      },
      {
        name: 'Alliance Shipping - Vertières',
        city: 'Cap-Haïtien',
        address: 'Route Vertières, Cap-Haïtien, Haiti',
        latitude: '19.7850',
        longitude: '-72.2250',
        phone: '+509 3701-6789',
        email: 'cap-vertieres@allianceshipping.com',
        openingHours: 'Lun-Ven: 8h30-16h30, Sam: 9h00-13h00',
        isActive: true,
      },
      // Port-de-Paix Warehouses
      {
        name: 'Alliance Shipping - Port-de-Paix',
        city: 'Port-de-Paix',
        address: 'Rue du Commerce, Port-de-Paix, Haiti',
        latitude: '19.9389',
        longitude: '-72.8303',
        phone: '+509 3702-3456',
        email: 'pdp-centre@allianceshipping.com',
        openingHours: 'Lun-Ven: 8h00-16h00, Sam: 9h00-12h00',
        isActive: true,
      },
      {
        name: 'Alliance Shipping - Port-de-Paix Baie',
        city: 'Port-de-Paix',
        address: 'Avenue de la Baie, Port-de-Paix, Haiti',
        latitude: '19.9510',
        longitude: '-72.8420',
        phone: '+509 3702-7890',
        email: 'pdp-baie@allianceshipping.com',
        openingHours: 'Lun-Sam: 8h00-15h00',
        isActive: true,
      },
    ];

    for (const warehouse of mockWarehouses) {
      await db.insert(warehouses).values(warehouse);
    }

    console.log('✅ Mock warehouses created (7 warehouses)');

    console.log('\n🎉 Database seed completed successfully!\n');
    console.log('📋 Summary:');
    console.log('  - 1 Super Admin');
    console.log('  - 1 Service Fee Configuration');
    console.log('  - 6 Special Item Fees');
    console.log('  - 3 City Pricing Configurations');
    console.log('  - 7 Mock Warehouses (3x Port-au-Prince, 2x Cap-Haïtien, 2x Port-de-Paix)');
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
