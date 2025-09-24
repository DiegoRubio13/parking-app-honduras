# Stripe Payment Integration Guide - ParKing App

Complete implementation guide for Stripe payment processing with Honduras Lempira (HNL) support.

## Overview

This integration provides:
- Secure card payment processing with Stripe
- Support for Honduras Lempira (HNL) currency
- Payment method storage and management
- Webhook-based transaction confirmation
- PCI DSS compliance via Stripe

## Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │
         │ 1. Create Payment Intent
         │
         ▼
┌─────────────────┐
│  Backend Server │
│  (Express/TS)   │
└────────┬────────┘
         │
         │ 2. Process Payment
         │
         ▼
┌─────────────────┐
│     Stripe      │
│    Payment API  │
└────────┬────────┘
         │
         │ 3. Webhook Notification
         │
         ▼
┌─────────────────┐
│  Backend Server │
│  (Update DB)    │
└─────────────────┘
```

## Setup Instructions

### Step 1: Configure Stripe Account

1. **Create Stripe Account**
   - Go to https://dashboard.stripe.com/register
   - Complete business verification
   - Enable Honduras (HNL) currency

2. **Get API Keys**
   - Navigate to: Developers > API Keys
   - Copy **Publishable Key** (pk_test_...)
   - Copy **Secret Key** (sk_test_...)

3. **Configure Webhooks**
   - Go to: Developers > Webhooks
   - Click "Add endpoint"
   - URL: `https://your-backend-url.com/api/webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_method.attached`
     - `customer.created`
   - Copy **Webhook Secret** (whsec_...)

### Step 2: Configure Environment Variables

Update `.env` file:

```env
# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Backend URL
EXPO_PUBLIC_BACKEND_URL=https://your-backend-url.com
```

### Step 3: Setup Backend Server

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Deploy Backend**

Choose one deployment option:

**Option A: Vercel**
```bash
npm i -g vercel
vercel
```

**Option B: Railway**
- Connect GitHub repo at railway.app
- Set environment variables
- Deploy

**Option C: Render**
- Create Web Service at render.com
- Connect GitHub repo
- Set environment variables

### Step 4: Wrap App with Stripe Provider

Update `App.tsx`:

```tsx
import { StripeProvider } from './src/components/providers/StripeProvider';

export default function App() {
  return (
    <StripeProvider>
      {/* Your app components */}
    </StripeProvider>
  );
}
```

## Usage Guide

### 1. Add Payment Method

Navigate to `PaymentMethodScreen`:

```tsx
// User enters card details
// Card is tokenized by Stripe
// Token is saved securely in Firebase
```

Features:
- CardField component for secure input
- Real-time validation
- Support for Visa, Mastercard, Amex
- Save card for future use
- Set default payment method

### 2. Make Purchase

Navigate to `PurchaseScreen`:

```tsx
// Select package
// Choose payment method
// Confirm purchase
// Process with Stripe
```

Flow:
1. User selects minutes package
2. Selects saved card or adds new
3. Confirms purchase
4. Backend creates Payment Intent
5. App confirms payment with Stripe SDK
6. Webhook updates transaction status
7. Minutes added to user balance

### 3. Webhook Processing

Backend automatically handles:

```typescript
payment_intent.succeeded → Update transaction → Add minutes
payment_intent.payment_failed → Update transaction → Notify user
```

## Security Features

### PCI Compliance
- ✅ Card data never touches your servers
- ✅ Stripe SDK handles tokenization
- ✅ PCI DSS Level 1 certified

### Data Protection
- ✅ HTTPS enforced in production
- ✅ Webhook signature verification
- ✅ Environment variable encryption
- ✅ No card data in logs

### Fraud Prevention
- ✅ 3D Secure (SCA) support
- ✅ Stripe Radar fraud detection
- ✅ Card verification (CVC)
- ✅ Address verification (AVS)

## Testing

### Test Cards

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

**3D Secure Required:**
- Card: `4000 0027 6000 3184`

**Declined Payment:**
- Card: `4000 0000 0000 0002`

**Insufficient Funds:**
- Card: `4000 0000 0000 9995`

### Test Amounts (HNL)

- L 135.00 = Successful payment
- L 1.00 = Minimum charge
- L 999,999.99 = Maximum test amount

## Currency Handling

Honduras Lempira (HNL):

```typescript
// Frontend: Display amount
const displayAmount = 135; // L 135.00

// Backend: Convert to centavos
const stripeAmount = displayAmount * 100; // 13500 centavos

// Stripe API: Process in centavos
await stripe.paymentIntents.create({
  amount: 13500,
  currency: 'hnl'
});
```

## Error Handling

### Common Errors

| Error Code | Meaning | User Action |
|------------|---------|-------------|
| `card_declined` | Card declined | Try different card |
| `expired_card` | Card expired | Update card details |
| `incorrect_cvc` | Wrong CVC | Re-enter CVC |
| `insufficient_funds` | Not enough money | Add funds or use different card |
| `authentication_required` | 3DS needed | Complete authentication |

### Error Display

```tsx
try {
  await processPayment();
} catch (error) {
  const userMessage = getErrorMessage(error.code);
  Alert.alert('Payment Failed', userMessage);
}
```

## Firebase Schema

### paymentMethods Collection

```typescript
{
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  brand: string; // 'visa', 'mastercard', etc.
  last4: string; // '4242'
  expMonth: number; // 12
  expYear: number; // 2025
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### paymentTransactions Collection

```typescript
{
  id: string;
  userId: string;
  type: 'purchase';
  method: 'card';
  amount: number; // In Lempiras
  minutes: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  metadata: {
    packageId: string;
    stripePaymentIntentId: string;
    stripePaymentMethodId: string;
  };
  createdAt: string;
  completedAt?: string;
}
```

## Production Checklist

### Before Going Live

- [ ] Switch to live Stripe keys
- [ ] Update webhook URL to production
- [ ] Enable HTTPS everywhere
- [ ] Configure proper CORS
- [ ] Set up error monitoring (Sentry)
- [ ] Test all payment flows
- [ ] Verify webhook delivery
- [ ] Review Stripe Radar rules
- [ ] Enable email receipts
- [ ] Configure dispute handling

### Stripe Dashboard Settings

1. **Business Settings**
   - Company name
   - Support email
   - Support phone
   - Statement descriptor

2. **Payment Methods**
   - Enable: Cards
   - Consider: Bank transfers, wallets

3. **Radar Rules**
   - Review default rules
   - Customize if needed

4. **Email Receipts**
   - Enable automatic receipts
   - Customize email template

## Monitoring & Analytics

### Key Metrics

- Payment success rate
- Average transaction value
- Failed payment reasons
- 3DS authentication rate
- Dispute rate

### Stripe Dashboard

Monitor at: https://dashboard.stripe.com/payments

- Real-time payments
- Success/failure trends
- Revenue analytics
- Customer insights

## Support Resources

### Documentation
- Stripe React Native: https://stripe.com/docs/mobile/react-native
- Stripe API: https://stripe.com/docs/api
- Webhooks: https://stripe.com/docs/webhooks

### Testing Tools
- Stripe CLI: https://stripe.com/docs/stripe-cli
- Webhook testing: https://dashboard.stripe.com/test/webhooks
- Card testing: https://stripe.com/docs/testing

### Support
- Stripe Support: https://support.stripe.com
- Community: https://github.com/stripe

## Troubleshooting

### Issue: Payment not completing

**Solution:**
1. Check webhook is configured correctly
2. Verify webhook secret matches
3. Check webhook delivery logs in Stripe
4. Ensure backend is accessible

### Issue: 3D Secure not working

**Solution:**
1. Verify `return_url` is configured
2. Check URL scheme in app config
3. Test with 3DS test card
4. Review authentication flow

### Issue: Card validation failing

**Solution:**
1. Check CardField configuration
2. Verify postal code setting
3. Review Stripe dashboard for errors
4. Test with different cards

## Next Steps

1. ✅ Complete integration setup
2. ✅ Test all payment flows
3. ✅ Deploy backend to production
4. ✅ Configure production webhooks
5. ✅ Monitor initial transactions
6. ✅ Optimize user experience
7. ✅ Add analytics tracking

## License

Proprietary - ParKing Honduras S.A.

---

**Last Updated:** 2025-01-23
**Version:** 1.0.0
**Maintained by:** ParKing Development Team