/**
 * Record Data Service
 * Domain-agnostic service for saving records (health, finance, etc.)
 */

import { type RecordData, type MetricItem } from '@ai-chart/shared';
import { createDb, records, metrics } from '@ai-chart/database';
import { eq } from 'drizzle-orm';

/**
 * Save record data to database (domain-agnostic)
 * @param db - Database instance
 * @param recordData - Extracted or manually input data (health, finance, etc.)
 * @param userId - User identifier
 * @param source - Data provenance: 'chat' | 'upload' | 'manual'
 * @returns Record ID and metadata
 */
export async function saveRecordData(
  db: ReturnType<typeof createDb>,
  recordData: RecordData,
  userId: string = 'default-user',
  source: 'chat' | 'upload' | 'manual' = 'manual',
): Promise<{
  recordId: string;
  itemsCount: number;
}> {
  const recordId = crypto.randomUUID();
  const now = new Date();

  await db.insert(records).values({
    id: recordId,
    userId,
    type: recordData.type,
    title: recordData.title || null,
    category: recordData.category,
    date: new Date(recordData.date),
    summaryValue: recordData.summary,
    source,
    rawContent: JSON.stringify(recordData),
    createdAt: now,
    updatedAt: now,
  });

  console.log(`${recordData.type} record created with ID: ${recordId}`);

  if (recordData.items.length > 0) {
    await insertMetrics(db, recordId, recordData.items);
    console.log(`Inserted ${recordData.items.length} ${recordData.type} metrics`);
  }

  return {
    recordId,
    itemsCount: recordData.items.length,
  };
}

/**
 * Save multiple records in one batch (e.g., one image with blood test + urine test)
 */
export async function saveMultipleRecords(
  db: ReturnType<typeof createDb>,
  recordsData: RecordData[],
  userId: string = 'default-user',
  source: 'chat' | 'upload' | 'manual' = 'manual',
): Promise<Array<{ recordId: string; category: string; itemsCount: number }>> {
  const results = [];
  for (const recordData of recordsData) {
    const { recordId, itemsCount } = await saveRecordData(db, recordData, userId, source);
    results.push({ recordId, category: recordData.category, itemsCount });
  }
  return results;
}

/**
 * Update an existing record and optionally replace its metrics
 */
export async function updateRecordData(
  db: ReturnType<typeof createDb>,
  recordId: string,
  updates: {
    title?: string;
    category?: string;
    date?: string;
    summary?: number;
    items?: MetricItem[];
  },
): Promise<{ success: boolean }> {
  const now = new Date();

  // Build record field updates
  const recordUpdates: Record<string, unknown> = { updatedAt: now };
  if (updates.title !== undefined) {
    recordUpdates.title = updates.title;
  }
  if (updates.category !== undefined) {
    recordUpdates.category = updates.category;
  }
  if (updates.date !== undefined) {
    recordUpdates.date = new Date(updates.date);
  }
  if (updates.summary !== undefined) {
    recordUpdates.summaryValue = updates.summary;
  }

  await db.update(records).set(recordUpdates).where(eq(records.id, recordId));

  // If items are provided, replace all metrics for this record
  if (updates.items && updates.items.length > 0) {
    await db.delete(metrics).where(eq(metrics.recordId, recordId));
    await insertMetrics(db, recordId, updates.items);
  }

  return { success: true };
}

/**
 * Delete a record (metrics cascade automatically)
 */
export async function deleteRecordData(
  db: ReturnType<typeof createDb>,
  recordId: string,
): Promise<{ success: boolean }> {
  await db.delete(records).where(eq(records.id, recordId));
  return { success: true };
}

/**
 * Insert metrics for a record
 */
async function insertMetrics(
  db: ReturnType<typeof createDb>,
  recordId: string,
  items: MetricItem[],
) {
  await Promise.all(
    items.map((item) =>
      db.insert(metrics).values({
        recordId,
        key: item.key,
        name: item.name,
        value: item.value,
        unit: item.unit || null,
        status: item.status,
        reference: item.reference || null,
        notes: item.notes || null,
        displayOrder: item.displayOrder ?? null,
        categoryTag: item.categoryTag || null,
        parentKey: item.parentKey || null,
      }),
    ),
  );
}
