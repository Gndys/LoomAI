import { createDeepSeek } from '@ai-sdk/deepseek';
import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { ProviderName, ProviderConfig } from './types';

export function createProvider(providerName: ProviderName, config: ProviderConfig[ProviderName]) {
  switch (providerName) {
    case 'qwen': {
      return createOpenAICompatible({
        name: 'qwen',
        apiKey: config.apiKey,
        baseURL: config.baseURL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      });
    }
    case 'openai': {
      return createOpenAI(config);
    }
    case 'deepseek':
      return createDeepSeek(config);
    default:
      throw new Error(`Unsupported provider: ${providerName}`);
  }
}
