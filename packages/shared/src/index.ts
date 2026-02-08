import { z } from 'zod';

export const sharedVersion = '0.0.1';

// ========================================
// Zod Schemas - Data Contract Layer
// ========================================

/**
 * MetricItemSchema
 * Represents a single metric extracted from a medical report or financial document
 */
export const MetricItemSchema = z.object({
  key: z.string().describe('Short identifier for the metric (e.g., "wbc", "alt", "total_amount")'),
  name: z.string().describe('Human-readable name (e.g., "White Blood Cell Count", "Total Amount")'),
  value: z.number().describe('The numeric value of the metric'),
  unit: z.string().optional().describe('Unit of measurement (e.g., "U/L", "mmol/L", "USD")'),
  status: z
    .enum([
      'normal',
      'high',
      'low',
      'positive',
      'negative', // Health status values
      'income',
      'expense',
      'neutral', // Finance status values
    ])
    .describe('Status indicator'),
  reference: z.string().optional().describe('Reference range (e.g., "3.5-9.5", "Negative")'),
  notes: z.string().optional().describe('Additional context or notes about the metric'),
  displayOrder: z.number().optional().describe('Order for UI display (0, 1, 2, ...)'),
  categoryTag: z
    .string()
    .optional()
    .describe('Category/group tag (e.g., "liver_function", "food_drink")'),
  parentKey: z
    .string()
    .optional()
    .describe('Parent metric key for hierarchical data (e.g., line items under "subtotal")'),
});

/**
 * RecordDataSchema
 * The AI output structure - represents the complete extraction result
 */
export const RecordDataSchema = z.object({
  type: z.enum(['health', 'finance']).describe('Type of record'),
  title: z.string().optional().describe('Human-readable title (e.g., "Annual Blood Test")'),
  category: z.string().describe('Category (e.g., "blood_test", "invoice")'),
  date: z.string().describe('ISO date string (YYYY-MM-DD)'),
  summary: z.number().optional().describe('Key summary value for quick charting'),
  items: z.array(MetricItemSchema).describe('List of extracted metric items'),
});

// ========================================
// TypeScript Type Exports
// ========================================

export type MetricItem = z.infer<typeof MetricItemSchema>;
export type RecordData = z.infer<typeof RecordDataSchema>;
