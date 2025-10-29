import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@src/db';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});
export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });
