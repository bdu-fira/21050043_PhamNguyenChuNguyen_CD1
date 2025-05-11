import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { ISanPham } from '../interfaces/product.interface';

// Interface cho các thuộc tính SanPham có thể tạo
interface SanPhamCreationAttributes extends Optional<ISanPham, 'MaSP' | 'NgayTao' | 'NgayCapNhat' | 'LuotXem'> {}

// Mô hình SanPham kế thừa từ Model Sequelize
class SanPham extends Model<ISanPham, SanPhamCreationAttributes> implements ISanPham {
  public MaSP!: number;
  public TenSP!: string;
  public MoTaDai!: string;
  public GiaBan!: number;
  public SoLuongTon!: number;
  public HinhAnhChinhURL!: string;
  public MaDanhMuc!: number;
  public DacDiemNoiBat!: string;
  public LuotXem!: number;
  public NgayTao!: Date;
  public NgayCapNhat!: Date;
}

// Khởi tạo mô hình
SanPham.init(
  {
    MaSP: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TenSP: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MoTaDai: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    GiaBan: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    SoLuongTon: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    HinhAnhChinhURL: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MaDanhMuc: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DacDiemNoiBat: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    LuotXem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    NgayTao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    NgayCapNhat: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'SanPham',
    tableName: 'SanPham',
    timestamps: false,
  }
);

export default SanPham; 