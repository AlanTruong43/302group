import { prisma } from '../config/prisma';

export const specialtyRepository = {
  findAll() {
    return prisma.specialty.findMany({ orderBy: { name: 'asc' } });
  },

  findById(id: string) {
    return prisma.specialty.findUnique({ where: { id } });
  },

  create(name: string) {
    return prisma.specialty.create({ data: { name } });
  },

  update(id: string, name: string) {
    return prisma.specialty.update({ where: { id }, data: { name } });
  },

  countDoctors(id: string) {
    return prisma.doctor.count({ where: { specialtyId: id } });
  },

  delete(id: string) {
    return prisma.specialty.delete({ where: { id } });
  },
};
