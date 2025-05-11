import express from 'express';
import nhanvienController from '../controllers/nhanvien.controller';
import { protect, requireAdmin } from '../middlewares/auth';

const router = express.Router();

// Tất cả các route đều yêu cầu là admin
router.use(protect);
router.use(requireAdmin);

// GET /api/nhanviens - Lấy danh sách nhân viên
router.get('/', nhanvienController.getNhanViens);

// GET /api/nhanviens/:id - Lấy thông tin chi tiết nhân viên
router.get('/:id', nhanvienController.getNhanVienById);

// POST /api/nhanviens - Tạo nhân viên mới
router.post('/', nhanvienController.createNhanVien);

// PUT /api/nhanviens/:id - Cập nhật thông tin nhân viên
router.put('/:id', nhanvienController.updateNhanVien);

// POST /api/nhanviens/:id/deactivate - Vô hiệu hóa nhân viên
router.post('/:id/deactivate', nhanvienController.deactivateNhanVien);

export default router; 