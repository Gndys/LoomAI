// Function to get environment variables
function getEnv(key: string): string | undefined {
  return process.env[key];
}

// Warning function
function warnMissingEnv(key: string, service: string): void {
  console.warn(`Warning: Missing environment variable ${key} for ${service} service. This service will not be available.`);
}

// Function to get environment variables for optional services
function getEnvForService(key: string, service: string): string | undefined {
  const value = getEnv(key);
  if (!value) {
    warnMissingEnv(key, service);
  }
  return value;
}

// Function to get environment variables for required services with development defaults
function requireEnvForService(key: string, service: string, devDefault?: string): string {
  const value = getEnv(key);
  if (!value) {
    // In development, use default values if provided
    if (process.env.NODE_ENV === 'development' && devDefault) {
      console.warn(`Warning: Using default value for ${key} in development. Set ${key} in .env file for production.`);
      return devDefault;
    }
    // During build time, return a placeholder to avoid build failures
    if (process.env.BUILD_TIME === 'true') {
      console.warn(`Warning: Missing ${key} for ${service} service during build. This will be validated at runtime.`);
      return `__BUILD_TIME_PLACEHOLDER_${key}__`;
    }
    throw new Error(`Missing required environment variable: ${key} for ${service} service. This service is required for the application to function.`);
  }
  return value;
}


// 计划类型定义

type PlanUnit = {
  type: 'image';
  quantity: number;
};

type BasePlan = {
  id: string;
  provider: string;
  amount: number;
  currency: string;
  recommended?: boolean;
  category?: 'subscription' | 'image-pack';
  unit?: PlanUnit;
  i18n: {
    [locale: string]: {
      name: string;
      description: string;
      duration: string;
      features: string[];
    }
  };
};

export type RecurringPlan = BasePlan & {
  duration: { type: 'recurring'; months: number };
  stripePriceId?: string | undefined;
  stripeProductId?: string | undefined;
  creemProductId?: string | undefined;
};

export type OneTimePlan = BasePlan & {
  duration: { type: 'one_time'; months: number };
  stripePriceId?: string | undefined;
  stripeProductId?: string | undefined;
  creemProductId?: string | undefined;
};

export type Plan = RecurringPlan | OneTimePlan;

/**
 * Application Configuration
 */
export const config = {
  /**
   * Application Configuration
   */
  app: {
    /**
     * Application Name
     * This will be used throughout the application for branding
     */
    name: 'LoomAI',

    /**
     * Base URL Configuration
     * This will be used for all callback URLs and webhooks
     */
    get baseUrl() {
      return requireEnvForService('APP_BASE_URL', 'Application', 'http://localhost:7001');
    },

    /**
     * Theme Configuration
     * Default theme and color scheme for the application
     */
    theme: {
      /**
       * Default theme mode
       * @type {'light' | 'dark'}
       */
      defaultTheme: 'light' as const,

      /**
       * Default color scheme
       * @type {'default' | 'claude' | 'cosmic-night' | 'modern-minimal' | 'ocean-breeze'}
       */
      defaultColorScheme: 'claude' as const,

      /**
       * Storage key for theme persistence
       */
      storageKey: 'tinyship-ui-theme'
    },

    /**
     * Internationalization Configuration
     * Default language and locale settings
     */
    i18n: {
      /**
       * Default locale
       * @type {'en' | 'zh-CN'}
       */
      defaultLocale: 'zh-CN' as const,
      /**
       * Available locales
       */
      locales: ['en', 'zh-CN'] as const,
      /**
       * Cookie key for locale persistence
       * Used by both Next.js middleware and Nuxt.js i18n module
       */
      cookieKey: 'NEXT_LOCALE',

      /**
       * Auto-detect browser language
       * When true, detects user's browser language preference
       * When false, always uses defaultLocale for new users
       * Cookie preferences always take priority when set
       */
      autoDetect: false
    },

    /**
     * Payment Related URLs
     */
    payment: {
      /**
       * Payment Success/Cancel URLs
       * These URLs will be used by payment providers for redirects
       * The locale middleware will automatically add locale prefix
       */
      get successUrl() {
        return `${config.app.baseUrl}/payment-success`;
      },
      get cancelUrl() {
        return `${config.app.baseUrl}/payment-cancel`;
      },
    }
  },
  /**
   * Authentication Service Configuration
   */
  auth: {
    requireEmailVerification: false,

    /**
     * Social Login Providers Configuration
     */
    socialProviders: {
      /**
       * Google OAuth Configuration
       */
      google: {
        get clientId() {
          return getEnvForService('GOOGLE_CLIENT_ID', 'Google Auth');
        },
        get clientSecret() {
          return getEnvForService('GOOGLE_CLIENT_SECRET', 'Google Auth');
        }
      },

      /**
       * GitHub OAuth Configuration
       */
      github: {
        get clientId() {
          return getEnvForService('GITHUB_CLIENT_ID', 'GitHub Auth');
        },
        get clientSecret() {
          return getEnvForService('GITHUB_CLIENT_SECRET', 'GitHub Auth');
        }
      },

      /**
       * WeChat OAuth Configuration
       */
      wechat: {
        get appId() {
          return getEnvForService('NEXT_PUBLIC_WECHAT_APP_ID', 'WeChat Auth');
        },
        get appSecret() {
          return getEnvForService('WECHAT_APP_SECRET', 'WeChat Auth');
        }
      }
    }
  },
  /**
   * Payment Configuration
   */
  payment: {
    /**
     * Available Payment Providers
     */
    providers: {
      /**
       * WeChat Pay Configuration
       */
      wechat: {
        get appId() {
          return requireEnvForService('WECHAT_PAY_APP_ID', 'WeChat Pay');
        },
        get mchId() {
          return requireEnvForService('WECHAT_PAY_MCH_ID', 'WeChat Pay');
        },
        get apiKey() {
          return requireEnvForService('WECHAT_PAY_API_KEY', 'WeChat Pay');
        },
        get notifyUrl() {
          // 需要设置成为公网地址，使用内网穿透工具
          return requireEnvForService('WECHAT_PAY_NOTIFY_URL', 'WeChat Pay');
        },
        /**
         * WeChat Pay Certificates (PEM format with \n escape sequences)
         * These replace the need for certificate files
         */
        get privateKey() {
          const pemKey = requireEnvForService('WECHAT_PAY_PRIVATE_KEY', 'WeChat Pay');
          return Buffer.from(pemKey, 'utf8');
        },
        get publicKey() {
          const pemKey = requireEnvForService('WECHAT_PAY_PUBLIC_KEY', 'WeChat Pay');
          return Buffer.from(pemKey, 'utf8');
        },
        /**
         * WeChat Pay Payment Public Key (for signature verification)
         * This is the official WeChat Pay public key for verifying signatures
         */
        get paymentPublicKey() {
          const pemKey = getEnvForService('WECHAT_PAY_PAYMENT_PUBLIC_KEY', 'WeChat Pay Payment Public Key');
          return pemKey ? Buffer.from(pemKey, 'utf8') : undefined;
        },
        /**
         * WeChat Pay Public Key ID
         * This is used to identify which WeChat Pay public key to use for verification
         */
        get publicKeyId() {
          return getEnvForService('WECHAT_PAY_PUBLIC_KEY_ID', 'WeChat Pay Public Key ID');
        }
      },

      /**
       * Stripe Configuration
       */
      stripe: {
        get secretKey() {
          return requireEnvForService('STRIPE_SECRET_KEY', 'Stripe');
        },
        get publicKey() {
          return requireEnvForService('STRIPE_PUBLIC_KEY', 'Stripe');
        },
        get webhookSecret() {
          return requireEnvForService('STRIPE_WEBHOOK_SECRET', 'Stripe');
        }
      },

      /**
       * Creem Configuration
       */
      creem: {
        get apiKey() {
          return requireEnvForService('CREEM_API_KEY', 'Creem');
        },
        get serverUrl() {
          return getEnvForService('CREEM_SERVER_URL', 'Creem') || 'https://test-api.creem.io';
        },
        get webhookSecret() {
          return requireEnvForService('CREEM_WEBHOOK_SECRET', 'Creem');
        }
      }
    },

    /**
     * Subscription Plans
     */
    plans: {
      imageSingle: {
        provider: 'wechat',
        id: 'image-single',
        amount: 2,
        currency: 'CNY',
        category: 'image-pack',
        unit: { type: 'image', quantity: 1 },
        duration: {
          months: 1,
          type: 'one_time'
        },
        i18n: {
          'en': {
            name: 'Single image',
            description: 'Pay-per-image for on-demand renders',
            duration: '1 image',
            features: [
              '1 image credit',
              'Unit price ¥2/image',
              'No expiration'
            ]
          },
          'zh-CN': {
            name: '单张图片',
            description: '按张付费，随时下单',
            duration: '1 张',
            features: [
              '1 张图片额度',
              '单价 2 元/张',
              '不限有效期'
            ]
          }
        }
      },
      imageBundle20: {
        provider: 'wechat',
        id: 'image-bundle-20',
        amount: 36,
        currency: 'CNY',
        category: 'image-pack',
        unit: { type: 'image', quantity: 20 },
        duration: {
          months: 1,
          type: 'one_time'
        },
        i18n: {
          'en': {
            name: '20-image bundle',
            description: 'Better rate for small batches',
            duration: '20 images',
            features: [
              '20 image credits',
              '¥1.80/image (10% off)',
              'Great for lookbook tests'
            ]
          },
          'zh-CN': {
            name: '20 张图片包',
            description: '小批量更划算',
            duration: '20 张',
            features: [
              '20 张图片额度',
              '折算 1.8 元/张（9 折）',
              '适合小批量测试'
            ]
          }
        }
      },
      imageBundle100: {
        provider: 'wechat',
        id: 'image-bundle-100',
        amount: 160,
        currency: 'CNY',
        category: 'image-pack',
        unit: { type: 'image', quantity: 100 },
        recommended: true,
        duration: {
          months: 1,
          type: 'one_time'
        },
        i18n: {
          'en': {
            name: '100-image bundle',
            description: 'Lowest per-image cost for teams',
            duration: '100 images',
            features: [
              '100 image credits',
              '¥1.60/image (20% off)',
              'Best for production batches'
            ]
          },
          'zh-CN': {
            name: '100 张图片包',
            description: '团队批量最低单价',
            duration: '100 张',
            features: [
              '100 张图片额度',
              '折算 1.6 元/张（8 折）',
              '适合批量生产'
            ]
          }
        }
      },
      monthlyWechat: {
        provider: 'wechat',
        id: 'monthlyWechat',
        amount: 0.01,
        currency: 'CNY',
        duration: {
          months: 1,
          type: 'one_time'
        },
        i18n: {
          'en': {
            name: 'Wechat Monthly Plan',
            description: 'Monthly one time pay via WeChat Pay',
            duration: 'month',
            features: [
              'All premium features',
              'Priority support'
            ]
          },
          'zh-CN': {
            name: '微信支付月度',
            description: '通过微信支付的月度一次性支付',
            duration: '月',
            features: [
              '所有高级功能',
              '优先支持'
            ]
          }
        }
      },
      monthly: {
        provider: 'stripe',
        id: 'monthly',
        amount: 10,
        currency: 'USD',
        duration: {
          months: 1,
          type: 'recurring'
        },
        // 当使用 Stripe 支付时，订阅的时长和价格将由 stripePriceId 决定
        // 这里的 duration 和 amount 仅用于显示和计算，实际订阅周期和价格以 Stripe 后台配置为准
        stripePriceId: 'price_1RL2GgDjHLfDWeHDBHjoZaap',
        i18n: {
          'en': {
            name: 'Stripe Monthly Plan',
            description: 'Monthly recurring subscription via Stripe',
            duration: 'month',
            features: [
              'All premium features',
              'Priority support'
            ]
          },
          'zh-CN': {
            name: 'Stripe 月度订阅',
            description: '通过 Stripe 的月度循环订阅',
            duration: '月',
            features: [
              '所有高级功能',
              '优先支持'
            ]
          }
        }
      },
      'monthly-pro': {
        provider: 'stripe',
        id: 'monthly-pro',
        amount: 20,
        currency: 'USD',
        duration: {
          months: 1,
          type: 'recurring'
        },
        stripePriceId: 'price_1RMmc4DjHLfDWeHDp9Xhpn5X',
        i18n: {
          'en': {
            name: 'Stripe Monthly Pro Plan',
            description: 'Premium monthly subscription with higher pricing',
            duration: 'month',
            features: [
              'All premium features',
              'Priority support',
              'Free lifetime updates'
            ]
          },
          'zh-CN': {
            name: 'Stripe 月度专业版',
            description: '高价位的月度专业订阅',
            duration: '月',
            features: [
              '所有高级功能',
              '优先支持',
              '终身免费更新'
            ]
          }
        }
      },
      lifetime: {
        provider: 'stripe',
        id: 'lifetime',
        amount: 999,
        currency: 'USD',
        recommended: false,
        category: 'subscription',
        duration: {
          months: 999999,
          type: 'one_time'
        },
        stripePriceId: 'price_1RL2IcDjHLfDWeHDMCmobkzb',
        i18n: {
          'en': {
            name: 'Stripe Lifetime',
            description: 'One-time payment for permanent access',
            duration: 'lifetime',
            features: [
              'All premium features',
              'Priority support',
              'Free lifetime updates'
            ]
          },
          'zh-CN': {
            name: 'Stripe 终身会员',
            description: '一次性付费永久访问',
            duration: '终身',
            features: [
              '所有高级功能',
              '优先支持',
              '终身免费更新'
            ]
          }
        }
      },
      monthlyCreem: {
        provider: 'creem',
        id: 'monthlyCreem',
        amount: 10,
        currency: 'USD',
        duration: {
          months: 1,
          type: 'recurring'
        },
        creemProductId: 'prod_1M1c4ktVmvLgrNtpVB9oQf', // Will be set after creating product in Creem
        i18n: {
          'en': {
            name: 'Creem Monthly Plan',
            description: 'Monthly recurring subscription via Creem',
            duration: 'month',
            features: [
              'All premium features',
              'Priority support'
            ]
          },
          'zh-CN': {
            name: 'Creem 月度订阅',
            description: '通过Creem的月度循环订阅',
            duration: '月',
            features: [
              '所有高级功能',
              '优先支持'
            ]
          }
        }
      },
      monthlyCreemOneTime: {
        provider: 'creem',
        id: 'monthlyCreemOneTime',
        amount: 10,
        currency: 'USD',
        duration: {
          months: 1,
          type: 'one_time'
        },
        creemProductId: 'prod_5BeCtf2LS6KcOvtLuPIpHz', // Will be set after creating product in Creem
        i18n: {
          'en': {
            name: 'Creem Monthly Plan (One Time)',
            description: 'One-time payment for monthly access via Creem',
            duration: 'month',
            features: [
              'All premium features',
              'Priority support'
            ]
          },
          'zh-CN': {
            name: 'Creem 月度订阅 (一次性)',
            description: '通过Creem的一次性月度付费',
            duration: '月',
            features: [
              '所有高级功能',
              '优先支持'
            ]
          }
        }
      }
    } as const,
  },



  /**
   * SMS Service Configuration
   */
  sms: {
    /**
     * Default SMS Provider
     */
    defaultProvider: 'aliyun',

    /**
     * Aliyun SMS Configuration
     */
    aliyun: {
      // Optional service, using warning instead of error
      get accessKeyId() {
        return getEnvForService('ALIYUN_ACCESS_KEY_ID', 'Aliyun SMS');
      },
      get accessKeySecret() {
        return getEnvForService('ALIYUN_ACCESS_KEY_SECRET', 'Aliyun SMS');
      },
      get endpoint() {
        return getEnvForService('ALIYUN_SMS_ENDPOINT', 'Aliyun SMS') || 'dysmsapi.aliyuncs.com';
      },
      get signName() {
        return getEnvForService('ALIYUN_SMS_SIGN_NAME', 'Aliyun SMS');
      },
      get templateCode() {
        return getEnvForService('ALIYUN_SMS_TEMPLATE_CODE', 'Aliyun SMS');
      },
    },

    /**
     * Twilio SMS Configuration
     */
    twilio: {
      // Optional service, using warning instead of error
      get accountSid() {
        return getEnvForService('TWILIO_ACCOUNT_SID', 'Twilio SMS');
      },
      get authToken() {
        return getEnvForService('TWILIO_AUTH_TOKEN', 'Twilio SMS');
      },
      get defaultFrom() {
        return getEnvForService('TWILIO_DEFAULT_FROM', 'Twilio SMS');
      },
    }
  },

  /**
   * Email Service Configuration
   */
  email: {
    /**
     * Default Email Provider
     */
    defaultProvider: 'resend',

    /**
     * Default Sender Email
     */
    get defaultFrom() {
      return getEnvForService('EMAIL_DEFAULT_FROM', 'Email Service');
    },

    /**
     * Resend Configuration
     */
    resend: {
      // Optional service, using warning instead of error
      get apiKey() {
        return getEnvForService('RESEND_API_KEY', 'Resend Email');
      }
    },
  },

  /**
   * Captcha Service Configuration
   */
  captcha: {
    /**
     * Enable/Disable Captcha Verification
     */
    enabled: false,

    /**
     * Default Captcha Provider
     */
    defaultProvider: 'cloudflare-turnstile',

    /**
     * Cloudflare Turnstile Configuration
     */
    cloudflare: {
      // 服务端使用的 secret key（用于 better-auth）
      get secretKey() {
        // 开发环境fallback到测试key
        if (process.env.NODE_ENV === 'development') {
          return '1x0000000000000000000000000000000AA'; // 测试用的 siteKey
        }
        return getEnvForService('TURNSTILE_SECRET_KEY', 'Cloudflare Turnstile');
      },
      // 客户端使用的 site key（使用 NEXT_PUBLIC_ 前缀）
      get siteKey() {
        // 开发环境fallback到测试key
        if (process.env.NODE_ENV === 'development') {
          return '1x00000000000000000000AA'; // 测试用的 siteKey
        }
        // 直接访问 process.env，不通过 getEnv 函数（因为客户端环境下 dotenv 不工作）
        const publicKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
        if (publicKey) return publicKey;

        // 生产环境必须配置
        return getEnvForService('TURNSTILE_SITE_KEY', 'Cloudflare Turnstile');
      }
    }
  },

  /**
   * Database Configuration
   */
  database: {
    // Required core service, using error instead of warning
    get url() {
      return requireEnvForService('DATABASE_URL', 'Database', 'postgresql://username:password@localhost:5432/database_name');
    }
  },

  /**
   * AI Chat Configuration
   */
  ai: {
    /**
     * Default AI Provider
     * @type {'qwen' | 'deepseek' | 'openai'}
     */
    defaultProvider: 'qwen' as const,

    /**
     * Default Model for each provider
     */
    defaultModels: {
      qwen: 'qwen-turbo',
      deepseek: 'deepseek-chat',
      openai: 'gpt-5'
    },

    /**
     * Available Models for each provider
     * These will be displayed in the model selector dropdown
     */
    availableModels: {
      qwen: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
      deepseek: ['deepseek-chat', 'deepseek-coder'],
      openai: ['gpt-5', 'gpt-5-codex', 'gpt-5-pro']
    },

    /**
     * Provider API Keys Configuration
     * Note: These are configured via environment variables in libs/ai/config.ts
     * - QWEN_API_KEY and QWEN_BASE_URL
     * - DEEPSEEK_API_KEY
     * - OPENAI_API_KEY and OPENAI_BASE_URL
     */
  },
} as const;
