import { AppointmentService } from '../appointment.service';
import { PrismaClient, Role } from '@prisma/client';

// Define mock structure inside factory
jest.mock('@prisma/client', () => {
  const mPrisma = {
    patient: { findUnique: jest.fn() },
    doctor: { findUnique: jest.fn() },
    appointment: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    note: { create: jest.fn() }
  };
  return {
    PrismaClient: class {
      constructor() {
        return mPrisma;
      }
    },
    Role: {
      PATIENT: 'PATIENT',
      DOCTOR: 'DOCTOR'
    },
    AppointmentStatus: {
      PENDING: 'PENDING'
    }
  };
});

jest.mock('../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('AppointmentService', () => {
  let appointmentService: AppointmentService;
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
    appointmentService = new AppointmentService();
  });

  describe('createAppointment', () => {
    it('should create appointment if patient exists', async () => {
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue({ id: 'p1' });
      (prisma.appointment.create as jest.Mock).mockResolvedValue({ id: 'a1' });

      const result = await appointmentService.createAppointment('u1', { doctorId: 'd1', dateTime: '2023-01-01', reason: 'Sick' });

      expect(prisma.patient.findUnique).toHaveBeenCalledWith({ where: { userId: 'u1' } });
      expect(prisma.appointment.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 'a1' });
    });

    it('should throw error if patient not found', async () => {
      (prisma.patient.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(appointmentService.createAppointment('u1', {})).rejects.toThrow('Patient not found');
    });
  });
});
