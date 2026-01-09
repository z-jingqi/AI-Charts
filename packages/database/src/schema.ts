import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

/**
 * Records Table
 * Stores the main record metadata and full AI extraction result
 */
export const records = sqliteTable(
  'records',
  {
    id: text('id').primaryKey(), // UUID (generated with crypto.randomUUID())
    userId: text('user_id').notNull(),
    type: text('type', { enum: ['health', 'finance'] }).notNull(),
    category: text('category').notNull(), // e.g., 'blood_test', 'invoice'
    date: integer('date', { mode: 'timestamp' }).notNull(), // Unix timestamp for easier sorting
    summaryValue: real('summary_value'), // Key value for quick graphing
    rawContent: text('raw_content').notNull(), // JSON string of full AI extraction
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()), // Default to current timestamp
  },
  (table) => [
    index('idx_records_user_id').on(table.userId),
    index('idx_records_type').on(table.type),
    index('idx_records_date').on(table.date),
  ]
);

/**
 * Metrics Table
 * Stores individual metrics for SQL-based trending and analysis
 * Each metric is a normalized row for efficient querying
 */
export const metrics = sqliteTable(
  'metrics',
  {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    recordId: text('record_id')
      .notNull()
      .references(() => records.id, { onDelete: 'cascade' }), // Foreign key with cascade delete
    key: text('key').notNull(), // Metric name (e.g., "WBC", "ALT")
    value: real('value').notNull(), // Normalized numeric value
    unit: text('unit'), // Unit of measurement
    status: text('status', {
      enum: ['normal', 'high', 'low', 'positive', 'negative'],
    }).notNull(),
  },
  (table) => [
    index('idx_metrics_record_id').on(table.recordId),
    index('idx_metrics_key').on(table.key),
  ]
);
