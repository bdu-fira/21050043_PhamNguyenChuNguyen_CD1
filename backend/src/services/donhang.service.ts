import { DonHang, ChiTietDonHang, SanPham, KhachHang } from '../models';
import { IDonHangCreate, IDonHangUpdate, IDonHangWithCustomer, IDonHangFull } from '../interfaces/order.interface';
import { AppError } from '../middlewares/errorHandler';
import { sequelize } from '../config/database';
import logger from '../utils/logger';
import { QueryTypes, literal } from 'sequelize';
import { Transaction } from 'sequelize';

class DonHangService {
  /**
   * Lấy danh sách đơn hàng (có hỗ trợ phân trang và lọc theo trạng thái)
   */
  async getDonHangs(maKH?: string, trangThai?: string, page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;
      
      let whereClause: any = {};
      
      if (maKH) {
        whereClause.MaKH = maKH;
      }
      
      if (trangThai) {
        whereClause.TrangThaiDonHang = trangThai;
      }
      
      // Đếm tổng số đơn hàng thỏa mãn điều kiện
      const count = await DonHang.count({ where: whereClause });
      
      // Lấy danh sách đơn hàng với phân trang
      const donhangs = await DonHang.findAll({
        where: whereClause,
        include: [
          {
            model: KhachHang,
            as: 'KhachHang',
            attributes: ['MaKH', 'HoTen', 'Email', 'SoDienThoai']
          }
        ],
        order: [['NgayDatHang', 'DESC']],
        limit,
        offset
      });
      
      // Chuyển đổi dữ liệu để frontend dễ sử dụng
      const formattedDonhangs = donhangs.map(donhang => {
        const plainDonhang = donhang.get({ plain: true }) as any;
        return {
          ...plainDonhang,
          TenKhachHang: plainDonhang.KhachHang?.HoTen || 'Không xác định'
        };
      });
      
      return {
        donhangs: formattedDonhangs,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        limit
      };
    } catch (error) {
      logger.error('Error in getDonHangs:', error);
      throw new AppError('Không thể lấy danh sách đơn hàng.', 500);
    }
  }

  /**
   * Lấy thông tin chi tiết đơn hàng theo mã sử dụng ORM
   */
  async getDonHangById(maDonHang: number) {
    try {
      // Lấy thông tin đơn hàng
      const donHang = await DonHang.findByPk(maDonHang, {
        include: [{
          model: KhachHang,
          attributes: ['MaKH', 'HoTen']
        }]
      });
      
      if (!donHang) {
        return null;
      }
      
      // Lấy chi tiết đơn hàng
      const chiTietDonHang = await ChiTietDonHang.findAll({
        where: { MaDonHang: maDonHang },
        include: [{
          model: SanPham,
          attributes: ['MaSP', 'TenSP', 'HinhAnhChinhURL']
        }]
      });
      
      // Chuyển đổi sang định dạng mong muốn
      const donHangData = donHang.get({ plain: true }) as any;
      
      const result: IDonHangFull = {
        MaDonHang: donHangData.MaDonHang,
        MaKH: donHangData.MaKH,
        TenKhachHang: donHangData.KhachHang?.HoTen || '',
        TenNguoiNhan: donHangData.TenNguoiNhan,
        SoDienThoaiNhan: donHangData.SoDienThoaiNhan,
        DiaChiGiaoHang: donHangData.DiaChiGiaoHang,
        EmailNguoiNhan: donHangData.EmailNguoiNhan,
        NgayDatHang: donHangData.NgayDatHang,
        TongTienSanPham: donHangData.TongTienSanPham,
        PhiVanChuyen: donHangData.PhiVanChuyen,
        GiamGia: donHangData.GiamGia,
        TongThanhToan: donHangData.TongThanhToan,
        PhuongThucThanhToan: donHangData.PhuongThucThanhToan,
        TrangThaiThanhToan: donHangData.TrangThaiThanhToan,
        TrangThaiDonHang: donHangData.TrangThaiDonHang,
        GhiChuKhachHang: donHangData.GhiChuKhachHang,
        GhiChuQuanTri: donHangData.GhiChuQuanTri,
        NgayCapNhat: donHangData.NgayCapNhat,
        ChiTietDonHang: chiTietDonHang.map(item => {
          const chiTietData = item.get({ plain: true }) as any;
          return {
            MaChiTietDH: chiTietData.MaChiTietDH,
            MaDonHang: chiTietData.MaDonHang,
            MaSP: chiTietData.MaSP,
            TenSP: chiTietData.SanPham?.TenSP || '',
            HinhAnhChinhURL: chiTietData.SanPham?.HinhAnhChinhURL || '',
            SoLuong: chiTietData.SoLuong,
            DonGia: chiTietData.DonGia,
            ThanhTien: chiTietData.ThanhTien
          };
        })
      };
      
      return result;
    } catch (error) {
      logger.error(`Error in getDonHangById service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy thông tin đơn hàng.', 500);
    }
  }

  /**
   * Tạo đơn hàng mới
   */
  async createDonHang(donhangData: IDonHangCreate | any) {
    let t: Transaction | undefined;
    try {
      t = await sequelize.transaction();

      // Kiểm tra xem dữ liệu đến từ frontend hay không
      // Dữ liệu từ frontend có định dạng khác với backend
      const isFromFrontend = donhangData.items && Array.isArray(donhangData.items);
      
      // Xử lý dữ liệu từ frontend
      let processedData: IDonHangCreate;
      
      if (isFromFrontend) {
        // Lấy thông tin người dùng từ database
        const user = await KhachHang.findByPk(donhangData.userId || ''); 
        
        if (!user) {
          throw new AppError('Không tìm thấy thông tin người dùng.', 404);
        }
        
        // Tính tổng tiền sản phẩm
        let tongTienSanPham = 0;
        const chiTietDonHang = [];
        
        // Lấy thông tin chi tiết sản phẩm và tính tổng tiền
        for (const item of donhangData.items) {
          const sanpham = await SanPham.findByPk(item.productId);
          if (!sanpham) {
            throw new AppError(`Không tìm thấy sản phẩm với ID ${item.productId}`, 404);
          }
          
          if (sanpham.SoLuongTon < item.quantity) {
            throw new AppError(`Sản phẩm ${sanpham.TenSP} chỉ còn ${sanpham.SoLuongTon} sản phẩm.`, 400);
          }
          
          const thanhTien = sanpham.GiaBan * item.quantity;
          tongTienSanPham += thanhTien;
          
          chiTietDonHang.push({
            MaSP: sanpham.MaSP,
            SoLuong: item.quantity,
            DonGia: sanpham.GiaBan,
            ThanhTien: thanhTien
          });
        }
        
        // Phí vận chuyển mặc định: 30,000 VND
        const phiVanChuyen = 30000;
        // Hiện tại không có giảm giá
        const giamGia = 0;
        // Tổng thanh toán = tổng tiền sản phẩm + phí vận chuyển - giảm giá
        const tongThanhToan = tongTienSanPham + phiVanChuyen - giamGia;
        
        // Tạo dữ liệu đơn hàng theo định dạng backend mong đợi
        processedData = {
          MaKH: user.MaKH,
          TenNguoiNhan: user.HoTen,
          SoDienThoaiNhan: user.SoDienThoai || '',
          DiaChiGiaoHang: donhangData.shippingAddress,
          EmailNguoiNhan: '21050043@sudent.bdu.edu.vn',
          TongTienSanPham: tongTienSanPham,
          PhiVanChuyen: phiVanChuyen,
          GiamGia: giamGia,
          TongThanhToan: tongThanhToan,
          PhuongThucThanhToan: donhangData.paymentMethod === 'cod' ? 'TienMat' : 'ViDienTu',
          GhiChuKhachHang: donhangData.notes || null,
          ChiTietDonHang: chiTietDonHang
        };
      } else {
        // Dữ liệu từ backend có định dạng đúng
        processedData = donhangData;
      }
      
      // Sử dụng raw query để tạo đơn hàng thay vì ORM để tránh lỗi chuyển đổi ngày tháng
      const ngayHienTai = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      const [donhangResult] = await sequelize.query(
        `INSERT INTO DonHang (
          MaKH, TenNguoiNhan, SoDienThoaiNhan, DiaChiGiaoHang, EmailNguoiNhan,
          NgayDatHang, TongTienSanPham, PhiVanChuyen, GiamGia, TongThanhToan,
          PhuongThucThanhToan, TrangThaiThanhToan, TrangThaiDonHang, GhiChuKhachHang, NgayCapNhat
        ) 
        OUTPUT INSERTED.MaDonHang
        VALUES (
          :MaKH, :TenNguoiNhan, :SoDienThoaiNhan, :DiaChiGiaoHang, :EmailNguoiNhan,
          GETDATE(), :TongTienSanPham, :PhiVanChuyen, :GiamGia, :TongThanhToan,
          :PhuongThucThanhToan, :TrangThaiThanhToan, :TrangThaiDonHang, :GhiChuKhachHang, GETDATE()
        )`,
        {
          replacements: {
            MaKH: processedData.MaKH,
            TenNguoiNhan: processedData.TenNguoiNhan,
            SoDienThoaiNhan: processedData.SoDienThoaiNhan,
            DiaChiGiaoHang: processedData.DiaChiGiaoHang,
            EmailNguoiNhan: processedData.EmailNguoiNhan,
            TongTienSanPham: processedData.TongTienSanPham,
            PhiVanChuyen: processedData.PhiVanChuyen,
            GiamGia: processedData.GiamGia,
            TongThanhToan: processedData.TongThanhToan,
            PhuongThucThanhToan: processedData.PhuongThucThanhToan,
            TrangThaiThanhToan: 'ChuaThanhToan',
            TrangThaiDonHang: 'ChoXacNhan',
            GhiChuKhachHang: processedData.GhiChuKhachHang || null
          },
          type: QueryTypes.INSERT,
          transaction: t
        }
      );
      
      // Lấy ID đơn hàng vừa tạo
      const maDonHang = donhangResult && Array.isArray(donhangResult) && donhangResult.length > 0 ? 
        donhangResult[0].MaDonHang : null;
      
      if (!maDonHang) {
        throw new AppError('Không thể tạo đơn hàng.', 500);
      }
      
      // Tạo chi tiết đơn hàng
      for (const chiTiet of processedData.ChiTietDonHang) {
        await sequelize.query(
          `INSERT INTO ChiTietDonHang (
            MaDonHang, MaSP, SoLuong, DonGia, ThanhTien
          ) VALUES (
            :MaDonHang, :MaSP, :SoLuong, :DonGia, :ThanhTien
          )`,
          {
            replacements: {
              MaDonHang: maDonHang,
              MaSP: chiTiet.MaSP,
              SoLuong: chiTiet.SoLuong,
              DonGia: chiTiet.DonGia,
              ThanhTien: chiTiet.ThanhTien
            },
            type: QueryTypes.INSERT,
            transaction: t
          }
        );
        
        // Cập nhật số lượng tồn sản phẩm
        await sequelize.query(
          `UPDATE SanPham 
           SET SoLuongTon = SoLuongTon - :SoLuong, 
               NgayCapNhat = GETDATE()
           WHERE MaSP = :MaSP`,
          {
            replacements: {
              MaSP: chiTiet.MaSP,
              SoLuong: chiTiet.SoLuong
            },
            type: QueryTypes.UPDATE,
            transaction: t
          }
        );
      }
      
      // Commit transaction
      await t.commit();
      
      // Lấy thông tin đơn hàng đã tạo
      const donhang = await this.getDonHangById(maDonHang);
      
      // Trả về dữ liệu đơn hàng đã tạo
      return donhang;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      if (t) {
        try {
          await t.rollback();
        } catch (rollbackError) {
          logger.error('Lỗi khi rollback transaction:', rollbackError);
        }
      }
      
      logger.error('Lỗi khi tạo đơn hàng:', error);
      throw error;
    }
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateDonHang(maDonHang: number, updateData: IDonHangUpdate) {
    try {
      // Kiểm tra xem đơn hàng có tồn tại không
      const donhang = await DonHang.findByPk(maDonHang);

      if (!donhang) {
        return null;
      }

      // Lấy giá trị hiện tại của đơn hàng để sử dụng nếu không có dữ liệu cập nhật
      const trangThaiDonHang = updateData.TrangThaiDonHang || donhang.TrangThaiDonHang;
      const trangThaiThanhToan = updateData.TrangThaiThanhToan || donhang.TrangThaiThanhToan;
      const ghiChuQuanTri = updateData.GhiChuQuanTri || donhang.GhiChuQuanTri;

      // Sử dụng raw query để cập nhật đơn hàng thay vì ORM để tránh lỗi chuyển đổi ngày tháng
      await sequelize.query(
        `UPDATE [DonHang]
        SET [TrangThaiDonHang] = :trangThaiDonHang,
            [TrangThaiThanhToan] = :trangThaiThanhToan,
            [GhiChuQuanTri] = :ghiChuQuanTri,
            [NgayCapNhat] = GETDATE()
        WHERE [MaDonHang] = :maDonHang`,
        {
          replacements: {
            maDonHang: maDonHang,
            trangThaiDonHang: trangThaiDonHang,
            trangThaiThanhToan: trangThaiThanhToan,
            ghiChuQuanTri: ghiChuQuanTri
          },
          type: QueryTypes.UPDATE
        }
      );

      // Lấy dữ liệu đơn hàng đã cập nhật
      return this.getDonHangById(maDonHang);
    } catch (error) {
      logger.error(`Error in updateDonHang service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi cập nhật đơn hàng.', 500);
    }
  }

  /**
   * Hủy đơn hàng
   */
  async cancelDonHang(maDonHang: number, lyDo: string) {
    const t = await sequelize.transaction();

    try {
      // Kiểm tra xem đơn hàng có tồn tại không
      const [donhangRows] = await sequelize.query(
        `SELECT * FROM DonHang WHERE MaDonHang = :maDonHang`,
        {
          replacements: { maDonHang },
          type: QueryTypes.SELECT,
          transaction: t
        }
      );

      if (!donhangRows || (Array.isArray(donhangRows) && donhangRows.length === 0)) {
        await t.rollback();
        return null;
      }

      const donhang = Array.isArray(donhangRows) ? donhangRows[0] : donhangRows;

      // Chỉ cho phép hủy đơn hàng ở trạng thái 'ChoXacNhan' hoặc 'ChuaThanhToan'
      if (!['ChoXacNhan', 'ChuaThanhToan'].includes(donhang.TrangThaiDonHang)) {
        await t.rollback();
        throw new AppError('Không thể hủy đơn hàng đã được xử lý.', 400);
      }

      // Lấy danh sách chi tiết đơn hàng
      const [chiTietDonHang] = await sequelize.query(
        `SELECT * FROM ChiTietDonHang WHERE MaDonHang = :maDonHang`,
        {
          replacements: { maDonHang },
          type: QueryTypes.SELECT,
          transaction: t
        }
      );

      // Hoàn lại số lượng sản phẩm về kho
      if (Array.isArray(chiTietDonHang)) {
        for (const item of chiTietDonHang) {
          await sequelize.query(
            `UPDATE SanPham 
             SET SoLuongTon = SoLuongTon + :soLuong, 
                 NgayCapNhat = GETDATE()
             WHERE MaSP = :maSP`,
            {
              replacements: {
                maSP: item.MaSP,
                soLuong: item.SoLuong
              },
              type: QueryTypes.UPDATE,
              transaction: t
            }
          );
        }
      }

      // Cập nhật trạng thái đơn hàng
      await sequelize.query(
        `UPDATE DonHang 
         SET TrangThaiDonHang = 'DaHuy', 
             GhiChuQuanTri = :ghiChu,
             NgayCapNhat = GETDATE()
         WHERE MaDonHang = :maDonHang`,
        {
          replacements: {
            maDonHang,
            ghiChu: lyDo ? `Đơn hàng bị hủy. Lý do: ${lyDo}` : 'Đơn hàng bị hủy.'
          },
          type: QueryTypes.UPDATE,
          transaction: t
        }
      );

      await t.commit();

      // Trả về dữ liệu đơn hàng đã cập nhật
      return this.getDonHangById(maDonHang);
    } catch (error) {
      await t.rollback();
      logger.error(`Error in cancelDonHang service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi hủy đơn hàng.', 500);
    }
  }
}

export default new DonHangService(); 