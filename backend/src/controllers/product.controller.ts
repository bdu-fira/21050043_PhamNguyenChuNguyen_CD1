import { Request, Response, NextFunction } from 'express';
import productService from '../services/product.service';
import { successResponse, errorResponse } from '../utils/responseHandler';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';

const ProductController = {
  // Lấy danh sách sản phẩm
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        keyword,
        categoryId,
        minPrice,
        maxPrice,
        sortBy,
        page,
        limit,
        withReviews 
      } = req.query;

      // Tiền xử lý dữ liệu đầu vào
      const options = {
        keyword: keyword as string,
        categoryId: categoryId ? Number(categoryId) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as 'newest' | 'price_asc' | 'price_desc' | 'popular',
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10
      };

      // Quyết định lấy dữ liệu với đánh giá hay không
      let result;
      if (withReviews === 'true') {
        result = await productService.getProductsWithReviews({
          page: options.page,
          limit: options.limit,
          sortBy: sortBy as string
        });
      } else {
        result = await productService.getProducts(options);
      }
      
      return successResponse(res, result, 'Lấy danh sách sản phẩm thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Lấy thông tin chi tiết sản phẩm
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const productId = Number(id);

      if (isNaN(productId)) {
        return next(new AppError('ID sản phẩm không hợp lệ.', 400));
      }

      const product = await productService.getProductById(productId);
      return successResponse(res, product, 'Lấy thông tin sản phẩm thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Tạo sản phẩm mới
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      // Kiểm tra dữ liệu đầu vào
      const { tenSanPham, moTa, giaBan, soLuong, maDanhMuc, dacDiemNoiBat, hinhAnh } = req.body;

      // Validation
      if (!tenSanPham || !moTa || !giaBan || !maDanhMuc) {
        return next(new AppError('Vui lòng điền đầy đủ thông tin sản phẩm.', 400));
      }

      if (isNaN(Number(giaBan)) || Number(giaBan) <= 0) {
        return next(new AppError('Giá bán phải là số dương.', 400));
      }

      // Kiểm tra hình ảnh
      if (!hinhAnh) {
        return next(new AppError('Vui lòng cung cấp URL hình ảnh cho sản phẩm.', 400));
      }

      const productData = {
        TenSP: tenSanPham,
        MoTaDai: moTa,
        GiaBan: Number(giaBan),
        SoLuongTon: Number(soLuong) || 0,
        HinhAnhChinhURL: hinhAnh,
        MaDanhMuc: Number(maDanhMuc),
        DacDiemNoiBat: dacDiemNoiBat || null
      };

      const newProduct = await productService.createProduct(productData);
      return successResponse(res, newProduct, 'Tạo sản phẩm thành công.', 201);
    } catch (error) {
      logger.error(`Error in createProduct controller: ${error}`);
      next(error);
    }
  },

  // Cập nhật sản phẩm
  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { tenSanPham, moTa, giaBan, soLuong, hinhAnh, maDanhMuc, dacDiemNoiBat, trangThai, useRawQuery } = req.body;

      const productId = Number(id);
      if (isNaN(productId)) {
        return next(new AppError('ID sản phẩm không hợp lệ.', 400));
      }

      // Xây dựng đối tượng dữ liệu cập nhật
      const updateData: any = {};
      
      if (tenSanPham) updateData.TenSP = tenSanPham;
      if (moTa) updateData.MoTaDai = moTa;
      if (giaBan) {
        if (isNaN(Number(giaBan)) || Number(giaBan) <= 0) {
          return next(new AppError('Giá bán phải là số dương.', 400));
        }
        updateData.GiaBan = Number(giaBan);
      }
      if (soLuong !== undefined) updateData.SoLuongTon = Number(soLuong);
      if (hinhAnh) updateData.HinhAnhChinhURL = hinhAnh;
      if (maDanhMuc) updateData.MaDanhMuc = Number(maDanhMuc);
      if (dacDiemNoiBat !== undefined) updateData.DacDiemNoiBat = dacDiemNoiBat;

      // Quyết định sử dụng phương thức nào dựa vào flag useRawQuery
      const updatedProduct = useRawQuery === 'true' 
        ? await productService.updateProductWithRawQuery(productId, updateData)
        : await productService.updateProduct(productId, updateData);

      return successResponse(res, updatedProduct, 'Cập nhật sản phẩm thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Xóa sản phẩm
  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const productId = Number(id);

      if (isNaN(productId)) {
        return next(new AppError('ID sản phẩm không hợp lệ.', 400));
      }

      await productService.deleteProduct(productId);
      return successResponse(res, null, 'Xóa sản phẩm thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Lấy sản phẩm bán chạy
  async getBestSellingProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const limitValue = limit ? Number(limit) : 10;
      
      if (isNaN(limitValue) || limitValue <= 0) {
        return next(new AppError('Giới hạn phải là số dương.', 400));
      }

      const products = await productService.getBestSellingProducts(limitValue);
      return successResponse(res, products, 'Lấy danh sách sản phẩm bán chạy thành công.');
    } catch (error) {
      next(error);
    }
  },

  // Lấy danh sách sản phẩm cho Dashboard
  async getProductsForDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        keyword,
        categoryId,
        status,
        sortBy,
        page,
        limit
      } = req.query;

      // Tiền xử lý dữ liệu đầu vào
      const options = {
        keyword: keyword as string,
        categoryId: categoryId ? Number(categoryId) : undefined,
        status: status as string,
        sortBy: sortBy as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10
      };

      const result = await productService.getProductsForDashboard(options);
      
      return successResponse(res, result, 'Lấy danh sách sản phẩm cho dashboard thành công.');
    } catch (error) {
      next(error);
    }
  }
};

export default ProductController; 