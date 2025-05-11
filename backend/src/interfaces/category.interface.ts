// Interface cho đối tượng Danh mục
export interface IDanhMuc {
  MaDanhMuc: number;
  TenDanhMuc: string;
  MoTa?: string;
  HinhAnh?: string;
  NgayTao: Date;
  NgayCapNhat: Date;
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
