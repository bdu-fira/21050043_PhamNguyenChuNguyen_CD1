import { Request, Response, NextFunction } from 'express';
import khachhangService from '../services/khachhang.service';
import { successResponse } from '../utils/responseHandler';
import { AppError } from '../middlewares/errorHandler';
import { isValidEmail, isValidPassword } from '../utils/validator';
import logger from '../utils/logger';

const KhachHangController = {
  // Lấy danh sách khách hàng
  async getKhachHangs(req: Request, res: Response, next: NextFunction) {
    try {
      const khachhangs = await khachhangService.getKhachHangs();
      return successResponse(res, khachhangs, 'Lấy danh sách khách hàng thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Lấy thông tin chi tiết khách hàng
  async getKhachHangById(req: Request, res: Response, next: NextFunction) {
    try {
      const maKH = req.params.id;
      
      const khachhang = await khachhangService.getKhachHangById(maKH);
      
      if (!khachhang) {
        return next(new AppError('Khách hàng không tồn tại.', 404));
      }
      
      return successResponse(res, khachhang, 'Lấy thông tin khách hàng thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Đăng ký khách hàng mới
  async registerKhachHang(req: Request, res: Response, next: NextFunction) {
    try {
      const { Email, MatKhau, HoTen, SoDienThoai } = req.body;

      // Validation
      if (!Email || !MatKhau || !HoTen) {
        return next(new AppError('Vui lòng điền đầy đủ thông tin cần thiết.', 400));
      }

      if (!isValidEmail(Email)) {
        return next(new AppError('Email không hợp lệ.', 400));
      }

      if (!isValidPassword(MatKhau)) {
        return next(
          new AppError('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.', 400)
        );
      }

      const khachhangData = {
        Email,
        MatKhau,
        HoTen,
        SoDienThoai,
        MaVaiTro: 1 // Vai trò mặc định khách hàng
      };
      
      const newKhachHang = await khachhangService.createKhachHang(khachhangData);
      return successResponse(res, newKhachHang, 'Đăng ký tài khoản thành công.', 201);
    } catch (error) {
      next(error);
    }
  },

  // Đăng nhập
  async loginKhachHang(req: Request, res: Response, next: NextFunction) {
    try {
      const { Email, MatKhau } = req.body;

      // Validation
      if (!Email || !MatKhau) {
        return next(new AppError('Vui lòng nhập email và mật khẩu.', 400));
      }

      const result = await khachhangService.loginKhachHang({ Email, MatKhau });

      // Đặt cookie JWT nếu cần
      if (process.env.SKIP_REDIS !== 'true') {
        res.cookie('jwt', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 1 ngày
        });
      }

      return successResponse(res, result, 'Đăng nhập thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Cập nhật thông tin khách hàng
  async updateKhachHang(req: Request, res: Response, next: NextFunction) {
    try {
      const maKH = req.params.id;
      const updateData = req.body;
      
      // Đảm bảo chỉ cập nhật thông tin của chính mình
      if (req.user && req.user.id !== maKH && req.user.userType !== 'admin') {
        return next(new AppError('Bạn không có quyền cập nhật thông tin của khách hàng khác.', 403));
      }
      
      const updatedKhachHang = await khachhangService.updateKhachHang(maKH, updateData);
      
      if (!updatedKhachHang) {
        return next(new AppError('Khách hàng không tồn tại.', 404));
      }
      
      return successResponse(res, updatedKhachHang, 'Cập nhật thông tin khách hàng thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Lấy thông tin của chính mình
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return next(new AppError('Vui lòng đăng nhập để truy cập.', 401));
      }
      
      const khachhang = await khachhangService.getKhachHangById(req.user.id);
      
      if (!khachhang) {
        return next(new AppError('Khách hàng không tồn tại.', 404));
      }
      
      return successResponse(res, khachhang, 'Lấy thông tin cá nhân thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Vô hiệu hóa khách hàng
  async deactivateKhachHang(req: Request, res: Response, next: NextFunction) {
    try {
      const maKH = req.params.id;
      
      const deactivatedKhachHang = await khachhangService.deactivateKhachHang(maKH);
      
      if (!deactivatedKhachHang) {
        return next(new AppError('Khách hàng không tồn tại.', 404));
      }
      
      return successResponse(res, deactivatedKhachHang, 'Vô hiệu hóa khách hàng thành công.');
    } catch (error) {
      next(error);
    }
  }
};

export default KhachHangController; 