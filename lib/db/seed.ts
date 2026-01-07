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
        phoneNumber: '+1 305-555-0000',
      })
      .returning();

    // 2. Create Admin Record
    const hashedPassword = await bcrypt.hash('admin123', 10);
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

    console.log('✅ Super admin created: stanleywendeljoseph@gmail.com / admin123');

    // 3. Create Sample Users
    console.log('Creating sample users...');
    const [user1] = await db
      .insert(users)
      .values({
        clerkId: 'user_1_clerk_id',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+509 3612-3456',
      })
      .returning();

    const [user2] = await db
      .insert(users)
      .values({
        clerkId: 'user_2_clerk_id',
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+509 3712-5678',
      })
      .returning();

    const [user3] = await db
      .insert(users)
      .values({
        clerkId: 'user_3_clerk_id',
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        phoneNumber: '+509 3845-9012',
      })
      .returning();

    console.log('✅ Sample users created');

    // 4. Create Service Fees (Default)
    console.log('Creating default service fees...');
    // Create service fee
    await db.insert(serviceFees).values({
      feeType: 'service_fee',
      amount: 5.0,
      currency: 'USD',
      description: 'Fixed service fee per package',
      effectiveFrom: new Date('2026-01-01'),
      createdBy: adminRecord.id,
      isActive: true,
    });

    // Create per pound fee
    await db.insert(serviceFees).values({
      feeType: 'per_pound',
      amount: 4.0,
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
        fixedFee: 15.0,
      },
      {
        category: 'phone',
        brand: 'Apple',
        itemName: 'iPhone',
        minModel: '12',
        maxModel: '14',
        fixedFee: 20.0,
      },
      {
        category: 'phone',
        brand: 'Apple',
        itemName: 'iPhone',
        minModel: '15',
        maxModel: '17',
        fixedFee: 25.0,
      },
      // Samsung Galaxy
      {
        category: 'phone',
        brand: 'Samsung',
        itemName: 'Galaxy S',
        minModel: 'S6',
        maxModel: 'S10',
        fixedFee: 15.0,
      },
      {
        category: 'phone',
        brand: 'Samsung',
        itemName: 'Galaxy S',
        minModel: 'S20',
        maxModel: 'S24',
        fixedFee: 20.0,
      },
      // Starlink
      {
        category: 'satellite',
        brand: 'SpaceX',
        itemName: 'Starlink',
        minModel: 'Standard',
        maxModel: 'Standard',
        fixedFee: 50.0,
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

    // 6. Create Sample Packages
    console.log('Creating sample packages...');

    // Package 1 - In Transit
    const [pkg1] = await db
      .insert(packages)
      .values({
        userId: user1.id,
        trackingNumber: 'AS-2026-00001',
        description: 'Electronics and clothing',
        weight: 5.5,
        serviceFee: 5.0,
        weightCost: 22.0,
        totalCost: 27.0,
        senderName: 'Miami Warehouse',
        senderAddress: '123 Shipping Street',
        senderCity: 'Miami',
        senderCountry: 'USA',
        senderPhone: '+1 305-555-1000',
        recipientName: 'John Doe',
        recipientAddress: '456 Delivery Ave',
        recipientCity: 'Cap-Haïtien',
        recipientCountry: 'Haiti',
        recipientPhone: '+509 3612-3456',
        status: 'in-transit',
        currentLocation: 'Port-au-Prince Airport',
        assignedToAdmin: adminRecord.id,
      })
      .returning();

    // Package 2 - Available
    const [pkg2] = await db
      .insert(packages)
      .values({
        userId: user2.id,
        trackingNumber: 'AS-2026-00002',
        description: 'Gift items',
        weight: 3.2,
        serviceFee: 5.0,
        weightCost: 12.8,
        totalCost: 17.8,
        senderName: 'Miami Warehouse',
        senderAddress: '123 Shipping Street',
        senderCity: 'Miami',
        senderCountry: 'USA',
        senderPhone: '+1 305-555-1000',
        recipientName: 'Jane Smith',
        recipientAddress: '789 Main St',
        recipientCity: 'Port-au-Prince',
        recipientCountry: 'Haiti',
        recipientPhone: '+509 3712-5678',
        status: 'available',
        currentLocation: 'Port-au-Prince Office',
        assignedToAdmin: adminRecord.id,
      })
      .returning();

    // Package 3 - Delivered
    const [pkg3] = await db
      .insert(packages)
      .values({
        userId: user1.id,
        trackingNumber: 'AS-2026-00003',
        description: 'Documents and accessories',
        weight: 8.0,
        serviceFee: 5.0,
        weightCost: 32.0,
        totalCost: 37.0,
        senderName: 'Miami Warehouse',
        senderAddress: '123 Shipping Street',
        senderCity: 'Miami',
        senderCountry: 'USA',
        senderPhone: '+1 305-555-1000',
        recipientName: 'John Doe',
        recipientAddress: '456 Delivery Ave',
        recipientCity: 'Port-au-Prince',
        recipientCountry: 'Haiti',
        recipientPhone: '+509 3612-3456',
        status: 'delivered',
        currentLocation: 'Delivered',
        assignedToAdmin: adminRecord.id,
        actualDelivery: new Date('2026-01-05'),
      })
      .returning();

    console.log('✅ Sample packages created');

    // 7. Create Package Request
    console.log('Creating package request...');
    await db.insert(packageRequests).values({
      userId: user3.id,
      description: 'iPhone 15 Pro',
      estimatedWeight: 0.5,
      category: 'phone',
      senderInfo: {
        name: 'Best Buy Miami',
        address: '789 Store Ave',
        city: 'Miami',
        country: 'USA',
        phone: '+1 305-555-2000',
      },
      recipientInfo: {
        name: 'Bob Johnson',
        address: '321 Mountain Rd',
        city: 'Cap-Haïtien',
        country: 'Haiti',
        phone: '+509 3845-9012',
      },
      status: 'pending',
    });

    console.log('✅ Package request created');

    // 8. Create Tracking History
    console.log('Creating tracking history...');
    await db.insert(trackingHistory).values([
      {
        packageId: pkg1.id,
        status: 'received',
        location: 'Miami Warehouse',
        description: 'Package received at Miami warehouse',
      },
      {
        packageId: pkg1.id,
        status: 'in-transit',
        location: 'In Flight to Haiti',
        description: 'Package departed Miami',
      },
      {
        packageId: pkg1.id,
        status: 'in-transit',
        location: 'Port-au-Prince Airport',
        description: 'Package arrived in Haiti',
      },
    ]);

    console.log('✅ Tracking history created');

    // 9. Create Revenue Records
    console.log('Creating revenue records...');
    await db.insert(revenueRecords).values([
      {
        packageId: pkg3.id,
        amount: 37.0,
        paymentMethod: 'cash',
        recordedBy: adminRecord.id,
      },
    ]);

    console.log('✅ Revenue records created');

    // 10. Create Announcements
    console.log('Creating announcements...');
    await db.insert(announcements).values([
      {
        title: 'Welcome to Alliance Shipping!',
        type: 'news',
        content:
          'We are excited to announce the launch of our new shipping platform. Track your packages in real-time and enjoy faster delivery times!',
        isPublished: true,
        publishDate: new Date(),
        createdBy: adminRecord.id,
      },
      {
        title: 'Holiday Shipping Schedule',
        type: 'alert',
        content:
          'Please note our modified schedule during the holiday season. We will be operating with reduced hours from December 24-26.',
        isPublished: true,
        publishDate: new Date(),
        createdBy: adminRecord.id,
      },
    ]);

    console.log('✅ Announcements created');

    console.log('\n🎉 Database seed completed successfully!\n');
    console.log('📋 Summary:');
    console.log('  - 1 Super Admin');
    console.log('  - 3 Sample Users');
    console.log('  - 1 Service Fee Configuration');
    console.log('  - 6 Special Item Fees');
    console.log('  - 3 Sample Packages');
    console.log('  - 1 Package Request');
    console.log('  - 3 Tracking History Entries');
    console.log('  - 1 Revenue Record');
    console.log('  - 2 Announcements');
    console.log('\n✅ Ready to use!');
    console.log('\n🔐 Admin Login:');
    console.log('   Email: stanleywendeljoseph@gmail.com');
    console.log('   Password: admin123');
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
