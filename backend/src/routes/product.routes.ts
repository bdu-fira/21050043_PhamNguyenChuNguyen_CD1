import { Router } from 'express';
import ProductController from '../controllers/product.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

/**
 * @route   GET /api/san-pham
 * @desc    Lấy danh sách sản phẩm
 * @access  Public
 */
router.get('/', ProductController.getProducts);

/**
 * @route   GET /api/san-pham/ban-chay
 * @desc    Lấy danh sách sản phẩm bán chạy
 * @access  Public
 */
router.get('/ban-chay', ProductController.getBestSellingProducts);

/**
 * @route   GET /api/san-pham/dashboard
 * @desc    Lấy danh sách sản phẩm cho Dashboard
 * @access  Private (Admin, Staff)
 */
router.get('/dashboard', protect, restrictTo('Admin', 'NhanVien'), ProductController.getProductsForDashboard);

/**
 * @route   GET /api/san-pham/:id
 * @desc    Lấy chi tiết sản phẩm theo ID
 * @access  Public
 */
router.get('/:id', ProductController.getProductById);

/**
 * @route   POST /api/san-pham
 * @desc    Tạo sản phẩm mới
 * @access  Private (Admin, Staff)
 */
router.post('/', protect, restrictTo('Admin', 'NhanVien'), ProductController.createProduct);

/**
 * @route   PUT /api/san-pham/:id
 * @desc    Cập nhật sản phẩm
 * @access  Private (Admin, Staff)
 */
router.put('/:id', protect, restrictTo('Admin', 'NhanVien'), ProductController.updateProduct);

/**
 * @route   DELETE /api/san-pham/:id
 * @desc    Xóa sản phẩm
 * @access  Private (Admin)
 */
router.delete('/:id', protect, restrictTo('Admin'), ProductController.deleteProduct);

export default router; 