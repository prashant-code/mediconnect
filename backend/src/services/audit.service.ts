import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class AuditService {
  async log(data: { userId?: string, action: string, resource: string, details?: string, ipAddress?: string }) {
    return prisma.auditLog.create({
      data
    });
  }

  async getLogs(limit: number = 50, offset: number = 0) {
    const logs = await prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });

    const total = await prisma.auditLog.count();

    return {
      data: logs,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
