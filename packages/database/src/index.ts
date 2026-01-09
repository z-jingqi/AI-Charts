/**
 * @ai-chart/database
 * Database layer for AI-Chart using Drizzle ORM and Cloudflare D1
 */

// Export database client factory
export { createDb, schema } from './client';

// Export table schemas for direct use
export { records, metrics } from './schema';

// Export TypeScript types inferred from schema
export type { DrizzleD1Database } from 'drizzle-orm/d1';
