import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();
const auditController = new AuditController();

// Protected Route: Only ADMINs can view audit logs
router.get('/', authenticate, auditController.getLogs);

export default router;
