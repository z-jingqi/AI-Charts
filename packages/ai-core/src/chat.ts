/**
 * Chat Engine
 * Provides conversational AI capabilities with tool support
 */

import { streamText } from 'ai';
import { getReasoningModel } from './registry';
import type { AIEnvironment } from './config';

/**
 * Simple message type for chat
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * System prompt for chat interactions
 */
const CHAT_SYSTEM_PROMPT = `You are an AI assistant for AI-Chart, a personal data intelligence dashboard.

Your capabilities:
1. Help users understand their health data and trends
2. Answer questions about medical test results
3. Provide insights from historical data
4. Explain medical terminology in simple terms

IMPORTANT GUIDELINES:
- You are NOT a medical professional and cannot provide medical advice
- Always recommend consulting healthcare providers for medical decisions
- Be clear, concise, and empathetic in your responses
- Use data from the user's records when available
- Explain trends and patterns in an easy-to-understand way

When discussing health metrics:
- Explain what the test measures
- Provide context for reference ranges
- Highlight trends over time if data is available
- Suggest follow-up questions the user might want to ask their doctor`;

/**
 * Stream a chat response
 * @param env - Environment variables from Cloudflare Workers context
 * @param messages - Conversation history
 * @param modelId - Optional model ID to override default
 * @returns Stream of text chunks
 */
export function streamChatResponse(
  env: AIEnvironment,
  messages: ChatMessage[],
  modelId?: string,
): ReturnType<typeof streamText> {
  const model = getReasoningModel(env, modelId);

  return streamText({
    model,
    system: CHAT_SYSTEM_PROMPT,
    messages,
    // TODO: Register tools for database query here
    // tools: {
    //   getHealthRecords: {...},
    //   getMetricTrend: {...},
    //   searchRecords: {...}
    // },
  });
}

/**
 * Generate a complete chat response (non-streaming)
 * @param env - Environment variables from Cloudflare Workers context
 * @param messages - Conversation history
 * @param modelId - Optional model ID to override default
 * @returns Complete response text
 */
export async function generateChatResponse(
  env: AIEnvironment,
  messages: ChatMessage[],
  modelId?: string,
): Promise<string> {
  const result = await streamChatResponse(env, messages, modelId);

  // Collect all chunks
  let fullText = '';
  for await (const chunk of result.textStream) {
    fullText += chunk;
  }

  return fullText;
}

/**
 * Create a simple chat message
 * @param role - Message role (user, assistant, system)
 * @param content - Message content
 * @returns ChatMessage object
 */
export function createMessage(role: 'user' | 'assistant' | 'system', content: string): ChatMessage {
  return {
    role,
    content,
  };
}

/**
 * Format health data into a chat-friendly summary
 * @param data - Health record data
 * @returns Formatted summary text
 */
export function formatHealthDataForChat(data: {
  type: string;
  category: string;
  date: string;
  items: Array<{
    key: string;
    value: number;
    unit?: string;
    status: string;
    reference?: string;
  }>;
}): string {
  const lines: string[] = [];

  lines.push(`**${data.category}** (${data.date})`);
  lines.push('');

  for (const item of data.items) {
    const status = item.status !== 'normal' ? ` [${item.status.toUpperCase()}]` : '';
    const unit = item.unit ? ` ${item.unit}` : '';
    const reference = item.reference ? ` (Ref: ${item.reference})` : '';

    lines.push(`- **${item.key}**: ${item.value}${unit}${status}${reference}`);
  }

  return lines.join('\n');
}
