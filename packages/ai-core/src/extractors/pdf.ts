/**
 * PDF Data Extractor
 * Extracts structured data from PDF files (health, finance, etc.)
 * Primary: Vision AI (PDF → Images → AI)
 * Fallback: Text extraction with AI (PDF → Text → AI → Structured Data)
 */

import * as pdfjsLib from "pdfjs-dist";
import { generateText, Output } from "ai";
import { RecordDataSchema, type RecordData } from "@ai-chart/shared";
import { getReasoningModel } from "../registry";
import type { AIEnvironment, ModelProvider } from "../config";
import { arrayBufferToBase64 } from "../utils/base64";
import { extractDataFromImage } from "./image";
import { getDomainConfig, type DataDomain } from "../config/domains";

// Configure PDF.js worker for Cloudflare Workers environment
// This tells pdfjs-dist to work without external worker files
declare const globalThis: {
  window?: any;
  OffscreenCanvas?: any;
};

if (typeof globalThis.window === "undefined") {
  // Server-side / Workers environment
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";
}

/**
 * Convert PDF pages to image data URLs using vision AI
 * @param pdfBuffer - PDF file as ArrayBuffer
 * @returns Array of image data URLs (base64)
 */
export async function convertPDFToImages(
  pdfBuffer: ArrayBuffer
): Promise<string[]> {
  const images: string[] = [];

  try {
    // Check if OffscreenCanvas is available (Cloudflare Workers compatibility)
    const OffscreenCanvas = globalThis.OffscreenCanvas;
    if (!OffscreenCanvas) {
      throw new Error(
        "OffscreenCanvas not available in this environment. Use text extraction fallback."
      );
    }

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDoc = await loadingTask.promise;

    // Process each page
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);

      // Get viewport at 2x scale for better quality
      const viewport = page.getViewport({ scale: 2.0 });

      // Create canvas for rendering
      const canvas = new OffscreenCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Could not get canvas context");
      }

      // Render page to canvas
      const renderContext = {
        canvasContext: context,
        canvas: canvas, // pdfjs requires canvas property
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Convert canvas to blob then to base64
      const blob = await canvas.convertToBlob({ type: "image/png" });
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      const dataUrl = `data:image/png;base64,${base64}`;

      images.push(dataUrl);
    }

    return images;
  } catch (error) {
    throw new Error(
      `Failed to convert PDF to images: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Extract text content from PDF
 * Used for text-based AI extraction when vision fails
 * @param pdfBuffer - PDF file as ArrayBuffer
 * @returns Extracted text content
 */
export async function extractTextFromPDF(
  pdfBuffer: ArrayBuffer
): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdfDoc = await loadingTask.promise;

    let fullText = "";

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      const pageText = textContent.items.map((item: any) => item.str).join(" ");

      fullText += pageText + "\n\n";
    }

    return fullText.trim();
  } catch (error) {
    throw new Error(
      `Failed to extract text from PDF: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * PDF extraction strategy
 */
export type PDFExtractionStrategy = 'vision' | 'text';

/**
 * Extract data from PDF with configurable strategy (domain-agnostic)
 * @param env - Environment variables from Cloudflare Workers context
 * @param pdfBuffer - PDF file as ArrayBuffer
 * @param domain - Data domain ('health' | 'finance')
 * @param options - Extraction options
 * @returns Extracted and validated data
 */
export async function extractDataFromPDF(
  env: AIEnvironment,
  pdfBuffer: ArrayBuffer,
  domain: DataDomain = 'health',
  options?: {
    modelId?: string;
    provider?: ModelProvider;
    strategy?: PDFExtractionStrategy;
  }
): Promise<RecordData> {
  const { modelId, provider, strategy = 'vision' } = options || {};

  if (strategy === 'text') {
    // Primary: Text extraction with AI
    try {
      return await extractFromText(env, pdfBuffer, domain, modelId, provider);
    } catch (error) {
      // Text extraction failed, fallback to vision
      return await extractFromVision(env, pdfBuffer, domain, modelId, provider);
    }
  } else {
    // Primary: Vision AI (default)
    try {
      return await extractFromVision(env, pdfBuffer, domain, modelId, provider);
    } catch (error) {
      // Vision extraction failed, fallback to text
      return await extractFromText(env, pdfBuffer, domain, modelId, provider);
    }
  }
}

/**
 * Extract data from PDF using vision AI
 * Internal function used by main extraction
 */
async function extractFromVision(
  env: AIEnvironment,
  pdfBuffer: ArrayBuffer,
  domain: DataDomain = 'health',
  modelId?: string,
  provider?: ModelProvider
): Promise<RecordData> {
  const images = await convertPDFToImages(pdfBuffer);

  if (images.length === 0) {
    throw new Error("PDF has no pages");
  }

  // For single-page PDFs, process directly
  if (images.length === 1) {
    return await extractDataFromImage(env, images[0], domain, modelId, provider);
  }

  // For multi-page PDFs, process each page and merge results
  const results = await Promise.all(
    images.map((image) =>
      extractDataFromImage(env, image, domain, modelId, provider)
    )
  );

  // Merge results from all pages
  return mergeMultiPageResults(results);
}

/**
 * Extract data from PDF text using reasoning AI (fallback)
 */
async function extractFromText(
  env: AIEnvironment,
  pdfBuffer: ArrayBuffer,
  domain: DataDomain = 'health',
  modelId?: string,
  provider?: ModelProvider
): Promise<RecordData> {
  const text = await extractTextFromPDF(pdfBuffer);
  const model = getReasoningModel(env, modelId, provider);
  const domainConfig = getDomainConfig(domain);

  const result = await generateText({
    model,
    output: Output.object({ schema: RecordDataSchema }),
    messages: [
      {
        role: "system",
        content: domainConfig.textPrompt,
      },
      {
        role: "user",
        content: `Extract ${domain} data from this document text:\n\n${text}`,
      },
    ],
  });

  return result.output as RecordData;
}

/**
 * Merge results from multiple PDF pages
 * Combines items from all pages into a single record
 */
function mergeMultiPageResults(results: RecordData[]): RecordData {
  if (results.length === 0) {
    throw new Error("No results to merge");
  }

  if (results.length === 1) {
    return results[0];
  }

  // Use the first page for metadata
  const merged: RecordData = {
    type: results[0].type,
    category: results[0].category,
    date: results[0].date,
    summary: results[0].summary,
    items: [],
  };

  // Merge all items from all pages
  for (const result of results) {
    if (result.items && Array.isArray(result.items)) {
      merged.items.push(...result.items);
    }
  }

  // Remove duplicate items (same key)
  const uniqueItems = new Map();
  for (const item of merged.items) {
    if (!uniqueItems.has(item.key) || item.value !== undefined) {
      uniqueItems.set(item.key, item);
    }
  }
  merged.items = Array.from(uniqueItems.values());

  return merged;
}
