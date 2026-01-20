/**
 * AI Tools for Database Queries
 * These tools allow the AI chat model to query the database
 */

import { tool } from 'ai';
import { z } from 'zod';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import type { DrizzleD1Database } from '@ai-chart/database';
import { records, metrics, schema } from '@ai-chart/database';

/**
 * Get AI tools for database interaction
 * @param db - Drizzle database instance
 * @returns Object containing AI tools
 */
export function getTools(db: DrizzleD1Database<typeof schema>) {
  return {
    /**
     * Query health or finance records within a date range
     */
    query_records: tool({
      description:
        'Query health or finance records within a date range. Returns records with their associated metrics. Use this to get detailed health data for analysis.',
      inputSchema: z.object({
        startDate: z
          .string()
          .describe('Start date in ISO format (YYYY-MM-DD)'),
        endDate: z.string().describe('End date in ISO format (YYYY-MM-DD)'),
        type: z
          .enum(['health', 'finance'])
          .describe('Type of records to query'),
        userId: z
          .string()
          .optional()
          .describe('User ID to filter by (optional)'),
      }),
      execute: async ({ startDate, endDate, type, userId }) => {
        try {
          // Convert dates to timestamps
          const startTimestamp = new Date(startDate);
          const endTimestamp = new Date(endDate);

          // Build query conditions
          const conditions = [
            eq(records.type, type),
            gte(records.date, startTimestamp),
            lte(records.date, endTimestamp),
          ];

          if (userId) {
            conditions.push(eq(records.userId, userId));
          }

          // Query records
          const results = await db
            .select()
            .from(records)
            .where(and(...conditions))
            .orderBy(records.date);

          // Fetch metrics for each record
          const recordsWithMetrics = await Promise.all(
            results.map(async (record) => {
              const recordMetrics = await db
                .select()
                .from(metrics)
                .where(eq(metrics.recordId, record.id));

              return {
                ...record,
                metrics: recordMetrics,
              };
            })
          );

          return {
            success: true,
            count: recordsWithMetrics.length,
            records: recordsWithMetrics,
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error ? error.message : 'Failed to query records',
          };
        }
      },
    }),

    /**
     * Get trend data for a specific health metric over time
     */
    get_metric_trend: tool({
      description:
        'Get trend data for a specific health metric (like WBC, Cholesterol, etc.) over time. Returns time series data showing how the metric changed.',
      inputSchema: z.object({
        metricKey: z
          .string()
          .describe(
            'The metric name to track (e.g., "WBC", "Cholesterol", "ALT")'
          ),
        startDate: z
          .string()
          .describe('Start date in ISO format (YYYY-MM-DD)'),
        endDate: z.string().describe('End date in ISO format (YYYY-MM-DD)'),
        userId: z
          .string()
          .optional()
          .describe('User ID to filter by (optional)'),
      }),
      execute: async ({ metricKey, startDate, endDate, userId }) => {
        try {
          const startTimestamp = new Date(startDate);
          const endTimestamp = new Date(endDate);

          // Query metrics with record dates
          const query = db
            .select({
              date: records.date,
              value: metrics.value,
              unit: metrics.unit,
              status: metrics.status,
              category: records.category,
            })
            .from(metrics)
            .innerJoin(records, eq(metrics.recordId, records.id))
            .where(
              and(
                eq(metrics.key, metricKey),
                gte(records.date, startTimestamp),
                lte(records.date, endTimestamp),
                userId ? eq(records.userId, userId) : sql`1=1`
              )
            )
            .orderBy(records.date);

          const results = await query;

          if (results.length === 0) {
            return {
              success: true,
              metricKey,
              count: 0,
              message: `No data found for metric "${metricKey}" in the specified date range`,
              trend: [],
            };
          }

          // Calculate trend statistics
          const values = results.map((r) => r.value);
          const average =
            values.reduce((sum, val) => sum + val, 0) / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);

          return {
            success: true,
            metricKey,
            count: results.length,
            statistics: {
              average,
              min,
              max,
              unit: results[0]?.unit || null,
            },
            trend: results.map((r) => ({
              date: r.date,
              value: r.value,
              unit: r.unit,
              status: r.status,
              category: r.category,
            })),
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to get metric trend',
          };
        }
      },
    }),

    /**
     * Get latest health records summary
     */
    get_latest_records: tool({
      description:
        'Get the most recent health or finance records. Returns a summary of the latest data.',
      inputSchema: z.object({
        type: z
          .enum(['health', 'finance'])
          .describe('Type of records to query'),
        limit: z
          .number()
          .min(1)
          .max(10)
          .default(5)
          .describe('Number of records to return (1-10)'),
        userId: z
          .string()
          .optional()
          .describe('User ID to filter by (optional)'),
      }),
      execute: async ({ type, limit, userId }) => {
        try {
          const conditions = [eq(records.type, type)];

          if (userId) {
            conditions.push(eq(records.userId, userId));
          }

          const results = await db
            .select()
            .from(records)
            .where(and(...conditions))
            .orderBy(sql`${records.date} DESC`)
            .limit(limit);

          return {
            success: true,
            count: results.length,
            records: results.map((r) => ({
              id: r.id,
              type: r.type,
              category: r.category,
              date: r.date,
              summaryValue: r.summaryValue,
            })),
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : 'Failed to get latest records',
          };
        }
      },
    }),

    /**
     * Render a UI component on the dynamic canvas
     */
    render_ui: tool({
      description:
        'Render a UI component on the dynamic canvas. Use this to display charts, forms, or detailed data summaries to the user.',
      inputSchema: z.object({
        component: z
          .enum(['MetricCard', 'TrendChart', 'RecordForm'])
          .describe('The name of the component to render'),
        contentType: z
          .enum(['chart', 'form', 'pdf'])
          .describe('The type of content being rendered'),
        props: z.any().describe('The props for the component. \n' +
          '- MetricCard: { label, value, unit?, trend?, description? }\n' +
          '- TrendChart: { title, type: "line"|"bar", data: { name, value }[] }\n' +
          '- RecordForm: { initialData: { id, title, date, metrics: { key, name, value, unit? }[] } }'
        ),
      }),
      execute: async ({ component, props, contentType }) => {
        return {
          render: true,
          component,
          props,
          contentType,
        };
      },
    }),
  };
}
