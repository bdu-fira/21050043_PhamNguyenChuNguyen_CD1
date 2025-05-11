import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { IChiTietDonHang } from '../interfaces/order.interface';

// Interface cho các thuộc tính ChiTietDonHang có thể tạo
interface ChiTietDonHangCreationAttributes extends Optional<IChiTietDonHang, 'MaChiTietDH'> {}

// Mô hình ChiTietDonHang kế thừa từ Model Sequelize
class ChiTietDonHang extends Model<IChiTietDonHang, ChiTietDonHangCreationAttributes> implements IChiTietDonHang {
  public MaChiTietDH!: number;
  public MaDonHang!: number;
  public MaSP!: number;
  public SoLuong!: number;
  public DonGia!: number;
  public ThanhTien!: number;
}

// Khởi tạo mô hình
ChiTietDonHang.init(
  {
    MaChiTietDH: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaDonHang: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaSP: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DonGia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    ThanhTien: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ChiTietDonHang',
    tableName: 'ChiTietDonHang',
    timestamps: false,
  }
);

export default ChiTietDonHang; 