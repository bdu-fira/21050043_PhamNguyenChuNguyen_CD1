import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { IDanhMuc } from '../interfaces/product.interface';

// Interface cho các thuộc tính DanhMuc có thể tạo
interface DanhMucCreationAttributes extends Optional<IDanhMuc, 'MaDanhMuc' | 'NgayTao' | 'NgayCapNhat' | 'MoTa' | 'HinhAnh'> {}

// Mô hình DanhMuc kế thừa từ Model Sequelize
class DanhMuc extends Model<IDanhMuc, DanhMucCreationAttributes> implements IDanhMuc {
  public MaDanhMuc!: number;
  public TenDanhMuc!: string;
  public MoTa?: string;
  public HinhAnh?: string;
  public NgayTao!: Date;
  public NgayCapNhat!: Date;
}

// Khởi tạo mô hình
DanhMuc.init(
  {
    MaDanhMuc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TenDanhMuc: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MoTa: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    HinhAnh: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: 'DanhMuc',
    tableName: 'DanhMuc',
    timestamps: false,
  }
);

export default DanhMuc; 