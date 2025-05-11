import { Response } from 'express';

// Interface cho đối tượng phản hồi API
interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: {
    code?: string;
    details?: any;
  };
}

// Hàm phản hồi thành công
export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Thành công',
  statusCode = 200,
  pagination?: any
): Response => {
  const response: ApiResponse<T> = {
    status: 'success',
    message,
    data,
  };

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

// Hàm phản hồi lỗi
export const errorResponse = (
  res: Response,
  message = 'Đã xảy ra lỗi',
  statusCode = 500,
  errorCode?: string,
  errorDetails?: any
): Response => {
  const response: ApiResponse<null> = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
  };

  if (errorCode || errorDetails) {
    response.error = {
      code: errorCode,
      details: errorDetails,
    };
  }

  return res.status(statusCode).json(response);
};

// Hàm tạo đối tượng phân trang
export const createPagination = (
  page: number,
  limit: number,
  totalItems: number
) => {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}; 