/**
 * Record Data Service
 * Domain-agnostic service for saving records (health, finance, etc.)
 */

import { type RecordData, type MetricItem } from '@ai-chart/shared';
import { createDb, records, metrics } from '@ai-chart/database';

/**
 * Save record data to database (domain-agnostic)
 * @param db - Database instance
 * @param recordData - Extracted or manually input data (health, finance, etc.)
 * @param userId - User identifier
 * @returns Record ID and metadata
 */
export async function saveRecordData(
  db: ReturnType<typeof createDb>,
  recordData: RecordData,
  userId: string = 'default-user',
): Promise<{
  recordId: string;
  itemsCount: number;
}> {
  // Generate unique record ID
  const recordId = crypto.randomUUID();

  // Insert into records table
  await db.insert(records).values({
    id: recordId,
    userId,
    type: recordData.type,
    category: recordData.category,
    date: new Date(recordData.date),
    summaryValue: recordData.summary,
    rawContent: JSON.stringify(recordData),
    createdAt: new Date(),
  });

  console.log(`${recordData.type} record created with ID: ${recordId}`);

  // Insert metrics
  if (recordData.items.length > 0) {
    await Promise.all(
      recordData.items.map((item: MetricItem) =>
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

    console.log(`Inserted ${recordData.items.length} ${recordData.type} metrics`);
  }

  return {
    recordId,
    itemsCount: recordData.items.length,
  };
}
