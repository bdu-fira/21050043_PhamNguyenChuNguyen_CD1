import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import ReviewService from '../services/review.service';
import { AuthRequest } from '../types/auth';

class ReviewController {
  /**
   * @desc Lấy danh sách đánh giá của sản phẩm
   * @route GET /api/reviews/product/:productId
   * @access Public
   */
  public getProductReviews = asyncHandler(async (req: Request, res: Response) => {
    const productId = parseInt(req.params.productId);
    
    const reviews = await ReviewService.getProductReviews(productId);
    res.json(reviews);
  });

  /**
   * @desc Lấy chi tiết đánh giá theo ID
   * @route GET /api/reviews/:id
   * @access Public
   */
  public getReviewById = asyncHandler(async (req: Request, res: Response) => {
    const reviewId = parseInt(req.params.id);
    
    const review = await ReviewService.getReviewById(reviewId);
    
    if (!review) {
      res.status(404);
      throw new Error('Không tìm thấy đánh giá');
    }
    
    res.json(review);
  });

  /**
   * @desc Tạo đánh giá mới
   * @route POST /api/reviews
   * @access Private
   */
  public createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { productId, rating, comment } = req.body;
    const userId = req.user!.id;
    
    // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const existingReview = await this.checkExistingReview(userId, productId);
    
    if (existingReview) {
      res.status(400);
      throw new Error('Bạn đã đánh giá sản phẩm này rồi');
    }
    
    const review = await ReviewService.createReview({
      MaSP: parseInt(productId),
      MaKH: userId,
      DiemSo: rating,
      BinhLuan: comment
    });
    
    res.status(201).json(review);
  });

  /**
   * @desc Cập nhật đánh giá
   * @route PUT /api/reviews/:id
   * @access Private
   */
  public updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reviewId = parseInt(req.params.id);
    const userId = req.user!.id;
    const { rating, comment } = req.body;
    
    const review = await ReviewService.getReviewById(reviewId);
    
    if (!review) {
      res.status(404);
      throw new Error('Không tìm thấy đánh giá');
    }
    
    // Kiểm tra xem người dùng có phải là chủ sở hữu của đánh giá không
    if (review.MaKH !== userId && req.user!.vaiTroId !== 'admin') {
      res.status(403);
      throw new Error('Bạn không có quyền cập nhật đánh giá này');
    }
    
    const updatedReview = await ReviewService.updateReview(reviewId, userId, {
      DiemSo: rating,
      BinhLuan: comment
    });
    
    res.json(updatedReview);
  });

  /**
   * @desc Xóa đánh giá
   * @route DELETE /api/reviews/:id
   * @access Private
   */
  public deleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reviewId = parseInt(req.params.id);
    const userId = req.user!.id;
    const isAdmin = req.user!.vaiTroId === 'admin';
    
    const review = await ReviewService.getReviewById(reviewId);
    
    if (!review) {
      res.status(404);
      throw new Error('Không tìm thấy đánh giá');
    }
    
    // Kiểm tra xem người dùng có phải là chủ sở hữu của đánh giá hoặc admin không
    if (review.MaKH !== userId && !isAdmin) {
      res.status(403);
      throw new Error('Bạn không có quyền xóa đánh giá này');
    }
    
    await ReviewService.deleteReview(reviewId, userId, isAdmin);
    
    res.status(200).json({ message: 'Đã xóa đánh giá thành công' });
  });

  /**
   * Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
   * @private
   */
  private async checkExistingReview(userId: string, productId: number) {
    try {
      const reviews = await ReviewService.getProductReviews(productId);
      return reviews.reviews.find(review => review.MaKH === userId);
    } catch (error) {
      return null;
    }
  }
}

export default new ReviewController(); 