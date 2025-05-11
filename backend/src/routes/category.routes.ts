import { Router } from 'express';
import CategoryController from '../controllers/category.controller';
import { protect, requireAdmin } from '../middlewares/auth';

const router = Router();

/**
 * @route GET /api/categories
 * @desc Lấy danh sách danh mục
 * @access Public
 */
router.get('/', CategoryController.getCategories);

/**
 * @route GET /api/categories/:id
 * @desc Lấy chi tiết danh mục theo ID
 * @access Public
 */
router.get('/:id', CategoryController.getCategoryById);

/**
 * @route POST /api/categories
 * @desc Tạo danh mục mới
 * @access Private (Admin only)
 */
router.post('/', protect, requireAdmin, CategoryController.createCategory);

/**
 * @route PUT /api/categories/:id
 * @desc Cập nhật danh mục
 * @access Private (Admin only)
 */
router.put('/:id', protect, requireAdmin, CategoryController.updateCategory);

/**
 * @route DELETE /api/categories/:id
 * @desc Xóa danh mục
 * @access Private (Admin only)
 */
router.delete('/:id', protect, requireAdmin, CategoryController.deleteCategory);

export default router; 