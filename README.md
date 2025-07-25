# Audio Mixing & Mastering Backend API

A robust Node.js backend API for audio mixing and mastering services, built with Express.js and TypeScript.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **File Upload**: Secure audio file upload with validation and processing
- **Payment Integration**: Stripe and PayPal payment processing
- **Database**: Database ORM to be configured (Sequelize recommended)
- **Caching**: Redis for session and data caching
- **Email Service**: Nodemailer for transactional emails
- **API Documentation**: Comprehensive API endpoints
- **Testing**: Jest unit and integration tests
- **Docker Support**: Containerized deployment
- **Security**: Helmet, CORS, rate limiting, and input validation

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd audio-mixing-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL="mysql://username:password@localhost:5432/audio_mixing_db"
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Database Setup**
   ```bash
   # TODO: Configure your preferred ORM (Sequelize recommended)
   # npm run db:migrate
   # npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   ├── app.ts      # App configuration
│   └── database.ts # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── validators/      # Input validation
└── index.ts         # Application entry point
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Service Endpoints

- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Order Endpoints

- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status

### Payment Endpoints

- `POST /api/payments/stripe/create-payment-intent` - Create Stripe payment
- `POST /api/payments/paypal/create-order` - Create PayPal order
- `POST /api/payments/webhook` - Payment webhooks

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run clean` - Clean build directory
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
REDIS_URL=your-production-redis-url
STRIPE_SECRET_KEY=your-stripe-secret-key
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

### Build for Production

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@audiomixing.com or create an issue in the repository.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your environment variables:**
   - Copy `env.example` to `.env` and update as needed.

3. **Set up the database:**
    - Configure your preferred database and ORM in the `.env` file
   - Set up database migrations and seeding according to your chosen ORM

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

See `env.example` for all available environment variables.