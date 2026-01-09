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
  userId: string = 'default-user'
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
          value: item.value,
          unit: item.unit || null,
          status: item.status,
        })
      )
    );

    console.log(`Inserted ${recordData.items.length} ${recordData.type} metrics`);
  }

  return {
    recordId,
    itemsCount: recordData.items.length,
  };
}

/**
 * Save health data to database
 * @deprecated Use saveRecordData instead (backward compatible wrapper)
 * @param db - Database instance
 * @param healthData - Extracted or manually input health data
 * @param userId - User identifier
 * @returns Record ID and metadata
 */
export async function saveHealthData(
  db: ReturnType<typeof createDb>,
  healthData: RecordData,
  userId: string = 'default-user'
): Promise<{
  recordId: string;
  itemsCount: number;
}> {
  return saveRecordData(db, healthData, userId);
}

/**
 * Save finance data to database
 * @param db - Database instance
 * @param financeData - Extracted or manually input finance data
 * @param userId - User identifier
 * @returns Record ID and metadata
 */
export async function saveFinanceData(
  db: ReturnType<typeof createDb>,
  financeData: RecordData,
  userId: string = 'default-user'
): Promise<{
  recordId: string;
  itemsCount: number;
}> {
  return saveRecordData(db, financeData, userId);
}
