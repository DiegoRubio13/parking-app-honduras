/**
 * ParKing Payment Server
 *
 * Express.js backend server for handling Stripe payments
 * Supports Honduras Lempira (HNL) currency
 *
 * Setup Instructions:
 * 1. Install dependencies: npm install express stripe cors dotenv
 * 2. Set environment variables in .env file
 * 3. Run: ts-node backend/server.ts
 * 4. Deploy to cloud service (Vercel, Railway, Render, etc.)
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { expressRoutes } from './payment-processor';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081'],
  credentials: true,
}));

// Raw body parsing for webhook signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// JSON body parsing for other routes
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'ParKing Payment Server',
    timestamp: new Date().toISOString(),
  });
});

// Payment routes
app.post('/api/create-payment-intent', expressRoutes.createPaymentIntent);
app.post('/api/create-customer', expressRoutes.createCustomer);
app.post('/api/webhook', expressRoutes.webhook);
app.post('/api/refund', expressRoutes.refund);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ParKing Payment Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}`);
});

export default app;