/**
 * Drizzle Kit Configuration
 * 
 * This file is only used by Drizzle Kit CLI commands for migrations and development.
 * It uses process.env and dotenv, which are NOT available in the Cloudflare Workers runtime.
 * 
 * When running in the Cloudflare Workers environment, connection strings should be 
 * provided through environment bindings rather than process.env.
 */
import 'dotenv/config'; // Only used by Drizzle Kit, not in Workers runtime
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    // This is only used by Drizzle Kit CLI tools, not within the Worker
    url: process.env.HYPERDRIVE_URL!,
  },
});