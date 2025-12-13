import { PrismaClient, User, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger';
import { Log } from '../utils/decorators';

const prisma = new PrismaClient();

export class AuthService {
  @Log
  async register(data: any) {
    const { email, password, role, firstName, lastName, ...otherDetails } = data;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User Transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role as Role,
        },
      });

      if (role === Role.PATIENT) {
        await tx.patient.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            dateOfBirth: new Date(otherDetails.dateOfBirth),
            gender: otherDetails.gender,
            phone: otherDetails.phone,
            address: otherDetails.address,
          },
        });
      } else if (role === Role.DOCTOR) {
        await tx.doctor.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            specialization: otherDetails.specialization,
            licenseNumber: otherDetails.licenseNumber,
          },
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER',
          resource: 'USER',
          details: `User registered with role ${role}`,
        },
      });

      return user;
    });

    Logger.info(`User registered: ${email}`);
    return { id: result.id, email: result.email, role: result.role };
  }

  @Log
  async login(data: any) {
    const { email, password } = data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      Logger.warn(`Failed login attempt for ${email}`);
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '1h' }
    );

    // Audit Log (Non-blocking)
    prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'AUTH',
        details: 'User logged in successfully',
      },
    }).catch(err => Logger.error('Failed to create audit log', err));

    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
}
