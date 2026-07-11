import { prisma } from '../config/prisma';
import { safeUserSelect } from './safe-select';

export const doctorRepository = {
  findMany(specialtyId?: string, keyword?: string) {
    return prisma.doctor.findMany({
      where: {
        specialtyId: specialtyId ?? undefined,
        user: keyword
          ? { fullName: { contains: keyword, mode: 'insensitive' } }
          : undefined,
      },
      include: { user: { select: safeUserSelect }, specialty: true },
      orderBy: { experienceYears: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.doctor.findUnique({
      where: { id },
      include: { user: { select: safeUserSelect }, specialty: true },
    });
  },

  findByUserId(userId: string) {
    return prisma.doctor.findUnique({
      where: { userId },
      include: { user: { select: safeUserSelect }, specialty: true },
    });
  },

  create(data: { userId: string; specialtyId: string; bio?: string; experienceYears?: number }) {
    return prisma.doctor.create({ data });
  },

  update(id: string, data: { specialtyId?: string; bio?: string; experienceYears?: number }) {
    return prisma.doctor.update({ where: { id }, data });
  },
};
