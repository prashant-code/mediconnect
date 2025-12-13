import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DoctorController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const doctors = await prisma.doctor.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          specialization: true,
        },
      });
      res.status(200).json({ status: 'success', data: doctors });
    } catch (error) {
      next(error);
    }
  }
}
