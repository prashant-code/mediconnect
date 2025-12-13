import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const adminController = new AdminController();

// All routes require Authentication. Controller checks for ADMIN role.
router.use(authenticate);

router.get('/stats', adminController.getStats);
router.get('/doctors', adminController.getDoctors);
router.get('/patients', adminController.getPatients);
router.get('/appointments', adminController.getAppointments);
router.post('/create', adminController.createNewAdmin);

export default router;
