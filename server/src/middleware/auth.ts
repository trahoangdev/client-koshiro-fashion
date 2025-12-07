import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

  console.log('Auth middleware - Headers:', req.headers);
  console.log('Auth middleware - Auth header:', authHeader);
  console.log('Auth middleware - Token:', token ? `${token.substring(0, 20)}...` : 'No token');

  if (!token) {
    console.log('Auth middleware - No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      name?: string;
    };
    console.log('Auth middleware - Decoded token:', { userId: decoded.userId, email: decoded.email, role: decoded.role });
    
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || '',
      role: decoded.role
    };
    next();
  } catch (error) {
    console.log('Auth middleware - Token verification failed:', error);
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

