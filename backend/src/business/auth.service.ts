import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { userRepository } from '../data-access/user.repository';
import { signToken } from '../utils/jwt';
import { BadRequestError, ConflictError, ForbiddenError, UnauthorizedError } from '../utils/errors';

export const authService = {
  async register(input: { email: string; password: string; fullName: string; phone?: string; role: Role }) {
    if (input.role !== Role.PATIENT) {
      throw new BadRequestError(
        'Chỉ bệnh nhân được tự đăng ký. Tài khoản bác sĩ do quản trị viên tạo.'
      );
    }
    if (input.password.length < 6) {
      throw new BadRequestError('Mật khẩu phải có ít nhất 6 ký tự');
    }

    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      role: input.role,
    });

    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: sanitize(user) };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }
    if (!user.isActive) {
      throw new ForbiddenError('Tài khoản đã bị khóa');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng');
    }

    const token = signToken({ userId: user.id, role: user.role });
    return { token, user: sanitize(user) };
  },
};

function sanitize<T extends { passwordHash: string }>(user: T) {
  const { passwordHash, ...rest } = user;
  return rest;
}
