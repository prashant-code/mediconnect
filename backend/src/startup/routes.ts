import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { specs } from '../config/swagger';
import authRoutes from '../routes/auth.routes';
import appointmentRoutes from '../routes/appointment.routes';
import doctorRoutes from '../routes/doctor.routes';
import auditRoutes from '../routes/audit.routes';
import adminRoutes from '../routes/admin.routes';
import { errorHandler } from '../middleware/error.middleware';
import { LogController } from '../controllers/log.controller';
import { requestLogger } from '../middleware/requestLogger';

export default function (app: Express) {
  // Global Request Logger with IP tracking
  app.use(requestLogger);

  // Logs
  app.post('/api/logs', LogController.logClientError);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  
  app.use('/api/auth', authRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/audit', auditRoutes);
  app.use('/api/admin', adminRoutes);
  
  // Health Check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  // Convert the inline error handler to the imported one
  app.use(errorHandler);
}
