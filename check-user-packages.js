const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkUserPackages() {
  try {
    console.log('=== Checking Users ===');
    const users = await sql`SELECT id, clerk_id, email, first_name, last_name FROM users`;
    console.log('Users in database:', users);

    console.log('\n=== Checking Packages ===');
    const packages = await sql`SELECT id, tracking_number, user_id, description, status FROM packages`;
    console.log('Packages in database:', packages);

    console.log('\n=== Checking Package Requests ===');
    const requests = await sql`SELECT id, user_id, external_tracking_number, status FROM package_requests`;
    console.log('Package Requests in database:', requests);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserPackages();
