import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validators';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      if (error.errors) {
        // Zod Error
        res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      } else {
        next(error);
      }
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      if (error.errors) {
         res.status(400).json({ status: 'error', message: 'Validation Error', errors: error.errors });
      } else {
        next(error);
      }
    }
  }
}
