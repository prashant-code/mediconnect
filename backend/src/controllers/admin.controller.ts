import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const adminService = new AdminService();

export class AdminController {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (req.user?.role !== Role.ADMIN) return res.status(403).json({ message: 'Forbidden' });
        const stats = await adminService.getDashboardStats();
        res.json({ status: 'success', data: stats });
    } catch (e) { next(e); }
  }

  async getDoctors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (req.user?.role !== Role.ADMIN) return res.status(403).json({ message: 'Forbidden' });
        const data = await adminService.getAllDoctors();
        res.json({ status: 'success', data });
    } catch (e) { next(e); }
  }

  async getPatients(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (req.user?.role !== Role.ADMIN) return res.status(403).json({ message: 'Forbidden' });
        const data = await adminService.getAllPatients();
        res.json({ status: 'success', data });
    } catch (e) { next(e); }
  }

  async getAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (req.user?.role !== Role.ADMIN) return res.status(403).json({ message: 'Forbidden' });
        const limit = Number(req.query.limit) || 100;
        const data = await adminService.getAllAppointments(limit);
        res.json({ status: 'success', data });
    } catch (e) { next(e); }
  }

  async createNewAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        if (req.user?.role !== Role.ADMIN) return res.status(403).json({ message: 'Forbidden' });
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
        
        const result = await adminService.createAdmin(email, password);
        res.status(201).json({ status: 'success', data: result });
    } catch (e) { next(e); }
  }
}
