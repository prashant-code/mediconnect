import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const doctorController = new DoctorController();

router.get('/', authenticate, doctorController.list);

export default router;
