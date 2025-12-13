import { AdminController } from '../admin.controller';
import { AdminService } from '../../services/admin.service';
import { Role } from '@prisma/client';
import { Request, Response } from 'express';

// Mock AdminService
jest.mock('../../services/admin.service');

describe('AdminController', () => {
    let adminController: AdminController;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(() => {
        adminController = new AdminController();
        mockReq = {
            user: { userId: 'admin-id', role: Role.ADMIN },
            query: {},
            body: {}
        } as any;
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('getStats', () => {
        it('should return stats for Admin', async () => {
            (AdminService.prototype.getDashboardStats as jest.Mock).mockResolvedValue({ users: 10 });
            await adminController.getStats(mockReq as any, mockRes as any, mockNext);
            expect(mockRes.json).toHaveBeenCalledWith({ status: 'success', data: { users: 10 } });
        });

        it('should return 403 for Non-Admin', async () => {
            mockReq.user = { userId: 'patient-id', role: Role.PATIENT };
            await adminController.getStats(mockReq as any, mockRes as any, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Forbidden' });
        });
    });

    describe('getDoctors', () => {
        it('should return list of doctors', async () => {
            const mockDocs = [{ id: 'd1', name: 'Dr. House' }];
            (AdminService.prototype.getAllDoctors as jest.Mock).mockResolvedValue(mockDocs);
            await adminController.getDoctors(mockReq as any, mockRes as any, mockNext);
            expect(mockRes.json).toHaveBeenCalledWith({ status: 'success', data: mockDocs });
        });
    });
});
