import { AuthService } from '../auth.service';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mocks
jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(async (callback) => {
      console.log('Inside mock transaction');
      try {
        const result = await callback(mPrisma);
        console.log('Transaction callback result:', result);
        return result;
      } catch (e) {
        console.error('Transaction callback error:', e);
        throw e;
      }
    }),
    patient: { create: jest.fn() },
    doctor: { create: jest.fn() },
    auditLog: { create: jest.fn().mockResolvedValue({}) },
  };
  return {
    PrismaClient: class {
      constructor() {
        return mPrisma;
      }
    },
    Role: {
      PATIENT: 'PATIENT',
      DOCTOR: 'DOCTOR',
    },
  };
});

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Because PrismaClient is mocked to return the SAME object (mPrisma),
    // we can get a reference to it by instantiation.
    prisma = new PrismaClient(); 
    (prisma.auditLog.create as jest.Mock).mockReturnValue(Promise.resolve({}));
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new patient successfully', async () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'PATIENT',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        phone: '1234567890',
        address: '123 St',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        role: 'PATIENT',
      });
      (prisma.patient.create as jest.Mock).mockResolvedValue({});
      
      // Mock transaction to return the expected result (simulating success)
      (prisma.$transaction as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        role: 'PATIENT',
      });

      const result = await authService.register(mockData);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: mockData.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(mockData.password, 10);
      expect(prisma.$transaction).toHaveBeenCalled();

      // Manually verify the transaction callback logic
      const transactionCallback = (prisma.$transaction as jest.Mock).mock.calls[0][0];
      await transactionCallback(prisma);
      
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.patient.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 'user-id', email: 'test@example.com', role: 'PATIENT' });
    });

    it('should throw error if user already exists', async () => {
      const mockData = { email: 'test@example.com', password: 'password123' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-id' });

      await expect(authService.register(mockData)).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const mockData = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'PATIENT',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.login(mockData);

      expect(result).toEqual({
        token: 'mock-token',
        user: { id: 'user-id', email: 'test@example.com', role: 'PATIENT' },
      });
    });

    it('should throw error for invalid credentials', async () => {
      const mockData = { email: 'test@example.com', password: 'wrong' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(mockData)).rejects.toThrow('Invalid credentials');
    });
  });
});
