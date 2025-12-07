import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string | { name: string; _id: string };
    permissions?: string[];
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  logger.debug('Auth middleware - Headers', { hasAuth: !!authHeader });
  logger.debug('Auth middleware - Token', { hasToken: !!token });

  if (!token) {
    logger.debug('Auth middleware - No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      name?: string;
    };
    logger.debug('Auth middleware - Decoded token', { userId: decoded.userId, email: decoded.email, role: decoded.role });
    
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || '',
      role: decoded.role
    };
    next();
  } catch (error) {
    logger.error('Auth middleware - Token verification failed', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Handle both string and object role formats
  const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name;
  
  if (userRole !== 'Admin' && userRole !== 'Super Admin') {
    return res.status(403).json({ 
      message: 'Admin access required',
      userRole: userRole,
      expectedRoles: ['Admin', 'Super Admin']
    });
  }

  next();
};

export const requireCustomer = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Handle both string and object role formats
  const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name;
  
  if (userRole !== 'Customer') {
    return res.status(403).json({ 
      message: 'Customer access required',
      userRole: userRole,
      expectedRole: 'Customer'
    });
  }

  next();
};

export const requireCustomerOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Handle both string and object role formats
  const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name;
  
  if (userRole !== 'Customer' && userRole !== 'Admin' && userRole !== 'Super Admin') {
    return res.status(403).json({ 
      message: 'Customer or admin access required',
      userRole: userRole,
      expectedRoles: ['Customer', 'Admin', 'Super Admin']
    });
  }

  next();
};

export const authorizeRoles = (roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Handle both string and object role formats
  const userRole = typeof req.user.role === 'string' ? req.user.role : req.user.role?.name;
  
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ 
      message: 'Insufficient permissions',
      userRole: userRole,
      requiredRoles: roles
    });
  }

  next();
};

// Async handler wrapper to catch errors
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Export AuthRequest type for use in controllers
export type { AuthRequest };

