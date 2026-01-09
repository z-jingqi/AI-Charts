/**
 * Image Data Extractor
 * Extracts structured data from images using AI (health, finance, etc.)
 */

import { generateText, Output } from "ai";
import { RecordDataSchema, type RecordData } from "@ai-chart/shared";
import { getVisionModel } from "../registry";
import type { AIEnvironment, ModelProvider } from "../config";
import { arrayBufferToBase64 } from "../utils/base64";
import { getDomainConfig, type DataDomain } from "../config/domains";

/**
 * Extract data from an image (domain-agnostic)
 * @param env - Environment variables from Cloudflare Workers context
 * @param imageBuffer - Image data as ArrayBuffer or base64 string
 * @param domain - Data domain ('health' | 'finance')
 * @param modelId - Optional model ID to override default
 * @param provider - Optional provider to override default
 * @returns Extracted and validated data
 */
export async function extractDataFromImage(
  env: AIEnvironment,
  imageBuffer: ArrayBuffer | string,
  domain: DataDomain = 'health',
  modelId?: string,
  provider?: ModelProvider
): Promise<RecordData> {
  const model = getVisionModel(env, modelId, provider);
  const domainConfig = getDomainConfig(domain);

  // Convert ArrayBuffer to base64 URL if needed
  let imageUrl: string;
  if (typeof imageBuffer === "string") {
    // Assume it's already a base64 string or URL
    imageUrl = imageBuffer.startsWith("data:")
      ? imageBuffer
      : `data:image/jpeg;base64,${imageBuffer}`;
  } else {
    // Use Web API compatible base64 encoding (works in Cloudflare Workers)
    const base64 = arrayBufferToBase64(imageBuffer);
    imageUrl = `data:image/jpeg;base64,${base64}`;
  }

  // Generate structured object using AI with domain-specific prompt
  const result = await generateText({
    model,
    output: Output.object({ schema: RecordDataSchema }),
    messages: [
      {
        role: "system",
        content: domainConfig.imagePrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Please extract all ${domain} metrics from this document image. Follow the guidelines strictly.`,
          },
          {
            type: "image",
            image: imageUrl,
          },
        ],
      },
    ],
  });

  return result.output as RecordData;
}

/**
 * Extract health data from a medical report image
 * @deprecated Use extractDataFromImage(env, imageBuffer, 'health') instead
 * @param env - Environment variables from Cloudflare Workers context
 * @param imageBuffer - Image data as ArrayBuffer or base64 string
 * @param modelId - Optional model ID to override default
 * @param provider - Optional provider to override default
 * @returns Extracted and validated health data
 */
export async function extractHealthDataFromImage(
  env: AIEnvironment,
  imageBuffer: ArrayBuffer | string,
  modelId?: string,
  provider?: ModelProvider
): Promise<RecordData> {
  return extractDataFromImage(env, imageBuffer, 'health', modelId, provider);
}

/**
 * Extract data from image with retry logic (domain-agnostic)
 * @param env - Environment variables from Cloudflare Workers context
 * @param imageBuffer - Image data as ArrayBuffer or base64 string
 * @param domain - Data domain ('health' | 'finance')
 * @param maxRetries - Maximum number of retry attempts
 * @param modelId - Optional model ID to override default
 * @param provider - Optional provider to override default
 * @returns Extracted and validated data
 */
export async function extractDataFromImageWithRetry(
  env: AIEnvironment,
  imageBuffer: ArrayBuffer | string,
  domain: DataDomain = 'health',
  maxRetries = 3,
  modelId?: string,
  provider?: ModelProvider
): Promise<RecordData> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await extractDataFromImage(
        env,
        imageBuffer,
        domain,
        modelId,
        provider
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(
    `Failed to extract ${domain} data from image after ${maxRetries} attempts: ${lastError?.message}`
  );
}

/**
 * Extract health data from image with retry logic
 * @deprecated Use extractDataFromImageWithRetry(env, imageBuffer, 'health') instead
 * @param env - Environment variables from Cloudflare Workers context
 * @param imageBuffer - Image data as ArrayBuffer or base64 string
 * @param maxRetries - Maximum number of retry attempts
 * @param modelId - Optional model ID to override default
 * @param provider - Optional provider to override default
 * @returns Extracted and validated health data
 */
export async function extractHealthDataFromImageWithRetry(
  env: AIEnvironment,
  imageBuffer: ArrayBuffer | string,
  maxRetries = 3,
  modelId?: string,
  provider?: ModelProvider
): Promise<RecordData> {
  return extractDataFromImageWithRetry(env, imageBuffer, 'health', maxRetries, modelId, provider);
}
