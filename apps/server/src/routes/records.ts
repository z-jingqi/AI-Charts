/**
 * Records API Route
 * Handles CRUD operations for health and finance records
 */

import { Hono } from 'hono';
import { createDb } from '@ai-chart/database';
import { saveRecordData } from '../services/record-data';
import { type RecordData } from '@ai-chart/shared';

interface Env {
  DB: D1Database;
}

export const recordsRoute = new Hono<{ Bindings: Env }>();

/**
 * Save or update a record
 */
recordsRoute.post('/', async (c) => {
  try {
    const { data, userId } = await c.req.json<{ data: RecordData; userId?: string }>();

    if (!data) {
      return c.json({ success: false, error: 'Missing record data' }, 400);
    }

    const db = createDb(c.env.DB);
    const { recordId, itemsCount } = await saveRecordData(db, data, userId || 'default-user');

    return c.json({
      success: true,
      recordId,
      itemsCount,
      message: 'Record saved successfully',
    });
  } catch (error) {
    console.error('Save record error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to save record',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

export default recordsRoute;
