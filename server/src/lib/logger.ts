/**
 * Logger utility for server-side logging
 * Automatically handles development vs production environments
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: Date;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    // Always log errors
    if (level === 'error') return true;
    
    // Only log other levels in development
    return this.isDevelopment;
  }

  private formatMessage(message: string, data?: unknown): string {
    if (data) {
      return `${message} ${typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data)}`;
    }
    return message;
  }

  private logInternal(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date()
    };

    // Use appropriate console method
    switch (level) {
      case 'error':
        console.error(`[${entry.timestamp.toISOString()}] ${this.formatMessage(message, data)}`, data || '');
        break;
      case 'warn':
        console.warn(`[${entry.timestamp.toISOString()}] ${this.formatMessage(message, data)}`, data || '');
        break;
      case 'info':
        console.info(`[${entry.timestamp.toISOString()}] ${this.formatMessage(message, data)}`, data || '');
        break;
      case 'debug':
        console.debug(`[${entry.timestamp.toISOString()}] ${this.formatMessage(message, data)}`, data || '');
        break;
      default:
        console.log(`[${entry.timestamp.toISOString()}] ${this.formatMessage(message, data)}`, data || '');
    }

    // TODO: In production, send to logging service (e.g., Sentry, LogRocket, etc.)
    // if (!this.isDevelopment && level === 'error') {
    //   this.sendToLoggingService(entry);
    // }
  }

  log(message: string, data?: unknown): void {
    this.logInternal('log', message, data);
  }

  info(message: string, data?: unknown): void {
    this.logInternal('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.logInternal('warn', message, data);
  }

  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      this.logInternal('error', message, {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    } else {
      this.logInternal('error', message, error);
    }
  }

  debug(message: string, data?: unknown): void {
    this.logInternal('debug', message, data);
  }

  // Group related logs together
  group(label: string, callback: () => void): void {
    if (this.isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }

  // Time operations
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export Logger class for testing
export default Logger;

