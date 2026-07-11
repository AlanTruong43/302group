import { Role } from '@prisma/client';
import { prisma } from '../config/prisma';

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: { email: string; passwordHash: string; fullName: string; phone?: string; role: Role }) {
    return prisma.user.create({ data });
  },

  setActive(id: string, isActive: boolean) {
    return prisma.user.update({ where: { id }, data: { isActive } });
  },
};
