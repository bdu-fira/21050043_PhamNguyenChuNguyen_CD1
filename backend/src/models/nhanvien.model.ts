import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcrypt';
import { INhanVien } from '../interfaces/user.interface';

// Interface cho các thuộc tính NhanVien có thể tạo
interface NhanVienCreationAttributes extends Optional<INhanVien, 'MaNV' | 'NgayTao' | 'NgayCapNhat' | 'LanDangNhapCuoi'> {}

// Mô hình NhanVien kế thừa từ Model Sequelize
class NhanVien extends Model<INhanVien, NhanVienCreationAttributes> implements INhanVien {
  public MaNV!: string;
  public HoTen!: string;
  public Email!: string;
  public MatKhau!: string;
  public SoDienThoai?: string;
  public DiaChi?: string;
  public MaVaiTro!: number;
  public TrangThai!: boolean;
  public NgayTao!: Date;
  public NgayCapNhat!: Date;
  public LanDangNhapCuoi?: Date;

  // Phương thức kiểm tra mật khẩu
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.MatKhau);
  }
}

// Khởi tạo mô hình
NhanVien.init(
  {
    MaNV: {
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
    MaVaiTro: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    TrangThai: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    LanDangNhapCuoi: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'NhanVien',
    tableName: 'NhanVien',
    timestamps: false,
    hooks: {
      // Hook trước khi tạo/cập nhật để hash mật khẩu
      beforeSave: async (nhanVien: NhanVien) => {
        if (nhanVien.changed('MatKhau')) {
          const salt = await bcrypt.genSalt(10);
          nhanVien.MatKhau = await bcrypt.hash(nhanVien.MatKhau, salt);
        }
      },
    },
  }
);

export default NhanVien; 