// Interface cho đối tượng Đánh giá
export interface IDanhGia {
  MaDanhGia: number;
  MaSP: number;
  MaKH: string;
  DiemSo: number;
  BinhLuan?: string;
  NgayDanhGia: Date;
  TrangThai: boolean;
}

// Interface dùng để tạo Đánh giá mới
export interface IDanhGiaCreate {
  MaSP: number;
  MaKH: string;
  DiemSo: number;
  BinhLuan?: string;
}

// Interface dùng để cập nhật Đánh giá
export interface IDanhGiaUpdate {
  DiemSo?: number;
  BinhLuan?: string;
  TrangThai?: boolean;
}

// Interface cho đối tượng đánh giá với thông tin sản phẩm và khách hàng
export interface IDanhGiaWithDetails extends IDanhGia {
  TenSP: string;
  TenKhachHang: string;
} 