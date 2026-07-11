export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: Role;
  isActive: boolean;
}

export interface Specialty {
  id: string;
  name: string;
}

export interface Doctor {
  id: string;
  userId: string;
  specialtyId: string;
  bio?: string | null;
  experienceYears: number;
  user: User;
  specialty: Specialty;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  status: AppointmentStatus;
  note?: string | null;
  cancelReason?: string | null;
  createdAt: string;
  slot: TimeSlot;
  doctor?: Doctor;
  patient?: User;
}
