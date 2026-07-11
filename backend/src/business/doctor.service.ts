import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { doctorRepository } from '../data-access/doctor.repository';
import { specialtyRepository } from '../data-access/specialty.repository';
import { timeSlotRepository } from '../data-access/timeslot.repository';
import { userRepository } from '../data-access/user.repository';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors';

const MAX_SCHEDULE_DAYS_AHEAD = 30;

export const doctorService = {
  searchDoctors(specialtyId?: string, keyword?: string) {
    return doctorRepository.findMany(specialtyId, keyword);
  },

  async getDoctorById(id: string) {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) throw new NotFoundError('Không tìm thấy bác sĩ');
    return doctor;
  },

  async getAvailableSlots(doctorId: string, date: Date) {
    await this.getDoctorById(doctorId);
    return timeSlotRepository.findAvailable(doctorId, date);
  },

  async createSchedule(
    doctorUserId: string,
    date: Date,
    startHour: number,
    endHour: number,
    slotMinutes: number
  ) {
    const doctor = await doctorRepository.findByUserId(doctorUserId);
    if (!doctor) throw new NotFoundError('Không tìm thấy hồ sơ bác sĩ');

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + MAX_SCHEDULE_DAYS_AHEAD);
    if (date > maxDate) {
      throw new BadRequestError(`Chỉ được mở lịch tối đa ${MAX_SCHEDULE_DAYS_AHEAD} ngày tới`);
    }
    if (startHour >= endHour) {
      throw new BadRequestError('Giờ bắt đầu phải trước giờ kết thúc');
    }

    const slots: { startTime: string; endTime: string }[] = [];
    for (let minutes = startHour * 60; minutes + slotMinutes <= endHour * 60; minutes += slotMinutes) {
      const start = minutesToTime(minutes);
      const end = minutesToTime(minutes + slotMinutes);
      slots.push({ startTime: start, endTime: end });
    }

    const created = await timeSlotRepository.createMany(doctor.id, date, slots);
    return { totalRequested: slots.length, created };
  },

  // --- Admin operations ---
  listSpecialties() {
    return specialtyRepository.findAll();
  },

  createSpecialty(name: string) {
    return specialtyRepository.create(name);
  },

  updateSpecialty(id: string, name: string) {
    return specialtyRepository.update(id, name);
  },

  async deleteSpecialty(id: string) {
    const count = await specialtyRepository.countDoctors(id);
    if (count > 0) {
      throw new BadRequestError('Không thể xóa chuyên khoa đang có bác sĩ trực thuộc');
    }
    return specialtyRepository.delete(id);
  },

  async createDoctorAccount(input: {
    email: string;
    fullName: string;
    specialtyId: string;
    bio?: string;
    experienceYears?: number;
  }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new ConflictError('Email đã được sử dụng');

    const specialty = await specialtyRepository.findById(input.specialtyId);
    if (!specialty) throw new NotFoundError('Không tìm thấy chuyên khoa');

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: Role.DOCTOR,
    });

    const doctor = await doctorRepository.create({
      userId: user.id,
      specialtyId: input.specialtyId,
      bio: input.bio,
      experienceYears: input.experienceYears,
    });

    console.log(`[EMAIL] Gửi mật khẩu tạm tới ${user.email}: ${tempPassword}`);
    return { doctor, tempPassword };
  },

  setDoctorAccountActive(userId: string, isActive: boolean) {
    return userRepository.setActive(userId, isActive);
  },
};

function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function generateTempPassword(): string {
  return Math.random().toString(36).slice(-10) + 'A1!';
}
