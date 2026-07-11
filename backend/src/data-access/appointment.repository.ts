import { AppointmentStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ConflictError } from '../utils/errors';
import { safeUserSelect } from './safe-select';

export const appointmentRepository = {
  /**
   * Đặt lịch trong một transaction: chỉ khóa slot thành công khi slot đang isBooked=false,
   * tránh double-booking khi nhiều bệnh nhân đặt cùng slot gần như đồng thời (QA-05).
   */
  async createWithSlotLock(patientId: string, slotId: string, doctorId: string, note?: string) {
    return prisma.$transaction(async (tx) => {
      const lockResult = await tx.timeSlot.updateMany({
        where: { id: slotId, isBooked: false },
        data: { isBooked: true },
      });

      if (lockResult.count === 0) {
        throw new ConflictError('Khung giờ vừa được đặt, vui lòng chọn khung giờ khác');
      }

      return tx.appointment.create({
        data: { patientId, slotId, doctorId, note, status: AppointmentStatus.PENDING },
        include: { slot: true, doctor: { include: { user: { select: safeUserSelect } } }, patient: { select: safeUserSelect } },
      });
    });
  },

  findById(id: string) {
    return prisma.appointment.findUnique({
      where: { id },
      include: { slot: true, doctor: { include: { user: { select: safeUserSelect } } }, patient: { select: safeUserSelect } },
    });
  },

  findByPatient(patientId: string) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: { slot: true, doctor: { include: { user: { select: safeUserSelect }, specialty: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  findByDoctor(doctorId: string, status?: AppointmentStatus) {
    return prisma.appointment.findMany({
      where: { doctorId, status: status ?? undefined },
      include: { slot: true, patient: { select: safeUserSelect } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateStatus(id: string, status: AppointmentStatus, cancelReason?: string) {
    return prisma.appointment.update({
      where: { id },
      data: { status, cancelReason },
      include: { slot: true, doctor: { include: { user: { select: safeUserSelect } } }, patient: { select: safeUserSelect } },
    });
  },

  /**
   * Hủy lịch hẹn và giải phóng slot trong cùng transaction để đảm bảo tính nhất quán.
   */
  async cancelWithSlotRelease(id: string, slotId: string, cancelReason?: string) {
    return prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.CANCELLED, cancelReason },
        include: { slot: true, doctor: { include: { user: { select: safeUserSelect } } }, patient: { select: safeUserSelect } },
      });
      await tx.timeSlot.update({ where: { id: slotId }, data: { isBooked: false } });
      return appointment;
    });
  },
};
