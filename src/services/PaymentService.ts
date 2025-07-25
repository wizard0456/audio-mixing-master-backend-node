import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';

let stripe: Stripe;
let paypalClient: paypal.core.PayPalHttpClient;

export const initializePaymentServices = async () => {
  try {
    // Initialize Stripe
    stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
      apiVersion: '2023-10-16',
    });

    // Initialize PayPal
    const environment = process.env['PAYPAL_MODE'] === 'live' 
      ? new paypal.core.LiveEnvironment(process.env['PAYPAL_CLIENT_ID'] || '', process.env['PAYPAL_CLIENT_SECRET'] || '')
      : new paypal.core.SandboxEnvironment(process.env['PAYPAL_CLIENT_ID'] || '', process.env['PAYPAL_CLIENT_SECRET'] || '');
    paypalClient = new paypal.core.PayPalHttpClient(environment);

    console.log('✅ Payment services initialized successfully');
  } catch (error) {
    console.error('❌ Payment services initialization failed:', error);
    throw error;
  }
};

// Stripe Payment Methods
export const createStripePaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
    throw error;
  }
};

export const createStripeSubscription = async (customerId: string, priceId: string) => {
  try {
    console.log('PaymentService: Creating subscription with:', { customerId, priceId });

    // Validate that the price is recurring before creating subscription
    const price = await stripe.prices.retrieve(priceId);
    if (price.type !== 'recurring') {
      throw new Error('Provided price is not recurring. Subscriptions require a recurring price.');
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    console.log('PaymentService: Subscription created successfully:', subscription.id);
    return subscription;
  } catch (error) {
    console.error('PaymentService: Stripe subscription creation failed:', JSON.stringify(error, null, 2));
    
    // Log additional Stripe error details
    if (error && typeof error === 'object' && 'raw' in error) {
      console.error('PaymentService: Stripe raw error:', error.raw);
    }
    
    throw error;
  }
};

export const createStripeCheckoutSession = async (options: {
  line_items: any[];
  mode: string;
  allow_promotion_codes?: boolean;
  metadata?: any;
  customer_email?: string;
  success_url: string;
  cancel_url: string;
}) => {
  try {
    const sessionParams: any = {
      line_items: options.line_items,
      mode: options.mode,
      metadata: options.metadata,
      success_url: options.success_url,
      cancel_url: options.cancel_url,
    };

    if (options.allow_promotion_codes !== undefined) {
      sessionParams.allow_promotion_codes = options.allow_promotion_codes;
    }

    if (options.customer_email) {
      sessionParams.customer_email = options.customer_email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return session;
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);
    throw error;
  }
};

// PayPal Payment Methods
export const createPayPalOrder = async (amount: number, currency: string = 'USD') => {
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(),
        },
      }],
    });

    const order = await paypalClient.execute(request);
    return order.result;
  } catch (error) {
    console.error('PayPal order creation failed:', error);
    throw error;
  }
};

export const capturePayPalOrder = async (orderId: string) => {
  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);

    const capture = await paypalClient.execute(request);
    return capture.result;
  } catch (error) {
    console.error('PayPal order capture failed:', error);
    throw error;
  }
};

export const createPayPalSubscription = async (planId: string, _startTime: string) => {
  try {
    // Note: PayPal subscriptions require additional setup and may need different SDK
    // For now, we'll create a basic implementation using orders
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '0.00', // Will be set by the plan
        },
        custom_id: `subscription_${planId}`,
      }],
      application_context: {
        return_url: process.env['PAYPAL_RETURN_URL'] || 'http://localhost:3000/success',
        cancel_url: process.env['PAYPAL_CANCEL_URL'] || 'http://localhost:3000/cancel',
      },
    });

    const subscription = await paypalClient.execute(request);
    return subscription.result;
  } catch (error) {
    console.error('PayPal subscription creation failed:', error);
    throw error;
  }
};

export const getPayPalOrderDetails = async (orderId: string) => {
  try {
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const order = await paypalClient.execute(request);
    return order.result;
  } catch (error) {
    console.error('PayPal order details fetch failed:', error);
    throw error;
  }
};

export const processPayPalSuccess = async (orderId: string) => {
  try {
    const orderDetails = await getPayPalOrderDetails(orderId);
    
    if (orderDetails.status === 'COMPLETED') {
      return {
        success: true,
        orderId,
        status: orderDetails.status,
        amount: orderDetails.purchase_units?.[0]?.amount?.value,
        currency: orderDetails.purchase_units?.[0]?.amount?.currency_code,
      };
    }
    
    return {
      success: false,
      message: 'Order not completed',
      status: orderDetails.status,
    };
  } catch (error) {
    console.error('PayPal success processing failed:', error);
    throw error;
  }
};

// Utility functions
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount * 100);
};

export const formatAmountFromStripe = (amount: number): number => {
  return amount / 100;
};

export const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999.99; // Reasonable limit
}; 