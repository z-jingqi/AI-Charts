/**
 * Records API Route
 * Handles manual health data input and record management
 */

import { Hono } from 'hono';
import { RecordDataSchema, type RecordData } from '@ai-chart/shared';
import { createDb } from '@ai-chart/database';
import { saveHealthData } from '../services/health-data';

/**
 * Environment bindings
 */
interface Env {
  DB: D1Database;
}

/**
 * Create records route
 */
export const recordsRoute = new Hono<{ Bindings: Env }>();

/**
 * POST /api/records - Manually create a health record
 */
recordsRoute.post('/', async (c) => {
  try {
    // Parse request body
    const body = await c.req.json();
    const userId = body.userId as string | null;

    // Validate against RecordDataSchema
    const healthData: RecordData = RecordDataSchema.parse(body.data);

    console.log('Manual record creation:', {
      type: healthData.type,
      category: healthData.category,
      date: healthData.date,
      itemsCount: healthData.items.length,
    });

    // Initialize database
    const db = createDb(c.env.DB);

    // Save health data to database
    const { recordId, itemsCount } = await saveHealthData(
      db,
      healthData,
      userId || 'default-user'
    );

    // Return success response
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
    console.error('Manual record creation error:', error);

    // Handle validation errors
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

    // Handle database errors
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

    // Generic error
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

export default recordsRoute;
