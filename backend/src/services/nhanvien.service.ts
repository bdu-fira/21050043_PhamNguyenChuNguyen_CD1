import bcrypt from 'bcrypt';
import { NhanVien, VaiTro } from '../models';
import { INhanVienCreate, INhanVienUpdate } from '../interfaces/user.interface';
import { AppError } from '../middlewares/errorHandler';
import { sequelize } from '../config/database';
import logger from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

class NhanVienService {
  /**
   * Lấy danh sách nhân viên
   */
  async getNhanViens() {
    try {
      const nhanviens = await NhanVien.findAll({
        attributes: { exclude: ['MatKhau'] },
        include: [
          {
            model: VaiTro,
            attributes: ['MaVaiTro', 'TenVaiTro']
          }
        ]
      });

      return nhanviens;
    } catch (error) {
      logger.error(`Error in getNhanViens service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy danh sách nhân viên.', 500);
    }
  }

  /**
   * Lấy thông tin nhân viên theo mã
   */
  async getNhanVienById(maNV: string) {
    try {
      const nhanvien = await NhanVien.findByPk(maNV, {
        attributes: { exclude: ['MatKhau'] },
        include: [
          {
            model: VaiTro,
            attributes: ['MaVaiTro', 'TenVaiTro']
          }
        ]
      });

      return nhanvien;
    } catch (error) {
      logger.error(`Error in getNhanVienById service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy thông tin nhân viên.', 500);
    }
  }

  /**
   * Tạo nhân viên mới
   */
  async createNhanVien(nhanvienData: INhanVienCreate) {
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingNhanVien = await NhanVien.findOne({
        where: { Email: nhanvienData.Email }
      });

      if (existingNhanVien) {
        throw new AppError('Email đã được sử dụng. Vui lòng chọn email khác.', 400);
      }

      // Kiểm tra vai trò tồn tại
      const vaiTro = await VaiTro.findByPk(nhanvienData.MaVaiTro);
      if (!vaiTro) {
        throw new AppError('Vai trò không tồn tại.', 400);
      }

      // Hash mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(nhanvienData.MatKhau, salt);

      // Tạo nhân viên mới
      const newNhanVien = await NhanVien.create({
        MaNV: uuidv4(),
        HoTen: nhanvienData.HoTen,
        Email: nhanvienData.Email,
        MatKhau: hashedPassword,
        SoDienThoai: nhanvienData.SoDienThoai,
        MaVaiTro: nhanvienData.MaVaiTro,
        TrangThai: true,
        NgayTao: new Date(),
        NgayCapNhat: new Date()
      });

      // Trả về nhân viên không có mật khẩu
      const nhanvienWithoutPassword = await this.getNhanVienById(newNhanVien.MaNV);
      return nhanvienWithoutPassword;
    } catch (error) {
      logger.error(`Error in createNhanVien service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi tạo nhân viên mới.', 500);
    }
  }

  /**
   * Cập nhật thông tin nhân viên
   */
  async updateNhanVien(maNV: string, updateData: INhanVienUpdate) {
    try {
      const nhanvien = await NhanVien.findByPk(maNV);
      if (!nhanvien) {
        return null;
      }

      // Kiểm tra vai trò tồn tại nếu cập nhật vai trò
      if (updateData.MaVaiTro) {
        const vaiTro = await VaiTro.findByPk(updateData.MaVaiTro);
        if (!vaiTro) {
          throw new AppError('Vai trò không tồn tại.', 400);
        }
      }

      // Cập nhật thông tin
      await nhanvien.update({
        HoTen: updateData.HoTen || nhanvien.HoTen,
        SoDienThoai: updateData.SoDienThoai || nhanvien.SoDienThoai,
        MaVaiTro: updateData.MaVaiTro || nhanvien.MaVaiTro,
        TrangThai: typeof updateData.TrangThai !== 'undefined' ? updateData.TrangThai : nhanvien.TrangThai,
        NgayCapNhat: new Date()
      });

      // Trả về nhân viên đã cập nhật
      return this.getNhanVienById(maNV);
    } catch (error) {
      logger.error(`Error in updateNhanVien service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi cập nhật thông tin nhân viên.', 500);
    }
  }

  /**
   * Vô hiệu hóa nhân viên
   */
  async deactivateNhanVien(maNV: string) {
    try {
      const nhanvien = await NhanVien.findByPk(maNV);
      if (!nhanvien) {
        return null;
      }

      // Vô hiệu hóa nhân viên
      await nhanvien.update({
        TrangThai: false,
        NgayCapNhat: new Date()
      });

      // Trả về nhân viên đã cập nhật
      return this.getNhanVienById(maNV);
    } catch (error) {
      logger.error(`Error in deactivateNhanVien service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi vô hiệu hóa nhân viên.', 500);
    }
  }
}

export default new NhanVienService(); 