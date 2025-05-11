// Interface cho đối tượng Sản phẩm
export interface ISanPham {
  MaSP: number;
  TenSP: string;
  MoTaDai: string;
  GiaBan: number;
  SoLuongTon: number;
  HinhAnhChinhURL: string;
  MaDanhMuc: number;
  DacDiemNoiBat?: string;
  LuotXem: number;
  NgayTao: Date;
  NgayCapNhat: Date;
}

// Interface dùng để tạo Sản phẩm mới
export interface ISanPhamCreate {
  TenSP: string;
  MoTaDai: string;
  GiaBan: number;
  SoLuongTon: number;
  HinhAnhChinhURL: string;
  MaDanhMuc: number;
  DacDiemNoiBat?: string;
  LuotXem?: number;
}

// Interface dùng để cập nhật Sản phẩm
export interface ISanPhamUpdate {
  TenSP?: string;
  MoTaDai?: string;
  GiaBan?: number;
  SoLuongTon?: number;
  HinhAnhChinhURL?: string;
  MaDanhMuc?: number;
  DacDiemNoiBat?: string;
  LuotXem?: number;
}

// Interface cho response của Sản phẩm với đánh giá
export interface ISanPhamWithReviews extends ISanPham {
  DiemDanhGiaTrungBinh?: number;
  SoLuongDanhGia?: number;
}

// Interface cho đối tượng Danh mục
export interface IDanhMuc {
  MaDanhMuc: number;
  TenDanhMuc: string;
  MoTa?: string;
  HinhAnh?: string;
  NgayTao: Date;
  NgayCapNhat: Date;
  SoLuongSanPham?: number;
}

// Interface dùng để tạo Danh mục mới
export interface IDanhMucCreate {
  TenDanhMuc: string;
  MoTa?: string;
  HinhAnh?: string;
}

// Interface dùng để cập nhật Danh mục
export interface IDanhMucUpdate {
  TenDanhMuc?: string;
  MoTa?: string;
  HinhAnh?: string;
} 