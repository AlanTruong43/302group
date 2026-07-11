import { prisma } from '../config/prisma';

export const timeSlotRepository = {
  findAvailable(doctorId: string, date: Date) {
    return prisma.timeSlot.findMany({
      where: { doctorId, date, isBooked: false },
      orderBy: { startTime: 'asc' },
    });
  },

  findById(id: string) {
    return prisma.timeSlot.findUnique({ where: { id } });
  },

  async createMany(
    doctorId: string,
    date: Date,
    slots: { startTime: string; endTime: string }[]
  ) {
    let created = 0;
    for (const slot of slots) {
      try {
        await prisma.timeSlot.create({
          data: { doctorId, date, startTime: slot.startTime, endTime: slot.endTime },
        });
        created += 1;
      } catch {
        // slot đã tồn tại (unique constraint) -> bỏ qua, không chặn các slot còn lại
      }
    }
    return created;
  },
};
