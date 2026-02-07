import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { sharedVersion } from '@ai-chart/shared';
import { aiCoreVersion } from '@ai-chart/ai-core';
import { createDb } from '@ai-chart/database';

// Chat route
import chatRoute from './routes/chat';

// Domain-specific routes
import healthUploadRoute from './routes/health/upload';
import healthRecordsRoute from './routes/health/records';
import financeUploadRoute from './routes/finance/upload';
import financeRecordsRoute from './routes/finance/records';
import recordsRoute from './routes/records';

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
  AI?: unknown; // Cloudflare Workers AI binding (optional)
}

const app = new Hono<{ Bindings: Env }>();

app.use('/*', cors());

// Domain-specific API routes
app.route('/api/health/upload', healthUploadRoute);
app.route('/api/health/records', healthRecordsRoute);
app.route('/api/finance/upload', financeUploadRoute);
app.route('/api/finance/records', financeRecordsRoute);
app.route('/api/records', recordsRoute);

// Chat route
app.route('/api/chat', chatRoute);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'AI-Chart API Server',
    version: '0.1.0',
    endpoints: {
      health: {
        upload: '/api/health/upload',
        records: '/api/health/records',
      },
      finance: {
        upload: '/api/finance/upload',
        records: '/api/finance/records',
      },
      chat: '/api/chat',
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
      500,
    );
  }
});

export default app;
