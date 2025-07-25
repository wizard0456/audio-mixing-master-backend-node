"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const models_1 = require("../models");
const PaymentService_1 = require("../services/PaymentService");
const EmailService_1 = require("../services/EmailService");
const uuid_1 = require("uuid");
class PaymentController {
    static async paypal(req, res) {
        try {
            const { amount, currency = 'USD', cartItem } = req.body;
            if (!amount || !cartItem) {
                return res.status(400).json({ message: 'Amount and cart items are required' });
            }
            const paypalOrder = await (0, PaymentService_1.createPayPalOrder)(amount, currency);
            if (paypalOrder.id) {
                const approveLink = paypalOrder.links?.find((link) => link.rel === 'approve');
                if (approveLink) {
                    return res.json({
                        approve_link: approveLink.href
                    });
                }
                else {
                    console.error('No approve link found in PayPal response', paypalOrder);
                    return res.status(500).json({ message: 'PayPal order creation failed' });
                }
            }
            else {
                console.error('PayPal create order failed', paypalOrder);
                return res.status(500).json({ message: 'PayPal order creation failed' });
            }
        }
        catch (error) {
            console.error('PayPal payment error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async createPaymentIntent(req, res) {
        try {
            const { amount, user_id: _user_id, cartItems, finalTotal, currency = 'usd' } = req.body;
            if (!amount || !cartItems) {
                return res.status(400).json({ message: 'Amount and cart items are required' });
            }
            const paymentAmount = finalTotal || amount;
            const amountInCents = typeof paymentAmount === 'number' && paymentAmount > 100 ?
                paymentAmount :
                Math.round(paymentAmount * 100);
            const paymentIntent = await (0, PaymentService_1.createStripePaymentIntent)(amountInCents / 100, currency.toLowerCase());
            return res.json({
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: amountInCents,
                currency: currency.toLowerCase()
            });
        }
        catch (error) {
            console.error('Stripe payment intent error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ message: `Error: ${errorMessage}` });
        }
    }
    static async stripePay(req, res) {
        try {
            const { cart_items, cartItems, amount, currency = 'USD', promoCode, user_id, order_type = 'one_time', payment_method_id, customerEmail, finalTotal, isGuestCheckout, guest_info } = req.body;
            const cartItemsToUse = cart_items || cartItems;
            if (!cartItemsToUse || !amount) {
                return res.status(400).json({ message: 'Cart items and amount are required' });
            }
            const userEmail = req.user?.email || customerEmail || (guest_info?.email);
            const currentUserId = req.user?.id || user_id || 'guest';
            const paymentAmount = finalTotal || amount;
            const amountInCents = typeof paymentAmount === 'number' && paymentAmount > 100 ?
                paymentAmount :
                Math.round(paymentAmount * 100);
            if (payment_method_id) {
                try {
                    const paymentIntent = await (0, PaymentService_1.createStripePaymentIntent)(amountInCents / 100, currency.toLowerCase());
                    const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);
                    const paymentIntentResult = await stripe.paymentIntents.confirm(paymentIntent.id, {
                        payment_method: payment_method_id,
                        return_url: `${process.env['FRONTEND_URL']}/success`,
                    });
                    console.log(`paymentIntentResult: ${JSON.stringify(paymentIntentResult)}`);
                    return res.json({
                        success: true,
                        paymentIntent: paymentIntentResult,
                        clientSecret: paymentIntent.client_secret
                    });
                }
                catch (error) {
                    console.error('Stripe payment method error:', error);
                    return res.status(500).json({ message: 'Payment failed' });
                }
            }
            else {
                const lineItems = cartItemsToUse.map((item) => ({
                    price_data: {
                        product_data: {
                            name: item.service_name,
                        },
                        currency: currency.toUpperCase(),
                        unit_amount: typeof item.price === 'number' && item.price > 100 ?
                            item.price :
                            Math.round(item.price * 100),
                    },
                    quantity: item.qty,
                }));
                const metadata = {
                    user_id: currentUserId,
                    isGuestCheckout: isGuestCheckout || false,
                    order_type: order_type,
                    promoCode: promoCode || '',
                    cartItems: encodeURIComponent(JSON.stringify(cartItemsToUse)),
                };
                if (isGuestCheckout && guest_info) {
                    metadata.guest_first_name = guest_info.first_name;
                    metadata.guest_last_name = guest_info.last_name;
                    metadata.guest_email = guest_info.email;
                    metadata.guest_phone = guest_info.phone;
                    metadata.guest_info = JSON.stringify(guest_info);
                }
                const session = await (0, PaymentService_1.createStripeCheckoutSession)({
                    line_items: lineItems,
                    mode: 'payment',
                    allow_promotion_codes: false,
                    metadata: metadata,
                    customer_email: userEmail,
                    success_url: `${process.env['FRONTEND_URL']}/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env['FRONTEND_URL']}/cancel?amount=${paymentAmount}&currency=${currency}&promoCode=${promoCode || ''}&cartItems=${encodeURIComponent(JSON.stringify(cartItemsToUse))}&transaction_id={CHECKOUT_SESSION_ID}&isGuestCheckout=${isGuestCheckout || false}`,
                });
                return res.json({ url: session.url });
            }
        }
        catch (error) {
            console.error('Stripe payment error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ message: `Error: ${errorMessage}` });
        }
    }
    static async stripeSubscribe(req, res) {
        try {
            const { service_id, customerId, priceId, customerEmail, customerName } = req.body;
            if (!service_id || !priceId) {
                return res.status(400).json({ message: 'Service ID and price ID are required' });
            }
            const service = await models_1.Service.findByPk(service_id);
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
            const userEmail = customerEmail;
            const userName = customerName;
            const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);
            let customer;
            if (customerId) {
                customer = await stripe.customers.retrieve(customerId);
            }
            else {
                customer = await stripe.customers.create({
                    email: userEmail,
                    name: userName,
                });
            }
            console.log("About to call createStripeSubscription with:", {
                customerId: customer.id,
                priceId: priceId
            });
            const subscription = await (0, PaymentService_1.createStripeSubscription)(customer.id, priceId);
            console.log(`subscription: ${JSON.stringify(subscription)}`);
            return res.json({
                success: true,
                data: {
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    clientSecret: subscription.latest_invoice && typeof subscription.latest_invoice === 'object'
                        ? subscription.latest_invoice.payment_intent?.client_secret
                        : undefined,
                },
            });
        }
        catch (error) {
            console.error('Stripe subscription error:', JSON.stringify(error, null, 2));
            if (error && typeof error === 'object' && 'raw' in error) {
                console.error('Stripe error details:', error.raw);
            }
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ message: `Error: ${errorMessage}` });
        }
    }
    static async createSubscription(req, res) {
        try {
            const { service_id, planId } = req.body;
            const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            if (!service_id || !planId) {
                return res.status(400).json({ message: 'Service ID and plan ID are required' });
            }
            const service = await models_1.Service.findByPk(service_id);
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
            const subscription = await (0, PaymentService_1.createPayPalSubscription)(planId, startTime);
            return res.json({
                success: true,
                data: {
                    subscriptionId: subscription.id,
                    status: subscription.status,
                    links: subscription.links,
                },
            });
        }
        catch (error) {
            console.error('PayPal subscription error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getOrderDetails(req, res) {
        try {
            const { orderId } = req.query;
            if (!orderId) {
                return res.status(400).json({ message: 'Order ID is required' });
            }
            const orderDetails = await (0, PaymentService_1.getPayPalOrderDetails)(orderId);
            return res.json({
                success: true,
                data: orderDetails,
            });
        }
        catch (error) {
            console.error('Get order details error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async orderDetails(req, res) {
        try {
            const { id } = req.params;
            const order = await models_1.Order.findByPk(id);
            if (!order) {
                return res.status(200).json({ error: 'No order found' });
            }
            const orderItems = await models_1.OrderItem.findAll({
                where: { order_id: id }
            });
            let coupon = null;
            if (order.promocode) {
                coupon = await models_1.OrderCoupon.findOne({
                    where: {
                        code: order.promocode,
                        order_id: id
                    }
                });
            }
            const user = await models_1.User.findByPk(order.user_id);
            const username = user ? `${user.first_name} ${user.last_name}` : order.payer_name;
            const useremail = user?.email || order.payer_email;
            const revision = await models_1.Revision.findAll({ where: { order_id: id } });
            const serviceIds = orderItems.map(item => item.service_id);
            let is_giftcard = 0;
            if (serviceIds.length > 0) {
                const hasGiftcard = await models_1.Service.findOne({
                    where: {
                        id: serviceIds,
                        category_id: 15
                    }
                });
                is_giftcard = hasGiftcard ? 1 : 0;
            }
            const orderDetails = {
                order: {
                    id: order.id,
                    user_id: order.user_id,
                    transaction_id: order.transaction_id,
                    amount: order.amount,
                    currency: order.currency,
                    promocode: order.promocode,
                    payer_name: order.payer_name,
                    payer_email: order.payer_email,
                    payment_status: order.payment_status,
                    Order_status: order.Order_status,
                    order_type: order.order_type,
                    is_active: order.is_active,
                    payment_method: order.payment_method,
                    order_reference_id: order.order_reference_id,
                    created_at: order.createdAt,
                    updated_at: order.updatedAt
                },
                order_items: orderItems.map(item => ({
                    id: item.id,
                    order_id: item.order_id,
                    service_id: item.service_id,
                    paypal_product_id: item.paypal_product_id,
                    paypal_plan_id: item.paypal_plan_id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total_price: item.total_price,
                    service_type: item.service_type,
                    max_revision: item.max_revision,
                    deliverable_files: item.deliverable_files,
                    admin_is_read: item.admin_is_read,
                    user_is_read: item.user_is_read,
                    created_at: item.createdAt,
                    updated_at: item.updatedAt
                })),
                coupon: coupon,
                user_name: username,
                user_email: useremail,
                revision: revision,
                is_giftcard: is_giftcard
            };
            return res.status(200).json(orderDetails);
        }
        catch (error) {
            console.error('Order details error:', error);
            return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
        }
    }
    static async userOrders(req, res) {
        try {
            const { user_id } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const orders = await models_1.Order.findAndCountAll({
                where: { user_id },
                include: [
                    {
                        model: models_1.OrderItem,
                        as: 'orderItems',
                        include: [
                            { model: models_1.Service, as: 'service' }
                        ]
                    },
                ],
                offset,
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']],
            });
            const transformedOrders = orders.rows.map(order => ({
                order: {
                    id: order.id,
                    user_id: order.user_id,
                    transaction_id: order.transaction_id,
                    amount: order.amount,
                    currency: order.currency,
                    promocode: order.promocode,
                    payer_name: order.payer_name,
                    payer_email: order.payer_email,
                    payment_status: order.payment_status,
                    Order_status: order.Order_status,
                    order_type: order.order_type,
                    is_active: order.is_active,
                    payment_method: order.payment_method,
                    order_reference_id: order.order_reference_id,
                    created_at: order.createdAt,
                    updated_at: order.updatedAt
                },
                order_items: order.orderItems?.map(item => ({
                    id: item.id,
                    order_id: item.order_id,
                    service_id: item.service_id,
                    paypal_product_id: item.paypal_product_id,
                    paypal_plan_id: item.paypal_plan_id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    total_price: item.total_price,
                    service_type: item.service_type,
                    max_revision: item.max_revision,
                    deliverable_files: item.deliverable_files,
                    admin_is_read: item.admin_is_read,
                    user_is_read: item.user_is_read,
                    created_at: item.createdAt,
                    updated_at: item.updatedAt
                })) || [],
                coupon: null,
                user_name: order.payer_name,
                user_email: order.payer_email,
                revision: [],
                is_giftcard: 0
            }));
            return res.json({
                success: true,
                data: {
                    orders: transformedOrders,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: orders.count,
                        pages: Math.ceil(orders.count / parseInt(limit)),
                    },
                },
            });
        }
        catch (error) {
            console.error('User orders error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async success(req, res) {
        try {
            const { session_id } = req.query;
            if (session_id) {
                try {
                    const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);
                    const session = await stripe.checkout.sessions.retrieve(session_id);
                    if (session.payment_status === 'paid') {
                        const order = await models_1.Order.findOne({ where: { transaction_id: session_id } });
                        if (order) {
                            return res.json({
                                success: true,
                                message: 'Payment successful! Your order has been processed.',
                                order_id: order.id,
                                session_id: session_id
                            });
                        }
                        else {
                            return res.json({
                                success: true,
                                message: 'Payment successful! Your order is being processed.',
                                session_id: session_id
                            });
                        }
                    }
                    else {
                        return res.status(400).json({ message: 'Payment not completed' });
                    }
                }
                catch (error) {
                    console.error('Error retrieving Stripe session:', error);
                    return res.status(500).json({ message: 'Error processing payment' });
                }
            }
            const { user_id, transaction_id, amount, payer_name, payer_email, order_type, payment_method, cartItems, promoCode, order_id, isGuestCheckout, guest_info } = req.body;
            if (!transaction_id || !amount || !payer_name || !payer_email || !order_type || !payment_method || !cartItems) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            let user;
            if (!user_id || user_id === 'guest' || isGuestCheckout) {
                let firstName, lastName;
                if (guest_info && guest_info.first_name && guest_info.last_name) {
                    firstName = guest_info.first_name;
                    lastName = guest_info.last_name;
                }
                else {
                    const [firstNamePart, ...lastNameParts] = payer_name.split(' ');
                    firstName = firstNamePart;
                    lastName = lastNameParts.join(' ') || 'Guest';
                }
                console.log('Creating guest user:', { firstName, lastName, email: payer_email });
                user = await models_1.User.findOne({ where: { email: payer_email } });
                if (!user) {
                    try {
                        user = await models_1.User.create({
                            first_name: firstName,
                            last_name: lastName,
                            email: payer_email,
                            phone_number: guest_info?.phone || null,
                            password: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            role: 'guest',
                            is_active: 1
                        });
                    }
                    catch (error) {
                        console.error('Error creating guest user:', error);
                        if (error.name === 'SequelizeUniqueConstraintError') {
                            user = await models_1.User.findOne({ where: { email: payer_email } });
                            if (!user) {
                                return res.status(400).json({ message: 'User with this email already exists' });
                            }
                        }
                        else {
                            return res.status(500).json({ message: 'Failed to create user account' });
                        }
                    }
                }
                console.log('Guest user created with ID:', user.id);
            }
            else {
                user = await models_1.User.findByPk(user_id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                console.log('Using existing user with ID:', user.id);
            }
            console.log('Creating order with user_id:', user.id);
            const order = await models_1.Order.create({
                user_id: user.id,
                transaction_id,
                amount: parseFloat(amount),
                currency: 'USD',
                promocode: promoCode || null,
                Order_status: 0,
                is_active: 1,
                payer_name,
                payer_email,
                payment_status: 'PAID',
                payment_method,
                order_type,
                order_reference_id: order_id || null
            });
            console.log('Order created with ID:', order.id);
            let totalAmount = 0;
            for (const item of cartItems) {
                const service = await models_1.Service.findByPk(item.service_id);
                if (service && service.category_id === 15) {
                    const giftCode = `gift-${(0, uuid_1.v4)().toUpperCase().replace(/-/g, '')}`;
                    await (0, EmailService_1.sendGiftCardEmail)({
                        name: `${user.first_name} ${user.last_name}`,
                        message: `Thank you for your purchase. Your gift card amount is: $${item.price} and your code is:`,
                        code: giftCode,
                        email: user.email
                    });
                }
                await models_1.OrderItem.create({
                    order_id: order.id,
                    service_id: item.service_id,
                    name: item.service_name,
                    price: item.price.toString(),
                    quantity: item.qty.toString(),
                    max_revision: parseInt(item.qty) * 3,
                    total_price: item.total_price.toString(),
                    service_type: item.service_type,
                    paypal_product_id: item.paypal_product_id || null,
                    paypal_plan_id: item.paypal_plan_id || null,
                    admin_is_read: 0,
                    user_is_read: 0
                });
                totalAmount += parseFloat(item.total_price);
            }
            if (promoCode) {
                if (promoCode.startsWith('gift-')) {
                }
                else {
                }
            }
            if (order_type === 'one_time') {
                for (const item of cartItems) {
                    await models_1.Cart.destroy({
                        where: {
                            service_id: item.service_id,
                            user_id: user.id
                        }
                    });
                }
            }
            const orderItems = await models_1.OrderItem.findAll({
                where: { order_id: order.id }
            });
            const userUrl = process.env['FRONTEND_URL'];
            const adminUrl = process.env['ADMIN_URL'];
            (0, EmailService_1.sendOrderSuccessEmail)({
                name: `${user.first_name} ${user.last_name}`,
                order_id: order.id,
                message: 'Thank you for your purchase. Your order has been processed successfully. Your order details are as follows',
                items: orderItems,
                url: `${userUrl}/order/${order.id}`,
                email: user.email
            });
            const admin = await models_1.User.findOne({ where: { role: 'admin' } });
            if (admin) {
                (0, EmailService_1.sendOrderSuccessEmail)({
                    name: `${admin.first_name} ${admin.last_name}`,
                    order_id: order.id,
                    items: orderItems,
                    message: 'New Order Arrived. All Engineer has been notified',
                    url: `${adminUrl}/order-detail/${order.id}`,
                    email: admin.email
                });
            }
            const engineers = await models_1.User.findAll({ where: { role: 'engineer' } });
            for (const engineer of engineers) {
                (0, EmailService_1.sendOrderSuccessEmail)({
                    name: `${engineer.first_name} ${engineer.last_name}`,
                    order_id: order.id,
                    items: orderItems,
                    url: `${adminUrl}/order-detail/${order.id}`,
                    message: 'New Order Arrived. Click the link below and go to the dashboard.',
                    email: engineer.email
                });
            }
            const response = {
                message: 'success',
                order_id: order.id
            };
            console.log('Payment success response:', response);
            return res.json(response);
        }
        catch (error) {
            console.error('Payment success error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({ message: `Error: ${errorMessage}` });
        }
    }
    static async cancel(_req, res) {
        try {
            return res.json({
                success: false,
                message: 'Payment cancelled',
            });
        }
        catch (error) {
            console.error('PayPal cancel error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async processPayment(req, res) {
        try {
            const { orderId, paymentMethod, paymentData } = req.body;
            if (!orderId || !paymentMethod) {
                return res.status(400).json({ message: 'Order ID and payment method are required' });
            }
            const order = await models_1.Order.findOne({
                where: { id: orderId },
                include: [{ model: models_1.User, as: 'user' }],
            });
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            if (order.user_id !== req.user?.id) {
                return res.status(403).json({ message: 'Access denied' });
            }
            let paymentResult;
            switch (paymentMethod) {
                case 'stripe':
                    paymentResult = await (0, PaymentService_1.createStripePaymentIntent)(paymentData.amount, paymentData.currency);
                    break;
                case 'paypal':
                    paymentResult = await (0, PaymentService_1.createPayPalOrder)(paymentData.amount, paymentData.currency);
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid payment method' });
            }
            if (paymentResult.success) {
                order.Order_status = 1;
                await order.save();
                await models_1.Payment.create({
                    payment_id: paymentResult.transactionId,
                    product_name: `Order ${orderId}`,
                    quantity: '1',
                    amount: order.amount.toString(),
                    currency: order.currency,
                    payer_name: req.user?.first_name + ' ' + req.user?.last_name,
                    payer_email: req.user?.email,
                    payment_status: 'COMPLETED',
                    payment_method: paymentMethod.toUpperCase(),
                });
            }
            return res.json({
                success: true,
                message: 'Payment processed successfully',
                data: paymentResult,
            });
        }
        catch (error) {
            console.error('Payment process error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async refundPayment(req, res) {
        try {
            const { paymentId } = req.params;
            const { reason: _reason } = req.body;
            const payment = await models_1.Payment.findOne({
                where: { id: paymentId },
            });
            if (!payment) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            const refundResult = { success: true, message: 'Refund processed' };
            if (refundResult.success) {
                payment.payment_status = 'REFUNDED';
                await payment.save();
            }
            return res.json({
                success: true,
                message: 'Payment refunded successfully',
                data: refundResult,
            });
        }
        catch (error) {
            console.error('Payment refund error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getPaymentHistory(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const payments = await models_1.Payment.findAndCountAll({
                include: [
                    {
                        model: models_1.Order,
                        as: 'order',
                        where: { userId: req.user?.id },
                    },
                ],
                offset,
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']],
            });
            return res.json({
                success: true,
                data: {
                    payments: payments.rows,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: payments.count,
                        pages: Math.ceil(payments.count / parseInt(limit)),
                    },
                },
            });
        }
        catch (error) {
            console.error('Payment history error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async getPayment(req, res) {
        try {
            const { id } = req.params;
            const payment = await models_1.Payment.findOne({
                where: { id },
            });
            if (!payment) {
                return res.status(404).json({ message: 'Payment not found' });
            }
            return res.json({
                success: true,
                data: { payment },
            });
        }
        catch (error) {
            console.error('Payment get error:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    }
    static async stripeWebhook(req, res) {
        try {
            const sig = req.headers['stripe-signature'];
            const endpointSecret = process.env['STRIPE_WEBHOOK_SECRET'];
            if (!endpointSecret) {
                console.error('STRIPE_WEBHOOK_SECRET not configured');
                return res.status(500).json({ message: 'Webhook secret not configured' });
            }
            let event;
            try {
                const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
            }
            catch (err) {
                console.error('Webhook signature verification failed:', err.message);
                return res.status(400).json({ message: 'Webhook signature verification failed' });
            }
            console.log('Received Stripe webhook event:', event.type);
            switch (event.type) {
                case 'checkout.session.completed':
                    await PaymentController.handleCheckoutSessionCompleted(event.data.object);
                    break;
                case 'payment_intent.succeeded':
                    await PaymentController.handlePaymentIntentSucceeded(event.data.object);
                    break;
                case 'invoice.payment_succeeded':
                    await PaymentController.handleInvoicePaymentSucceeded(event.data.object);
                    break;
                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }
            return res.json({ received: true });
        }
        catch (error) {
            console.error('Stripe webhook error:', error);
            return res.status(500).json({ message: 'Webhook processing failed' });
        }
    }
    static async handleCheckoutSessionCompleted(session) {
        try {
            console.log('Processing checkout session completed:', session.id);
            const metadata = session.metadata;
            const customerEmail = session.customer_details?.email;
            const customerName = session.customer_details?.name;
            if (!metadata || !customerEmail) {
                console.error('Missing metadata or customer email in session');
                return;
            }
            const userId = metadata.user_id;
            const isGuestCheckout = metadata.isGuestCheckout === 'true';
            const guestInfo = metadata.guest_info ? JSON.parse(metadata.guest_info) : null;
            let cartItems = [];
            if (metadata.cartItems) {
                try {
                    cartItems = JSON.parse(decodeURIComponent(metadata.cartItems));
                }
                catch (e) {
                    console.error('Failed to parse cartItems from metadata');
                }
            }
            if (cartItems.length === 0 && session.line_items?.data) {
                cartItems = session.line_items.data.map((item) => ({
                    service_name: item.description || item.price_data?.product_data?.name,
                    price: item.amount_total / 100,
                    qty: item.quantity,
                    total_price: (item.amount_total * item.quantity) / 100,
                    service_type: 'one_time'
                }));
            }
            let user;
            if (isGuestCheckout || userId === 'guest') {
                let firstName, lastName;
                if (guestInfo && guestInfo.first_name && guestInfo.last_name) {
                    firstName = guestInfo.first_name;
                    lastName = guestInfo.last_name;
                }
                else if (customerName) {
                    const [firstNamePart, ...lastNameParts] = customerName.split(' ');
                    firstName = firstNamePart;
                    lastName = lastNameParts.join(' ') || 'Guest';
                }
                else {
                    firstName = 'Guest';
                    lastName = 'User';
                }
                user = await models_1.User.findOne({ where: { email: customerEmail } });
                if (!user) {
                    try {
                        user = await models_1.User.create({
                            first_name: firstName,
                            last_name: lastName,
                            email: customerEmail,
                            phone_number: guestInfo?.phone || null,
                            password: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            role: 'guest',
                            is_active: 1
                        });
                    }
                    catch (error) {
                        if (error.name === 'SequelizeUniqueConstraintError') {
                            user = await models_1.User.findOne({ where: { email: customerEmail } });
                        }
                        else {
                            throw error;
                        }
                    }
                }
            }
            else {
                user = await models_1.User.findByPk(userId);
                if (!user) {
                    console.error('User not found for ID:', userId);
                    return;
                }
            }
            if (!user) {
                console.error('User not found or could not be created');
                return;
            }
            const order = await models_1.Order.create({
                user_id: user.id,
                transaction_id: session.id,
                amount: session.amount_total / 100,
                currency: session.currency?.toUpperCase() || 'USD',
                promocode: metadata.promoCode || null,
                Order_status: 0,
                is_active: 1,
                payer_name: customerName || `${user.first_name} ${user.last_name}`,
                payer_email: customerEmail,
                payment_status: 'PAID',
                payment_method: 'Stripe',
                order_type: metadata.order_type || 'one_time',
                order_reference_id: session.payment_intent || null
            });
            console.log('Order created with ID:', order.id);
            for (const item of cartItems) {
                await models_1.OrderItem.create({
                    order_id: order.id,
                    service_id: item.service_id || 0,
                    name: item.service_name,
                    price: item.price.toString(),
                    quantity: item.qty.toString(),
                    max_revision: parseInt(item.qty) * 3,
                    total_price: item.total_price.toString(),
                    service_type: item.service_type,
                    admin_is_read: 0,
                    user_is_read: 0
                });
            }
            const orderItems = await models_1.OrderItem.findAll({
                where: { order_id: order.id }
            });
            const userUrl = process.env['FRONTEND_URL'];
            const adminUrl = process.env['ADMIN_URL'];
            (0, EmailService_1.sendOrderSuccessEmail)({
                name: `${user.first_name} ${user.last_name}`,
                order_id: order.id,
                message: 'Thank you for your purchase. Your order has been processed successfully.',
                items: orderItems,
                url: `${userUrl}/order/${order.id}`,
                email: user.email
            });
            const admin = await models_1.User.findOne({ where: { role: 'admin' } });
            if (admin) {
                (0, EmailService_1.sendOrderSuccessEmail)({
                    name: `${admin.first_name} ${admin.last_name}`,
                    order_id: order.id,
                    items: orderItems,
                    message: 'New Order Arrived. All Engineers have been notified.',
                    url: `${adminUrl}/order-detail/${order.id}`,
                    email: admin.email
                });
            }
            const engineers = await models_1.User.findAll({ where: { role: 'engineer' } });
            for (const engineer of engineers) {
                (0, EmailService_1.sendOrderSuccessEmail)({
                    name: `${engineer.first_name} ${engineer.last_name}`,
                    order_id: order.id,
                    items: orderItems,
                    url: `${adminUrl}/order-detail/${order.id}`,
                    message: 'New Order Arrived. Click the link below and go to the dashboard.',
                    email: engineer.email
                });
            }
            console.log('Order processing completed successfully');
        }
        catch (error) {
            console.error('Error handling checkout session completed:', error);
        }
    }
    static async handlePaymentIntentSucceeded(paymentIntent) {
        try {
            console.log('Processing payment intent succeeded:', paymentIntent.id);
        }
        catch (error) {
            console.error('Error handling payment intent succeeded:', error);
        }
    }
    static async handleInvoicePaymentSucceeded(invoice) {
        try {
            console.log('Processing invoice payment succeeded:', invoice.id);
        }
        catch (error) {
            console.error('Error handling invoice payment succeeded:', error);
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=PaymentController.js.map