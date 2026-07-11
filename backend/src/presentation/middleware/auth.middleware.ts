import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyToken } from '../../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; role: Role };
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Thiếu token xác thực');
  }

  const token = header.substring('Bearer '.length);
  try {
    const payload = verifyToken(token);
    req.user = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    throw new UnauthorizedError('Token không hợp lệ hoặc đã hết hạn');
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError('Bạn không có quyền thực hiện thao tác này');
    }
    next();
  };
}
