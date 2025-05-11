import KhachHang from './khachhang.model';
import NhanVien from './nhanvien.model';
import VaiTro from './vaitro.model';
import SanPham from './sanpham.model';
import DanhMuc from './danhmuc.model';
import DonHang from './donhang.model';
import ChiTietDonHang from './chitietdonhang.model';
import DanhGia from './danhgia.model';

// Thiết lập các mối quan hệ giữa các mô hình

// KhachHang - VaiTro
KhachHang.belongsTo(VaiTro, { foreignKey: 'MaVaiTro' });
VaiTro.hasMany(KhachHang, { foreignKey: 'MaVaiTro' });

// NhanVien - VaiTro
NhanVien.belongsTo(VaiTro, { foreignKey: 'MaVaiTro' });
VaiTro.hasMany(NhanVien, { foreignKey: 'MaVaiTro' });

// SanPham - DanhMuc
SanPham.belongsTo(DanhMuc, { foreignKey: 'MaDanhMuc' });
DanhMuc.hasMany(SanPham, { foreignKey: 'MaDanhMuc' });

// DonHang - KhachHang
DonHang.belongsTo(KhachHang, { foreignKey: 'MaKH' });
KhachHang.hasMany(DonHang, { foreignKey: 'MaKH' });

// ChiTietDonHang - DonHang
ChiTietDonHang.belongsTo(DonHang, { foreignKey: 'MaDonHang' });
DonHang.hasMany(ChiTietDonHang, { foreignKey: 'MaDonHang' });

// ChiTietDonHang - SanPham
ChiTietDonHang.belongsTo(SanPham, { foreignKey: 'MaSP' });
SanPham.hasMany(ChiTietDonHang, { foreignKey: 'MaSP' });

// DanhGia - SanPham
DanhGia.belongsTo(SanPham, { foreignKey: 'MaSP' });
SanPham.hasMany(DanhGia, { foreignKey: 'MaSP' });

// DanhGia - KhachHang
DanhGia.belongsTo(KhachHang, { foreignKey: 'MaKH' });
KhachHang.hasMany(DanhGia, { foreignKey: 'MaKH' });

export {
  KhachHang,
  NhanVien,
  VaiTro,
  SanPham,
  DanhMuc,
  DonHang,
  ChiTietDonHang,
  DanhGia
}; 