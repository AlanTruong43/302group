import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { authRoutes } from './presentation/routes/auth.routes';
import { doctorRoutes } from './presentation/routes/doctor.routes';
import { appointmentRoutes } from './presentation/routes/appointment.routes';
import { adminRoutes } from './presentation/routes/admin.routes';
import { specialtyRoutes } from './presentation/routes/specialty.routes';
import { errorHandler, notFoundHandler } from './presentation/middleware/error.middleware';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/specialties', specialtyRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
