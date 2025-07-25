# Payment API Documentation

## Overview

The payment API supports both authenticated users and guest checkout with Stripe integration. The API handles the payment request structure you specified and provides flexible payment processing.

## Payment Request Structure

### Endpoint
```
POST /api/process-payment
```

### Request Body Structure

```json
{
  "payment_method_id": "pm_1234567890abcdef", // Stripe payment method ID
  "amount": 2500, // Amount in cents (e.g., $25.00 = 2500)
  "currency": "usd",
  "user_id": "guest", // or user ID for authenticated users
  "cart_items": [
    {
      "service_id": 1,
      "service_name": "Audio Mixing",
      "price": 2500, // in cents
      "qty": 1,
      "total_price": 2500,
      "service_type": "one_time"
    }
  ],
  "promoCode": "DISCOUNT10", // optional
  "isGuestCheckout": true, // true for guest checkout
  "guest_info": {
    "first_name": "John",
    "last_name": "Doe", 
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  }
}
```

### For Authenticated Users

```json
{
  "payment_method_id": "pm_1234567890abcdef",
  "amount": 2500,
  "currency": "usd", 
  "user_id": "123", // actual user ID
  "cart_items": [...],
  "promoCode": "DISCOUNT10",
  "isGuestCheckout": false,
  "guest_info": null
}
```

## Response Structure

### Success Response
```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_1234567890abcdef",
    "status": "succeeded",
    "amount": 2500,
    "currency": "usd"
  },
  "clientSecret": "pi_1234567890abcdef_secret_...",
  "amount": 2500,
  "currency": "usd",
  "user_id": "guest",
  "isGuestCheckout": true
}
```

### Error Response
```json
{
  "message": "Payment failed",
  "error": "Insufficient funds"
}
```

## Alternative Endpoints

### 1. Create Payment Intent
```
POST /api/stripe/intent
POST /api/stripe/intent/guest
```

**Request:**
```json
{
  "amount": 2500,
  "cartItems": [...],
  "finalTotal": 2500,
  "currency": "usd",
  "isGuestCheckout": true,
  "guest_info": {...}
}
```

**Response:**
```json
{
  "clientSecret": "pi_..._secret_...",
  "paymentIntentId": "pi_1234567890abcdef",
  "amount": 2500,
  "currency": "usd"
}
```

### 2. Stripe Payment (Checkout Session)
```
POST /api/stripe/pay
POST /api/stripe/pay/guest
```

**Request:**
```json
{
  "cartItems": [...],
  "amount": 2500,
  "currency": "USD",
  "promoCode": "DISCOUNT10",
  "user_id": "guest",
  "order_type": "one_time",
  "finalTotal": 2500,
  "isGuestCheckout": true,
  "guest_info": {...}
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_..."
}
```

## Guest Checkout Flow

1. **Collect Guest Information**: Gather guest details (name, email, phone)
2. **Create Payment Intent**: Use `/api/stripe/intent/guest` to create payment intent
3. **Process Payment**: Use `/api/process-payment` with guest information
4. **Handle Success**: Redirect to success page with order details

## Authenticated User Flow

1. **User Login**: User must be authenticated
2. **Create Payment Intent**: Use `/api/stripe/intent` 
3. **Process Payment**: Use `/api/process-payment` with user ID
4. **Handle Success**: Redirect to success page

## Success Callback

After successful payment, the system will:

1. Create or find user account (for guests)
2. Create order record
3. Create order items
4. Handle promo codes
5. Send confirmation emails
6. Clear cart items (for one-time payments)

### Success URL Parameters
```
/success?amount=2500&currency=usd&promoCode=DISCOUNT10&cartItems=...&user_id=guest&transaction_id=pi_...&payer_name=John%20Doe&payer_email=john.doe@example.com&order_type=one_time&isGuestCheckout=true&guest_info=...
```

## Error Handling

### Common Errors

1. **Invalid Payment Method**: Payment method ID is invalid or expired
2. **Insufficient Funds**: Card has insufficient funds
3. **Invalid Amount**: Amount is zero or negative
4. **Missing Required Fields**: Required fields are missing from request

### Error Response Format
```json
{
  "message": "Payment failed",
  "error": "Specific error message"
}
```

## Amount Handling

- **Input**: Amount can be provided in dollars (e.g., 25.00) or cents (e.g., 2500)
- **Processing**: System automatically detects and converts to cents for Stripe
- **Output**: All amounts in responses are in cents

## Currency Support

Currently supports:
- `usd` (default)
- `eur`
- `gbp`
- And other Stripe-supported currencies

## Security Features

1. **Authentication**: Optional auth middleware for guest checkout
2. **Input Validation**: All inputs are validated
3. **Error Handling**: Comprehensive error handling and logging
4. **Guest User Creation**: Secure guest user creation with temporary passwords

## Testing

### Test Card Numbers (Stripe Test Mode)
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Insufficient Funds**: 4000 0000 0000 9995

### Test Environment Setup
1. Set `STRIPE_SECRET_KEY` to test key
2. Use test payment method IDs
3. Monitor logs for payment processing

## Integration Examples

### Frontend Integration (React/Next.js)

```javascript
// Create payment intent
const createPaymentIntent = async (paymentData) => {
  const response = await fetch('/api/stripe/intent/guest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  return response.json();
};

// Process payment
const processPayment = async (paymentData) => {
  const response = await fetch('/api/process-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  return response.json();
};

// Example usage
const handlePayment = async () => {
  const paymentData = {
    payment_method_id: 'pm_1234567890abcdef',
    amount: 2500, // $25.00 in cents
    currency: 'usd',
    user_id: 'guest',
    cart_items: [
      {
        service_id: 1,
        service_name: 'Audio Mixing',
        price: 2500,
        qty: 1,
        total_price: 2500,
        service_type: 'one_time'
      }
    ],
    promoCode: 'DISCOUNT10',
    isGuestCheckout: true,
    guest_info: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890'
    }
  };

  try {
    const result = await processPayment(paymentData);
    if (result.success) {
      // Handle success
      console.log('Payment successful:', result);
    } else {
      // Handle error
      console.error('Payment failed:', result.message);
    }
  } catch (error) {
    console.error('Payment error:', error);
  }
};
```

This API structure provides a flexible and secure way to handle both authenticated and guest payments with comprehensive error handling and support for the exact JSON structure you specified. 