import React from 'react';
import { StripeProvider as StripeProviderOriginal } from '@stripe/stripe-react-native';

interface StripeProviderProps {
  children: React.ReactNode;
}

/**
 * Stripe Provider Component
 *
 * Wraps the app with Stripe context for payment processing
 * Configured for Honduras Lempira (HNL) currency
 */
export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

  if (!publishableKey) {
    console.warn('Stripe publishable key not configured. Payment features will be disabled.');
  }

  return (
    <StripeProviderOriginal
      publishableKey={publishableKey}
      merchantIdentifier="merchant.com.parking.hn" // Replace with your Apple merchant ID
      urlScheme="parking" // For returning from 3D Secure
    >
      {children}
    </StripeProviderOriginal>
  );
};

export default StripeProvider;