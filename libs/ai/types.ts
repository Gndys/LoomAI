import type { DeepSeekProviderSettings } from '@ai-sdk/deepseek';
import type { OpenAIProviderSettings } from '@ai-sdk/openai';
import type { UIMessage } from 'ai';

export type ProviderName = 'qwen' | 'openai' | 'deepseek';

export type QwenConfig = {
  apiKey: string;
  baseURL?: string;
};
export type OpenAIConfig = OpenAIProviderSettings;
export type DeepSeekConfig = DeepSeekProviderSettings;

export type ProviderConfig = {
  qwen: QwenConfig;
  openai: OpenAIConfig;
  deepseek: DeepSeekConfig;
};

export interface AIConfig {
  provider: ProviderName;
  config: ProviderConfig[ProviderName];
}

export interface ChatRequestOptions {
  messages: UIMessage[];
  extra?: {
    provider?: ProviderName;
    model?: string;
  };
}
