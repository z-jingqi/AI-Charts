/**
 * Model Registry
 * Provides flexible model selection for different AI tasks
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createWorkersAI, type WorkersAISettings, type WorkersAI } from 'workers-ai-provider';
import { getAIConfig, type AIEnvironment, type ModelProvider } from './config';
import type { LanguageModel } from 'ai';

/**
 * Provider-specific default model configurations
 */
const DEFAULT_MODELS: Record<
  ModelProvider,
  { vision: string; reasoning: string; advanced: string }
> = {
  google: {
    vision: 'gemini-2.5-flash',
    reasoning: 'gemini-2.5-flash',
    advanced: 'gemini-2.5-pro',
  },
  openai: {
    vision: 'gpt-4o',
    reasoning: 'gpt-4o',
    advanced: 'o1',
  },
  anthropic: {
    vision: 'claude-3-5-sonnet-20241022',
    reasoning: 'claude-3-5-sonnet-20241022',
    advanced: 'claude-3-5-sonnet-20241022',
  },
  deepseek: {
    vision: 'deepseek-chat',
    reasoning: 'deepseek-chat',
    advanced: 'deepseek-reasoner',
  },
  openrouter: {
    vision: 'google/gemma-3-27b-it:free',
    reasoning: 'google/gemma-3-27b-it:free',
    advanced: 'google/gemma-3-27b-it:free',
  },
  cloudflare: {
    vision: '@cf/meta/llama-3.2-11b-vision-instruct',
    reasoning: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    advanced: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  },
};

/**
 * Get the appropriate model instance for the provider
 */
function getModelInstance(
  provider: ModelProvider,
  modelId: string,
  env: AIEnvironment,
  options?: { binding?: unknown },
): LanguageModel {
  // Validate configuration
  const config = getAIConfig(env);

  switch (provider) {
    case 'google': {
      if (!config.google.apiKey) {
        throw new Error('Google API key not configured');
      }
      const google = createGoogleGenerativeAI({
        apiKey: config.google.apiKey,
      });
      return google(modelId);
    }

    case 'openai': {
      if (!config.openai.apiKey) {
        throw new Error('OpenAI API key not configured');
      }
      const openai = createOpenAI({
        apiKey: config.openai.apiKey,
      });
      return openai(modelId);
    }

    case 'anthropic': {
      if (!config.anthropic.apiKey) {
        throw new Error('Anthropic API key not configured');
      }
      const anthropic = createAnthropic({
        apiKey: config.anthropic.apiKey,
      });
      return anthropic(modelId);
    }

    case 'deepseek': {
      if (!config.deepseek.apiKey) {
        throw new Error('DeepSeek API key not configured');
      }
      // DeepSeek uses OpenAI-compatible API
      const deepseek = createOpenAI({
        apiKey: config.deepseek.apiKey,
        baseURL: config.deepseek.baseURL,
      });
      return deepseek(modelId);
    }

    case 'openrouter': {
      if (!config.openrouter.apiKey) {
        throw new Error('OpenRouter API key not configured');
      }
      const openrouter = createOpenRouter({
        apiKey: config.openrouter.apiKey,
      });
      return openrouter(modelId);
    }

    case 'cloudflare': {
      if (!options?.binding) {
        throw new Error('Cloudflare Workers AI binding is required. Pass the AI binding from env.');
      }
      // binding is a Cloudflare Workers runtime `Ai` type and modelId is a
      // `TextGenerationModels` union — neither is available in this package's
      // tsconfig, so we assert via the library's own exported types.
      const workersai = createWorkersAI({ binding: options.binding } as WorkersAISettings);
      return workersai(modelId as Parameters<WorkersAI>[0]);
    }

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Get vision model optimized for image analysis and OCR
 * @param env - Environment variables from Cloudflare Workers context
 * @param modelId - Optional model ID to override default
 * @param provider - Optional provider to override default (uses configured default provider)
 * @param options - Optional provider-specific options (e.g., Cloudflare AI binding)
 * @returns Vision-optimized language model
 */
export function getVisionModel(
  env: AIEnvironment,
  modelId?: string,
  provider?: ModelProvider,
  options?: { binding?: unknown },
): LanguageModel {
  const config = getAIConfig(env);
  const selectedProvider = provider || config.defaultProvider;
  const model = modelId || DEFAULT_MODELS[selectedProvider].vision;
  return getModelInstance(selectedProvider, model, env, options);
}

/**
 * Get reasoning model optimized for chat and complex queries
 * @param env - Environment variables from Cloudflare Workers context
 * @param modelId - Optional model ID to override default
 * @param provider - Optional provider to override default (uses configured default provider)
 * @param options - Optional provider-specific options (e.g., Cloudflare AI binding)
 * @returns Reasoning-optimized language model
 */
export function getReasoningModel(
  env: AIEnvironment,
  modelId?: string,
  provider?: ModelProvider,
  options?: { binding?: unknown },
): LanguageModel {
  const config = getAIConfig(env);
  const selectedProvider = provider || config.defaultProvider;
  const model = modelId || DEFAULT_MODELS[selectedProvider].reasoning;
  return getModelInstance(selectedProvider, model, env, options);
}

/**
 * Get advanced model for most complex tasks
 * @param env - Environment variables from Cloudflare Workers context
 * @param modelId - Optional model ID to override default
 * @param provider - Optional provider to override default (uses configured default provider)
 * @param options - Optional provider-specific options (e.g., Cloudflare AI binding)
 * @returns Advanced language model
 */
export function getAdvancedModel(
  env: AIEnvironment,
  modelId?: string,
  provider?: ModelProvider,
  options?: { binding?: unknown },
): LanguageModel {
  const config = getAIConfig(env);
  const selectedProvider = provider || config.defaultProvider;
  const model = modelId || DEFAULT_MODELS[selectedProvider].advanced;
  return getModelInstance(selectedProvider, model, env, options);
}

/**
 * Get a custom model by explicit provider and model ID
 * @param env - Environment variables from Cloudflare Workers context
 * @param provider - Model provider
 * @param modelId - Model identifier
 * @param options - Optional provider-specific options (e.g., Cloudflare AI binding)
 * @returns Language model instance
 */
export function getCustomModel(
  env: AIEnvironment,
  provider: ModelProvider,
  modelId: string,
  options?: { binding?: unknown },
): LanguageModel {
  return getModelInstance(provider, modelId, env, options);
}
