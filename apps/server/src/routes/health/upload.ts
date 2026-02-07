/**
 * Health Upload API Route
 * Handles health document upload (images, PDFs) and data extraction
 */

import { Hono } from 'hono';
import { extractDataFromImage } from '@ai-chart/ai-core';
import { type RecordData } from '@ai-chart/shared';
import { createDb } from '@ai-chart/database';
import { saveRecordData } from '../../services/record-data';
import { detectFileType } from '../../utils/file';

/**
 * Environment bindings
 */
interface Env {
  DB: D1Database;
  GOOGLE_GENERATIVE_AI_API_KEY: string;
}

/**
 * Create health upload route
 */
export const healthUploadRoute = new Hono<{ Bindings: Env }>();

healthUploadRoute.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    const userId = formData.get('userId') as string | null;

    if (!file || typeof file === 'string') {
      return c.json(
        {
          success: false,
          error: 'No file uploaded',
          message: 'Please provide a file in the "file" field',
        },
        400,
      );
    }

    const fileObj = file as File;
    const fileType = detectFileType(fileObj);

    if (fileType !== 'image') {
      return c.json(
        {
          success: false,
          error: 'Invalid file type',
          message: 'Only image files (PNG, JPG, WebP) are supported for now',
          receivedType: fileObj.type,
        },
        400,
      );
    }

    const arrayBuffer = await fileObj.arrayBuffer();

    console.log(`Extracting health data from image file: ${fileObj.name}`);

    const healthData = await extractDataFromImage(c.env, arrayBuffer, 'health');

    console.log('Health data extraction result:', {
      type: healthData.type,
      category: healthData.category,
      date: healthData.date,
      itemsCount: healthData.items.length,
    });

    const db = createDb(c.env.DB);
    const { recordId, itemsCount } = await saveRecordData(db, healthData, userId || 'default-user');

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
    console.error('Health upload error:', error);

    if (error instanceof Error) {
      if (error.message.includes('extract')) {
        return c.json(
          {
            success: false,
            error: 'Extraction failed',
            message:
              'Failed to extract health data. Please ensure the document is clear and contains medical information.',
            details: error.message,
          },
          422,
        );
      }

      if (error.message.includes('database') || error.message.includes('D1')) {
        return c.json(
          {
            success: false,
            error: 'Database error',
            message: 'Failed to save the extracted data. Please try again later.',
            details: error.message,
          },
          500,
        );
      }
    }

    return c.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500,
    );
  }
});

export default healthUploadRoute;
