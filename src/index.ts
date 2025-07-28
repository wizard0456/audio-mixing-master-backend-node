import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
// import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import apiRoutes from './routes/api';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Import services
import { initializeDatabase } from './config/database';
import { initializeEmailService } from './services/EmailService';
import { initializePaymentServices } from './services/PaymentService';
import './models'; // Import models to register associations

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env['PORT'] || 3000;



// Rate limiting
// const limiter = rateLimit({
//   windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
//   max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// Middleware
app.use(helmet());
// CORS configuration
const allowedOrigins = process.env['ALLOWED_ORIGINS']?.split(',') || [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'https://audio-mixing-master-frontend.vercel.app',
  'https://audio-mixing-master-admin-gold.vercel.app',
  'https://audio-mixing-master-test.vercel.app',
  'https://audio-mixing-master.vercel.app',
  'https://audio-mixing-master-admin.vercel.app',
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));
app.use(compression());
// Enhanced logging for debugging
app.use(morgan((tokens, req, res) => {
  const method = tokens['method']?.(req, res) || 'UNKNOWN';
  const url = tokens['url']?.(req, res) || '';
  const status = tokens['status']?.(req, res) || '0';
  const responseTime = tokens['response-time']?.(req, res) || '0';
  
  // Log only non-OPTIONS requests to reduce noise
  if (method !== 'OPTIONS') {
    console.log(`${method} ${url} ${status} ${responseTime}ms`);
  }
  
  return `${method} ${url} ${status} ${responseTime}ms`;
}));
// app.use(limiter);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static files with CORS headers
app.use('/uploads', (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static('uploads'));

app.use('/public', (_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
}, express.static('public'));

// Handle preflight requests more efficiently
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Root Route
app.get("/", (_req, res) => {
  res.send("🎉 Backend is running!");
});

// Image serving route with CORS headers
app.get('/public/gallary-images/:filename', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  const filePath = `${process.cwd()}/public/gallary-images/${req.params.filename}`;
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving image:', err);
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// Alias for gallery-images (correct spelling)
app.get('/public/gallery-images/:filename', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  const filePath = `${process.cwd()}/public/gallary-images/${req.params.filename}`;
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving image:', err);
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'],
  });
});

// API Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Initialize services and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Initialize email service (optional - won't crash if it fails)
    try {
      await initializeEmailService();
    } catch (error) {
      console.log('⚠️  Email service initialization failed, continuing without email support');
    }
    
    // Initialize payment services
    await initializePaymentServices();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env['NODE_ENV']}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app; 