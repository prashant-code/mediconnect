import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const clientIp = req.ip || req.header('x-forwarded-for') || 'unknown';
  
  // Enterprise: Correlation ID for Distrubuted Tracing
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  // Log request start
  Logger.http(`[${correlationId}] Incoming Request: ${req.method} ${req.url} - IP: ${clientIp}`);

  // Hook into response finish to log duration and status
  res.on('finish', () => {
      const duration = Date.now() - start;
      const status = res.statusCode;
      const logMsg = `[${correlationId}] Request Completed: ${req.method} ${req.url} ${status} - ${duration}ms - IP: ${clientIp}`;
      
      if (status >= 400) {
          Logger.warn(logMsg);
      } else {
          Logger.http(logMsg);
      }
  });

  next();
};
