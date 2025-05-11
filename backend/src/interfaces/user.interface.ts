export interface IUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: 'user' | 'admin' | 'seller';
  isActive: boolean;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  role?: 'user' | 'admin' | 'seller';
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserUpdate {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  isActive?: boolean;
  role?: 'user' | 'admin' | 'seller';
}

export interface IUserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  avatarUrl?: string;
  role: string;
}

// Interface cho đối tượng Khách hàng
export interface IKhachHang {
  MaKH: string;
  HoTen: string;
  Email: string;
  MatKhau: string;
  SoDienThoai?: string;
  DiaChi?: string;
  NgayDangKy: Date;
  LanDangNhapCuoi?: Date;
  TrangThai: boolean;
  MaVaiTro: number;
}

// Interface dùng để tạo Khách hàng mới
export interface IKhachHangCreate {
  HoTen: string;
  Email: string;
  MatKhau: string;
  SoDienThoai?: string;
  DiaChi?: string;
  MaVaiTro?: number;
}

// Interface dùng để đăng nhập
export interface IKhachHangLogin {
  Email: string;
  MatKhau: string;
}

// Interface dùng để cập nhật thông tin Khách hàng
export interface IKhachHangUpdate {
  HoTen?: string;
  SoDienThoai?: string;
  DiaChi?: string;
  TrangThai?: boolean;
}

// Interface cho đối tượng Nhân viên
export interface INhanVien {
  MaNV: string;
  HoTen: string;
  Email: string;
  MatKhau: string;
  SoDienThoai?: string;
  DiaChi?: string;
  MaVaiTro: number;
  TrangThai: boolean;
  NgayTao: Date;
  NgayCapNhat: Date;
  LanDangNhapCuoi?: Date;
}

// Interface dùng để tạo Nhân viên mới
export interface INhanVienCreate {
  HoTen: string;
  Email: string;
  MatKhau: string;
  SoDienThoai?: string;
  DiaChi?: string;
  MaVaiTro: number;
}

// Interface dùng để đăng nhập Nhân viên
export interface INhanVienLogin {
  Email: string;
  MatKhau: string;
}

// Interface dùng để cập nhật thông tin Nhân viên
export interface INhanVienUpdate {
  HoTen?: string;
  SoDienThoai?: string;
  DiaChi?: string;
  MaVaiTro?: number;
  TrangThai?: boolean;
}

// Interface cho đối tượng Vai trò
export interface IVaiTro {
  MaVaiTro: number;
  TenVaiTro: string;
  MoTa?: string;
} 