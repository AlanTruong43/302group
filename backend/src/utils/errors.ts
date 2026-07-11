export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Yêu cầu không hợp lệ') {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Chưa xác thực') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Không có quyền truy cập') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Không tìm thấy tài nguyên') {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Xung đột dữ liệu') {
    super(409, message);
  }
}
