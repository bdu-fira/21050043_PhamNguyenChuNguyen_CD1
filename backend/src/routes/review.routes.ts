import { Router } from 'express';
import ReviewController from '../controllers/review.controller';
import { protect } from '../middlewares/auth';

const router = Router();

/**
 * @route GET /api/reviews/product/:productId
 * @desc Lấy danh sách đánh giá của sản phẩm
 * @access Public
 */
router.get('/product/:productId', ReviewController.getProductReviews);

/**
 * @route GET /api/reviews/:id
 * @desc Lấy chi tiết đánh giá theo ID
 * @access Public
 */
router.get('/:id', ReviewController.getReviewById);

/**
 * @route POST /api/reviews
 * @desc Tạo đánh giá mới
 * @access Private (User only)
 */
router.post('/', protect, ReviewController.createReview);

/**
 * @route PUT /api/reviews/:id
 * @desc Cập nhật đánh giá
 * @access Private (Owner only)
 */
router.put('/:id', protect, ReviewController.updateReview);

/**
 * @route DELETE /api/reviews/:id
 * @desc Xóa đánh giá
 * @access Private (Owner or Admin only)
 */
router.delete('/:id', protect, ReviewController.deleteReview);

export default router; 