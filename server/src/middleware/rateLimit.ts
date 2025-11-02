import rateLimit, { Options } from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Helper function to check if request should skip rate limiting
 */
const shouldSkipRateLimit = (req: Request): boolean => {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  
  // Skip for localhost/IPs
  const ip = req.ip || req.socket.remoteAddress || '';
  const isLocalhost = ip === '127.0.0.1' || 
                      ip === '::1' || 
                      ip === '::ffff:127.0.0.1' ||
                      ip.startsWith('192.168.') ||
                      ip.startsWith('10.') ||
                      ip.startsWith('172.16.') ||
                      ip.startsWith('172.17.') ||
                      ip.startsWith('172.18.') ||
                      ip.startsWith('172.19.') ||
                      ip.startsWith('172.20.') ||
                      ip.startsWith('172.21.') ||
                      ip.startsWith('172.22.') ||
                      ip.startsWith('172.23.') ||
                      ip.startsWith('172.24.') ||
                      ip.startsWith('172.25.') ||
                      ip.startsWith('172.26.') ||
                      ip.startsWith('172.27.') ||
                      ip.startsWith('172.28.') ||
                      ip.startsWith('172.29.') ||
                      ip.startsWith('172.30.') ||
                      ip.startsWith('172.31.');
  
  // Skip for health checks
  const isHealthCheck = req.path === '/health' || req.path === '/api/status';
  
  return isLocalhost || isHealthCheck;
};

/**
 * General API rate limiter
 * Limits: 
 * - Development: Unlimited
 * - Production: 500 requests per 15 minutes per IP (increased from 100)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 500 : 10000, // Much higher limit in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60,
      timestamp: new Date().toISOString()
    });
  },
  skip: shouldSkipRateLimit
});

/**
 * Auth endpoints rate limiter
 * Limits: 
 * - Development: 50 requests per 15 minutes
 * - Production: 10 requests per 15 minutes per IP
 * More restrictive for login/register endpoints to prevent brute force
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // Increased limit
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts from this IP, please try again later.',
      retryAfter: 15 * 60,
      timestamp: new Date().toISOString()
    });
  },
  skip: shouldSkipRateLimit,
  // Use IP + email for more granular rate limiting
  // Note: For production, consider using ipKeyGenerator from express-rate-limit for IPv6 compatibility
  keyGenerator: (req: Request) => {
    // Skip rate limiting for localhost/development - return unique key to bypass
    if (shouldSkipRateLimit(req)) {
      return `${Date.now()}-${Math.random()}`;
    }
    
    const email = req.body?.email || req.body?.username || '';
    // Use req.ip which is already normalized by express
    // For IPv6 compatibility in production, install and use: import { ipKeyGenerator } from 'express-rate-limit'
    const ip = req.ip || 'unknown';
    return `${ip}-${email}`;
  }
});

/**
 * Admin endpoints rate limiter
 * Limits: 
 * - Development: Unlimited
 * - Production: 1000 requests per 15 minutes per IP
 * More lenient for admin operations
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 10000, // Much higher limit in development
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60,
      timestamp: new Date().toISOString()
    });
  },
  skip: shouldSkipRateLimit
});

/**
 * Password reset rate limiter
 * Limits: 
 * - Development: 20 requests per hour
 * - Production: 5 requests per hour per IP
 * Very restrictive for security
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 5 : 20, // Increased limit
  message: {
    success: false,
    message: 'Too many password reset requests from this IP, please try again later.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many password reset requests from this IP, please try again later.',
      retryAfter: 60 * 60,
      timestamp: new Date().toISOString()
    });
  },
  skip: shouldSkipRateLimit
});

/**
 * Product search/listing rate limiter
 * Limits: 
 * - Development: Unlimited
 * - Production: 1000 requests per 15 minutes per IP
 * More lenient for public product browsing
 */
export const productLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 10000, // Much higher limit in development
  message: {
    success: false,
    message: 'Too many product requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many product requests from this IP, please try again later.',
      retryAfter: 15 * 60,
      timestamp: new Date().toISOString()
    });
  },
  skip: shouldSkipRateLimit
});

