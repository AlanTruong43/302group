import { Response } from 'express';
import { z } from 'zod';
import { doctorService } from '../../business/doctor.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { BadRequestError } from '../../utils/errors';

const scheduleSchema = z.object({
  date: z.string(),
  startHour: z.number().int().min(0).max(23),
  endHour: z.number().int().min(1).max(24),
  slotMinutes: z.number().int().min(10).max(180).default(30),
});

export const doctorController = {
  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { specialtyId, keyword } = req.query;
    const doctors = await doctorService.searchDoctors(
      specialtyId as string | undefined,
      keyword as string | undefined
    );
    res.json(doctors);
  }),

  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const doctor = await doctorService.getDoctorById(req.params.id);
    res.json(doctor);
  }),

  getSlots: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { date } = req.query;
    if (!date || typeof date !== 'string') throw new BadRequestError('Thiếu tham số date');
    const slots = await doctorService.getAvailableSlots(req.params.id, new Date(date));
    res.json(slots);
  }),

  createSchedule: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = scheduleSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.errors[0].message);

    const result = await doctorService.createSchedule(
      req.user!.userId,
      new Date(parsed.data.date),
      parsed.data.startHour,
      parsed.data.endHour,
      parsed.data.slotMinutes
    );
    res.status(201).json(result);
  }),
};
