import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sharedVersion } from '@ai-chart/shared';
import { aiCoreVersion } from '@ai-chart/ai-core';
import { createDb } from '@ai-chart/database';

// Legacy routes (backward compatible)
import chatRoute from './routes/chat';
import uploadRoute from './routes/upload';
import recordsRoute from './routes/records';

// Domain-specific routes
import healthUploadRoute from './routes/health/upload';
import healthRecordsRoute from './routes/health/records';
import financeUploadRoute from './routes/finance/upload';
import financeRecordsRoute from './routes/finance/records';

/**
 * Environment bindings for Cloudflare Workers
 */
interface Env {
  DB: D1Database;
  DEFAULT_PROVIDER?: string;
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_KEY?: string;
  AI?: any; // Cloudflare Workers AI binding (optional)
}

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

// Domain-specific API routes (v2)
app.route('/api/health/upload', healthUploadRoute);
app.route('/api/health/records', healthRecordsRoute);
app.route('/api/finance/upload', financeUploadRoute);
app.route('/api/finance/records', financeRecordsRoute);

// Legacy API routes (v1 - backward compatible, defaults to health)
app.route('/api/chat', chatRoute);
app.route('/api/upload', uploadRoute);
app.route('/api/records', recordsRoute);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'AI-Chart API Server',
    version: '0.0.2',
    endpoints: {
      // Domain-specific endpoints (v2)
      health: {
        upload: '/api/health/upload',
        records: '/api/health/records',
      },
      finance: {
        upload: '/api/finance/upload',
        records: '/api/finance/records',
      },
      // Legacy endpoints (v1)
      legacy: {
        chat: '/api/chat',
        upload: '/api/upload',
        records: '/api/records',
      },
      // System endpoints
      system: {
        health: '/health',
        dbTest: '/db-test',
      },
    },
    dependencies: {
      shared: sharedVersion,
      aiCore: aiCoreVersion,
    },
  });
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: Date.now() });
});

// Database test endpoint
app.get('/db-test', (c) => {
  try {
    const db = createDb(c.env.DB);
    return c.json({
      status: 'success',
      message: 'Database connection initialized',
      dbInitialized: !!db,
    });
  } catch (error) {
    return c.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

export default app;
