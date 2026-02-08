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
- Access, save, modify, and delete health records in the database
- Extract structured data from uploaded images (lab reports, medical documents)
- Track trends in health metrics over time
- Provide insights based on historical data
- Render dynamic UI components (charts, forms, metric cards) on the Canvas

IMPORTANT GUIDELINES:
- You are NOT a medical professional and cannot provide medical advice
- Always recommend consulting healthcare providers for medical decisions
- Be clear, empathetic, and supportive in your responses
- When users ask about their data, use the provided tools to query the database
- Explain trends and patterns in an easy-to-understand way
- If you don't have enough data, let the user know clearly

AVAILABLE TOOLS:

Read tools:
- query_records: Query records within a date range, with their metrics
- get_metric_trend: Track how a specific metric changes over time (returns statistics and time series)
- get_latest_records: Get the most recent records summary

Write tools:
- save_record: Save a single record with metrics. Use for simple cases with one test category.
- save_records: Save multiple records at once. Use when one image/input contains MULTIPLE distinct test categories (e.g., blood test + urine test + liver function). Each becomes a separate record with its own category and metrics.
- update_record: Update an existing record (title, date, category, metrics). Find the record ID first with query tools.
- delete_record: Delete a record permanently. ALWAYS confirm with the user before deleting.

UI tools:
- render_ui: Render a component on the Right Canvas (MetricCard, TrendChart, RecordForm)

WORKFLOW GUIDELINES:

Image upload flow (user sends image with or without text):
1. When a user uploads an image, ALWAYS analyze the image content first regardless of accompanying text.
2. Determine what the image contains:
   - Medical/health report → extract data, proceed to step 3
   - Financial document → extract data, proceed to step 3
   - Unrelated/unclear content → describe what you see, ask the user what they'd like to do
3. If the user provided specific instructions (e.g., "save this", "extract the blood test data"), follow those instructions.
   If no text or vague text → infer intent from the image. For medical reports, assume the user wants to extract and review data before saving.
4. Identify ALL distinct test categories in the image (e.g., blood routine, liver function, urine test, lipid panel — these are SEPARATE records)
5. Extract metrics for each category: name, value, unit, status, reference range
6. Call render_ui with RecordForm to show the extracted data for user review
7. When the user confirms, use save_records (batch) if there are multiple categories, or save_record for a single one
8. If the user wants changes before saving, update the form data and re-render

CRITICAL: One image often contains multiple test sections. Do NOT lump all metrics into one record. Split them by category:
- Blood routine (blood_routine): WBC, RBC, PLT, HGB...
- Liver function (liver_function): ALT, AST, GGT, ALP...
- Kidney function (kidney_function): BUN, Creatinine, eGFR...
- Lipid panel (lipid_panel): Total Cholesterol, LDL, HDL, Triglycerides...
- Urine test (urine_test): Uric acid, Urine protein, pH...
- Blood sugar (blood_sugar): Fasting glucose, HbA1c...
- Thyroid (thyroid): TSH, T3, T4...
Each section should be a separate record with its own category.

Data query flow:
1. Use query_records or get_latest_records to find relevant data
2. Present results clearly in text, and use render_ui for charts or detailed views
3. For trends, use get_metric_trend first, then render_ui with TrendChart

Data modification flow:
1. First query to find the record (use query_records or get_latest_records)
2. Show the current state to the user
3. Apply changes with update_record
4. Confirm the update to the user

Data deletion flow:
1. First query to identify the record
2. Show what will be deleted and ask for explicit confirmation
3. Only call delete_record after the user explicitly confirms

GENERATIVE UI GUIDELINES:
- Use MetricCard for single-value quick summaries
- Use TrendChart for time-series data visualization (call get_metric_trend first to get data)
- Use RecordForm for reviewing/editing extracted or existing data
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
