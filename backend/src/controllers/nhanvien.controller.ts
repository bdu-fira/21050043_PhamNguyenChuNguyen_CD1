import { Request, Response, NextFunction } from 'express';
import nhanvienService from '../services/nhanvien.service';
import { successResponse } from '../utils/responseHandler';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

const NhanVienController = {
  // Lấy danh sách nhân viên
  async getNhanViens(req: Request, res: Response, next: NextFunction) {
    try {
      const nhanviens = await nhanvienService.getNhanViens();
      return successResponse(res, nhanviens, 'Lấy danh sách nhân viên thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Lấy thông tin chi tiết nhân viên
  async getNhanVienById(req: Request, res: Response, next: NextFunction) {
    try {
      const maNV = req.params.id;
      
      const nhanvien = await nhanvienService.getNhanVienById(maNV);
      
      if (!nhanvien) {
        return next(new AppError('Nhân viên không tồn tại.', 404));
      }
      
      return successResponse(res, nhanvien, 'Lấy thông tin nhân viên thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Tạo nhân viên mới
  async createNhanVien(req: Request, res: Response, next: NextFunction) {
    try {
      const nhanvienData = req.body;
      
      // Validation cơ bản
      if (!nhanvienData.HoTen || !nhanvienData.Email || !nhanvienData.MatKhau) {
        return next(new AppError('Vui lòng cung cấp đầy đủ thông tin bắt buộc.', 400));
      }
      
      const newNhanVien = await nhanvienService.createNhanVien(nhanvienData);
      return successResponse(res, newNhanVien, 'Tạo nhân viên thành công.', 201);
    } catch (error) {
      next(error);
    }
  },

  // Cập nhật thông tin nhân viên
  async updateNhanVien(req: Request, res: Response, next: NextFunction) {
    try {
      const maNV = req.params.id;
      const updateData = req.body;
      
      const updatedNhanVien = await nhanvienService.updateNhanVien(maNV, updateData);
      
      if (!updatedNhanVien) {
        return next(new AppError('Nhân viên không tồn tại.', 404));
      }
      
      return successResponse(res, updatedNhanVien, 'Cập nhật thông tin nhân viên thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Vô hiệu hóa nhân viên
  async deactivateNhanVien(req: Request, res: Response, next: NextFunction) {
    try {
      const maNV = req.params.id;
      
      const deactivatedNhanVien = await nhanvienService.deactivateNhanVien(maNV);
      
      if (!deactivatedNhanVien) {
        return next(new AppError('Nhân viên không tồn tại.', 404));
      }
      
      return successResponse(res, deactivatedNhanVien, 'Vô hiệu hóa nhân viên thành công.');
    } catch (error) {
      next(error);
    }
  }
};

export default NhanVienController; 