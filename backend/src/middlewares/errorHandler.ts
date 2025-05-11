import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Lớp lỗi tùy chỉnh
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware xử lý lỗi
const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log lỗi
  logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack);

  // Phản hồi lỗi
  if (process.env.NODE_ENV === 'development') {
    // Phản hồi đầy đủ trong môi trường phát triển
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // Phản hồi đơn giản trong môi trường sản xuất
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Lỗi lập trình hoặc lỗi không xác định khác
      logger.error('Lỗi hệ thống không xác định!', err);
      res.status(500).json({
        status: 'error',
        message: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
      });
    }
  }
};

export default errorHandler; 