/**
 * Finance Records API Route
 * Handles manual finance data input and record management
 */

import { Hono } from 'hono';
import { RecordDataSchema, type RecordData } from '@ai-chart/shared';
import { createDb } from '@ai-chart/database';
import { saveRecordData } from '../../services/record-data';

/**
 * Environment bindings
 */
interface Env {
  DB: D1Database;
}

/**
 * Create finance records route
 */
export const financeRecordsRoute = new Hono<{ Bindings: Env }>();

/**
 * POST /api/finance/records - Manually create a finance record
 */
financeRecordsRoute.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const userId = body.userId as string | null;

    // Validate against RecordDataSchema
    const financeData: RecordData = RecordDataSchema.parse(body.data);

    // Ensure type is finance
    if (financeData.type !== 'finance') {
      return c.json(
        {
          success: false,
          error: 'Invalid type',
          message: 'This endpoint only accepts finance data. Use /api/health/records for health data.',
        },
        400
      );
    }

    console.log('Manual finance record creation:', {
      type: financeData.type,
      category: financeData.category,
      date: financeData.date,
      itemsCount: financeData.items.length,
    });

    const db = createDb(c.env.DB);
    const { recordId, itemsCount } = await saveRecordData(
      db,
      financeData,
      userId || 'default-user'
    );

    return c.json({
      success: true,
      recordId,
      data: {
        type: financeData.type,
        category: financeData.category,
        date: financeData.date,
        summary: financeData.summary,
        itemsCount,
        items: financeData.items,
      },
    });
  } catch (error) {
    console.error('Manual finance record creation error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return c.json(
        {
          success: false,
          error: 'Validation error',
          message: 'The provided data does not match the required schema',
          details: error.message,
        },
        400
      );
    }

    if (error instanceof Error && (error.message.includes('database') || error.message.includes('D1'))) {
      return c.json(
        {
          success: false,
          error: 'Database error',
          message: 'Failed to save the finance data. Please try again later.',
          details: error.message,
        },
        500
      );
    }

    return c.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while saving your data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default financeRecordsRoute;
