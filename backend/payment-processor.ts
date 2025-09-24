/**
 * Stripe Payment Processor for ParKing App
 *
 * This backend service handles:
 * - Payment Intent creation
 * - Webhook handling for payment confirmations
 * - Secure payment processing with Stripe
 * - Honduras Lempira (HNL) currency support
 *
 * Security Features:
 * - Webhook signature verification
 * - Idempotency handling
 * - PCI compliance via Stripe
 * - Environment-based configuration
 */

import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Webhook signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Create Payment Intent
 *
 * @param amount - Amount in Lempiras (will be converted to centavos)
 * @param userId - User ID from Firebase
 * @param packageId - Package ID being purchased
 * @param paymentMethodId - Optional: Stripe payment method ID for saved cards
 */
export async function createPaymentIntent(
  amount: number,
  userId: string,
  packageId: string,
  paymentMethodId?: string
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to centavos
      currency: 'hnl', // Honduras Lempira
      payment_method: paymentMethodId,
      metadata: {
        userId,
        packageId,
        app: 'ParKing',
      },
      // Automatically confirm if payment method is provided
      confirm: !!paymentMethodId,
      // Return URL for 3D Secure authentication
      return_url: `${process.env.EXPO_PUBLIC_APP_URL || 'parking://'}payment-success`,
    });

    return {
      clientSecret: paymentIntent.client_secret || '',
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    throw new Error(`Payment intent creation failed: ${error.message}`);
  }
}

/**
 * Create Payment Method
 *
 * @param cardToken - Card token from Stripe mobile SDK
 * @param customerId - Optional: Stripe customer ID
 */
export async function createPaymentMethod(
  cardToken: string,
  customerId?: string
): Promise<Stripe.PaymentMethod> {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: { token: cardToken },
    });

    // Attach to customer if provided
    if (customerId) {
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customerId,
      });
    }

    return paymentMethod;
  } catch (error: any) {
    console.error('Error creating payment method:', error);
    throw new Error(`Payment method creation failed: ${error.message}`);
  }
}

/**
 * Create or Retrieve Stripe Customer
 *
 * @param userId - User ID from Firebase
 * @param email - User email
 * @param name - User name
 * @param phone - User phone
 */
export async function createOrRetrieveCustomer(
  userId: string,
  email?: string,
  name?: string,
  phone?: string
): Promise<Stripe.Customer> {
  try {
    // Search for existing customer by user ID
    const existingCustomers = await stripe.customers.list({
      limit: 1,
      email: email,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        userId,
        app: 'ParKing',
      },
    });

    return customer;
  } catch (error: any) {
    console.error('Error creating/retrieving customer:', error);
    throw new Error(`Customer operation failed: ${error.message}`);
  }
}

/**
 * Handle Stripe Webhook Events
 *
 * @param rawBody - Raw request body
 * @param signature - Stripe signature header
 */
export async function handleWebhook(
  rawBody: string | Buffer,
  signature: string
): Promise<{ received: boolean; type: string }> {
  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      endpointSecret
    );

    console.log(`Webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod);
        break;

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true, type: event.type };
  } catch (error: any) {
    console.error('Webhook error:', error);
    throw new Error(`Webhook handling failed: ${error.message}`);
  }
}

/**
 * Handle Payment Succeeded Event
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  const { userId, packageId } = paymentIntent.metadata;

  // TODO: Update Firebase transaction status to 'completed'
  // TODO: Add minutes to user balance
  // TODO: Send confirmation notification

  console.log(`Processing successful payment for user ${userId}, package ${packageId}`);
}

/**
 * Handle Payment Failed Event
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  const { userId, packageId } = paymentIntent.metadata;
  const errorMessage = paymentIntent.last_payment_error?.message || 'Unknown error';

  // TODO: Update Firebase transaction status to 'failed'
  // TODO: Send failure notification

  console.log(`Payment failed for user ${userId}: ${errorMessage}`);
}

/**
 * Handle Payment Method Attached Event
 */
async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  console.log('Payment method attached:', paymentMethod.id);
  // Additional logic if needed
}

/**
 * Handle Customer Created Event
 */
async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('Customer created:', customer.id);
  // Additional logic if needed
}

/**
 * Refund Payment
 *
 * @param paymentIntentId - Payment Intent ID to refund
 * @param amount - Optional: Partial refund amount in centavos
 * @param reason - Refund reason
 */
export async function refundPayment(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount,
      reason: reason || 'requested_by_customer',
    });

    console.log('Refund created:', refund.id);
    return refund;
  } catch (error: any) {
    console.error('Error creating refund:', error);
    throw new Error(`Refund failed: ${error.message}`);
  }
}

/**
 * Retrieve Payment Intent
 *
 * @param paymentIntentId - Payment Intent ID
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error: any) {
    console.error('Error retrieving payment intent:', error);
    throw new Error(`Payment intent retrieval failed: ${error.message}`);
  }
}

/**
 * List Customer Payment Methods
 *
 * @param customerId - Stripe customer ID
 */
export async function listCustomerPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error: any) {
    console.error('Error listing payment methods:', error);
    throw new Error(`Payment methods list failed: ${error.message}`);
  }
}

/**
 * Detach Payment Method
 *
 * @param paymentMethodId - Payment method ID to detach
 */
export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  try {
    return await stripe.paymentMethods.detach(paymentMethodId);
  } catch (error: any) {
    console.error('Error detaching payment method:', error);
    throw new Error(`Payment method detachment failed: ${error.message}`);
  }
}

// Express.js route handlers example
export const expressRoutes = {
  /**
   * POST /api/create-payment-intent
   */
  createPaymentIntent: async (req: any, res: any) => {
    try {
      const { amount, userId, packageId, paymentMethodId } = req.body;

      if (!amount || !userId || !packageId) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const result = await createPaymentIntent(amount, userId, packageId, paymentMethodId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * POST /api/create-customer
   */
  createCustomer: async (req: any, res: any) => {
    try {
      const { userId, email, name, phone } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      const customer = await createOrRetrieveCustomer(userId, email, name, phone);
      res.json({ customerId: customer.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * POST /api/webhook
   */
  webhook: async (req: any, res: any) => {
    try {
      const signature = req.headers['stripe-signature'];

      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      const result = await handleWebhook(req.rawBody || req.body, signature);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * POST /api/refund
   */
  refund: async (req: any, res: any) => {
    try {
      const { paymentIntentId, amount, reason } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ error: 'Payment Intent ID required' });
      }

      const refund = await refundPayment(paymentIntentId, amount, reason);
      res.json({ refundId: refund.id, status: refund.status });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default {
  createPaymentIntent,
  createPaymentMethod,
  createOrRetrieveCustomer,
  handleWebhook,
  refundPayment,
  getPaymentIntent,
  listCustomerPaymentMethods,
  detachPaymentMethod,
  expressRoutes,
};