import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { AppError } from './errorHandler';
import { redisClient } from '../config/redis';
import { KhachHang, NhanVien } from '../models';

// Mở rộng interface Request để thêm thuộc tính user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        vaiTroId: string;
        userType: string;
      };
    }
  }
}

interface JwtPayload {
  id: string;
  vaiTroId: string;
  userType: string;
  iat: number;
  exp: number;
  [key: string]: any;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Lấy token từ header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('Bạn chưa đăng nhập! Vui lòng đăng nhập để truy cập.', 401));
    }

    // 2) Xác minh token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    } catch (err) {
      return next(new AppError('Token không hợp lệ hoặc đã hết hạn.', 401));
    }

    // 3) Kiểm tra xem token có trong danh sách hết hạn không (đã đăng xuất)
    // Bỏ qua kiểm tra blacklist nếu SKIP_REDIS=true
    if (process.env.SKIP_REDIS !== 'true') {
      try {
        const isBlacklisted = await redisClient.get(`blacklist:${token}`);
        if (isBlacklisted) {
          return next(new AppError('Token không hợp lệ. Vui lòng đăng nhập lại.', 401));
        }
      } catch (error) {
        console.warn('Không thể kiểm tra blacklist token, bỏ qua bước này');
      }
    }

    // 4) Kiểm tra user có tồn tại không - nếu không bỏ qua DB
    if (process.env.SKIP_DB !== 'true') {
      try {
        let userExists = false;
        
        if (decoded.userType === 'admin') {
          const admin = await NhanVien.findByPk(decoded.id);
          userExists = !!admin;
        } else {
          const customer = await KhachHang.findByPk(decoded.id);
          userExists = !!customer;
        }
        
        if (!userExists) {
          return next(new AppError('Người dùng không tồn tại hoặc đã bị xóa.', 401));
        }
      } catch (error) {
        console.warn('Không thể kiểm tra sự tồn tại của người dùng, bỏ qua bước này');
      }
    }

    // Lưu user vào request để sử dụng sau này
    req.user = {
      id: decoded.id,
      vaiTroId: decoded.vaiTroId,
      userType: decoded.userType
    };
    next();
  } catch (error: any) {
    return next(new AppError(error.message || 'Lỗi xác thực. Vui lòng đăng nhập lại.', 401));
  }
};

export const restrictTo = (...vaiTroIds: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Kiểm tra vai trò
    if (!req.user) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
    }

    // Kiểm tra vai trò dạng chuỗi và số
    const user = req.user; // Đảm bảo req.user không undefined
    const hasValidRole = vaiTroIds.some(role => {
      // Nếu vai trò là Admin và người dùng có MaVaiTro=1
      if (role === 'Admin' && user.vaiTroId === '1') {
        return true;
      }
      // Nếu vai trò là NhanVien và người dùng có MaVaiTro=2
      if (role === 'NhanVien' && user.vaiTroId === '2') {
        return true;
      }
      // Kiểm tra trực tiếp nếu vaiTroId giống hệt role
      return user.vaiTroId === role;
    });

    if (!hasValidRole) {
      return next(new AppError('Bạn không có quyền thực hiện hành động này.', 403));
    }
    
    next();
  };
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.userType !== 'admin') {
    return next(new AppError('Chỉ quản trị viên mới có quyền thực hiện hành động này.', 403));
  }
  next();
}; 