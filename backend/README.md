# ParKing Payment Backend

Backend payment processor for ParKing app using Stripe with Honduras Lempira (HNL) support.

## Features

- ✅ Stripe Payment Intent creation
- ✅ Webhook handling for payment confirmations
- ✅ Honduras Lempira (HNL) currency support
- ✅ Secure payment method tokenization
- ✅ PCI compliance via Stripe
- ✅ Idempotency handling
- ✅ Refund processing
- ✅ Customer management

## Setup Instructions

### 1. Install Dependencies

```bash
npm install express stripe cors dotenv
npm install --save-dev @types/express @types/cors @types/node ts-node typescript
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Server Configuration
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.1:8081

# App Configuration
EXPO_PUBLIC_APP_URL=parking://
```

### 3. Get Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret Key** (starts with `sk_test_`)
3. Copy your **Publishable Key** (starts with `pk_test_`) for the mobile app

### 4. Setup Webhook Endpoint

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter URL: `https://your-domain.com/api/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_method.attached`
   - `customer.created`
5. Copy the **Webhook Secret** (starts with `whsec_`)

### 5. Run the Server

Development:
```bash
npm run dev
# or
ts-node backend/server.ts
```

Production:
```bash
npm run build
npm start
```

## API Endpoints

### POST /api/create-payment-intent

Create a payment intent for a purchase.

**Request:**
```json
{
  "amount": 135,
  "currency": "hnl",
  "userId": "user123",
  "packageId": "standard-150",
  "paymentMethodId": "pm_xxxxx" // Optional: for saved cards
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxxxx_secret_xxxxx",
  "paymentIntentId": "pi_xxxxx"
}
```

### POST /api/create-customer

Create or retrieve a Stripe customer.

**Request:**
```json
{
  "userId": "user123",
  "email": "user@example.com",
  "name": "Juan Pérez",
  "phone": "+50499999999"
}
```

**Response:**
```json
{
  "customerId": "cus_xxxxx"
}
```

### POST /api/webhook

Webhook endpoint for Stripe events (automatically called by Stripe).

**Headers:**
```
stripe-signature: t=xxxxx,v1=xxxxx
```

### POST /api/refund

Process a refund.

**Request:**
```json
{
  "paymentIntentId": "pi_xxxxx",
  "amount": 13500, // Optional: partial refund in centavos
  "reason": "requested_by_customer"
}
```

**Response:**
```json
{
  "refundId": "re_xxxxx",
  "status": "succeeded"
}
```

## Deployment Options

### Option 1: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard

### Option 2: Railway

1. Go to [Railway](https://railway.app)
2. Create new project
3. Connect GitHub repo
4. Set environment variables
5. Deploy

### Option 3: Render

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set environment variables
5. Deploy

### Option 4: Heroku

```bash
heroku create parking-payment-server
heroku config:set STRIPE_SECRET_KEY=sk_test_xxxxx
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
git push heroku main
```

## Security Checklist

- [x] Webhook signature verification
- [x] HTTPS only in production
- [x] Environment variable protection
- [x] CORS configuration
- [x] Input validation
- [x] Error handling
- [x] PCI compliance via Stripe
- [x] No sensitive data logging

## Testing

### Test Payment Flow

1. Use Stripe test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any 3-digit CVC
4. Any 5-digit postal code

### Test 3D Secure

Card: `4000 0027 6000 3184`

### Test Declined Payment

Card: `4000 0000 0000 0002`

## Currency Support

Honduras Lempira (HNL) is supported by Stripe with the following considerations:

- **Minimum charge:** L 1.00 (100 centavos)
- **Zero-decimal currency:** No (uses centavos)
- **Conversion:** Amount × 100 = centavos
- **Example:** L 135.00 = 13500 centavos

## Webhook Events

| Event | Description | Action |
|-------|-------------|--------|
| `payment_intent.succeeded` | Payment successful | Update transaction, add minutes |
| `payment_intent.payment_failed` | Payment failed | Update transaction, notify user |
| `payment_method.attached` | Card saved | Log event |
| `customer.created` | Customer created | Log event |

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `authentication_required` | 3D Secure needed | Client handles authentication |
| `card_declined` | Insufficient funds | Show user-friendly message |
| `expired_card` | Card expired | Prompt to update card |
| `incorrect_cvc` | Wrong CVC | Prompt to re-enter |
| `processing_error` | Stripe issue | Retry or contact support |

## Support

For issues or questions:
- Stripe Docs: https://stripe.com/docs
- ParKing Support: support@parking.hn
- Stripe Support: https://support.stripe.com

## License

Proprietary - ParKing Honduras S.A.