// Stripe Payment Types for ParKing App
export interface StripeCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay' | 'unknown';
  last4: string;
  expMonth: number;
  expYear: number;
  funding?: 'credit' | 'debit' | 'prepaid' | 'unknown';
  country?: string;
}

export interface StripePaymentMethod {
  id: string;
  type: 'card';
  card: StripeCard;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postalCode?: string;
      state?: string;
    };
  };
  created: number;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: 'hnl'; // Honduras Lempira
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
  paymentMethodId?: string;
  created: number;
  metadata?: {
    userId: string;
    packageId: string;
    minutes: number;
  };
}

export interface StripeCustomer {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  defaultPaymentMethodId?: string;
  created: number;
}

export interface StripeWebhookEvent {
  id: string;
  type: 'payment_intent.succeeded' | 'payment_intent.payment_failed' | 'payment_method.attached' | 'customer.created';
  data: {
    object: any;
  };
  created: number;
}

export interface PaymentError {
  code: string;
  message: string;
  type: 'card_error' | 'validation_error' | 'api_error' | 'authentication_error' | 'rate_limit_error';
}

// Local storage for payment methods
export interface StoredPaymentMethod {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}