/**
 * @ai-chart/ai-core
 * AI functionality using Vercel AI SDK with multi-provider support
 */

export const aiCoreVersion = "0.0.1";

// Configuration
export { getAIConfig, isProviderConfigured } from './config';
export type { AIConfig, AIEnvironment, ModelProvider } from './config';

// Domain Configuration
export { getDomainConfig, DOMAIN_CONFIGS } from './config/domains';
export type { DataDomain, DomainConfig } from './config/domains';

// Model Registry
export {
  getVisionModel,
  getReasoningModel,
  getAdvancedModel,
  getCustomModel,
} from './registry';

// Image Data Extraction (domain-agnostic)
export {
  extractDataFromImage,
  extractDataFromImageWithRetry,
  // Backward compatible exports
  extractHealthDataFromImage,
  extractHealthDataFromImageWithRetry,
} from './extractors/image';

// PDF Data Extraction (domain-agnostic)
export {
  extractDataFromPDF,
  extractDataFromPDFWithRetry,
  // Backward compatible exports
  extractHealthDataFromPDF,
  extractHealthDataFromPDFWithRetry,
  // Utilities
  convertPDFToImages,
  extractTextFromPDF,
} from './extractors/pdf';
export type { PDFExtractionStrategy } from './extractors/pdf';

// Chat Engine
export {
  streamChatResponse,
  generateChatResponse,
  createMessage,
  formatHealthDataForChat,
} from './chat';
export type { ChatMessage } from './chat';

// Utilities (Cloudflare Workers compatible)
export {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  arrayBufferToDataUrl,
} from './utils/base64';
