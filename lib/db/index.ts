import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// During build time, DATABASE_URL might not be available
// We create a dummy connection that will throw an error only if actually used
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost:5432/dummy';

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
