/**
 * Chat API Route
 * Handles AI chat with tool calling for database queries
 */

import { Hono } from 'hono';
import { streamText } from 'ai';
import { getReasoningModel } from '@ai-chart/ai-core';
import { createDb } from '@ai-chart/database';
import { getTools } from '../ai/tools';

/**
 * Environment bindings
 */
interface Env {
  DB: D1Database;
  GOOGLE_GENERATIVE_AI_API_KEY: string;
}

/**
 * Chat message structure
 */
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Request body structure
 */
interface ChatRequest {
  messages: ChatMessage[];
  userId?: string;
}

/**
 * System prompt for the AI assistant
 */
const SYSTEM_PROMPT = `You are a helpful AI assistant for AI-Chart, a personal health data intelligence dashboard.

Your capabilities:
- Access and analyze health records from the database
- Track trends in health metrics over time
- Provide insights based on historical data
- Explain medical terminology in simple terms

IMPORTANT GUIDELINES:
- You are NOT a medical professional and cannot provide medical advice
- Always recommend consulting healthcare providers for medical decisions
- Be clear, empathetic, and supportive in your responses
- When users ask about their data, use the provided tools to query the database
- Explain trends and patterns in an easy-to-understand way
- If you don't have enough data, let the user know clearly

Available tools:
- query_records: Get detailed health records within a date range
- get_metric_trend: Track how a specific metric changes over time
- get_latest_records: Get the most recent health records summary

Use these tools proactively when users ask about their health data.`;

/**
 * Create chat route
 */
export const chatRoute = new Hono<{ Bindings: Env }>();

chatRoute.post('/', async (c) => {
  try {
    // Parse request body
    const body = await c.req.json<ChatRequest>();

    if (!body.messages || !Array.isArray(body.messages)) {
      return c.json(
        {
          error: 'Invalid request',
          message: 'messages array is required',
        },
        400
      );
    }

    if (body.messages.length === 0) {
      return c.json(
        {
          error: 'Invalid request',
          message: 'messages array cannot be empty',
        },
        400
      );
    }

    // Initialize database
    const db = createDb(c.env.DB);

    // Get AI tools with database access
    const tools = getTools(db);

    // Get AI model
    const model = getReasoningModel(c.env);

    // Stream chat response with tools
    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: body.messages,
      tools,
    });

    // Return streaming response
    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);

    return c.json(
      {
        error: 'Internal server error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to process chat request',
      },
      500
    );
  }
});

export default chatRoute;
