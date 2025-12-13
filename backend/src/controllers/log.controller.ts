import { Request, Response } from 'express';
import { Logger } from '../utils/logger';

export class LogController {
  
  static async logClientError(req: Request, res: Response) {
    const { level, message, details, component } = req.body;
    const clientIp = req.ip || req.header('x-forwarded-for') || 'unknown';
    
    const meta = {
        clientIp,
        component,
        details
    };

    const logMessage = `[CLIENT] [${component || 'Unknown'}] ${message} - IP: ${clientIp}`;

    if (level === 'error') {
      Logger.error(logMessage, meta);
    } else if (level === 'warn') {
      Logger.warn(logMessage, meta);
    } else {
      Logger.info(logMessage, meta);
    }

    res.status(200).send({ status: 'ok' });
  }
}
