const { drizzle } = require('drizzle-orm/node-postgres');
const { Client } = require('pg');
const { users } = require('./lib/db/schema');
const { eq } = require('drizzle-orm');
require('dotenv').config({ path: '.env.local' });

async function checkAllianceAccount() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client);
  
  const result = await db.select().from(users).where(eq(users.email, 'allianceshipping26@gmail.com'));
  
  if (result.length > 0) {
    console.log('✅ Alliance Shipping account EXISTS:');
    console.log(JSON.stringify(result[0], null, 2));
  } else {
    console.log('❌ Alliance Shipping account NOT FOUND');
  }
  
  await client.end();
}

checkAllianceAccount().catch(console.error);
