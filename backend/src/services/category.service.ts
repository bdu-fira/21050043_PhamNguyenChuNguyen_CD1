import { DanhMuc, SanPham } from '../models';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';
import { Op } from 'sequelize';

class CategoryService {
  /**
   * Lấy danh sách danh mục
   */
  async getCategories() {
    try {
      const categories = await DanhMuc.findAll({
        attributes: ['MaDanhMuc', 'TenDanhMuc', 'MoTa', 'HinhAnh', 'NgayTao'],
        order: [['MaDanhMuc', 'ASC']]
      });
      return categories;
    } catch (error) {
      logger.error(`Error in getCategories service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy danh sách danh mục.', 500);
    }
  }

  /**
   * Lấy chi tiết danh mục theo ID
   */
  async getCategoryById(categoryId: number) {
    try {
      const category = await DanhMuc.findByPk(categoryId, {
        include: [
          {
            model: SanPham,
            as: 'SanPhams',
            attributes: ['MaSP', 'TenSP', 'GiaBan', 'HinhAnhChinhURL', 'SoLuongTon']
          }
        ]
      });

      if (!category) {
        throw new AppError('Không tìm thấy danh mục.', 404);
      }

      return category;
    } catch (error) {
      logger.error(`Error in getCategoryById service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy thông tin danh mục.', 500);
    }
  }

  /**
   * Tạo danh mục mới
   */
  async createCategory(categoryData: {
    TenDanhMuc: string;
    MoTa?: string;
    HinhAnh?: string;
  }) {
    try {
      // Kiểm tra tên danh mục đã tồn tại chưa
      const existingCategory = await DanhMuc.findOne({
        where: {
          TenDanhMuc: categoryData.TenDanhMuc
        }
      });

      if (existingCategory) {
        throw new AppError('Tên danh mục đã tồn tại.', 400);
      }

      // Tạo danh mục mới
      const newCategory = await DanhMuc.create({
        ...categoryData,
        NgayTao: new Date(),
        NgayCapNhat: new Date()
      });

      return newCategory;
    } catch (error) {
      logger.error(`Error in createCategory service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi tạo danh mục.', 500);
    }
  }

  /**
   * Cập nhật danh mục
   */
  async updateCategory(categoryId: number, categoryData: {
    TenDanhMuc?: string;
    MoTa?: string;
    HinhAnh?: string;
  }) {
    try {
      // Kiểm tra tồn tại của danh mục
      const category = await DanhMuc.findByPk(categoryId);
      if (!category) {
        throw new AppError('Không tìm thấy danh mục.', 404);
      }

      // Kiểm tra tên danh mục đã tồn tại chưa (nếu có thay đổi tên)
      if (categoryData.TenDanhMuc && categoryData.TenDanhMuc !== category.TenDanhMuc) {
        const existingCategory = await DanhMuc.findOne({
          where: {
            TenDanhMuc: categoryData.TenDanhMuc,
            MaDanhMuc: { [Op.ne]: categoryId }
          }
        });

        if (existingCategory) {
          throw new AppError('Tên danh mục đã tồn tại.', 400);
        }
      }

      // Cập nhật danh mục
      await category.update({
        ...categoryData,
        NgayCapNhat: new Date()
      });

      return category;
    } catch (error) {
      logger.error(`Error in updateCategory service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi cập nhật danh mục.', 500);
    }
  }

  /**
   * Xóa danh mục
   */
  async deleteCategory(categoryId: number) {
    try {
      // Kiểm tra tồn tại của danh mục
      const category = await DanhMuc.findByPk(categoryId);
      if (!category) {
        throw new AppError('Không tìm thấy danh mục.', 404);
      }

      // Kiểm tra xem danh mục có chứa sản phẩm không
      const productsCount = await SanPham.count({
        where: { MaDanhMuc: categoryId }
      });

      if (productsCount > 0) {
        throw new AppError('Không thể xóa danh mục đang chứa sản phẩm.', 400);
      }

      // Xóa danh mục
      await category.destroy();

      return { success: true };
    } catch (error) {
      logger.error(`Error in deleteCategory service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi xóa danh mục.', 500);
    }
  }
}

export default new CategoryService(); 