import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * Create a Drizzle database instance for Cloudflare D1
 * @param client - D1Database instance from Cloudflare Workers environment
 * @returns Drizzle database instance with schema
 */
export function createDb(client: D1Database): DrizzleD1Database<typeof schema> {
  return drizzle(client, { schema });
}

/**
 * Export schema for external use
 */
export { schema };
