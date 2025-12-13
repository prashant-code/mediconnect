import { Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const auditService = new AuditService();

export class AuditController {
  async getLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // 1. Check Auth
      if (!req.user) throw new Error('Unauthorized');
      
      // 2. RBAC: Only Admin or Doctor can view system audit logs?
      // Usually Audit Logs are for Admins. 
      // Since we don't have an 'Admin' dashboard, let's allow DOCTORs to see it for now (as a "Power User"), 
      // or strictly restrict to ADMIN. 
      // The user asked "who can see that". I will restrict to ADMIN.
      
      if (req.user.role !== Role.ADMIN) {
         // Fallback: If no ADMIN user exists easily, maybe allow DOCTORS?
         // No, let's stick to valid security. Must be ADMIN.
         // If the user hasn't created an ADMIN, they can't see it.
         // I'll add a check: allow DOCTOR for demo purposes if needed? 
         // Let's stick to ADMIN.
         
         return res.status(403).json({ status: 'error', message: 'Access denied. Admin rights required.' });
      }

      const limit = Number(req.query.limit) || 50;
      const offset = Number(req.query.offset) || 0;

      const result = await auditService.getLogs(limit, offset);
      res.status(200).json({ status: 'success', ...result });
    } catch (error) {
      next(error);
    }
  }
}
