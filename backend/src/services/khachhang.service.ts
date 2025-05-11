import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { KhachHang, VaiTro } from '../models';
import { IKhachHangCreate, IKhachHangUpdate, IKhachHangLogin } from '../interfaces/user.interface';
import { AppError } from '../middlewares/errorHandler';
import { sequelize } from '../config/database';
import { redisClient } from '../config/redis';
import logger from '../utils/logger';
import config from '../config/config';
import { v4 as uuidv4 } from 'uuid';
import { SignOptions } from 'jsonwebtoken';

class KhachHangService {
  /**
   * Lấy danh sách khách hàng
   */
  async getKhachHangs() {
    try {
      const khachhangs = await KhachHang.findAll({
        attributes: { exclude: ['MatKhau'] },
        include: [
          {
            model: VaiTro,
            attributes: ['MaVaiTro', 'TenVaiTro']
          }
        ]
      });

      return khachhangs;
    } catch (error) {
      logger.error(`Error in getKhachHangs service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy danh sách khách hàng.', 500);
    }
  }

  /**
   * Lấy thông tin khách hàng theo mã
   */
  async getKhachHangById(maKH: string) {
    try {
      const khachhang = await KhachHang.findByPk(maKH, {
        attributes: { exclude: ['MatKhau'] },
        include: [
          {
            model: VaiTro,
            attributes: ['MaVaiTro', 'TenVaiTro']
          }
        ]
      });

      return khachhang;
    } catch (error) {
      logger.error(`Error in getKhachHangById service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy thông tin khách hàng.', 500);
    }
  }

  /**
   * Tạo khách hàng mới (đăng ký)
   */
  async createKhachHang(khachhangData: IKhachHangCreate) {
    try {
      // Kiểm tra email đã tồn tại chưa
      const existingKhachHang = await KhachHang.findOne({
        where: { Email: khachhangData.Email }
      });

      if (existingKhachHang) {
        throw new AppError('Email đã được sử dụng. Vui lòng chọn email khác.', 400);
      }

      // Kiểm tra vai trò tồn tại
      const vaiTro = await VaiTro.findByPk(khachhangData.MaVaiTro);
      if (!vaiTro) {
        throw new AppError('Vai trò không tồn tại.', 400);
      }

      // Hash mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(khachhangData.MatKhau, salt);

      // Tạo khách hàng mới
      const newKhachHang = await KhachHang.create({
        MaKH: uuidv4(),
        HoTen: khachhangData.HoTen,
        Email: khachhangData.Email,
        MatKhau: hashedPassword,
        SoDienThoai: khachhangData.SoDienThoai,
        MaVaiTro: khachhangData.MaVaiTro ?? 1,
        TrangThai: true,
        NgayDangKy: new Date()
      });

      // Trả về khách hàng không có mật khẩu
      const khachhangWithoutPassword = await this.getKhachHangById(newKhachHang.MaKH);
      return khachhangWithoutPassword;
    } catch (error) {
      logger.error(`Error in createKhachHang service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi tạo khách hàng mới.', 500);
    }
  }

  /**
   * Đăng nhập khách hàng
   */
  async loginKhachHang(credentials: IKhachHangLogin) {
    try {
      // Tìm khách hàng theo email
      const khachhang = await KhachHang.findOne({
        where: { Email: credentials.Email }
      });

      if (!khachhang) {
        throw new AppError('Email hoặc mật khẩu không chính xác.', 401);
      }

      // Kiểm tra mật khẩu
      const isPasswordCorrect = await khachhang.comparePassword(credentials.MatKhau);
      if (!isPasswordCorrect) {
        throw new AppError('Email hoặc mật khẩu không chính xác.', 401);
      }

      // Kiểm tra trạng thái
      if (!khachhang.TrangThai) {
        throw new AppError('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.', 403);
      }

      // Cập nhật thời gian đăng nhập cuối
      await khachhang.update({ LanDangNhapCuoi: new Date() });

      // Tạo JWT token
      const token = this.generateToken(khachhang.MaKH, String(khachhang.MaVaiTro), 'customer');

      // Không trả về mật khẩu
      const userWithoutPassword = { ...khachhang.toJSON() };
      if ('MatKhau' in userWithoutPassword) {
        delete (userWithoutPassword as any).MatKhau;
      }

      return {
        user: userWithoutPassword,
        token
      };
    } catch (error) {
      logger.error(`Error in loginKhachHang service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi đăng nhập.', 500);
    }
  }

  /**
   * Cập nhật thông tin khách hàng
   */
  async updateKhachHang(maKH: string, updateData: IKhachHangUpdate) {
    try {
      const khachhang = await KhachHang.findByPk(maKH);
      if (!khachhang) {
        return null;
      }

      // Cập nhật thông tin
      await khachhang.update({
        HoTen: updateData.HoTen || khachhang.HoTen,
        SoDienThoai: updateData.SoDienThoai || khachhang.SoDienThoai,
        TrangThai: typeof updateData.TrangThai !== 'undefined' ? updateData.TrangThai : khachhang.TrangThai
      });

      // Trả về khách hàng đã cập nhật
      return this.getKhachHangById(maKH);
    } catch (error) {
      logger.error(`Error in updateKhachHang service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi cập nhật thông tin khách hàng.', 500);
    }
  }

  /**
   * Vô hiệu hóa khách hàng
   */
  async deactivateKhachHang(maKH: string) {
    try {
      const khachhang = await KhachHang.findByPk(maKH);
      if (!khachhang) {
        return null;
      }

      // Vô hiệu hóa khách hàng
      await khachhang.update({
        TrangThai: false
      });

      // Trả về khách hàng đã cập nhật
      return this.getKhachHangById(maKH);
    } catch (error) {
      logger.error(`Error in deactivateKhachHang service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi vô hiệu hóa khách hàng.', 500);
    }
  }

  /**
   * Đăng xuất khách hàng
   */
  async logoutKhachHang(token: string) {
    try {
      // Giải mã token để lấy thời gian hết hạn
      const decoded: any = jwt.verify(token, config.JWT_SECRET);
      const expiryTime = decoded.exp - Math.floor(Date.now() / 1000);

      // Đưa token vào danh sách đen
      await redisClient.setEx(`blacklist:${token}`, expiryTime, 'true');

      return true;
    } catch (error) {
      logger.error(`Error in logoutKhachHang service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi đăng xuất.', 500);
    }
  }

  /**
   * Tạo JWT token
   */
  generateToken(maKH: string, maVaiTro: string, userType: string): string {
    const options: SignOptions = {
      expiresIn: '7d'
    };
    
    return jwt.sign(
      { id: maKH, vaiTroId: maVaiTro, userType },
      config.JWT_SECRET,
      options
    );
  }
}

export default new KhachHangService(); 