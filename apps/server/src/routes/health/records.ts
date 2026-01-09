/**
 * Health Records API Route
 * Handles manual health data input and record management
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
 * Create health records route
 */
export const healthRecordsRoute = new Hono<{ Bindings: Env }>();

/**
 * POST /api/health/records - Manually create a health record
 */
healthRecordsRoute.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const userId = body.userId as string | null;

    // Validate against RecordDataSchema
    const healthData: RecordData = RecordDataSchema.parse(body.data);

    // Ensure type is health
    if (healthData.type !== 'health') {
      return c.json(
        {
          success: false,
          error: 'Invalid type',
          message: 'This endpoint only accepts health data. Use /api/finance/records for finance data.',
        },
        400
      );
    }

    console.log('Manual health record creation:', {
      type: healthData.type,
      category: healthData.category,
      date: healthData.date,
      itemsCount: healthData.items.length,
    });

    const db = createDb(c.env.DB);
    const { recordId, itemsCount } = await saveRecordData(
      db,
      healthData,
      userId || 'default-user'
    );

    return c.json({
      success: true,
      recordId,
      data: {
        type: healthData.type,
        category: healthData.category,
        date: healthData.date,
        summary: healthData.summary,
        itemsCount,
        items: healthData.items,
      },
    });
  } catch (error) {
    console.error('Manual health record creation error:', error);

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
          message: 'Failed to save the health data. Please try again later.',
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

export default healthRecordsRoute;
