import { Request, Response, NextFunction } from 'express';
import ApiKey from '../models/ApiKey';
import ApiLog from '../models/ApiLog';

export interface AuthenticatedApiRequest extends Request {
  apiKey?: any;
  user?: any;
}

export const authenticateApiKey = async (req: AuthenticatedApiRequest, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    // If no API key provided, continue without authentication
    if (!apiKey) {
      return next();
    }

    // Find the API key
    const key = await ApiKey.findOne({ key: apiKey });
    
    if (!key) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    // Check if key is active and not expired
    if (!key.canUse()) {
      return res.status(401).json({
        success: false,
        message: key.isExpired() ? 'API key has expired' : 'API key is inactive'
      });
    }

    // Check rate limit
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentUsage = await ApiLog.countDocuments({
      apiKey: key.key,
      timestamp: { $gte: oneHourAgo }
    });

    if (recentUsage >= key.rateLimit) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded',
        retryAfter: 3600 // 1 hour in seconds
      });
    }

    // Attach API key to request
    req.apiKey = key;
    
    // Log the API request
    const startTime = Date.now();
    
    // Override res.json to log response
    const originalJson = res.json;
    res.json = function(body: any) {
      const responseTime = Date.now() - startTime;
      
      // Log the request asynchronously (don't wait for it)
      ApiLog.create({
        apiKey: key.key,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent'),
        requestBody: req.method !== 'GET' ? req.body : undefined,
        responseBody: res.statusCode >= 400 ? body : undefined,
        error: res.statusCode >= 400 ? body.message : undefined,
        timestamp: new Date()
      }).catch(console.error);

      // Increment usage count
      key.incrementUsage().catch(console.error);

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    console.error('Error in API key authentication:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const requireApiPermission = (permission: string) => {
  return (req: AuthenticatedApiRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key authentication required'
      });
    }

    if (!req.apiKey.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' is required`
      });
    }

    next();
  };
};

export const requireAnyApiPermission = (permissions: string[]) => {
  return (req: AuthenticatedApiRequest, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key authentication required'
      });
    }

    const hasPermission = permissions.some(permission => 
      req.apiKey.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `One of the following permissions is required: ${permissions.join(', ')}`
      });
    }

    next();
  };
};
