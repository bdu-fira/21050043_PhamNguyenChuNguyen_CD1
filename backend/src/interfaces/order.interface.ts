// Interface cho đối tượng Đơn hàng
export interface IDonHang {
  MaDonHang: number;
  MaKH: string;
  TenNguoiNhan: string;
  SoDienThoaiNhan: string;
  DiaChiGiaoHang: string;
  EmailNguoiNhan: string;
  NgayDatHang: Date;
  TongTienSanPham: number;
  PhiVanChuyen: number;
  GiamGia: number;
  TongThanhToan: number;
  PhuongThucThanhToan: string;
  TrangThaiThanhToan: string;
  TrangThaiDonHang: string;
  GhiChuKhachHang?: string;
  GhiChuQuanTri?: string;
  NgayCapNhat: Date;
}

// Interface cho đối tượng Chi tiết đơn hàng
export interface IChiTietDonHang {
  MaChiTietDH: number;
  MaDonHang: number;
  MaSP: number;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
}

// Interface dùng để tạo Đơn hàng mới
export interface IDonHangCreate {
  MaKH: string;
  TenNguoiNhan: string;
  SoDienThoaiNhan: string;
  DiaChiGiaoHang: string;
  EmailNguoiNhan: string;
  TongTienSanPham: number;
  PhiVanChuyen: number;
  GiamGia: number;
  TongThanhToan: number;
  PhuongThucThanhToan: string;
  GhiChuKhachHang?: string;
  ChiTietDonHang: {
    MaSP: number;
    SoLuong: number;
    DonGia: number;
    ThanhTien: number;
  }[];
}

// Interface dùng để cập nhật Đơn hàng
export interface IDonHangUpdate {
  TrangThaiDonHang?: string;
  TrangThaiThanhToan?: string;
  GhiChuQuanTri?: string;
}

// Interface cho response đơn hàng với thông tin khách hàng
export interface IDonHangWithCustomer extends IDonHang {
  TenKhachHang: string;
}

// Interface cho response đơn hàng đầy đủ (bao gồm thông tin khách hàng và chi tiết)
export interface IDonHangFull extends IDonHangWithCustomer {
  ChiTietDonHang: (IChiTietDonHang & {
    TenSP: string;
    HinhAnhChinhURL: string;
  })[];
} 