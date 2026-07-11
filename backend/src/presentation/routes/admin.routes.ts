import { Router } from 'express';
import { Role } from '@prisma/client';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

export const adminRoutes = Router();

adminRoutes.use(authMiddleware, requireRole(Role.ADMIN));

adminRoutes.get('/specialties', adminController.listSpecialties);
adminRoutes.post('/specialties', adminController.createSpecialty);
adminRoutes.put('/specialties/:id', adminController.updateSpecialty);
adminRoutes.delete('/specialties/:id', adminController.deleteSpecialty);

adminRoutes.post('/doctors', adminController.createDoctor);
adminRoutes.patch('/doctors/:userId/active', adminController.setDoctorActive);
