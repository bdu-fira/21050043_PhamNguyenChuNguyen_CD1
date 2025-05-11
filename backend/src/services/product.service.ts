import { SanPham, DanhMuc, DanhGia } from '../models';
import { AppError } from '../middlewares/errorHandler';
import logger from '../utils/logger';
import { Op, Order, literal, QueryTypes } from 'sequelize';
import { ISanPhamWithReviews } from '../interfaces/product.interface';
import { sequelize } from '../config/database';

class ProductService {
  /**
   * Lấy danh sách sản phẩm với các bộ lọc sử dụng view vw_SanPham
   */
  async getProducts(options: {
    keyword?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
    page?: number;
    limit?: number;
  }) {
    try {
      const { 
        keyword = '', 
        categoryId, 
        minPrice, 
        maxPrice,
        sortBy = 'newest',
        page = 1, 
        limit = 10 
      } = options;

      // Xây dựng điều kiện lọc
      const whereClause: any = {};
      
      // Tìm kiếm theo từ khóa
      if (keyword) {
        whereClause.TenSP = { [Op.like]: `%${keyword}%` };
      }
      
      // Lọc theo danh mục
      if (categoryId) {
        whereClause.MaDanhMuc = categoryId;
      }
      
      // Lọc theo giá
      if (minPrice !== undefined || maxPrice !== undefined) {
        whereClause.GiaBan = {};
        if (minPrice !== undefined) {
          whereClause.GiaBan[Op.gte] = minPrice;
        }
        if (maxPrice !== undefined) {
          whereClause.GiaBan[Op.lte] = maxPrice;
        }
      }

      // Xác định thứ tự sắp xếp
      let order: Order = [];
      switch (sortBy) {
        case 'price_asc':
          order = [['GiaBan', 'ASC']];
          break;
        case 'price_desc':
          order = [['GiaBan', 'DESC']];
          break;
        case 'popular':
          order = [['LuotXem', 'DESC']];
          break;
        case 'newest':
        default:
          order = [['NgayTao', 'DESC']];
          break;
      }

      // Tính toán phân trang
      const offset = (page - 1) * limit;

      // Thực hiện truy vấn
      const { rows: products, count: totalItems } = await SanPham.findAndCountAll({
        where: whereClause,
        order,
        limit,
        offset,
        include: [
          {
            model: DanhMuc,
            attributes: ['MaDanhMuc', 'TenDanhMuc']
          }
        ]
      });

      // Tính toán thông tin phân trang
      const totalPages = Math.ceil(totalItems / limit);
      const nextPage = page < totalPages ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      return {
        products,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
          nextPage,
          prevPage
        }
      };
    } catch (error) {
      logger.error(`Error in getProducts service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy danh sách sản phẩm.', 500);
    }
  }

  /**
   * Lấy sản phẩm với đánh giá sử dụng view vw_SanPham_DanhGia
   */
  async getProductsWithReviews(options: {
    page?: number;
    limit?: number;
    sortBy?: string;
  }) {
    try {
      const { page = 1, limit = 10, sortBy = 'newest' } = options;
      const offset = (page - 1) * limit;

      let order: any[] = [];
      switch (sortBy) {
        case 'rating':
          order = [[literal('DiemDanhGiaTrungBinh'), 'DESC']];
          break;
        case 'popular':
          order = [[literal('SoLuongDanhGia'), 'DESC']];
          break;
        case 'price_asc':
          order = [['GiaBan', 'ASC']];
          break;
        case 'price_desc':
          order = [['GiaBan', 'DESC']];
          break;
        default:
          order = [['MaSP', 'DESC']];
      }

      // Sử dụng ORM với include và attributes
      const { rows: products, count: totalItems } = await SanPham.findAndCountAll({
        attributes: [
          'MaSP', 'TenSP', 'MoTaDai', 'GiaBan', 'SoLuongTon', 'HinhAnhChinhURL',
          'MaDanhMuc', 'DacDiemNoiBat', 'LuotXem', 'NgayTao', 'NgayCapNhat',
          [
            literal(`(
              SELECT AVG(CAST(DiemSo AS FLOAT))
              FROM DanhGia
              WHERE DanhGia.MaSP = SanPham.MaSP AND DanhGia.TrangThai = 1
            )`),
            'DiemDanhGiaTrungBinh'
          ],
          [
            literal(`(
              SELECT COUNT(*)
              FROM DanhGia
              WHERE DanhGia.MaSP = SanPham.MaSP AND DanhGia.TrangThai = 1
            )`),
            'SoLuongDanhGia'
          ]
        ],
        include: [
          {
            model: DanhMuc,
            attributes: ['MaDanhMuc', 'TenDanhMuc']
          }
        ],
        order,
        limit,
        offset,
        distinct: true
      });

      const totalPages = Math.ceil(totalItems / limit);

      return {
        products,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        }
      };
    } catch (error) {
      logger.error(`Error in getProductsWithReviews service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy danh sách sản phẩm với đánh giá.', 500);
    }
  }

  /**
   * Lấy thông tin chi tiết sản phẩm theo ID
   */
  async getProductById(productId: number) {
    try {
      const product = await SanPham.findByPk(productId, {
        include: [
          {
            model: DanhMuc,
            attributes: ['MaDanhMuc', 'TenDanhMuc']
          },
          {
            model: DanhGia,
            attributes: ['MaDanhGia', 'MaKH', 'DiemSo', 'BinhLuan', 'NgayDanhGia']
          }
        ]
      });

      if (!product) {
        throw new AppError('Không tìm thấy sản phẩm.', 404);
      }

      // Tăng lượt xem sử dụng literal cho cập nhật số lượng an toàn
      await product.update({ 
        LuotXem: literal('LuotXem + 1') 
      });

      return product;
    } catch (error) {
      logger.error(`Error in getProductById service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy thông tin sản phẩm.', 500);
    }
  }

  /**
   * Lấy sản phẩm bán chạy sử dụng ORM
   */
  async getBestSellingProducts(limit: number = 10) {
    try {
      const bestSellingProducts = await SanPham.findAll({
        attributes: [
          'MaSP', 'TenSP', 'GiaBan', 'HinhAnhChinhURL', 'MaDanhMuc',
          [
            literal(`(
              SELECT SUM(ChiTietDonHang.SoLuong)
              FROM ChiTietDonHang
              JOIN DonHang ON ChiTietDonHang.MaDonHang = DonHang.MaDonHang
              WHERE ChiTietDonHang.MaSP = SanPham.MaSP
              AND DonHang.TrangThaiDonHang NOT IN ('Đã hủy', 'Trả hàng')
            )`),
            'TongSoLuongBan'
          ]
        ],
        include: [
          {
            model: DanhMuc,
            attributes: ['MaDanhMuc', 'TenDanhMuc']
          }
        ],
        order: [[literal('TongSoLuongBan'), 'DESC']],
        limit
      });

      return bestSellingProducts;
    } catch (error) {
      logger.error(`Error in getBestSellingProducts service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy sản phẩm bán chạy.', 500);
    }
  }

  /**
   * Tạo sản phẩm mới sử dụng raw query
   */
  async createProduct(productData: {
    TenSP: string;
    MoTaDai: string;
    GiaBan: number;
    SoLuongTon: number;
    HinhAnhChinhURL: string;
    MaDanhMuc: number;
    DacDiemNoiBat?: string;
  }) {
    try {
      // Kiểm tra tồn tại của danh mục bằng raw query
      const [categoryResults] = await sequelize.query(
        `SELECT * FROM DanhMuc WHERE MaDanhMuc = ?`,
        {
          replacements: [productData.MaDanhMuc],
          type: QueryTypes.SELECT
        }
      );

      if (!categoryResults) {
        throw new AppError('Danh mục không tồn tại.', 400);
      }

      // Tạo sản phẩm mới bằng raw query
      const currentDate = new Date().toISOString();
      
      // Chuẩn bị câu lệnh SQL INSERT
      const query = `
        INSERT INTO SanPham (
          TenSP, 
          MoTaDai, 
          GiaBan, 
          SoLuongTon, 
          HinhAnhChinhURL, 
          MaDanhMuc,
          DacDiemNoiBat,
          LuotXem, 
          NgayTao, 
          NgayCapNhat
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, GETDATE(), GETDATE());
        
        SELECT SCOPE_IDENTITY() as MaSP;
      `;

      // Thực thi câu query
      const [insertResult] = await sequelize.query(query, {
        replacements: [
          productData.TenSP,
          productData.MoTaDai,
          productData.GiaBan,
          productData.SoLuongTon,
          productData.HinhAnhChinhURL,
          productData.MaDanhMuc,
          productData.DacDiemNoiBat || null
        ],
        type: QueryTypes.INSERT
      });

      // Lấy ID của sản phẩm vừa tạo
      const newProductId = (insertResult as any)[0]?.MaSP;

      // Truy vấn dữ liệu sản phẩm vừa tạo
      const [newProduct] = await sequelize.query(`
        SELECT 
          sp.MaSP, 
          sp.TenSP, 
          sp.MoTaDai, 
          sp.GiaBan, 
          sp.SoLuongTon, 
          sp.HinhAnhChinhURL, 
          sp.MaDanhMuc,
          dm.TenDanhMuc,
          sp.DacDiemNoiBat,
          sp.LuotXem, 
          FORMAT(sp.NgayTao, 'yyyy-MM-ddTHH:mm:ss') as NgayTao,
          FORMAT(sp.NgayCapNhat, 'yyyy-MM-ddTHH:mm:ss') as NgayCapNhat
        FROM SanPham sp
        JOIN DanhMuc dm ON sp.MaDanhMuc = dm.MaDanhMuc
        WHERE sp.MaSP = ?
      `, {
        replacements: [newProductId],
        type: QueryTypes.SELECT
      });

      return newProduct;
    } catch (error) {
      logger.error(`Error in createProduct service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi tạo sản phẩm.', 500);
    }
  }

  /**
   * Cập nhật sản phẩm
   */
  async updateProduct(productId: number, productData: {
    TenSP?: string;
    MoTaDai?: string;
    GiaBan?: number;
    SoLuongTon?: number;
    HinhAnhChinhURL?: string;
    MaDanhMuc?: number;
    DacDiemNoiBat?: string;
  }) {
    try {
      // Kiểm tra tồn tại của sản phẩm
      const product = await SanPham.findByPk(productId);
      if (!product) {
        throw new AppError('Không tìm thấy sản phẩm.', 404);
      }

      // Kiểm tra tồn tại của danh mục nếu được cập nhật
      if (productData.MaDanhMuc) {
        const categoryExists = await DanhMuc.findByPk(productData.MaDanhMuc);
        if (!categoryExists) {
          throw new AppError('Danh mục không tồn tại.', 400);
        }
      }

      // Cập nhật thông tin sản phẩm
      await product.update({
        ...productData,
        NgayCapNhat: new Date()
      });

      return product;
    } catch (error) {
      logger.error(`Error in updateProduct service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi cập nhật sản phẩm.', 500);
    }
  }

  /**
   * Xóa sản phẩm
   */
  async deleteProduct(productId: number) {
    try {
      // Kiểm tra tồn tại của sản phẩm
      const product = await SanPham.findByPk(productId);
      if (!product) {
        throw new AppError('Không tìm thấy sản phẩm.', 404);
      }

      // Xóa sản phẩm
      await product.destroy();

      return { success: true };
    } catch (error) {
      logger.error(`Error in deleteProduct service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi xóa sản phẩm.', 500);
    }
  }

  /**
   * Lấy danh sách sản phẩm cho Dashboard sử dụng raw query
   */
  async getProductsForDashboard(options: {
    keyword?: string;
    categoryId?: number;
    status?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const { 
        keyword = '', 
        categoryId, 
        status,
        sortBy = 'newest',
        page = 1, 
        limit = 10 
      } = options;

      // Xây dựng câu truy vấn SQL với các tham số
      let query = `
        SELECT 
          sp.MaSP as id,
          sp.TenSP as name,
          dm.TenDanhMuc as category,
          sp.GiaBan as price,
          sp.SoLuongTon as stock,
          CASE 
            WHEN sp.SoLuongTon = 0 THEN 'outOfStock'
            ELSE 'active'
          END as status,
          FORMAT(sp.NgayTao, 'yyyy-MM-ddTHH:mm:ss') as createdAt,
          sp.HinhAnhChinhURL as imageUrl,
          dm.MaDanhMuc as categoryId
        FROM SanPham sp
        JOIN DanhMuc dm ON sp.MaDanhMuc = dm.MaDanhMuc
        WHERE 1=1
      `;

      let countQuery = `
        SELECT COUNT(*) as total
        FROM SanPham sp
        JOIN DanhMuc dm ON sp.MaDanhMuc = dm.MaDanhMuc
        WHERE 1=1
      `;

      const queryParams: any[] = [];
      let whereConditions = '';

      // Tìm kiếm theo từ khóa
      if (keyword && keyword.trim() !== '') {
        whereConditions += ` AND sp.TenSP LIKE ?`;
        queryParams.push(`%${keyword}%`);
      }
      
      // Lọc theo danh mục
      if (categoryId) {
        whereConditions += ` AND sp.MaDanhMuc = ?`;
        queryParams.push(categoryId);
      }
      
      // Lọc theo trạng thái
      if (status) {
        if (status === 'outOfStock') {
          whereConditions += ` AND sp.SoLuongTon = 0`;
        } else if (status === 'active') {
          whereConditions += ` AND sp.SoLuongTon > 0`;
        }
      }

      // Áp dụng điều kiện vào truy vấn
      query += whereConditions;
      countQuery += whereConditions;

      // Sắp xếp
      let orderClause = '';
      switch (sortBy) {
        case 'name-asc':
          orderClause = ` ORDER BY sp.TenSP ASC`;
          break;
        case 'name-desc':
          orderClause = ` ORDER BY sp.TenSP DESC`;
          break;
        case 'price-asc':
          orderClause = ` ORDER BY sp.GiaBan ASC`;
          break;
        case 'price-desc':
          orderClause = ` ORDER BY sp.GiaBan DESC`;
          break;
        case 'stock-asc':
          orderClause = ` ORDER BY sp.SoLuongTon ASC`;
          break;
        case 'stock-desc':
          orderClause = ` ORDER BY sp.SoLuongTon DESC`;
          break;
        case 'date-asc':
          orderClause = ` ORDER BY sp.NgayTao ASC`;
          break;
        case 'date-desc':
        case 'newest':
        default:
          orderClause = ` ORDER BY sp.NgayTao DESC`;
          break;
      }

      query += orderClause;

      // Phân trang
      const offset = (page - 1) * limit;
      query += ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

      // Thực hiện truy vấn
      const [products, countResult] = await Promise.all([
        sequelize.query(query, {
          replacements: queryParams,
          type: QueryTypes.SELECT
        }),
        sequelize.query(countQuery, {
          replacements: queryParams,
          type: QueryTypes.SELECT
        })
      ]);

      // Lấy tổng số sản phẩm từ kết quả đếm
      const totalItems = (countResult[0] as any).total;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        products,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        }
      };
    } catch (error) {
      logger.error(`Error in getProductsForDashboard service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi lấy danh sách sản phẩm cho dashboard.', 500);
    }
  }

  /**
   * Cập nhật sản phẩm sử dụng raw query cho phần thời gian
   */
  async updateProductWithRawQuery(productId: number, productData: {
    TenSP?: string;
    MoTaDai?: string;
    GiaBan?: number;
    SoLuongTon?: number;
    HinhAnhChinhURL?: string;
    MaDanhMuc?: number;
    DacDiemNoiBat?: string;
  }) {
    try {
      // Kiểm tra tồn tại của sản phẩm
      const product = await SanPham.findByPk(productId);
      if (!product) {
        throw new AppError('Không tìm thấy sản phẩm.', 404);
      }

      // Kiểm tra tồn tại của danh mục nếu được cập nhật
      if (productData.MaDanhMuc) {
        const categoryExists = await DanhMuc.findByPk(productData.MaDanhMuc);
        if (!categoryExists) {
          throw new AppError('Danh mục không tồn tại.', 400);
        }
      }

      // Xây dựng câu truy vấn SQL UPDATE
      let query = `UPDATE SanPham SET `;
      const queryParams: any[] = [];
      const updateFields = [];

      // Thêm các trường cần cập nhật vào câu truy vấn
      if (productData.TenSP !== undefined) {
        updateFields.push(`TenSP = ?`);
        queryParams.push(productData.TenSP);
      }

      if (productData.MoTaDai !== undefined) {
        updateFields.push(`MoTaDai = ?`);
        queryParams.push(productData.MoTaDai);
      }

      if (productData.GiaBan !== undefined) {
        updateFields.push(`GiaBan = ?`);
        queryParams.push(productData.GiaBan);
      }

      if (productData.SoLuongTon !== undefined) {
        updateFields.push(`SoLuongTon = ?`);
        queryParams.push(productData.SoLuongTon);
      }

      if (productData.HinhAnhChinhURL !== undefined) {
        updateFields.push(`HinhAnhChinhURL = ?`);
        queryParams.push(productData.HinhAnhChinhURL);
      }

      if (productData.MaDanhMuc !== undefined) {
        updateFields.push(`MaDanhMuc = ?`);
        queryParams.push(productData.MaDanhMuc);
      }

      if (productData.DacDiemNoiBat !== undefined) {
        updateFields.push(`DacDiemNoiBat = ?`);
        queryParams.push(productData.DacDiemNoiBat);
      }

      // Thêm trường NgayCapNhat với GETDATE() để SQL Server tự xử lý
      updateFields.push(`NgayCapNhat = GETDATE()`);

      // Hoàn thiện truy vấn
      query += updateFields.join(', ');
      query += ` WHERE MaSP = ?`;
      queryParams.push(productId);

      // Thực hiện truy vấn
      await sequelize.query(query, {
        replacements: queryParams,
        type: QueryTypes.UPDATE
      });

      // Lấy lại sản phẩm đã cập nhật
      const updatedProduct = await SanPham.findByPk(productId);
      return updatedProduct;
    } catch (error) {
      logger.error(`Error in updateProductWithRawQuery service: ${error}`);
      if (error instanceof AppError) throw error;
      throw new AppError('Đã xảy ra lỗi khi cập nhật sản phẩm.', 500);
    }
  }
}

export default new ProductService(); 