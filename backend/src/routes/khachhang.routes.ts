import express from 'express';
import khachhangController from '../controllers/khachhang.controller';
import { protect, requireAdmin } from '../middlewares/auth';

const router = express.Router();

// Route đăng ký và đăng nhập không cần xác thực
// POST /api/khachhangs/register - Đăng ký khách hàng mới
router.post('/register', khachhangController.registerKhachHang);

// POST /api/khachhangs/login - Đăng nhập
router.post('/login', khachhangController.loginKhachHang);

// Các route sau đây cần xác thực
router.use(protect);

// GET /api/khachhangs/profile - Lấy thông tin cá nhân
router.get('/profile', khachhangController.getProfile);

// PUT /api/khachhangs/:id - Cập nhật thông tin cá nhân (bản thân hoặc admin)
router.put('/:id', khachhangController.updateKhachHang);

// Các route sau đây chỉ dành cho admin
// GET /api/khachhangs - Lấy danh sách khách hàng
router.get('/', requireAdmin, khachhangController.getKhachHangs);

// GET /api/khachhangs/:id - Lấy thông tin chi tiết khách hàng
router.get('/:id', requireAdmin, khachhangController.getKhachHangById);

// POST /api/khachhangs/:id/deactivate - Vô hiệu hóa khách hàng
router.post('/:id/deactivate', requireAdmin, khachhangController.deactivateKhachHang);

export default router; 