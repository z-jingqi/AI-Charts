/**
 * AI Configuration
 * Manages API keys and provider settings
 */

/**
 * Supported AI providers
 */
export type ModelProvider =
  | 'google'
  | 'openai'
  | 'anthropic'
  | 'deepseek'
  | 'openrouter'
  | 'cloudflare';

/**
 * AI Provider Configuration
 */
export interface AIConfig {
  defaultProvider: ModelProvider;
  google: {
    apiKey: string;
  };
  openai: {
    apiKey: string;
  };
  anthropic: {
    apiKey: string;
  };
  deepseek: {
    apiKey: string;
    baseURL: string;
  };
  openrouter: {
    apiKey: string;
  };
  cloudflare: {
    accountId: string;
    apiKey: string;
  };
}

/**
 * Environment variables interface for Cloudflare Workers
 */
export interface AIEnvironment {
  DEFAULT_PROVIDER?: string;
  GOOGLE_GENERATIVE_AI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_KEY?: string;
}

/**
 * Get AI configuration from environment variables
 * @param env - Environment variables from Cloudflare Workers context
 * @throws Error if required API keys are missing
 */
export function getAIConfig(env: AIEnvironment): AIConfig {
  // Determine default provider (fallback order: env var -> first configured provider -> google)
  let defaultProvider: ModelProvider = 'openrouter';

  if (env.DEFAULT_PROVIDER && isValidProvider(env.DEFAULT_PROVIDER)) {
    defaultProvider = env.DEFAULT_PROVIDER as ModelProvider;
  } else {
    // Auto-detect first configured provider
    if (env.GOOGLE_GENERATIVE_AI_API_KEY) {
      defaultProvider = 'google';
    } else if (env.OPENAI_API_KEY) {
      defaultProvider = 'openai';
    } else if (env.ANTHROPIC_API_KEY) {
      defaultProvider = 'anthropic';
    } else if (env.DEEPSEEK_API_KEY) {
      defaultProvider = 'deepseek';
    } else if (env.OPENROUTER_API_KEY) {
      defaultProvider = 'openrouter';
    } else if (env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_API_KEY) {
      defaultProvider = 'cloudflare';
    }
  }

  return {
    defaultProvider,
    google: {
      apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY || '',
    },
    openai: {
      apiKey: env.OPENAI_API_KEY || '',
    },
    anthropic: {
      apiKey: env.ANTHROPIC_API_KEY || '',
    },
    deepseek: {
      apiKey: env.DEEPSEEK_API_KEY || '',
      baseURL: 'https://api.deepseek.com',
    },
    openrouter: {
      apiKey: env.OPENROUTER_API_KEY || '',
    },
    cloudflare: {
      accountId: env.CLOUDFLARE_ACCOUNT_ID || '',
      apiKey: env.CLOUDFLARE_API_KEY || '',
    },
  };
}

/**
 * Check if a string is a valid provider
 */
function isValidProvider(provider: string): boolean {
  return ['google', 'openai', 'anthropic', 'deepseek', 'openrouter', 'cloudflare'].includes(
    provider,
  );
}

/**
 * Check if a specific provider is configured
 * @param provider - Provider name to check
 * @param env - Environment variables from Cloudflare Workers context
 */
export function isProviderConfigured(provider: ModelProvider, env: AIEnvironment): boolean {
  try {
    const config = getAIConfig(env);
    if (provider === 'cloudflare') {
      return !!config.cloudflare.accountId && !!config.cloudflare.apiKey;
    }
    return !!config[provider]?.apiKey;
  } catch {
    return false;
  }
}
