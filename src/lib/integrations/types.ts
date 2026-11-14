export type Money = { amountMinor: number; currency: string };
export type PaymentIntentInput = {
  reference: string;
  amount: Money;
  customer: { id: string; email?: string; phone?: string };
  returnUrl?: string;
  metadata?: Record<string, string>;
};
export type PaymentIntentResult = {
  providerReference: string;
  status: 'pending' | 'succeeded' | 'failed';
  checkoutUrl?: string;
};
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  verifyPayment(providerReference: string): Promise<PaymentStatus>;
}

export type FulfilmentRequest = {
  orderReference: string;
  sku: string;
  quantity: number;
  recipient?: string;
};
export type FulfilmentResult = {
  providerReference: string;
  status: 'pending' | 'completed' | 'failed';
  deliveryPayload?: Record<string, unknown>;
};

export interface DigitalGoodsProvider {
  readonly name: string;
  checkBalance(): Promise<Money>;
  fulfil(input: FulfilmentRequest): Promise<FulfilmentResult>;
}

export interface NotificationProvider {
  readonly name: string;
  send(input: { to: string; subject: string; message: string }): Promise<{ id: string }>;
}
