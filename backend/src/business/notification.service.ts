import { Appointment, TimeSlot, User } from '@prisma/client';

type SafeUser = Omit<User, 'passwordHash'>;

type AppointmentWithRelations = Appointment & {
  slot: TimeSlot;
  patient: SafeUser;
  doctor: { user: SafeUser };
};

/**
 * MVP: log ra console thay vì gửi SMTP thật.
 * Có thể thay bằng provider SMTP/SendGrid mà không ảnh hưởng AppointmentService (QA-04 Modifiability).
 */
export const notificationService = {
  notifyAppointmentCreated(appointment: AppointmentWithRelations) {
    console.log(
      `[EMAIL] Gửi tới bác sĩ ${appointment.doctor.user.email}: có lịch hẹn mới từ ${appointment.patient.fullName} lúc ${appointment.slot.startTime} ngày ${appointment.slot.date.toISOString().slice(0, 10)}`
    );
  },

  notifyAppointmentConfirmed(appointment: AppointmentWithRelations) {
    console.log(
      `[EMAIL] Gửi tới bệnh nhân ${appointment.patient.email}: lịch hẹn đã được bác sĩ ${appointment.doctor.user.fullName} xác nhận`
    );
  },

  notifyAppointmentCancelled(appointment: AppointmentWithRelations, byRole: 'PATIENT' | 'DOCTOR') {
    const recipient = byRole === 'PATIENT' ? appointment.doctor.user.email : appointment.patient.email;
    console.log(`[EMAIL] Gửi tới ${recipient}: lịch hẹn đã bị hủy bởi ${byRole === 'PATIENT' ? 'bệnh nhân' : 'bác sĩ'}`);
  },
};
