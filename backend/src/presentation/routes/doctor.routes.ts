import { Router } from 'express';
import { Role } from '@prisma/client';
import { doctorController } from '../controllers/doctor.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

export const doctorRoutes = Router();

doctorRoutes.get('/', doctorController.list);
doctorRoutes.get('/:id', doctorController.getById);
doctorRoutes.get('/:id/slots', doctorController.getSlots);
doctorRoutes.post(
  '/me/schedule',
  authMiddleware,
  requireRole(Role.DOCTOR),
  doctorController.createSchedule
);
