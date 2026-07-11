import { Router } from 'express';
import { doctorService } from '../../business/doctor.service';
import { asyncHandler } from '../../utils/asyncHandler';

export const specialtyRoutes = Router();

specialtyRoutes.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await doctorService.listSpecialties());
  })
);
