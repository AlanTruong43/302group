import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const specialties = await Promise.all(
    ['Nội tổng quát', 'Nhi khoa', 'Da liễu', 'Tim mạch', 'Tai Mũi Họng'].map((name) =>
      prisma.specialty.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@clinic.vn' },
    update: {},
    create: {
      email: 'admin@clinic.vn',
      passwordHash: adminPassword,
      fullName: 'Quản trị viên',
      role: Role.ADMIN,
    },
  });

  const doctorPassword = await bcrypt.hash('Doctor@123', 10);
  const doctorUser = await prisma.user.upsert({
    where: { email: 'bs.an@clinic.vn' },
    update: {},
    create: {
      email: 'bs.an@clinic.vn',
      passwordHash: doctorPassword,
      fullName: 'BS. Nguyễn Văn An',
      role: Role.DOCTOR,
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      specialtyId: specialties[0].id,
      bio: 'Bác sĩ chuyên khoa Nội tổng quát, 10 năm kinh nghiệm.',
      experienceYears: 10,
    },
  });

  const patientPassword = await bcrypt.hash('Patient@123', 10);
  await prisma.user.upsert({
    where: { email: 'benhnhan@example.com' },
    update: {},
    create: {
      email: 'benhnhan@example.com',
      passwordHash: patientPassword,
      fullName: 'Trần Thị Bình',
      phone: '0900000000',
      role: Role.PATIENT,
    },
  });

  const today = new Date();
  const slotDates = [0, 1, 2].map((offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  for (const date of slotDates) {
    for (const startHour of [8, 9, 10, 14, 15]) {
      const startTime = `${String(startHour).padStart(2, '0')}:00`;
      const endTime = `${String(startHour).padStart(2, '0')}:30`;
      await prisma.timeSlot.upsert({
        where: {
          doctorId_date_startTime: {
            doctorId: doctor.id,
            date,
            startTime,
          },
        },
        update: {},
        create: {
          doctorId: doctor.id,
          date,
          startTime,
          endTime,
        },
      });
    }
  }

  console.log('Seed data created successfully.');
  console.log('Admin login: admin@clinic.vn / Admin@123');
  console.log('Doctor login: bs.an@clinic.vn / Doctor@123');
  console.log('Patient login: benhnhan@example.com / Patient@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
