import { Router } from 'express';
import donHangController from '../controllers/donhang.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

/**
 * @route   GET /api/don-hang
 * @desc    Lấy danh sách đơn hàng
 * @access  Private (Admin, Staff)
 */
router.get('/', protect, restrictTo('Admin', 'NhanVien'), donHangController.getDonHangs);

/**
 * @route   GET /api/don-hang/:id
 * @desc    Lấy chi tiết đơn hàng theo ID
 * @access  Private (Admin, Staff, Customer)
 */
router.get('/:id', protect, donHangController.getDonHangById);

/**
 * @route   POST /api/don-hang
 * @desc    Tạo đơn hàng mới
 * @access  Private (Customer)
 */
router.post('/', protect, donHangController.createDonHang);

/**
 * @route   PATCH /api/don-hang/:id
 * @desc    Cập nhật trạng thái đơn hàng
 * @access  Private (Admin, Staff)
 */
router.patch('/:id', protect, restrictTo('Admin', 'NhanVien'), donHangController.updateDonHang);

/**
 * @route   POST /api/don-hang/:id/cancel
 * @desc    Hủy đơn hàng
 * @access  Private (Admin, Staff)
 */
router.post('/:id/cancel', protect, restrictTo('Admin', 'NhanVien'), donHangController.cancelDonHang);

export default router; 