import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Connection string is provided by the environment variable if available
const connectionString = process.env.DATABASE_URL;

let client: any = null;
let db: any = null;

if (connectionString) {
  try {
    client = postgres(connectionString);
    db = drizzle(client, { schema });
  } catch (err) {
    console.warn('[AI Studio] Could not connect to PostgreSQL:', err);
  }
} else {
  console.log('[AI Studio] DATABASE_URL not set — using in-memory storage fallback');
}

export { client, db, client as sql };
