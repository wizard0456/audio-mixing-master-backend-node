"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaymentAmount = exports.formatAmountFromStripe = exports.formatAmountForStripe = exports.processPayPalSuccess = exports.getPayPalOrderDetails = exports.createPayPalSubscription = exports.capturePayPalOrder = exports.createPayPalOrder = exports.createStripeCheckoutSession = exports.createStripeSubscription = exports.createStripePaymentIntent = exports.initializePaymentServices = void 0;
const stripe_1 = __importDefault(require("stripe"));
const checkout_server_sdk_1 = __importDefault(require("@paypal/checkout-server-sdk"));
let stripe;
let paypalClient;
const initializePaymentServices = async () => {
    try {
        stripe = new stripe_1.default(process.env['STRIPE_SECRET_KEY'] || '', {
            apiVersion: '2023-10-16',
        });
        const environment = process.env['PAYPAL_MODE'] === 'live'
            ? new checkout_server_sdk_1.default.core.LiveEnvironment(process.env['PAYPAL_CLIENT_ID'] || '', process.env['PAYPAL_CLIENT_SECRET'] || '')
            : new checkout_server_sdk_1.default.core.SandboxEnvironment(process.env['PAYPAL_CLIENT_ID'] || '', process.env['PAYPAL_CLIENT_SECRET'] || '');
        paypalClient = new checkout_server_sdk_1.default.core.PayPalHttpClient(environment);
        console.log('✅ Payment services initialized successfully');
    }
    catch (error) {
        console.error('❌ Payment services initialization failed:', error);
        throw error;
    }
};
exports.initializePaymentServices = initializePaymentServices;
const createStripePaymentIntent = async (amount, currency = 'usd') => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        return paymentIntent;
    }
    catch (error) {
        console.error('Stripe payment intent creation failed:', error);
        throw error;
    }
};
exports.createStripePaymentIntent = createStripePaymentIntent;
const createStripeSubscription = async (customerId, priceId) => {
    try {
        console.log('PaymentService: Creating subscription with:', { customerId, priceId });
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
    }
    catch (error) {
        console.error('PaymentService: Stripe subscription creation failed:', JSON.stringify(error, null, 2));
        if (error && typeof error === 'object' && 'raw' in error) {
            console.error('PaymentService: Stripe raw error:', error.raw);
        }
        throw error;
    }
};
exports.createStripeSubscription = createStripeSubscription;
const createStripeCheckoutSession = async (options) => {
    try {
        const sessionParams = {
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
    }
    catch (error) {
        console.error('Stripe checkout session creation failed:', error);
        throw error;
    }
};
exports.createStripeCheckoutSession = createStripeCheckoutSession;
const createPayPalOrder = async (amount, currency = 'USD') => {
    try {
        const request = new checkout_server_sdk_1.default.orders.OrdersCreateRequest();
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
    }
    catch (error) {
        console.error('PayPal order creation failed:', error);
        throw error;
    }
};
exports.createPayPalOrder = createPayPalOrder;
const capturePayPalOrder = async (orderId) => {
    try {
        const request = new checkout_server_sdk_1.default.orders.OrdersCaptureRequest(orderId);
        const capture = await paypalClient.execute(request);
        return capture.result;
    }
    catch (error) {
        console.error('PayPal order capture failed:', error);
        throw error;
    }
};
exports.capturePayPalOrder = capturePayPalOrder;
const createPayPalSubscription = async (planId, _startTime) => {
    try {
        const request = new checkout_server_sdk_1.default.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: '0.00',
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
    }
    catch (error) {
        console.error('PayPal subscription creation failed:', error);
        throw error;
    }
};
exports.createPayPalSubscription = createPayPalSubscription;
const getPayPalOrderDetails = async (orderId) => {
    try {
        const request = new checkout_server_sdk_1.default.orders.OrdersGetRequest(orderId);
        const order = await paypalClient.execute(request);
        return order.result;
    }
    catch (error) {
        console.error('PayPal order details fetch failed:', error);
        throw error;
    }
};
exports.getPayPalOrderDetails = getPayPalOrderDetails;
const processPayPalSuccess = async (orderId) => {
    try {
        const orderDetails = await (0, exports.getPayPalOrderDetails)(orderId);
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
    }
    catch (error) {
        console.error('PayPal success processing failed:', error);
        throw error;
    }
};
exports.processPayPalSuccess = processPayPalSuccess;
const formatAmountForStripe = (amount) => {
    return Math.round(amount * 100);
};
exports.formatAmountForStripe = formatAmountForStripe;
const formatAmountFromStripe = (amount) => {
    return amount / 100;
};
exports.formatAmountFromStripe = formatAmountFromStripe;
const validatePaymentAmount = (amount) => {
    return amount > 0 && amount <= 999999.99;
};
exports.validatePaymentAmount = validatePaymentAmount;
//# sourceMappingURL=PaymentService.js.map