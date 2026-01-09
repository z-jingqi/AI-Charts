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
    key: text('key').notNull(), // Short identifier (e.g., "wbc", "alt")
    name: text('name').notNull(), // Human-readable name (e.g., "White Blood Cell Count")
    value: real('value').notNull(), // Normalized numeric value
    unit: text('unit'), // Unit of measurement (e.g., "mg/dL", "USD")
    status: text('status', {
      enum: ['normal', 'high', 'low', 'positive', 'negative', 'income', 'expense', 'neutral'],
    }).notNull(),
    reference: text('reference'), // Reference range (e.g., "3.5-9.5", "Negative")
    notes: text('notes'), // Additional context or notes about the metric
    displayOrder: integer('display_order'), // Order for UI display (0, 1, 2, ...)
    categoryTag: text('category_tag'), // Category/group (e.g., "liver_function", "food_drink")
    parentKey: text('parent_key'), // Parent metric key for hierarchical data
  },
  (table) => [
    index('idx_metrics_record_id').on(table.recordId),
    index('idx_metrics_key').on(table.key),
    index('idx_metrics_category_tag').on(table.categoryTag),
    index('idx_metrics_parent_key').on(table.parentKey),
  ]
);
