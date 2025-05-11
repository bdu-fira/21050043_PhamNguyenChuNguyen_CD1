import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { IDanhGia } from '../interfaces/review.interface';

// Interface cho các thuộc tính DanhGia có thể tạo
interface DanhGiaCreationAttributes extends Optional<IDanhGia, 'MaDanhGia' | 'NgayDanhGia' | 'BinhLuan'> {}

// Mô hình DanhGia kế thừa từ Model Sequelize
class DanhGia extends Model<IDanhGia, DanhGiaCreationAttributes> implements IDanhGia {
  public MaDanhGia!: number;
  public MaSP!: number;
  public MaKH!: string;
  public DiemSo!: number;
  public BinhLuan?: string;
  public NgayDanhGia!: Date;
  public TrangThai!: boolean;
}

// Khởi tạo mô hình
DanhGia.init(
  {
    MaDanhGia: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    MaSP: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    MaKH: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DiemSo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    BinhLuan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    NgayDanhGia: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    TrangThai: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'DanhGia',
    tableName: 'DanhGia',
    timestamps: false,
  }
);

export default DanhGia; 