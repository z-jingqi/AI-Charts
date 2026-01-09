/**
 * Upload API Route
 * Handles file upload and health data extraction using AI
 * Supports: Images (PNG, JPG, WebP) and PDF files
 */

import { Hono } from 'hono';
import {
  extractHealthDataFromImage,
  extractHealthDataFromPDF,
} from '@ai-chart/ai-core';
import { type RecordData } from '@ai-chart/shared';
import { createDb } from '@ai-chart/database';
import { saveHealthData } from '../services/health-data';

/**
 * Environment bindings
 */
interface Env {
  DB: D1Database;
  GOOGLE_GENERATIVE_AI_API_KEY: string;
}

/**
 * File type detection utility
 */
function detectFileType(file: File): 'image' | 'pdf' | 'unknown' {
  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const extension = fileName.split('.').pop();

  // Check MIME type first
  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType === 'application/pdf') {
    return 'pdf';
  }

  // Fallback to file extension
  if (extension === 'pdf') {
    return 'pdf';
  }

  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
    return 'image';
  }

  return 'unknown';
}

/**
 * Create upload route
 */
export const uploadRoute = new Hono<{ Bindings: Env }>();

uploadRoute.post('/', async (c) => {
  try {
    // Parse multipart form data
    const formData = await c.req.formData();
    const file = formData.get('file');
    const userId = formData.get('userId') as string | null;

    // Validate file exists
    if (!file) {
      return c.json(
        {
          success: false,
          error: 'No file uploaded',
          message: 'Please provide a file in the "file" field',
        },
        400
      );
    }

    // Check if file is a File-like object
    if (typeof file === 'string') {
      return c.json(
        {
          success: false,
          error: 'Invalid file format',
          message: 'File must be uploaded as binary data',
        },
        400
      );
    }

    // Convert file to proper type and validate
    const fileObj = file as File;

    // Detect file type
    const fileType = detectFileType(fileObj);

    // Validate file type
    if (!['image', 'pdf'].includes(fileType)) {
      return c.json(
        {
          success: false,
          error: 'Invalid file type',
          message: 'Only image files (PNG, JPG, WebP) and PDF files are supported',
          receivedType: fileObj.type,
        },
        400
      );
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await fileObj.arrayBuffer();

    // Extract health data using appropriate strategy
    console.log(`Extracting data from ${fileType} file: ${fileObj.name} (${fileObj.size} bytes)`);

    let healthData: RecordData;
    if (fileType === 'pdf') {
      // PDF extraction: Vision AI primary (default), text fallback
      // Can be configured with strategy: 'text' for text-first extraction
      healthData = await extractHealthDataFromPDF(c.env, arrayBuffer, {
        strategy: 'vision', // or 'text' for text-first extraction
      });
    } else {
      // Image extraction: Vision AI
      healthData = await extractHealthDataFromImage(c.env, arrayBuffer);
    }

    console.log('Extraction result:', {
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
    console.error('Upload error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // AI extraction errors
      if (error.message.includes('extract')) {
        return c.json(
          {
            success: false,
            error: 'Extraction failed',
            message:
              'Failed to extract health data from the image. Please ensure the image is clear and contains a medical report.',
            details: error.message,
          },
          422
        );
      }

      // Database errors
      if (error.message.includes('database') || error.message.includes('D1')) {
        return c.json(
          {
            success: false,
            error: 'Database error',
            message:
              'Failed to save the extracted data. Please try again later.',
            details: error.message,
          },
          500
        );
      }
    }

    // Generic error
    return c.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default uploadRoute;
