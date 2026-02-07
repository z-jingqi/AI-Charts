/**
 * Chat API Route
 * Handles AI chat with tool calling for database queries
 */

import { Hono } from 'hono';
import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from 'ai';
import { getReasoningModel } from '@ai-chart/ai-core';
import { createDb } from '@ai-chart/database';
import { getTools } from '../ai/tools';

/**
 * Environment bindings
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AI?: any; // Cloudflare Workers AI binding — no SDK type available
}

/**
 * Request body structure
 * Uses UIMessage from AI SDK — same type the client's DefaultChatTransport sends
 */
interface ChatRequest {
  messages: UIMessage[];
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
- render_ui: EXPLICITLY call this to show charts, forms, or data on the Right Canvas.

GENERATIVE UI GUIDELINES:
- When a user uploads an image (passed as context), analyze its content.
- If it's a health record (blood test, report, etc.), call render_ui with component: "RecordForm" and the extracted metrics so the user can review and save.
- When a user asks for a chart or trend, first use get_metric_trend to get data, THEN call render_ui with component: "TrendChart" and the formatted data.
- Use MetricCard for quick single-value summaries.
- The Right Canvas is your primary way to present complex information. Use it!`;

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
        400,
      );
    }

    if (body.messages.length === 0) {
      return c.json(
        {
          error: 'Invalid request',
          message: 'messages array cannot be empty',
        },
        400,
      );
    }

    // Initialize database
    const db = createDb(c.env.DB);

    // Get AI tools with database access
    const tools = getTools(db);

    // Get AI model
    const model = getReasoningModel(c.env);

    // Convert UIMessage[] → ModelMessage[] using SDK utility
    const modelMessages = await convertToModelMessages(body.messages, { tools });

    // Stream chat response with tools
    const result = streamText({
      model,
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(5),
    });

    // Return UI message stream (compatible with DefaultChatTransport on the client)
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat error:', error);

    return c.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to process chat request',
      },
      500,
    );
  }
});

export default chatRoute;
