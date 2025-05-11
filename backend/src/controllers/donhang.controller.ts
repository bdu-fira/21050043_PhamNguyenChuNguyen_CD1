import { Request, Response, NextFunction } from 'express';
import donhangService from '../services/donhang.service';
import { successResponse } from '../utils/responseHandler';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

const DonHangController = {
  // Lấy danh sách đơn hàng
  async getDonHangs(req: Request, res: Response, next: NextFunction) {
    try {
      const maKH = req.query.maKH as string;
      const trangThai = req.query.trangThai as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await donhangService.getDonHangs(maKH, trangThai, page, limit);
      return successResponse(res, {
        donhangs: result.donhangs,
        pagination: {
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          currentPage: page,
          limit
        }
      }, 'Lấy danh sách đơn hàng thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Lấy thông tin chi tiết đơn hàng
  async getDonHangById(req: Request, res: Response, next: NextFunction) {
    try {
      const maDonHang = parseInt(req.params.id);
      
      if (isNaN(maDonHang)) {
        return next(new AppError('Mã đơn hàng không hợp lệ.', 400));
      }
      
      const donhang = await donhangService.getDonHangById(maDonHang);
      
      if (!donhang) {
        return next(new AppError('Đơn hàng không tồn tại.', 404));
      }
      
      return successResponse(res, donhang, 'Lấy thông tin đơn hàng thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Tạo đơn hàng mới
  async createDonHang(req: Request, res: Response, next: NextFunction) {
    try {
      const donhangData = req.body;
      const userData = req.user;
      
      // Thêm userId từ JWT token nếu là request từ frontend
      if (donhangData.items && Array.isArray(donhangData.items)) {
        donhangData.userId = userData?.id;
      } else {
        // Validation cơ bản cho định dạng backend
        if (!donhangData.MaKH || !donhangData.TenNguoiNhan || !donhangData.SoDienThoaiNhan || 
            !donhangData.DiaChiGiaoHang || !donhangData.ChiTietDonHang || donhangData.ChiTietDonHang.length === 0) {
          return next(new AppError('Vui lòng cung cấp đầy đủ thông tin đơn hàng.', 400));
        }
      }
      
      const newDonHang = await donhangService.createDonHang(donhangData);
      
      // Định dạng lại ID để frontend có thể sử dụng
      let responseData: any = newDonHang;
      if (newDonHang) {
        responseData = {
          ...JSON.parse(JSON.stringify(newDonHang)),
          id: newDonHang.MaDonHang // Thêm trường id để frontend có thể truy cập dễ dàng
        };
      }
      
      return successResponse(res, responseData, 'Tạo đơn hàng thành công.', 201);
    } catch (error) {
      next(error);
    }
  },

  // Cập nhật trạng thái đơn hàng
  async updateDonHang(req: Request, res: Response, next: NextFunction) {
    try {
      const maDonHang = parseInt(req.params.id);
      const requestData = req.body;
      
      if (isNaN(maDonHang)) {
        return next(new AppError('Mã đơn hàng không hợp lệ.', 400));
      }
      
      // Biến đổi dữ liệu từ frontend thành định dạng dữ liệu phù hợp với backend
      const updateData = {
        TrangThaiDonHang: requestData.status || requestData.TrangThaiDonHang,
        TrangThaiThanhToan: requestData.paymentStatus || requestData.TrangThaiThanhToan,
        GhiChuQuanTri: requestData.adminNote || requestData.GhiChuQuanTri
      };
      
      // Loại bỏ các trường không được cung cấp
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });
      
      const updatedDonHang = await donhangService.updateDonHang(maDonHang, updateData);
      
      if (!updatedDonHang) {
        return next(new AppError('Đơn hàng không tồn tại.', 404));
      }
      
      return successResponse(res, updatedDonHang, 'Cập nhật đơn hàng thành công.');
    } catch (error) {
      logger.error(`Error in updateDonHang controller: ${error}`);
      next(error);
    }
  },

  // Hủy đơn hàng
  async cancelDonHang(req: Request, res: Response, next: NextFunction) {
    try {
      const maDonHang = parseInt(req.params.id);
      // Lấy lý do hủy từ request body, hỗ trợ cả hai định dạng
      const lyDo = req.body.lyDo || req.body.adminNote || req.body.reason || '';
      
      if (isNaN(maDonHang)) {
        return next(new AppError('Mã đơn hàng không hợp lệ.', 400));
      }
      
      const cancelledDonHang = await donhangService.cancelDonHang(maDonHang, lyDo);
      
      if (!cancelledDonHang) {
        return next(new AppError('Đơn hàng không tồn tại hoặc không thể hủy.', 404));
      }
      
      return successResponse(res, cancelledDonHang, 'Hủy đơn hàng thành công.');
    } catch (error) {
      logger.error(`Error in cancelDonHang controller: ${error}`);
      next(error);
    }
  }
};

export default DonHangController; 