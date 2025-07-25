import { Response, Request } from 'express';
import { Payment, Order, User, Service, Cart, OrderItem, OrderCoupon, Revision } from '../models';
import { AuthRequest } from '../middleware/auth';
import { 
  createStripePaymentIntent, 
  createPayPalOrder,
  createStripeSubscription,
  createPayPalSubscription,
  getPayPalOrderDetails,
  createStripeCheckoutSession
} from '../services/PaymentService';
import { sendOrderSuccessEmail, sendGiftCardEmail } from '../services/EmailService';
import { v4 as uuidv4 } from 'uuid';

export class PaymentController {
  // PayPal payment - matches Laravel implementation
  static async paypal(req: AuthRequest | any, res: Response) {
    try {
      const { amount, currency = 'USD', cartItem } = req.body;

      if (!amount || !cartItem) {
        return res.status(400).json({ message: 'Amount and cart items are required' });
      }

      const paypalOrder = await createPayPalOrder(amount, currency);

      if (paypalOrder.id) {
        // Find the approve link
        const approveLink = paypalOrder.links?.find((link: any) => link.rel === 'approve');
        
        if (approveLink) {
          return res.json({
            approve_link: approveLink.href
          });
        } else {
          console.error('No approve link found in PayPal response', paypalOrder);
          return res.status(500).json({ message: 'PayPal order creation failed' });
        }
      } else {
        console.error('PayPal create order failed', paypalOrder);
        return res.status(500).json({ message: 'PayPal order creation failed' });
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Create Stripe payment intent - for frontend integration (works for both auth and guest)
  static async createPaymentIntent(req: AuthRequest | any, res: Response) {
    try {
      const { 
        amount, 
        user_id: _user_id, 
        cartItems,
        finalTotal,
        currency = 'usd'
      } = req.body;

      if (!amount || !cartItems) {
        return res.status(400).json({ message: 'Amount and cart items are required' });
      }

      // Use finalTotal if provided, otherwise use amount
      const paymentAmount = finalTotal || amount;
      
      // Convert amount to cents for Stripe if not already in cents
      const amountInCents = typeof paymentAmount === 'number' && paymentAmount > 100 ? 
        paymentAmount : // Already in cents
        Math.round(paymentAmount * 100); // Convert to cents

      const paymentIntent = await createStripePaymentIntent(amountInCents / 100, currency.toLowerCase());

      return res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInCents,
        currency: currency.toLowerCase()
      });
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ message: `Error: ${errorMessage}` });
    }
  }

  // Stripe payment - matches Laravel implementation (works for both auth and guest)
  static async stripePay(req: AuthRequest | any, res: Response) {
    try {
      const { 
        cart_items, // Updated to match the request structure
        cartItems, // Keep for backward compatibility
        amount, 
        currency = 'USD', 
        promoCode, 
        user_id, 
        order_type = 'one_time', 
        payment_method_id, 
        customerEmail, 
        // New fields from the specified structure
        finalTotal,
        isGuestCheckout,
        guest_info
      } = req.body;

      // Use cart_items if provided, otherwise fall back to cartItems for backward compatibility
      const cartItemsToUse = cart_items || cartItems;

      if (!cartItemsToUse || !amount) {
        return res.status(400).json({ message: 'Cart items and amount are required' });
      }

      // Handle both authenticated and guest users
      const userEmail = req.user?.email || customerEmail || (guest_info?.email);
      const currentUserId = req.user?.id || user_id || 'guest';

      // Use finalTotal if provided, otherwise use amount
      const paymentAmount = finalTotal || amount;
      
      // Convert amount to cents for Stripe if not already in cents
      const amountInCents = typeof paymentAmount === 'number' && paymentAmount > 100 ? 
        paymentAmount : // Already in cents
        Math.round(paymentAmount * 100); // Convert to cents

      if (payment_method_id) {
        // Handle payment method flow (for authenticated users with payment method)
        try {
          const paymentIntent = await createStripePaymentIntent(amountInCents / 100, currency.toLowerCase());
          
          // Confirm the payment with the payment method
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
        } catch (error) {
          console.error('Stripe payment method error:', error);
          return res.status(500).json({ message: 'Payment failed' });
        }
      } else {
        // Handle checkout session flow (for guest users or without payment method)
        const lineItems = cartItemsToUse.map((item: any) => ({
          price_data: {
            product_data: {
              name: item.service_name,
            },
            currency: currency.toUpperCase(),
            unit_amount: typeof item.price === 'number' && item.price > 100 ? 
              item.price : // Already in cents
              Math.round(item.price * 100), // Convert to cents
          },
          quantity: item.qty,
        }));

        // Prepare metadata with guest info if available
        const metadata: any = {
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

        const session = await createStripeCheckoutSession({
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
    } catch (error) {
      console.error('Stripe payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ message: `Error: ${errorMessage}` });
    }
  }

  static async stripeSubscribe(req: AuthRequest | any, res: Response) {
    try {
      const { service_id, customerId, priceId, customerEmail, customerName } = req.body;

      if (!service_id || !priceId) {
        return res.status(400).json({ message: 'Service ID and price ID are required' });
      }

      const service = await Service.findByPk(service_id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      // Handle both authenticated and guest users
      const userEmail = customerEmail;
      const userName = customerName;

      // Create or get customer
      const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);
      let customer;
      
      if (customerId) {
        customer = await stripe.customers.retrieve(customerId);
      } else {
        // Create new customer for guest
        customer = await stripe.customers.create({
          email: userEmail,
          name: userName,
        });
      }

      // Log before calling createStripeSubscription
      console.log("About to call createStripeSubscription with:", {
        customerId: customer.id,
        priceId: priceId
      });

      const subscription = await createStripeSubscription(customer.id, priceId);
      console.log(`subscription: ${JSON.stringify(subscription)}`);

      return res.json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          status: subscription.status,
          clientSecret: subscription.latest_invoice && typeof subscription.latest_invoice === 'object' 
            ? (subscription.latest_invoice as any).payment_intent?.client_secret 
            : undefined,
        },
      });
    } catch (error) {
      // Enhanced error logging
      console.error('Stripe subscription error:', JSON.stringify(error, null, 2));
      
      // Log Stripe-specific error details
      if (error && typeof error === 'object' && 'raw' in error) {
        console.error('Stripe error details:', error.raw);
      }
      
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ message: `Error: ${errorMessage}` });
    }
  }

  // PayPal subscription
  static async createSubscription(req: AuthRequest, res: Response) {
    try {
      const { service_id, planId } = req.body;
      const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Start tomorrow

      if (!service_id || !planId) {
        return res.status(400).json({ message: 'Service ID and plan ID are required' });
      }

      const service = await Service.findByPk(service_id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      const subscription = await createPayPalSubscription(planId, startTime);

      return res.json({
        success: true,
        data: {
          subscriptionId: subscription.id,
          status: subscription.status,
          links: subscription.links,
        },
      });
    } catch (error) {
      console.error('PayPal subscription error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get order details
  static async getOrderDetails(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.query;

      if (!orderId) {
        return res.status(400).json({ message: 'Order ID is required' });
      }

      const orderDetails = await getPayPalOrderDetails(orderId as string);

      return res.json({
        success: true,
        data: orderDetails,
      });
    } catch (error) {
      console.error('Get order details error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get order details by ID
  static async orderDetails(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Retrieve the order by id
      const order = await Order.findByPk(id);
      
      if (!order) {
        return res.status(200).json({ error: 'No order found' });
      }
      
      // Retrieve the associated order items
      const orderItems = await OrderItem.findAll({
        where: { order_id: id }
      });
      
      // Handle coupon logic
      let coupon = null;
      if (order.promocode) {
        coupon = await OrderCoupon.findOne({
          where: { 
            code: order.promocode,
            order_id: id 
          }
        });
      }
      
      // Get user details
      const user = await User.findByPk(order.user_id);
      const username = user ? `${user.first_name} ${user.last_name}` : order.payer_name;
      const useremail = user?.email || order.payer_email;
      
      // Get revisions
      const revision = await Revision.findAll({ where: { order_id: id } });
      
      // Check for gift card services
      const serviceIds = orderItems.map(item => item.service_id);
      let is_giftcard = 0;
      
      if (serviceIds.length > 0) {
        const hasGiftcard = await Service.findOne({
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
    } catch (error) {
      console.error('Order details error:', error);
      return res.status(500).json({ error: error instanceof Error ? error.message : 'Server error' });
    }
  }

  // Get user orders
  static async userOrders(req: AuthRequest, res: Response) {
    try {
      const { user_id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const orders = await Order.findAndCountAll({
        where: { user_id },
        include: [
          { 
            model: OrderItem, 
            as: 'orderItems',
            include: [
              { model: Service, as: 'service' }
            ]
          },
        ],
        offset,
        limit: parseInt(limit as string),
        order: [['createdAt', 'DESC']],
      });

      // Transform each order to match the expected structure
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
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: orders.count,
            pages: Math.ceil(orders.count / parseInt(limit as string)),
          },
        },
      });
    } catch (error) {
      console.error('User orders error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Success callback - handles both PayPal and Stripe
  static async success(req: AuthRequest | any, res: Response) {
    try {
      const { session_id } = req.query;
      
      // If session_id is provided, this is a Stripe checkout success
      if (session_id) {
        try {
          const stripe = require('stripe')(process.env['STRIPE_SECRET_KEY']);
          const session = await stripe.checkout.sessions.retrieve(session_id as string);
          
          if (session.payment_status === 'paid') {
            // Find the order by transaction_id (session_id)
            const order = await Order.findOne({ where: { transaction_id: session_id } });
            
            if (order) {
              return res.json({
                success: true,
                message: 'Payment successful! Your order has been processed.',
                order_id: order.id,
                session_id: session_id
              });
            } else {
              return res.json({
                success: true,
                message: 'Payment successful! Your order is being processed.',
                session_id: session_id
              });
            }
          } else {
            return res.status(400).json({ message: 'Payment not completed' });
          }
        } catch (error) {
          console.error('Error retrieving Stripe session:', error);
          return res.status(500).json({ message: 'Error processing payment' });
        }
      }

      // Handle PayPal success (existing logic)
      const {
        user_id,
        transaction_id,
        amount,
        payer_name,
        payer_email,
        order_type,
        payment_method,
        cartItems,
        promoCode,
        order_id,
        isGuestCheckout,
        guest_info
      } = req.body;

      // Validate required fields
      if (!transaction_id || !amount || !payer_name || !payer_email || !order_type || !payment_method || !cartItems) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      let user;
      
      // Handle guest users
      if (!user_id || user_id === 'guest' || isGuestCheckout) {
        // Use guest_info if available, otherwise parse from payer_name
        let firstName, lastName;
        
        if (guest_info && guest_info.first_name && guest_info.last_name) {
          firstName = guest_info.first_name;
          lastName = guest_info.last_name;
        } else {
          const [firstNamePart, ...lastNameParts] = payer_name.split(' ');
          firstName = firstNamePart;
          lastName = lastNameParts.join(' ') || 'Guest';
        }
        
        console.log('Creating guest user:', { firstName, lastName, email: payer_email });
        user = await User.findOne({ where: { email: payer_email } });
        if (!user) {
          try {
            user = await User.create({
              first_name: firstName,
              last_name: lastName,
              email: payer_email,
              phone_number: guest_info?.phone || null,
              password: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Temporary password
              role: 'guest',
              is_active: 1
            });
          } catch (error: any) {
            console.error('Error creating guest user:', error);
            
            // Handle unique constraint errors
            if (error.name === 'SequelizeUniqueConstraintError') {
              // If user creation fails due to unique constraint, try to find the existing user
              user = await User.findOne({ where: { email: payer_email } });
              if (!user) {
                return res.status(400).json({ message: 'User with this email already exists' });
              }
            } else {
              return res.status(500).json({ message: 'Failed to create user account' });
            }
          }
        }
        
        console.log('Guest user created with ID:', user.id);
      } else {
        // Find existing user
        user = await User.findByPk(user_id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
        console.log('Using existing user with ID:', user.id);
      }

      // Create order
      console.log('Creating order with user_id:', user.id);
      
      const order = await Order.create({
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

      // Process each cart item
      for (const item of cartItems) {
        const service = await Service.findByPk(item.service_id);
        
        if (service && service.category_id === 15) {
          // Handle gift card purchase
          const giftCode = `gift-${uuidv4().toUpperCase().replace(/-/g, '')}`;
          
          // Create user wallet entry (you'll need to create this model)
          // UserWallet.create({
          //   user_id: parseInt(user_id),
          //   promocode: giftCode,
          //   amount: parseFloat(item.price),
          // });

          // Send gift card email
          await sendGiftCardEmail({
            name: `${user.first_name} ${user.last_name}`,
            message: `Thank you for your purchase. Your gift card amount is: $${item.price} and your code is:`,
            code: giftCode,
            email: user.email
          });
        }

        // Create order item
        await OrderItem.create({
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

      // Handle coupon/promocode logic
      if (promoCode) {
        if (promoCode.startsWith('gift-')) {
          // Handle gift card usage
          // const userWallet = await UserWallet.findOne({ where: { promocode } });
          // if (userWallet) {
          //   const usableAmount = Math.min(userWallet.amount, totalAmount);
          //   userWallet.use_amount += usableAmount;
          //   userWallet.amount = Math.max(0, userWallet.amount - totalAmount);
          //   await userWallet.save();
          // }
        } else {
          // Handle regular coupon
          // const coupon = await Coupon.findOne({ where: { code: promoCode } });
          // if (coupon) {
          //   coupon.uses += 1;
          //   await coupon.save();
          // }
        }
      }

      // Remove items from cart if payment type is one_time
      if (order_type === 'one_time') {
        for (const item of cartItems) {
          await Cart.destroy({
            where: {
              service_id: item.service_id,
              user_id: user.id
            }
          });
        }
      }

      // Get order items for email
      const orderItems = await OrderItem.findAll({
        where: { order_id: order.id }
      });

      // Send emails
      const userUrl = process.env['FRONTEND_URL'];
      const adminUrl = process.env['ADMIN_URL'];

      // Email to user
      sendOrderSuccessEmail({
        name: `${user.first_name} ${user.last_name}`,
        order_id: order.id,
        message: 'Thank you for your purchase. Your order has been processed successfully. Your order details are as follows',
        items: orderItems,
        url: `${userUrl}/order/${order.id}`,
        email: user.email
      });

      // Email to admin
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (admin) {
        sendOrderSuccessEmail({
          name: `${admin.first_name} ${admin.last_name}`,
          order_id: order.id,
          items: orderItems,
          message: 'New Order Arrived. All Engineer has been notified',
          url: `${adminUrl}/order-detail/${order.id}`,
          email: admin.email
        });
      }

      // Email to engineers
      const engineers = await User.findAll({ where: { role: 'engineer' } });
      for (const engineer of engineers) {
        sendOrderSuccessEmail({
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

    } catch (error) {
      console.error('Payment success error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ message: `Error: ${errorMessage}` });
    }
  }

  // PayPal cancel callback
  static async cancel(_req: AuthRequest | any, res: Response) {
    try {
      return res.json({
        success: false,
        message: 'Payment cancelled',
      });
    } catch (error) {
      console.error('PayPal cancel error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Process payment
  static async processPayment(req: AuthRequest, res: Response) {
    try {
      const { orderId, paymentMethod, paymentData } = req.body;

      if (!orderId || !paymentMethod) {
        return res.status(400).json({ message: 'Order ID and payment method are required' });
      }

      const order = await Order.findOne({
        where: { id: orderId },
        include: [{ model: User, as: 'user' }],
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
          paymentResult = await createStripePaymentIntent(paymentData.amount, paymentData.currency);
          break;
        case 'paypal':
          paymentResult = await createPayPalOrder(paymentData.amount, paymentData.currency);
          break;
        default:
          return res.status(400).json({ message: 'Invalid payment method' });
      }

      if (paymentResult.success) {
        // Update order status
        order.Order_status = 1; // PAID
        await order.save();

        // Create payment record
        await Payment.create({
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
    } catch (error) {
      console.error('Payment process error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Refund payment
  static async refundPayment(req: AuthRequest, res: Response) {
    try {
      const { paymentId } = req.params;
      const { reason: _reason } = req.body;

      const payment = await Payment.findOne({
        where: { id: paymentId },
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      // TODO: Implement refund logic with payment gateway
      const refundResult = { success: true, message: 'Refund processed' };

      if (refundResult.success) {
        // Update payment status
        payment.payment_status = 'REFUNDED';
        await payment.save();
      }

      return res.json({
        success: true,
        message: 'Payment refunded successfully',
        data: refundResult,
      });
    } catch (error) {
      console.error('Payment refund error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get payment history
  static async getPaymentHistory(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const payments = await Payment.findAndCountAll({
        include: [
          {
            model: Order,
            as: 'order',
            where: { userId: req.user?.id },
          },
        ],
        offset,
        limit: parseInt(limit as string),
        order: [['createdAt', 'DESC']],
      });

      return res.json({
        success: true,
        data: {
          payments: payments.rows,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: payments.count,
            pages: Math.ceil(payments.count / parseInt(limit as string)),
          },
        },
      });
    } catch (error) {
      console.error('Payment history error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Get payment by ID
  static async getPayment(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const payment = await Payment.findOne({
        where: { id },
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      return res.json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      console.error('Payment get error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  // Stripe webhook handler
  static async stripeWebhook(req: Request, res: Response) {
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
        event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: 'Webhook signature verification failed' });
      }

      console.log('Received Stripe webhook event:', event.type);

      // Handle the event
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
    } catch (error) {
      console.error('Stripe webhook error:', error);
      return res.status(500).json({ message: 'Webhook processing failed' });
    }
  }

  // Handle checkout session completed
  static async handleCheckoutSessionCompleted(session: any) {
    try {
      console.log('Processing checkout session completed:', session.id);
      
      const metadata = session.metadata;
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name;
      
      if (!metadata || !customerEmail) {
        console.error('Missing metadata or customer email in session');
        return;
      }

      // Extract data from metadata
      const userId = metadata.user_id;
      const isGuestCheckout = metadata.isGuestCheckout === 'true';
      const guestInfo = metadata.guest_info ? JSON.parse(metadata.guest_info) : null;
      
      // Parse cart items from metadata or use line items
      let cartItems = [];
      if (metadata.cartItems) {
        try {
          cartItems = JSON.parse(decodeURIComponent(metadata.cartItems));
        } catch (e) {
          console.error('Failed to parse cartItems from metadata');
        }
      }

      // If no cart items in metadata, try to extract from line items
      if (cartItems.length === 0 && session.line_items?.data) {
        cartItems = session.line_items.data.map((item: any) => ({
          service_name: item.description || item.price_data?.product_data?.name,
          price: item.amount_total / 100, // Convert from cents
          qty: item.quantity,
          total_price: (item.amount_total * item.quantity) / 100,
          service_type: 'one_time'
        }));
      }

      // Create or find user
      let user;
      if (isGuestCheckout || userId === 'guest') {
        // Handle guest user creation
        let firstName, lastName;
        
        if (guestInfo && guestInfo.first_name && guestInfo.last_name) {
          firstName = guestInfo.first_name;
          lastName = guestInfo.last_name;
        } else if (customerName) {
          const [firstNamePart, ...lastNameParts] = customerName.split(' ');
          firstName = firstNamePart;
          lastName = lastNameParts.join(' ') || 'Guest';
        } else {
          firstName = 'Guest';
          lastName = 'User';
        }
        
        user = await User.findOne({ where: { email: customerEmail } });
        if (!user) {
          try {
            user = await User.create({
              first_name: firstName,
              last_name: lastName,
              email: customerEmail,
              phone_number: guestInfo?.phone || null,
              password: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              role: 'guest',
              is_active: 1
            });
          } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
              user = await User.findOne({ where: { email: customerEmail } });
            } else {
              throw error;
            }
          }
        }
      } else {
        // Find existing user
        user = await User.findByPk(userId);
        if (!user) {
          console.error('User not found for ID:', userId);
          return;
        }
      }

      // Create order
      if (!user) {
        console.error('User not found or could not be created');
        return;
      }

      const order = await Order.create({
        user_id: user.id,
        transaction_id: session.id,
        amount: session.amount_total / 100, // Convert from cents
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

      // Create order items
      for (const item of cartItems) {
        await OrderItem.create({
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

      // Get order items for email
      const orderItems = await OrderItem.findAll({
        where: { order_id: order.id }
      });

      // Send emails
      const userUrl = process.env['FRONTEND_URL'];
      const adminUrl = process.env['ADMIN_URL'];

      // Email to user
      sendOrderSuccessEmail({
        name: `${user.first_name} ${user.last_name}`,
        order_id: order.id,
        message: 'Thank you for your purchase. Your order has been processed successfully.',
        items: orderItems,
        url: `${userUrl}/order/${order.id}`,
        email: user.email
      });

      // Email to admin
      const admin = await User.findOne({ where: { role: 'admin' } });
      if (admin) {
        sendOrderSuccessEmail({
          name: `${admin.first_name} ${admin.last_name}`,
          order_id: order.id,
          items: orderItems,
          message: 'New Order Arrived. All Engineers have been notified.',
          url: `${adminUrl}/order-detail/${order.id}`,
          email: admin.email
        });
      }

      // Email to engineers
      const engineers = await User.findAll({ where: { role: 'engineer' } });
      for (const engineer of engineers) {
        sendOrderSuccessEmail({
          name: `${engineer.first_name} ${engineer.last_name}`,
          order_id: order.id,
          items: orderItems,
          url: `${adminUrl}/order-detail/${order.id}`,
          message: 'New Order Arrived. Click the link below and go to the dashboard.',
          email: engineer.email
        });
      }

      console.log('Order processing completed successfully');
    } catch (error) {
      console.error('Error handling checkout session completed:', error);
    }
  }

  // Handle payment intent succeeded
  static async handlePaymentIntentSucceeded(paymentIntent: any) {
    try {
      console.log('Processing payment intent succeeded:', paymentIntent.id);
      // This can be used for additional payment intent processing if needed
    } catch (error) {
      console.error('Error handling payment intent succeeded:', error);
    }
  }

  // Handle invoice payment succeeded (for subscriptions)
  static async handleInvoicePaymentSucceeded(invoice: any) {
    try {
      console.log('Processing invoice payment succeeded:', invoice.id);
      // This can be used for subscription payment processing if needed
    } catch (error) {
      console.error('Error handling invoice payment succeeded:', error);
    }
  }
} 