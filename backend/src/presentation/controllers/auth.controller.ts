import { Request, Response } from 'express';
import { z } from 'zod';
import { Role } from '@prisma/client';
import { authService } from '../../business/auth.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { BadRequestError } from '../../utils/errors';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(1),
  phone: z.string().optional(),
  role: z.nativeEnum(Role),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.errors[0].message);

    const result = await authService.register(parsed.data);
    res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) throw new BadRequestError(parsed.error.errors[0].message);

    const result = await authService.login(parsed.data.email, parsed.data.password);
    res.status(200).json(result);
  }),
};
