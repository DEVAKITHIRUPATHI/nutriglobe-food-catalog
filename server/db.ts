import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Connection string is provided by the environment variable if available
const rawUrl = process.env.DATABASE_URL;
const connectionString = (rawUrl && typeof rawUrl === 'string' && rawUrl.trim().length > 0 && rawUrl !== 'undefined' && rawUrl !== 'null')
  ? rawUrl.trim()
  : null;

let client: any = null;
let db: any = null;

if (connectionString) {
  try {
    const testClient = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 5,
      onnotice: () => {},
    });

    client = testClient;
    db = drizzle(client, { schema });

    // Verify credentials and database connection asynchronously
    testClient`SELECT 1`.then(() => {
      console.log('[AI Studio] PostgreSQL database connected successfully.');
    }).catch((err: any) => {
      console.log('[AI Studio] PostgreSQL unavailable or credentials invalid, using in-memory storage fallback:', err?.message || err);
      client = null;
      db = null;
    });
  } catch (err) {
    console.warn('[AI Studio] Could not initialize PostgreSQL client:', err);
    client = null;
    db = null;
  }
} else {
  console.log('[AI Studio] DATABASE_URL not set — using in-memory storage fallback');
}

export { client, db, client as sql };

