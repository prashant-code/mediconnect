import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export class AdminService {
  async getDashboardStats() {
    const [patientCount, doctorCount, appointmentCount, auditLogCount] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.auditLog.count(),
    ]);

    return {
      patients: patientCount,
      doctors: doctorCount,
      appointments: appointmentCount,
      auditLogs: auditLogCount,
    };
  }

  async getAllDoctors() {
    return prisma.doctor.findMany({
      include: {
        user: { select: { email: true, createdAt: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async getAllPatients() {
    return prisma.patient.findMany({
      include: {
        user: { select: { email: true, createdAt: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async getAllAppointments(limit: number = 100) {
    return prisma.appointment.findMany({
      take: limit,
      orderBy: { dateTime: 'desc' },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        doctor: { select: { firstName: true, lastName: true } },
      },
    });
  }

  async createAdmin(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }
}
