import { Request, Response, NextFunction } from 'express';
import categoryService from '../services/category.service';
import { successResponse } from '../utils/responseHandler';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

const CategoryController = {
  // Lấy danh sách danh mục
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getCategories();
      return successResponse(res, categories, 'Lấy danh sách danh mục thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Lấy thông tin chi tiết danh mục
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const categoryId = Number(id);

      if (isNaN(categoryId)) {
        return next(new AppError('ID danh mục không hợp lệ.', 400));
      }

      const category = await categoryService.getCategoryById(categoryId);
      return successResponse(res, category, 'Lấy thông tin danh mục thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Tạo danh mục mới
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { tenDanhMuc, moTa, hinhAnh } = req.body;

      // Validation
      if (!tenDanhMuc) {
        return next(new AppError('Tên danh mục không được để trống.', 400));
      }

      const categoryData = {
        TenDanhMuc: tenDanhMuc,
        MoTa: moTa,
        HinhAnh: hinhAnh
      };

      const newCategory = await categoryService.createCategory(categoryData);
      return successResponse(res, newCategory, 'Tạo danh mục thành công.', 201);
    } catch (error) {
      next(error);
    }
  },

  // Cập nhật danh mục
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { tenDanhMuc, moTa, hinhAnh } = req.body;

      const categoryId = Number(id);
      if (isNaN(categoryId)) {
        return next(new AppError('ID danh mục không hợp lệ.', 400));
      }

      // Xây dựng đối tượng dữ liệu cập nhật
      const updateData: any = {};
      
      if (tenDanhMuc) updateData.TenDanhMuc = tenDanhMuc;
      if (moTa !== undefined) updateData.MoTa = moTa;
      if (hinhAnh !== undefined) updateData.HinhAnh = hinhAnh;

      const updatedCategory = await categoryService.updateCategory(categoryId, updateData);
      return successResponse(res, updatedCategory, 'Cập nhật danh mục thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Xóa danh mục
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const categoryId = Number(id);

      if (isNaN(categoryId)) {
        return next(new AppError('ID danh mục không hợp lệ.', 400));
      }

      await categoryService.deleteCategory(categoryId);
      return successResponse(res, null, 'Xóa danh mục thành công.');
    } catch (error) {
      next(error);
    }
  }
};

export default CategoryController; 