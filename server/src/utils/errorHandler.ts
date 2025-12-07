import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  stack?: string;
  details?: unknown;
}

/**
 * Create standardized error response
 */
export const createErrorResponse = (
  error: Error | ApiError,
  req?: Request,
  statusCode?: number
): ErrorResponse => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const code = statusCode || (error instanceof ApiError ? error.statusCode : 500);
  
  const response: ErrorResponse = {
    success: false,
    message: error.message || 'Internal Server Error',
    statusCode: code,
    timestamp: new Date().toISOString(),
    ...(req && { path: req.originalUrl }),
    ...(isDevelopment && {
      stack: error.stack,
      error: error.name,
      details: error instanceof ApiError ? undefined : error
    })
  };

  return response;
};

/**
 * Centralized error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  if (err instanceof ApiError) {
    logger.error(`API Error: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  } else {
    logger.error('Unhandled error', {
      error: err,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
      stack: err.stack
    });
  }

  // Create standardized error response
  const errorResponse = createErrorResponse(err, req);

  // Send error response
  res.status(errorResponse.statusCode).json(errorResponse);
};

/**
 * Async handler wrapper to catch errors and pass to error handler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom API errors
 */
export const createApiError = (message: string, statusCode: number = 500): ApiError => {
  return new ApiError(message, statusCode);
};

/**
 * Common API error constructors
 */
export const errors = {
  badRequest: (message: string = 'Bad Request') => new ApiError(message, 400),
  unauthorized: (message: string = 'Unauthorized') => new ApiError(message, 401),
  forbidden: (message: string = 'Forbidden') => new ApiError(message, 403),
  notFound: (message: string = 'Not Found') => new ApiError(message, 404),
  conflict: (message: string = 'Conflict') => new ApiError(message, 409),
  validationError: (message: string = 'Validation Error') => new ApiError(message, 422),
  tooManyRequests: (message: string = 'Too Many Requests') => new ApiError(message, 429),
  internalServerError: (message: string = 'Internal Server Error') => new ApiError(message, 500),
  serviceUnavailable: (message: string = 'Service Unavailable') => new ApiError(message, 503)
};

