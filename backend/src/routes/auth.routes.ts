import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Đăng ký người dùng mới
 * @access Public
 */
router.post('/register', AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc Đăng nhập
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route POST /api/auth/logout
 * @desc Đăng xuất
 * @access Private
 */
router.post('/logout', AuthController.logout);

/**
 * @route GET /api/auth/profile
 * @desc Lấy thông tin người dùng hiện tại
 * @access Private
 */
router.get('/profile', protect, AuthController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Cập nhật thông tin người dùng
 * @access Private
 */
router.put('/profile', protect, AuthController.updateProfile);

export default router; 