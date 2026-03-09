import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

export const processPayment = async (paymentMethod, amount) => {
  try {
    const response = await axios.post('/api/payments/create-intent', {
      paymentMethod,
      amount
    });
    return response.data;
  } catch (error) {
    console.error('Payment error:', error);
    throw error;
  }
};

export const handleSubscription = async (planId) => {
  try {
    const response = await axios.post('/api/payments/subscribe', {
      planId
    });
    return response.data;
  } catch (error) {
    console.error('Subscription error:', error);
    throw error;
  }
};