import { Response } from 'express';
import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';
import { appointmentService } from '../../business/appointment.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { BadRequestError } from '../../utils/errors';

const bookSchema = z.object({
  slotId: z.string().uuid(),
  note: z.string().optional(),
});

const cancelSchema = z.object({
  reason: z.string().optional(),
});

export const appointmentController = {
  book: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = bookSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.errors[0].message);

    const appointment = await appointmentService.bookAppointment(
      req.user!.userId,
      parsed.data.slotId,
      parsed.data.note
    );
    res.status(201).json(appointment);
  }),

  myAppointments: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const appointments = await appointmentService.getMyAppointments(req.user!.userId);
    res.json(appointments);
  }),

  doctorAppointments: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const status = req.query.status as AppointmentStatus | undefined;
    const appointments = await appointmentService.getDoctorAppointments(req.user!.userId, status);
    res.json(appointments);
  }),

  cancel: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = cancelSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.errors[0].message);

    const appointment = await appointmentService.cancelAppointment(
      req.params.id,
      req.user!.userId,
      req.user!.role,
      parsed.data.reason
    );
    res.json(appointment);
  }),

  confirm: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const appointment = await appointmentService.confirmAppointment(req.params.id, req.user!.userId);
    res.json(appointment);
  }),
};
