import { z } from 'zod';

export const sharedVersion = "0.0.1";

// ========================================
// Zod Schemas - Data Contract Layer
// ========================================

/**
 * MetricItemSchema
 * Represents a single metric extracted from a medical report or financial document
 */
export const MetricItemSchema = z.object({
  key: z.string().describe('Standardized name of the metric (e.g., "WBC", "ALT")'),
  value: z.number().describe('The numeric value of the metric'),
  unit: z.string().optional().describe('Unit of measurement (e.g., "U/L", "mmol/L")'),
  status: z.enum(['normal', 'high', 'low', 'positive', 'negative']).describe('Status indicator'),
  reference: z.string().optional().describe('Reference range (e.g., "3.5-9.5")'),
});

/**
 * RecordDataSchema
 * The AI output structure - represents the complete extraction result
 */
export const RecordDataSchema = z.object({
  type: z.enum(['health', 'finance']).describe('Type of record'),
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
