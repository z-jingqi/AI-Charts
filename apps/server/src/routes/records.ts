/**
 * Records API Route
 * Full CRUD operations for health and finance records
 */

import { Hono } from 'hono';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { createDb, records, metrics } from '@ai-chart/database';
import { saveRecordData, updateRecordData, deleteRecordData } from '../services/record-data';
import { type RecordData } from '@ai-chart/shared';

interface Env {
  DB: D1Database;
}

export const recordsRoute = new Hono<{ Bindings: Env }>();

/**
 * GET /api/records — List records with filters
 * Query params: type, startDate, endDate, category, limit, offset
 */
recordsRoute.get('/', async (c) => {
  try {
    const db = createDb(c.env.DB);

    const type = c.req.query('type') as 'health' | 'finance' | undefined;
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    const category = c.req.query('category');
    const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);
    const offset = parseInt(c.req.query('offset') || '0', 10);

    const conditions = [];
    if (type) {
      conditions.push(eq(records.type, type));
    }
    if (category) {
      conditions.push(eq(records.category, category));
    }
    if (startDate) {
      conditions.push(gte(records.date, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(records.date, new Date(endDate)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, countResult] = await Promise.all([
      db
        .select({
          id: records.id,
          type: records.type,
          title: records.title,
          category: records.category,
          date: records.date,
          summaryValue: records.summaryValue,
          source: records.source,
          createdAt: records.createdAt,
          updatedAt: records.updatedAt,
          metricsCount: sql<number>`(SELECT COUNT(*) FROM metrics WHERE metrics.record_id = ${records.id})`,
        })
        .from(records)
        .where(where)
        .orderBy(desc(records.date))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(records)
        .where(where),
    ]);

    return c.json({
      success: true,
      data: items,
      total: countResult[0]?.count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('List records error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to list records',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

/**
 * GET /api/records/:id — Single record with its metrics
 */
recordsRoute.get('/:id', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const id = c.req.param('id');

    const record = await db.select().from(records).where(eq(records.id, id)).limit(1);

    if (record.length === 0) {
      return c.json({ success: false, error: 'Record not found' }, 404);
    }

    const recordMetrics = await db
      .select()
      .from(metrics)
      .where(eq(metrics.recordId, id))
      .orderBy(metrics.displayOrder);

    return c.json({
      success: true,
      data: {
        ...record[0],
        metrics: recordMetrics,
      },
    });
  } catch (error) {
    console.error('Get record error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to get record',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

/**
 * POST /api/records — Create a new record
 */
recordsRoute.post('/', async (c) => {
  try {
    const { data, userId } = await c.req.json<{ data: RecordData; userId?: string }>();

    if (!data) {
      return c.json({ success: false, error: 'Missing record data' }, 400);
    }

    const db = createDb(c.env.DB);
    const { recordId, itemsCount } = await saveRecordData(
      db,
      data,
      userId || 'default-user',
      'manual',
    );

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

/**
 * PUT /api/records/:id — Update record fields and/or metrics
 */
recordsRoute.put('/:id', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const id = c.req.param('id');

    // Check record exists
    const existing = await db
      .select({ id: records.id })
      .from(records)
      .where(eq(records.id, id))
      .limit(1);
    if (existing.length === 0) {
      return c.json({ success: false, error: 'Record not found' }, 404);
    }

    const body = await c.req.json<{
      title?: string;
      category?: string;
      date?: string;
      summary?: number;
      items?: RecordData['items'];
    }>();

    await updateRecordData(db, id, body);

    return c.json({ success: true, message: 'Record updated successfully' });
  } catch (error) {
    console.error('Update record error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to update record',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

/**
 * DELETE /api/records/:id — Delete a record (metrics cascade)
 */
recordsRoute.delete('/:id', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const id = c.req.param('id');

    // Check record exists
    const existing = await db
      .select({ id: records.id })
      .from(records)
      .where(eq(records.id, id))
      .limit(1);
    if (existing.length === 0) {
      return c.json({ success: false, error: 'Record not found' }, 404);
    }

    await deleteRecordData(db, id);

    return c.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete record error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to delete record',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

export default recordsRoute;
