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
