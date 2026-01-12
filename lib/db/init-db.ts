import { db } from './index';
import { sql } from 'drizzle-orm';

/**
 * Initialize database tables
 * This script creates all necessary tables for the Alliance Shipping application
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...');

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        clerk_id VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Users table created');

    // Create admins table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'admin' NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Admins table created');

    // Create special_item_fees table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS special_item_fees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        fee_amount DECIMAL(10, 2) NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Special item fees table created');

    // Create packages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        tracking_number VARCHAR(100) NOT NULL UNIQUE,
        external_tracking_number VARCHAR(255),
        user_id INTEGER NOT NULL REFERENCES users(id),
        description TEXT NOT NULL,
        weight DECIMAL(10, 2) NOT NULL,
        weight_unit VARCHAR(10) DEFAULT 'lbs' NOT NULL,
        dimensions JSONB,
        category VARCHAR(100),
        service_fee DECIMAL(10, 2) DEFAULT 5.00 NOT NULL,
        weight_cost DECIMAL(10, 2) NOT NULL,
        total_cost DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
        sender_name VARCHAR(255) NOT NULL,
        sender_address TEXT NOT NULL,
        sender_city VARCHAR(100) NOT NULL,
        sender_country VARCHAR(100) NOT NULL,
        sender_phone VARCHAR(50),
        recipient_name VARCHAR(255) NOT NULL,
        recipient_address TEXT NOT NULL,
        recipient_city VARCHAR(100) NOT NULL,
        recipient_country VARCHAR(100) NOT NULL,
        recipient_phone VARCHAR(50),
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        current_location VARCHAR(255),
        estimated_delivery TIMESTAMP,
        actual_delivery TIMESTAMP,
        is_fragile BOOLEAN DEFAULT false NOT NULL,
        requires_signature BOOLEAN DEFAULT false NOT NULL,
        special_instructions TEXT,
        assigned_to_admin INTEGER REFERENCES admins(id),
        location_details JSONB,
        special_item_id INTEGER REFERENCES special_item_fees(id),
        priority VARCHAR(20) DEFAULT 'normal' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Packages table created');

    // Create tracking_history table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tracking_history (
        id SERIAL PRIMARY KEY,
        package_id INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        location VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Tracking history table created');

    // Create package_requests table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS package_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        external_tracking_number VARCHAR(255) NOT NULL,
        receipt_location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        customer_notes TEXT,
        estimated_weight VARCHAR(50),
        category VARCHAR(100) DEFAULT 'general',
        sender_info JSONB,
        recipient_info JSONB,
        status VARCHAR(50) DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Package requests table created');

    // Create service_fees table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS service_fees (
        id SERIAL PRIMARY KEY,
        fee_type VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
        description TEXT,
        effective_from TIMESTAMP DEFAULT NOW() NOT NULL,
        effective_until TIMESTAMP,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_by INTEGER REFERENCES admins(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Service fees table created');

    // Create announcements table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        target_audience VARCHAR(50) DEFAULT 'all' NOT NULL,
        specific_user_ids JSONB,
        is_published BOOLEAN DEFAULT false NOT NULL,
        publish_date TIMESTAMP,
        expiry_date TIMESTAMP,
        show_on_homepage BOOLEAN DEFAULT true NOT NULL,
        is_pinned BOOLEAN DEFAULT false NOT NULL,
        image_url VARCHAR(500),
        created_by INTEGER REFERENCES admins(id) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Announcements table created');

    // Create notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        package_id INTEGER REFERENCES packages(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Notifications table created');

    // Create delivery_proof table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS delivery_proof (
        id SERIAL PRIMARY KEY,
        package_id INTEGER NOT NULL UNIQUE REFERENCES packages(id),
        signature_image_url VARCHAR(500),
        photo_url VARCHAR(500),
        recipient_name VARCHAR(255) NOT NULL,
        delivered_to_alternate BOOLEAN DEFAULT false NOT NULL,
        alternate_recipient_name VARCHAR(255),
        alternate_recipient_relation VARCHAR(100),
        notes TEXT,
        delivered_by INTEGER REFERENCES admins(id),
        delivered_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Delivery proof table created');

    // Create revenue_records table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS revenue_records (
        id SERIAL PRIMARY KEY,
        package_id INTEGER NOT NULL REFERENCES packages(id),
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        transaction_id VARCHAR(255),
        payment_date TIMESTAMP DEFAULT NOW() NOT NULL,
        notes TEXT,
        recorded_by INTEGER NOT NULL REFERENCES admins(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Revenue records table created');

    // Create admin_activity_logs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS admin_activity_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER NOT NULL REFERENCES admins(id),
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id INTEGER,
        details JSONB,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('✅ Admin activity logs table created');

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
