import { Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { appointmentSchema, noteSchema } from '../utils/validators';
import { Role } from '@prisma/client';

import { checkInsurance } from '../utils/circuitBreaker';

const appointmentService = new AppointmentService();

export class AppointmentController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error('Unauthorized');
      if (req.user.role !== Role.PATIENT) {
        return res.status(403).json({ status: 'error', message: 'Only patients can book appointments' });
      }

      // Enterprise: Check Insurance Eligibility with Circuit Breaker
      const insurance = await checkInsurance(req.user.id);
      if (!insurance.eligible) {
          return res.status(400).json({ 
              status: 'error', 
              message: 'Insurance verification failed or not eligible. Please contact support.' 
          });
      }

      const validatedData = appointmentSchema.parse(req.body);
      const result = await appointmentService.createAppointment(req.user.id, validatedData);
      res.status(201).json({ status: 'success', data: result, insurancePlan: insurance.plan });
    } catch (error: any) {
      if (error.errors) {
        res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      } else {
        next(error);
      }
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new Error('Unauthorized');
        const result = await appointmentService.getAppointments(req.user.id, req.user.role);
        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
  }

  async getAvailableSlots(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new Error('Unauthorized');
        const { doctorId, startDate, endDate } = req.query;
        
        if (!doctorId || !startDate) {
            return res.status(400).json({ status: 'error', message: 'doctorId and startDate are required' });
        }

        const result = await appointmentService.getAvailableSlots(
          doctorId as string, 
          startDate as string,
          endDate as string | undefined
        );
        res.status(200).json({ status: 'success', data: result });
    } catch (error) {
        next(error);
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new Error('Unauthorized');
        const { id } = req.params;
        const { cancellationReason } = req.body;
        
        if (!id) {
            return res.status(400).json({ status: 'error', message: 'Appointment ID required' });
        }

        const result = await appointmentService.cancelAppointment(req.user.id, id, req.user.role, cancellationReason);
        res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
        if (error.message.includes('24 hours')) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
        next(error);
    }
  }

  async reschedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new Error('Unauthorized');
        const { id } = req.params;
        const { newDateTime } = req.body;
        
        if (!id || !newDateTime) {
            return res.status(400).json({ status: 'error', message: 'Appointment ID and newDateTime are required' });
        }

        const result = await appointmentService.rescheduleAppointment(
          req.user.id, 
          id, 
          newDateTime,
          req.user.role
        );
        res.status(200).json({ status: 'success', data: result });
    } catch (error: any) {
        if (error.message.includes('24 hours') || error.message.includes('not available')) {
            return res.status(400).json({ status: 'error', message: error.message });
        }
        next(error);
    }
  }

  async addNote(req: AuthRequest, res: Response, next: NextFunction) {
      try {
          if (!req.user) throw new Error('Unauthorized');
          if (req.user.role !== Role.DOCTOR) {
              return res.status(403).json({ status: 'error', message: 'Only doctors can add notes' });
          }
          const { id } = req.params;
          if (!id) {
            return res.status(400).json({ status: 'error', message: 'Appointment ID required' });
          }
          const validatedData = noteSchema.parse(req.body);
          const result = await appointmentService.addNote(req.user.id, id, validatedData.content);
          res.status(201).json({ status: 'success', data: result });
      } catch (error: any) {
        if (error.errors) {
           res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
        } else {
            next(error);
        }
      }
  }
}
