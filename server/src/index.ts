import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { apiLimiter, authLimiter, adminLimiter, passwordResetLimiter, productLimiter } from './middleware/rateLimit';
import { logger } from './lib/logger';
import { errorHandler } from './utils/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import reviewRoutes from './routes/reviews';
import adminRoutes from './routes/admin';
import activityRoutes from './routes/activity';
import notificationRoutes from './routes/notifications';
import settingsRoutes from './routes/settings';
import paymentMethodRoutes from './routes/paymentMethods';
import promotionRoutes from './routes/promotions';
import inventoryRoutes from './routes/inventory';
import adminShippingRoutes from './routes/adminShipping';
import adminPaymentsRoutes from './routes/adminPayments';
import flashSaleRoutes from './routes/flashSale';
import roleRoutes from './routes/roles';
import permissionRoutes from './routes/permissions';
import colorRoutes from './routes/colors';

// Load environment variables
dotenv.config();

const app = express();

// Port configuration with validation
const PORT = (() => {
  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('❌ Invalid PORT configuration. Using default port 3000.');
    return 3000;
  }
  return port;
})();

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration with validation
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:8080',
  // Only allow specific localhost ports in development
  ...(process.env.NODE_ENV === 'development' ? [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
  ] : [])
].filter(Boolean);

// Add production frontend URL if provided
if (process.env.PRODUCTION_FRONTEND_URL) {
  allowedOrigins.push(process.env.PRODUCTION_FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // In production, require origin
    if (process.env.NODE_ENV === 'production' && !origin) {
      return callback(new Error('CORS: Origin required in production'), false);
    }
    
    // Allow requests with no origin only in development (for testing tools)
    if (!origin) {
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS: Origin required'), false);
    }
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    logger.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // Cache preflight requests for 24 hours
}));
// Request size limits (adjust based on needs)
app.use(express.json({ limit: '5mb' })); // Reduced from 10mb for security
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Apply general API rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Koshiro Fashion API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      admin: '/api/admin',
      roles: '/api/roles',
      permissions: '/api/permissions'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin/shipping', adminShippingRoutes);
app.use('/api/admin/payments', adminPaymentsRoutes);
app.use('/api/flash-sales', flashSaleRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/colors', colorRoutes);

// Error handling middleware - use centralized error handler (must be last)
app.use(errorHandler);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const startTime = Date.now();
  
  // Log request
  logger.debug(`${req.method} ${req.originalUrl}`, { 
    ip: req.ip, 
    userAgent: req.get('User-Agent')?.substring(0, 50) || 'Unknown' 
  });
  
  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'debug';
    logger[logLevel](`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`, {
      statusCode: res.statusCode,
      duration
    });
  });
  
  next();
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, { ip: req.ip });
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      health: '/health',
      apiStatus: '/api/status',
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      admin: '/api/admin'
    }
  });
});

// Start server
const startServer = async () => {
  try {
    logger.info('Starting Koshiro Fashion API Server', {
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
    });
    
    // Validate environment variables
    const requiredEnvVars = ['MONGODB_URI'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      logger.error('Missing required environment variables', { missing: missingEnvVars });
      console.error('❌ Missing required environment variables:', missingEnvVars);
      console.error('💡 Please check your .env file');
      process.exit(1);
    }
    
    // Connect to database
    logger.info('Connecting to database...');
    await connectDB();
    logger.info('Database connected successfully');
    
    // Try to start server with automatic port handling
    await startServerWithPortHandling();

  } catch (error) {
    logger.error('Failed to start server', error);
    console.error('❌ Failed to start server:', error);
    console.error('💡 Check your database connection and environment variables');
    console.error('💡 Make sure MongoDB is running and accessible');
    process.exit(1);
  }
};

const startServerWithPortHandling = async (attemptPort: number = PORT, maxAttempts: number = 5): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Attempting to start server on port ${attemptPort}...`);
    
    // Validate port range
    if (attemptPort < 1 || attemptPort > 65535) {
      reject(new Error(`Invalid port number: ${attemptPort}. Port must be between 1 and 65535.`));
      return;
    }
    
    server = app.listen(attemptPort, '0.0.0.0', () => {
      const address = server?.address();
      const actualPort = (address && typeof address === 'object' && 'port' in address) 
        ? address.port 
        : attemptPort;
      
      console.log('\n🚀 ===========================================');
      console.log('   KOSHIRO FASHION API SERVER STARTED');
      console.log('🚀 ===========================================');
      console.log(`📡 Server running on port: ${actualPort}`);
      console.log(`🌐 API URL: http://localhost:${actualPort}`);
      console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
      console.log(`💾 Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log(`🔧 Process ID: ${process.pid}`);
      console.log(`💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
      console.log('🚀 ===========================================\n');
      resolve();
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${attemptPort} is already in use`);
        console.error(`💡 Process using port ${attemptPort}: ${error.message}`);
        
        if (attemptPort < PORT + maxAttempts) {
          console.log(`🔄 Trying next port: ${attemptPort + 1}`);
          server = null;
          startServerWithPortHandling(attemptPort + 1, maxAttempts)
            .then(resolve)
            .catch(reject);
        } else {
          console.error('❌ Could not find an available port after multiple attempts');
          console.error(`💡 Tried ports: ${PORT} to ${PORT + maxAttempts - 1}`);
          console.error('💡 Please kill existing processes or use a different port range');
          reject(new Error(`No available ports in range ${PORT}-${PORT + maxAttempts - 1}`));
        }
      } else if (error.code === 'EACCES') {
        console.error(`❌ Permission denied for port ${attemptPort}`);
        console.error('💡 Try using a port number above 1024 or run with sudo');
        reject(new Error(`Permission denied for port ${attemptPort}`));
      } else {
        console.error('❌ Server error:', error);
        reject(error);
      }
    });
  });
};

// Handle graceful shutdown
let server: ReturnType<typeof app.listen> | null = null;
let isShuttingDown = false;

const gracefulShutdown = (signal: string) => {
  if (isShuttingDown) {
    console.log('🛑 Force shutdown requested...');
    process.exit(1);
  }
  
  isShuttingDown = true;
  console.log(`\n🛑 ${signal} received, shutting down gracefully...`);
  console.log(`⏰ Shutdown initiated at: ${new Date().toISOString()}`);
  
  if (server) {
    console.log('🔄 Closing HTTP server...');
    server.close((err) => {
      if (err) {
        console.error('❌ Error closing server:', err);
        process.exit(1);
      }
      
      console.log('✅ HTTP server closed');
      console.log('👋 Koshiro Fashion API Server stopped gracefully');
      console.log(`⏰ Shutdown completed at: ${new Date().toISOString()}`);
      process.exit(0);
    });

    // Force close after 15 seconds
    setTimeout(() => {
      console.error('❌ Could not close connections in time, forcefully shutting down');
      console.error('💡 Some connections may have been terminated abruptly');
      process.exit(1);
    }, 15000);
  } else {
    console.log('👋 No server to close, exiting...');
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('📍 Stack trace:', error.stack);
  console.error('💡 Server will be terminated for safety');
  console.error('⏰ Exception occurred at:', new Date().toISOString());
  
  // Attempt graceful shutdown
  if (server && !isShuttingDown) {
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  } else {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('📍 Reason:', reason);
  console.error('💡 Server will be terminated for safety');
  console.error('⏰ Rejection occurred at:', new Date().toISOString());
  
  // Attempt graceful shutdown
  if (server && !isShuttingDown) {
    gracefulShutdown('UNHANDLED_REJECTION');
  } else {
    process.exit(1);
  }
});

// Start the server
startServer();
