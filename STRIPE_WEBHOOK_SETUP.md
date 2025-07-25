# Stripe Webhook Setup Guide

## Overview

This guide explains how to set up Stripe webhooks to automatically process payments and create orders in your database.

## Problem Solved

Previously, when Stripe payments were successful, orders weren't being created in the database because:
1. The success URL was just a redirect, not an API call
2. There was no webhook endpoint to handle payment completion events
3. The frontend wasn't calling the success API endpoint

## Solution

We've added a Stripe webhook endpoint that automatically:
1. Receives payment completion events from Stripe
2. Creates orders in the database
3. Sends confirmation emails
4. Handles both guest and authenticated users

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook endpoint secret
FRONTEND_URL=http://localhost:3000 # Your frontend URL
ADMIN_URL=http://localhost:3000/admin # Your admin URL
```

### 2. Create Webhook Endpoint in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://your-domain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded` (for subscriptions)
5. Copy the webhook signing secret and add it to your `.env` file

### 3. Update Your Frontend

Your frontend should now redirect to the success page with just the session ID:

```javascript
// After successful Stripe checkout
window.location.href = `${FRONTEND_URL}/success?session_id=${sessionId}`;
```

### 4. Test the Webhook

1. Use Stripe's webhook testing tool in the dashboard
2. Send a test `checkout.session.completed` event
3. Check your server logs for webhook processing
4. Verify that orders are created in your database

## How It Works

### Payment Flow

1. **User initiates payment**: Frontend calls `/api/stripe/pay` or `/api/stripe/pay/guest`
2. **Stripe checkout session created**: Returns checkout URL with metadata
3. **User completes payment**: On Stripe's hosted page
4. **Stripe sends webhook**: `checkout.session.completed` event to `/api/stripe/webhook`
5. **Order created automatically**: Webhook handler creates order, order items, and sends emails
6. **User redirected**: To success page with session ID

### Webhook Processing

The webhook handler:
1. Verifies the webhook signature
2. Extracts metadata from the session
3. Creates or finds the user (guest or authenticated)
4. Creates the order record
5. Creates order items
6. Sends confirmation emails to user, admin, and engineers

### Metadata Structure

The checkout session includes metadata:
```json
{
  "user_id": "guest",
  "isGuestCheckout": "true",
  "order_type": "one_time",
  "promoCode": "",
  "cartItems": "encoded_cart_items_json",
  "guest_info": "encoded_guest_info_json"
}
```

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**:
   - Check webhook endpoint URL is correct
   - Verify webhook secret in environment variables
   - Check server logs for webhook processing

2. **Orders not being created**:
   - Check webhook signature verification
   - Verify metadata is being passed correctly
   - Check database connection and models

3. **Emails not being sent**:
   - Check email service configuration
   - Verify admin and engineer users exist
   - Check email service logs

### Debugging

Add these logs to check webhook processing:

```javascript
console.log('Webhook received:', event.type);
console.log('Session metadata:', session.metadata);
console.log('Customer details:', session.customer_details);
```

## Security

- Webhook signature verification prevents fake events
- Environment variables keep secrets secure
- No authentication required for webhook endpoint (Stripe handles security)

## Testing

### Test Cards (Stripe Test Mode)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

### Webhook Testing
1. Use Stripe CLI to forward webhooks locally
2. Use Stripe Dashboard webhook testing tool
3. Check server logs for webhook processing
4. Verify database records are created

## Next Steps

1. Set up the webhook endpoint in Stripe Dashboard
2. Add the webhook secret to your environment variables
3. Test with a small payment
4. Monitor logs to ensure webhook processing works
5. Update your frontend to use the new success URL format 