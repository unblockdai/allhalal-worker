import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Create a database client using the Hyperdrive connection string
 * 
 * Note: This function expects the connection string to be passed directly
 * from the environment bindings, NOT from process.env which isn't available in Workers.
 * process.env is only used by drizzle-kit via dotenv in the drizzle.config.ts file.
 */
export function createDbClient(connectionString: string) {
  // Create a postgres.js client with the connection string
  const sql = postgres(connectionString);
  
  // Create the drizzle client with the schema
  return drizzle(sql, { schema });
}