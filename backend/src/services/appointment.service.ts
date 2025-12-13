import { PrismaClient, AppointmentStatus, Role } from '@prisma/client';
import { Logger } from '../utils/logger';
import { Log } from '../utils/decorators';

const prisma = new PrismaClient();

export class AppointmentService {
  @Log
  async createAppointment(patientUserId: string, data: any) {
    const patient = await prisma.patient.findUnique({ where: { userId: patientUserId } });
    if (!patient) throw new Error('Patient not found');

    // Check if doctor already has an appointment at this time
    const appointmentDateTime = new Date(data.dateTime);
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        dateTime: appointmentDateTime,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
        }
      }
    });

    if (existingAppointment) {
      throw new Error('Doctor already has an appointment at this time. Please choose a different time slot.');
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: data.doctorId,
        dateTime: appointmentDateTime,
        reason: data.reason,
        status: AppointmentStatus.PENDING,
      },
    });

    Logger.info(`Appointment created: ${appointment.id}`);
    return appointment;
  }

  @Log
  async getAppointments(userId: string, role: Role) {
    if (role === Role.PATIENT) {
      const patient = await prisma.patient.findUnique({ where: { userId } });
      if (!patient) return [];
      return prisma.appointment.findMany({
        where: { patientId: patient.id },
        include: { doctor: true, notes: true },
        orderBy: { dateTime: 'asc' },
      });
    } else if (role === Role.DOCTOR) {
      const doctor = await prisma.doctor.findUnique({ where: { userId } });
      if (!doctor) return [];
      return prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: { patient: true, notes: true },
        orderBy: { dateTime: 'asc' },
      });
    }
    return [];
  }

  @Log
  async addNote(doctorUserId: string, appointmentId: string, content: string) {
    const doctor = await prisma.doctor.findUnique({ where: { userId: doctorUserId } });
    if (!doctor) throw new Error('Doctor not found');

    const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
    if (!appointment) throw new Error('Appointment not found');

    if (appointment.doctorId !== doctor.id) {
       throw new Error('Not authorized to add note to this appointment');
    }

    const note = await prisma.note.create({
      data: {
        appointmentId,
        doctorId: doctor.id,
        content,
      },
    });

    Logger.info(`Note added to appointment: ${appointmentId}`);
    return note;
  }

  @Log
  async getAvailableSlots(doctorId: string, startDateStr: string, endDateStr?: string) {
    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);
    
    // Default to 7 days if no end date provided
    const endDate = endDateStr ? new Date(endDateStr) : new Date(startDate);
    if (!endDateStr) {
      endDate.setDate(endDate.getDate() + 6); // 7 days total
    }
    endDate.setHours(23, 59, 59, 999);

    // Get all booked appointments for this doctor in the date range
    const bookedAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        dateTime: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
        }
      },
      select: {
        dateTime: true
      }
    });

    // Create a set of booked times (including buffer) for fast lookup
    const bookedTimes = new Set<number>();
    bookedAppointments.forEach(apt => {
      const aptTime = apt.dateTime.getTime();
      bookedTimes.add(aptTime);
      // Add 15-minute buffer after appointment (1 hour appointment + 15 min buffer)
      const bufferTime = new Date(aptTime);
      bufferTime.setMinutes(bufferTime.getMinutes() + 60); // End of 1-hour appointment
      for (let i = 0; i < 15; i++) {
        bookedTimes.add(new Date(bufferTime.getTime() + i * 60000).getTime());
      }
    });

    // Generate available slots (9 AM to 5 PM, 1-hour intervals)
    const slots: Array<{ dateTime: string; available: boolean }> = [];
    const now = new Date();
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // Only generate slots for future dates or today
      if (currentDate.toDateString() >= now.toDateString()) {
        for (let hour = 9; hour < 17; hour++) { // 9 AM to 5 PM (last slot at 4 PM)
          const slotTime = new Date(currentDate);
          slotTime.setHours(hour, 0, 0, 0);
          
          // Skip past slots
          if (slotTime <= now) continue;
          
          // Check if slot is available (not booked and no buffer conflict)
          const isBooked = bookedTimes.has(slotTime.getTime());
          
          slots.push({
            dateTime: slotTime.toISOString(),
            available: !isBooked
          });
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  @Log
  async cancelAppointment(userId: string, appointmentId: string, role: Role, cancellationReason?: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true }
    });

    if (!appointment) throw new Error('Appointment not found');

    // Verify ownership
    if (role === Role.PATIENT && appointment.patient.userId !== userId) {
      throw new Error('Not authorized to cancel this appointment');
    }

    // Check if appointment is at least 24 hours away
    const now = new Date();
    const appointmentTime = new Date(appointment.dateTime);
    const hoursDiff = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      throw new Error('Cannot cancel appointment less than 24 hours before scheduled time');
    }

    // Update status to CANCELLED with optional reason
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { 
        status: AppointmentStatus.CANCELLED,
        ...(cancellationReason && {
          notes: {
            create: {
              doctorId: appointment.doctorId,
              content: `Cancellation reason: ${cancellationReason}`
            }
          }
        })
      }
    });

    Logger.info(`Appointment cancelled: ${appointmentId}${cancellationReason ? ` - Reason: ${cancellationReason}` : ''}`);
    return updated;
  }

  @Log
  async rescheduleAppointment(
    userId: string, 
    appointmentId: string, 
    newDateTime: string,
    role: Role
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true }
    });

    if (!appointment) throw new Error('Appointment not found');

    // Verify ownership
    if (role === Role.PATIENT && appointment.patient.userId !== userId) {
      throw new Error('Not authorized to reschedule this appointment');
    }

    // Check if current appointment is at least 24 hours away
    const now = new Date();
    const currentTime = new Date(appointment.dateTime);
    const hoursDiff = (currentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      throw new Error('Cannot reschedule appointment less than 24 hours before scheduled time');
    }

    const newAppointmentTime = new Date(newDateTime);

    // Check if new slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: appointment.doctorId,
        dateTime: newAppointmentTime,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]
        }
      }
    });

    if (existingAppointment) {
      throw new Error('New time slot is not available');
    }

    // Atomic update: cancel old and create new
    const [cancelled, newAppointment] = await prisma.$transaction([
      prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CANCELLED }
      }),
      prisma.appointment.create({
        data: {
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          dateTime: newAppointmentTime,
          reason: appointment.reason,
          status: AppointmentStatus.PENDING
        }
      })
    ]);

    Logger.info(`Appointment rescheduled: ${appointmentId} -> ${newAppointment.id}`);
    return newAppointment;
  }
}
