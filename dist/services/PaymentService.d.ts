import Stripe from 'stripe';
export declare const initializePaymentServices: () => Promise<void>;
export declare const createStripePaymentIntent: (amount: number, currency?: string) => Promise<Stripe.Response<Stripe.PaymentIntent>>;
export declare const createStripeSubscription: (customerId: string, priceId: string) => Promise<Stripe.Response<Stripe.Subscription>>;
export declare const createStripeCheckoutSession: (options: {
    line_items: any[];
    mode: string;
    allow_promotion_codes?: boolean;
    metadata?: any;
    customer_email?: string;
    success_url: string;
    cancel_url: string;
}) => Promise<Stripe.Response<Stripe.Checkout.Session>>;
export declare const createPayPalOrder: (amount: number, currency?: string) => Promise<any>;
export declare const capturePayPalOrder: (orderId: string) => Promise<any>;
export declare const createPayPalSubscription: (planId: string, _startTime: string) => Promise<any>;
export declare const getPayPalOrderDetails: (orderId: string) => Promise<any>;
export declare const processPayPalSuccess: (orderId: string) => Promise<{
    success: boolean;
    orderId: string;
    status: any;
    amount: any;
    currency: any;
    message?: never;
} | {
    success: boolean;
    message: string;
    status: any;
    orderId?: never;
    amount?: never;
    currency?: never;
}>;
export declare const formatAmountForStripe: (amount: number) => number;
export declare const formatAmountFromStripe: (amount: number) => number;
export declare const validatePaymentAmount: (amount: number) => boolean;
//# sourceMappingURL=PaymentService.d.ts.map