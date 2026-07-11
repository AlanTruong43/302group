import { AppointmentStatus, Role } from '@prisma/client';
import { appointmentRepository } from '../data-access/appointment.repository';
import { timeSlotRepository } from '../data-access/timeslot.repository';
import { doctorRepository } from '../data-access/doctor.repository';
import { notificationService } from './notification.service';
import { env } from '../config/env';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';

function slotDateTime(date: Date, time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const dt = new Date(date);
  dt.setHours(h, m, 0, 0);
  return dt;
}

export const appointmentService = {
  async bookAppointment(patientId: string, slotId: string, note?: string) {
    const slot = await timeSlotRepository.findById(slotId);
    if (!slot) throw new NotFoundError('Không tìm thấy khung giờ');
    if (slot.isBooked) throw new BadRequestError('Khung giờ đã được đặt');

    const appointment = await appointmentRepository.createWithSlotLock(
      patientId,
      slotId,
      slot.doctorId,
      note
    );
    notificationService.notifyAppointmentCreated(appointment);
    return appointment;
  },

  getMyAppointments(patientId: string) {
    return appointmentRepository.findByPatient(patientId);
  },

  async getDoctorAppointments(doctorUserId: string, status?: AppointmentStatus) {
    const doctor = await doctorRepository.findByUserId(doctorUserId);
    if (!doctor) throw new NotFoundError('Không tìm thấy hồ sơ bác sĩ');
    return appointmentRepository.findByDoctor(doctor.id, status);
  },

  async cancelAppointment(appointmentId: string, requesterId: string, requesterRole: Role, reason?: string) {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) throw new NotFoundError('Không tìm thấy lịch hẹn');

    if (requesterRole === Role.PATIENT && appointment.patientId !== requesterId) {
      throw new ForbiddenError('Bạn không có quyền hủy lịch hẹn này');
    }
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestError('Lịch hẹn đã được hủy trước đó');
    }
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestError('Không thể hủy lịch hẹn đã hoàn thành');
    }

    if (requesterRole === Role.PATIENT) {
      const appointmentTime = slotDateTime(appointment.slot.date, appointment.slot.startTime);
      const hoursUntil = (appointmentTime.getTime() - Date.now()) / (1000 * 60 * 60);
      if (hoursUntil < env.minCancelHoursBefore) {
        throw new BadRequestError(
          `Không thể hủy lịch trong vòng ${env.minCancelHoursBefore} giờ trước giờ khám`
        );
      }
    }

    const updated = await appointmentRepository.cancelWithSlotRelease(
      appointmentId,
      appointment.slotId,
      reason
    );
    notificationService.notifyAppointmentCancelled(
      updated,
      requesterRole === Role.PATIENT ? 'PATIENT' : 'DOCTOR'
    );
    return updated;
  },

  async confirmAppointment(appointmentId: string, doctorUserId: string) {
    const doctor = await doctorRepository.findByUserId(doctorUserId);
    if (!doctor) throw new NotFoundError('Không tìm thấy hồ sơ bác sĩ');

    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) throw new NotFoundError('Không tìm thấy lịch hẹn');
    if (appointment.doctorId !== doctor.id) {
      throw new ForbiddenError('Bạn không có quyền xác nhận lịch hẹn này');
    }
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new BadRequestError('Chỉ có thể xác nhận lịch hẹn đang chờ xử lý');
    }

    const updated = await appointmentRepository.updateStatus(appointmentId, AppointmentStatus.CONFIRMED);
    notificationService.notifyAppointmentConfirmed(updated);
    return updated;
  },
};
