import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { IVaiTro } from '../interfaces/user.interface';

// Interface cho các thuộc tính VaiTro có thể tạo
interface VaiTroCreationAttributes extends Optional<IVaiTro, 'MoTa'> {}

// Mô hình VaiTro kế thừa từ Model Sequelize
class VaiTro extends Model<IVaiTro, VaiTroCreationAttributes> implements IVaiTro {
  public MaVaiTro!: number;
  public TenVaiTro!: string;
  public MoTa?: string;
}

// Khởi tạo mô hình
VaiTro.init(
  {
    MaVaiTro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
    },
    TenVaiTro: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    MoTa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'VaiTro',
    tableName: 'VaiTro',
    timestamps: false,
  }
);

export default VaiTro; 