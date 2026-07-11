import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../utils/errors';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: 'Không tìm thấy endpoint' });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Lỗi hệ thống, vui lòng thử lại sau' });
}
