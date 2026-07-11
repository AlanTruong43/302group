import { Router } from 'express';
import { Role } from '@prisma/client';
import { appointmentController } from '../controllers/appointment.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

export const appointmentRoutes = Router();

appointmentRoutes.use(authMiddleware);

appointmentRoutes.post('/', requireRole(Role.PATIENT), appointmentController.book);
appointmentRoutes.get('/me', requireRole(Role.PATIENT), appointmentController.myAppointments);
appointmentRoutes.get(
  '/doctor/me',
  requireRole(Role.DOCTOR),
  appointmentController.doctorAppointments
);
appointmentRoutes.patch(
  '/:id/cancel',
  requireRole(Role.PATIENT, Role.DOCTOR),
  appointmentController.cancel
);
appointmentRoutes.patch(
  '/:id/confirm',
  requireRole(Role.DOCTOR),
  appointmentController.confirm
);
