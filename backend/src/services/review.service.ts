import { DanhGia, KhachHang, SanPham } from '../models';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';
import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { IDanhGiaWithDetails } from '../interfaces/review.interface';

class ReviewService {
  /**
   * Lấy danh sách đánh giá của sản phẩm sử dụng ORM
   */
  async getProductReviews(productId: number) {
    try {
      // Kiểm tra tồn tại của sản phẩm
      const product = await SanPham.findByPk(productId);
      if (!product) {
        throw new AppError('Không tìm thấy sản phẩm.', 404);
      }

      // Sử dụng ORM để lấy dữ liệu
      const danhGiaItems = await DanhGia.findAll({
        where: {
          MaSP: productId,
          TrangThai: true
        },
        order: [['NgayDanhGia', 'DESC']]
      });

      // Lấy thông tin khách hàng
      const reviews = await Promise.all(danhGiaItems.map(async (danhGia) => {
        const khachHang = await KhachHang.findByPk(danhGia.MaKH, {
          attributes: ['MaKH', 'HoTen']
        });
        
        return {
          MaDanhGia: danhGia.MaDanhGia,
          MaSP: danhGia.MaSP,
          MaKH: danhGia.MaKH,
          TenKhachHang: khachHang ? khachHang.HoTen : '',
          DiemSo: danhGia.DiemSo,
          BinhLuan: danhGia.BinhLuan,
          NgayDanhGia: danhGia.NgayDanhGia,
          TrangThai: danhGia.TrangThai
        };
      }));

      // Tính điểm trung bình
      const avgRating = danhGiaItems.length > 0
        ? danhGiaItems.reduce((sum, review) => sum + review.DiemSo, 0) / danhGiaItems.length
        : 0;

      return {
        reviews,
        averageRating: avgRating,
        totalReviews: danhGiaItems.length
      };
    } catch (error) {
      logger.error(`Error in getProductReviews service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy danh sách đánh giá.', 500);
    }
  }

  /**
   * Lấy chi tiết đánh giá theo ID sử dụng ORM
   */
  async getReviewById(reviewId: number) {
    try {
      const danhGia = await DanhGia.findByPk(reviewId);
      
      if (!danhGia) {
        throw new AppError('Không tìm thấy đánh giá.', 404);
      }
      
      // Lấy thêm thông tin sản phẩm và khách hàng
      const khachHang = await KhachHang.findByPk(danhGia.MaKH, {
        attributes: ['MaKH', 'HoTen']
      });
      
      const sanPham = await SanPham.findByPk(danhGia.MaSP, {
        attributes: ['MaSP', 'TenSP']
      });
      
      return {
        MaDanhGia: danhGia.MaDanhGia,
        MaSP: danhGia.MaSP,
        TenSP: sanPham ? sanPham.TenSP : '',
        MaKH: danhGia.MaKH,
        TenKhachHang: khachHang ? khachHang.HoTen : '',
        DiemSo: danhGia.DiemSo,
        BinhLuan: danhGia.BinhLuan,
        NgayDanhGia: danhGia.NgayDanhGia,
        TrangThai: danhGia.TrangThai
      };
    } catch (error) {
      logger.error(`Error in getReviewById service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy thông tin đánh giá.', 500);
    }
  }

  /**
   * Lấy tất cả đánh giá với phân trang và lọc sử dụng ORM
   */
  async getAllReviews(options: {
    productId?: number;
    customerId?: string;
    rating?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const { productId, customerId, rating, page = 1, limit = 10 } = options;
      
      // Xây dựng điều kiện tìm kiếm
      const whereClause: any = {};
      
      if (productId) {
        whereClause.MaSP = productId;
      }
      
      if (customerId) {
        whereClause.MaKH = customerId;
      }
      
      if (rating) {
        whereClause.DiemSo = rating;
      }
      
      const offset = (page - 1) * limit;
      
      // Sử dụng ORM để lấy dữ liệu với phân trang
      const { rows: danhGiaItems, count: totalItems } = await DanhGia.findAndCountAll({
        where: whereClause,
        order: [['NgayDanhGia', 'DESC']],
        limit,
        offset,
        distinct: true
      });
      
      // Xử lý kết quả để bổ sung thông tin khách hàng và sản phẩm
      const reviews = await Promise.all(danhGiaItems.map(async (danhGia) => {
        const khachHang = await KhachHang.findByPk(danhGia.MaKH, {
          attributes: ['MaKH', 'HoTen']
        });
        
        const sanPham = await SanPham.findByPk(danhGia.MaSP, {
          attributes: ['MaSP', 'TenSP']
        });
        
        return {
          MaDanhGia: danhGia.MaDanhGia,
          MaSP: danhGia.MaSP,
          TenSP: sanPham ? sanPham.TenSP : '',
          MaKH: danhGia.MaKH,
          TenKhachHang: khachHang ? khachHang.HoTen : '',
          DiemSo: danhGia.DiemSo,
          BinhLuan: danhGia.BinhLuan,
          NgayDanhGia: danhGia.NgayDanhGia,
          TrangThai: danhGia.TrangThai
        };
      }));
      
      const totalPages = Math.ceil(totalItems / limit);
      
      return {
        reviews,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        }
      };
    } catch (error) {
      logger.error(`Error in getAllReviews service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy danh sách đánh giá.', 500);
    }
  }

  /**
   * Tạo đánh giá mới
   */
  async createReview(reviewData: {
    MaSP: number;
    MaKH: string;
    DiemSo: number;
    BinhLuan?: string;
  }) {
    try {
      // Kiểm tra tồn tại của sản phẩm
      const product = await SanPham.findByPk(reviewData.MaSP);
      if (!product) {
        throw new AppError('Không tìm thấy sản phẩm.', 404);
      }

      // Kiểm tra tồn tại của khách hàng
      const customer = await KhachHang.findByPk(reviewData.MaKH);
      if (!customer) {
        throw new AppError('Không tìm thấy khách hàng.', 404);
      }

      // Kiểm tra xem khách hàng đã đánh giá sản phẩm này chưa
      const existingReview = await DanhGia.findOne({
        where: {
          MaSP: reviewData.MaSP,
          MaKH: reviewData.MaKH
        }
      });

      if (existingReview) {
        throw new AppError('Bạn đã đánh giá sản phẩm này trước đó.', 400);
      }

      // Kiểm tra điểm số hợp lệ
      if (reviewData.DiemSo < 1 || reviewData.DiemSo > 5) {
        throw new AppError('Điểm đánh giá phải từ 1 đến 5.', 400);
      }

      // Tạo đánh giá mới
      const newReview = await DanhGia.create({
        ...reviewData,
        NgayDanhGia: new Date(),
        TrangThai: true
      });

      // Lấy chi tiết đánh giá đã tạo bằng view
      return this.getReviewById(newReview.MaDanhGia);
    } catch (error) {
      logger.error(`Error in createReview service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi tạo đánh giá.', 500);
    }
  }

  /**
   * Cập nhật đánh giá
   */
  async updateReview(reviewId: number, userId: string, reviewData: {
    DiemSo?: number;
    BinhLuan?: string;
  }) {
    try {
      // Kiểm tra tồn tại của đánh giá
      const review = await DanhGia.findByPk(reviewId);
      if (!review) {
        throw new AppError('Không tìm thấy đánh giá.', 404);
      }

      // Kiểm tra người dùng có quyền cập nhật đánh giá này không
      if (review.MaKH !== userId) {
        throw new AppError('Bạn không có quyền cập nhật đánh giá này.', 403);
      }

      // Kiểm tra điểm số hợp lệ
      if (reviewData.DiemSo !== undefined && (reviewData.DiemSo < 1 || reviewData.DiemSo > 5)) {
        throw new AppError('Điểm đánh giá phải từ 1 đến 5.', 400);
      }

      // Cập nhật đánh giá
      await review.update({
        DiemSo: reviewData.DiemSo !== undefined ? reviewData.DiemSo : review.DiemSo,
        BinhLuan: reviewData.BinhLuan !== undefined ? reviewData.BinhLuan : review.BinhLuan,
        NgayDanhGia: new Date() // Cập nhật ngày đánh giá
      });

      // Lấy chi tiết đánh giá đã cập nhật bằng view
      return this.getReviewById(reviewId);
    } catch (error) {
      logger.error(`Error in updateReview service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi cập nhật đánh giá.', 500);
    }
  }

  /**
   * Xóa đánh giá (ẩn đánh giá)
   */
  async deleteReview(reviewId: number, userId: string, isAdmin: boolean) {
    try {
      // Kiểm tra tồn tại của đánh giá
      const review = await DanhGia.findByPk(reviewId);
      if (!review) {
        throw new AppError('Không tìm thấy đánh giá.', 404);
      }

      // Kiểm tra người dùng có quyền xóa đánh giá này không
      if (!isAdmin && review.MaKH !== userId) {
        throw new AppError('Bạn không có quyền xóa đánh giá này.', 403);
      }

      // Ẩn đánh giá thay vì xóa hẳn khỏi database
      await review.update({
        TrangThai: false
      });

      return { success: true, message: 'Đã ẩn đánh giá thành công.' };
    } catch (error) {
      logger.error(`Error in deleteReview service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi xóa đánh giá.', 500);
    }
  }
}

export default new ReviewService(); 