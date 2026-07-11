import { Response } from 'express';
import { z } from 'zod';
import { doctorService } from '../../business/doctor.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { BadRequestError } from '../../utils/errors';

const specialtySchema = z.object({ name: z.string().min(1) });

const createDoctorSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  specialtyId: z.string().uuid(),
  bio: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
});

export const adminController = {
  listSpecialties: asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    res.json(await doctorService.listSpecialties());
  }),

  createSpecialty: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = specialtySchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.errors[0].message);
    res.status(201).json(await doctorService.createSpecialty(parsed.data.name));
  }),

  updateSpecialty: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = specialtySchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.errors[0].message);
    res.json(await doctorService.updateSpecialty(req.params.id, parsed.data.name));
  }),

  deleteSpecialty: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await doctorService.deleteSpecialty(req.params.id);
    res.status(204).send();
  }),

  createDoctor: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const parsed = createDoctorSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.errors[0].message);
    const result = await doctorService.createDoctorAccount(parsed.data);
    res.status(201).json(result);
  }),

  setDoctorActive: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { isActive } = req.body as { isActive: boolean };
    res.json(await doctorService.setDoctorAccountActive(req.params.userId, Boolean(isActive)));
  }),
};
