import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { IDonHang } from '../interfaces/order.interface';

// Interface cho các thuộc tính DonHang có thể tạo
interface DonHangCreationAttributes extends Optional<IDonHang, 'MaDonHang' | 'NgayDatHang' | 'NgayCapNhat' | 'GhiChuKhachHang' | 'GhiChuQuanTri'> {}

// Mô hình DonHang kế thừa từ Model Sequelize
class DonHang extends Model<IDonHang, DonHangCreationAttributes> implements IDonHang {
  public MaDonHang!: number;
  public MaKH!: string;
  public TenNguoiNhan!: string;
  public SoDienThoaiNhan!: string;
  public DiaChiGiaoHang!: string;
  public EmailNguoiNhan!: string;
  public NgayDatHang!: Date;
  public TongTienSanPham!: number;
  public PhiVanChuyen!: number;
  public GiamGia!: number;
  public TongThanhToan!: number;
  public PhuongThucThanhToan!: string;
  public TrangThaiThanhToan!: string;
  public TrangThaiDonHang!: string;
  public GhiChuKhachHang?: string;
  public GhiChuQuanTri?: string;
  public NgayCapNhat!: Date;
}

// Khởi tạo mô hình
DonHang.init(
  {
    MaDonHang: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaKH: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    TenNguoiNhan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SoDienThoaiNhan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DiaChiGiaoHang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    EmailNguoiNhan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    NgayDatHang: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    TongTienSanPham: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    PhiVanChuyen: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    GiamGia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    TongThanhToan: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    PhuongThucThanhToan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    TrangThaiThanhToan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    TrangThaiDonHang: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    GhiChuKhachHang: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    GhiChuQuanTri: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    NgayCapNhat: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'DonHang',
    tableName: 'DonHang',
    timestamps: false,
  }
);

export default DonHang; 