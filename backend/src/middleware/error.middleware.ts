import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  Logger.error(`${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err.message === 'Invalid credentials' || err.message === 'Not authorized') {
    statusCode = 401;
    message = err.message;
  } else if (err.message.includes('not found')) {
    statusCode = 404;
    message = err.message;
  } else if (err.message.includes('already exists') || err.message.includes('Time slot not available')) {
    statusCode = 400;
    message = err.message;
  }

  res.status(statusCode).json({
    status: 'error',
    message: message,
  });
};
