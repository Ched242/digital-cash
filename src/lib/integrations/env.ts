const serverOnly = (name: string) => {
  if (typeof window !== 'undefined') {
    throw new Error('Integration credentials may only be read on the server.');
  }
  return process.env[name]?.trim() || undefined;
};

export const integrationEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: serverOnly('SUPABASE_SERVICE_ROLE_KEY'),
  payments: {
    provider: serverOnly('PAYMENT_PROVIDER'),
    baseUrl: serverOnly('PAYMENT_API_BASE_URL'),
    apiKey: serverOnly('PAYMENT_API_KEY'),
    apiSecret: serverOnly('PAYMENT_API_SECRET'),
    webhookSecret: serverOnly('PAYMENT_WEBHOOK_SECRET'),
  },
  mtn: {
    baseUrl: serverOnly('MTN_MOMO_BASE_URL'),
    subscriptionKey: serverOnly('MTN_MOMO_SUBSCRIPTION_KEY'),
    apiUser: serverOnly('MTN_MOMO_API_USER'),
    apiKey: serverOnly('MTN_MOMO_API_KEY'),
    callbackUrl: serverOnly('MTN_MOMO_CALLBACK_URL'),
  },
  airtel: {
    baseUrl: serverOnly('AIRTEL_MONEY_BASE_URL'),
    clientId: serverOnly('AIRTEL_MONEY_CLIENT_ID'),
    clientSecret: serverOnly('AIRTEL_MONEY_CLIENT_SECRET'),
    pin: serverOnly('AIRTEL_MONEY_PIN'),
  },
  orange: {
    baseUrl: serverOnly('ORANGE_MONEY_BASE_URL'),
    clientId: serverOnly('ORANGE_MONEY_CLIENT_ID'),
    clientSecret: serverOnly('ORANGE_MONEY_CLIENT_SECRET'),
  },
  stripe: {
    secretKey: serverOnly('STRIPE_SECRET_KEY'),
    webhookSecret: serverOnly('STRIPE_WEBHOOK_SECRET'),
  },
  paypal: {
    clientId: serverOnly('PAYPAL_CLIENT_ID'),
    clientSecret: serverOnly('PAYPAL_CLIENT_SECRET'),
    webhookId: serverOnly('PAYPAL_WEBHOOK_ID'),
  },
  digitalGoods: {
    provider: serverOnly('DIGITAL_GOODS_PROVIDER'),
    baseUrl: serverOnly('DIGITAL_GOODS_API_BASE_URL'),
    apiKey: serverOnly('DIGITAL_GOODS_API_KEY'),
    apiSecret: serverOnly('DIGITAL_GOODS_API_SECRET'),
    webhookSecret: serverOnly('DIGITAL_GOODS_WEBHOOK_SECRET'),
  },
  notifications: {
    oneSignalAppId: serverOnly('ONESIGNAL_APP_ID'),
    oneSignalRestApiKey: serverOnly('ONESIGNAL_REST_API_KEY'),
    termiiApiKey: serverOnly('TERMII_API_KEY'),
    termiiBaseUrl: serverOnly('TERMII_BASE_URL'),
  },
} as const;

export function hasSupabaseServerConfig() {
  return Boolean(integrationEnv.supabaseUrl && integrationEnv.supabaseServiceRoleKey);
}
