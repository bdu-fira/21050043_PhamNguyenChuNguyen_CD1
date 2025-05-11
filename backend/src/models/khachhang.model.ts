import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';
import { IKhachHang } from '../interfaces/user.interface';

// Interface cho các thuộc tính KhachHang có thể tạo
interface KhachHangCreationAttributes extends Optional<IKhachHang, 'MaKH' | 'NgayDangKy' | 'LanDangNhapCuoi'> {}

// Mô hình KhachHang kế thừa từ Model Sequelize
class KhachHang extends Model<IKhachHang, KhachHangCreationAttributes> implements IKhachHang {
  public MaKH!: string;
  public HoTen!: string;
  public Email!: string;
  public MatKhau!: string;
  public SoDienThoai?: string;
  public DiaChi?: string;
  public NgayDangKy!: Date;
  public LanDangNhapCuoi?: Date;
  public TrangThai!: boolean;
  public MaVaiTro!: number;

  // Phương thức kiểm tra mật khẩu
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.MatKhau);
  }
}

// Khởi tạo mô hình
KhachHang.init(
  {
    MaKH: {
      type: DataTypes.STRING,
      primaryKey: true,
      autoIncrement: false,
    },
    HoTen: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    MatKhau: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    SoDienThoai: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    DiaChi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    NgayDangKy: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    LanDangNhapCuoi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    TrangThai: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    MaVaiTro: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: 'KhachHang',
    tableName: 'KhachHang',
    timestamps: false,
    hooks: {
      // Hook trước khi tạo/cập nhật để hash mật khẩu
      beforeSave: async (khachHang: KhachHang) => {
        if (khachHang.changed('MatKhau')) {
          const salt = await bcrypt.genSalt(10);
          khachHang.MatKhau = await bcrypt.hash(khachHang.MatKhau, salt);
        }
      },
    },
  }
);

export default KhachHang; 